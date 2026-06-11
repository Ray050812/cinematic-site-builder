#!/usr/bin/env python3
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path


sys.dont_write_bytecode = True

REQUIRED_TEMPLATE_TOKENS = {
    "index.html": [
        "film-layer",
        "importmap",
        "three.module.min.js",
    ],
    "src/main.js": [
        "URLSearchParams",
        "fallback",
        "progress",
        "dataset.renderMode",
        "dataset.renderError",
        "dataset.zoom",
    ],
    "src/cinematic/runtime/progress.js": [
        "targetZoom",
        "initialProgress",
        "targetProgress",
        "wheel",
        "touchmove",
        "pointermove",
    ],
    "src/cinematic/runtime/domLayer.js": [
        "--film-sweep",
        "--film-opacity",
        "--film-drift",
    ],
    "src/cinematic/runtime/threeLayer.js": [
        "ACESFilmicToneMapping",
        "FogExp2",
        "visiblePhase",
        "Math.max(rawPhase, 0.42)",
    ],
    "src/cinematic/runtime/fallbackCanvas.js": [
        "getContext(\"2d\")",
        "devicePixelRatio",
        "reducedMotion",
    ],
    "src/cinematic/presets/presetRegistry.js": [
        "createAiEraSphere",
        "createDetailTexture",
        "createYellowCraneTowerProcedural",
        "loadGltfSubjectModel",
        "createPhotoDepthShader",
        "createPhotoCutoutShader",
        "createImageDepthRotator",
        "normalizeRealismImageSources",
        "createResearchedSubjectHero",
        "photoFollowModel",
        "model-follow-photo-anchor",
        "seededRandom",
        "createVideoComposite",
        "VideoTexture",
        "createDepthComposite",
        "normalizeMediaSources",
        "createInterfaceTexture",
        "TextureLoader",
        "uTexture",
        "createDistortedMediaPlane",
        "createGalleryScrollSync",
        "createProductOrbit",
        "createModularInterface",
    ],
    "src/styles.css": [
        ".film-layer",
        "--film-opacity",
        "--film-drift",
        ".chapters::before",
        "overflow-wrap: anywhere",
        "body[data-render-mode=\"fallback\"]",
        "@media (max-width: 720px)",
    ],
    "public/media/real-subject-pipeline.json": [
        "real-subject-3d-pipeline",
        "strategyOrder",
        "validationSignals",
    ],
    "public/vendor/three.module.min.js": [
        "three.core.min.js",
    ],
    "public/vendor/three.core.min.js": [
        "Color",
    ],
    "public/vendor/addons/loaders/GLTFLoader.js": [
        "GLTFLoader",
    ],
    "public/vendor/addons/utils/BufferGeometryUtils.js": [
        "toTrianglesDrawMode",
    ],
    "scripts/visual-smoke.mjs": [
        "optimizeDeps",
        "?progress=0.55",
        "mobile-fallback.png",
        "visual-report.json",
    ],
}

REQUIRED_REFERENCE_FILES = [
    "fallback-rules.md",
    "intake.md",
    "performance-budget.md",
    "quality-rubric.md",
    "scene-presets.md",
    "research-to-render.md",
    "real-subject-3d-pipeline.md",
]

REQUIRED_RELEASE_FILES = [
    "LICENSE",
    "INSTALL.md",
    "GITHUB_PUBLISH.md",
    "NOTICE.md",
    "THIRD_PARTY_LICENSES.md",
    "ATTRIBUTION.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "RELEASE_CHECKLIST.md",
    ".gitignore",
    ".github/workflows/release-check.yml",
]

TEXT_FILE_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".py",
    ".svg",
    ".txt",
    ".yaml",
    ".yml",
}

LOCAL_PATH_MARKERS = [
    "C:" + "/Users/",
    "C:" + "\\Users\\",
    "Admin" + "istrator",
    "Desk" + "top\\",
    "Documents" + "\\Web 2",
    "\u52a8\u6548\u7f51\u9875",
]

ALLOWED_PRESETS = {
    "ai-era-sphere",
    "researched-3d-subject",
    "particle-field",
    "video-composite",
    "light-ribbon",
    "depth-composite",
    "distorted-media-plane",
    "modular-interface",
    "portal-transition",
    "gallery-scroll-sync",
    "product-orbit",
}


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def warn(condition: bool, message: str, warnings: list[str]) -> None:
    if not condition:
        warnings.append(message)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def iter_text_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if ".git" in path.parts:
            continue
        if path.suffix.lower() in TEXT_FILE_SUFFIXES:
            yield path


def normalized_pages(config: dict) -> list[dict]:
    pages = config.get("pages")
    if isinstance(pages, list) and pages:
        return [
            {
                "id": page.get("id") or f"page-{index + 1}",
                "route": page.get("route") or ("/" if index == 0 else f"/page-{index + 1}"),
                "chapters": page.get("chapters") or [],
            }
            for index, page in enumerate(pages)
            if isinstance(page, dict)
        ]
    return [{"id": "home", "route": "/", "chapters": config.get("chapters") or []}]


def audit_config(config: dict, label: str, failures: list[str], warnings: list[str]) -> dict:
    pages = normalized_pages(config)
    require(1 <= len(pages) <= 3, f"{label}: expected 1 to 3 pages", failures)
    if pages:
        require(pages[0]["route"] == "/", f"{label}: first page route should be /", failures)

    all_presets = set()
    chapter_count = 0
    for page in pages:
        chapters = page["chapters"]
        require(bool(chapters), f"{label}: page {page['id']} has no chapters", failures)
        require(1 <= len(chapters) <= 8, f"{label}: page {page['id']} has too many chapters", failures)
        previous_start = -1.0
        for index, chapter in enumerate(chapters):
            scoped = f"{label}:{page['id']}:{chapter.get('id', index)}"
            chapter_count += 1
            range_value = chapter.get("range")
            if not (isinstance(range_value, list) and len(range_value) == 2):
                failures.append(f"{scoped}: missing range")
            else:
                start, end = range_value
                require(isinstance(start, (int, float)) and isinstance(end, (int, float)), f"{scoped}: range values must be numeric", failures)
                require(0 <= start < end <= 1, f"{scoped}: range must satisfy 0 <= start < end <= 1", failures)
                require(start >= previous_start, f"{scoped}: range starts before previous chapter", failures)
                previous_start = start
                warn(end - start >= 0.12, f"{scoped}: range is narrow; animation may feel rushed", warnings)

            copy = chapter.get("copy", {})
            title = str(copy.get("title", ""))
            body = str(copy.get("body", ""))
            require(bool(title), f"{scoped}: missing copy.title", failures)
            warn(len(title) <= 72, f"{scoped}: title is long; verify mobile wrapping", warnings)
            warn(len(body) <= 190, f"{scoped}: body is long; verify mobile clipping", warnings)

            preset = chapter.get("scene", {}).get("preset")
            require(preset in ALLOWED_PRESETS, f"{scoped}: unknown preset {preset}", failures)
            if preset:
                all_presets.add(preset)
            media = chapter.get("scene", {}).get("media")
            if media is not None:
                require(isinstance(media, list), f"{scoped}: scene.media must be a list", failures)
                warn(len(media) <= 6, f"{scoped}: many media textures; verify mobile performance", warnings)
            if preset == "video-composite":
                scene = chapter.get("scene", {})
                warn(bool(scene.get("video") or scene.get("poster") or scene.get("media")), f"{scoped}: video-composite should define video, poster, or media", warnings)
            if preset == "researched-3d-subject":
                scene = chapter.get("scene", {})
                pipeline = scene.get("subjectPipeline")
                require(isinstance(pipeline, dict), f"{scoped}: researched-3d-subject requires subjectPipeline", failures)
                if isinstance(pipeline, dict):
                    require(pipeline.get("id") == "real-subject-3d-pipeline", f"{scoped}: subjectPipeline.id should be real-subject-3d-pipeline", failures)
                    require(bool(pipeline.get("selectedStrategy")), f"{scoped}: subjectPipeline.selectedStrategy is required", failures)
                    strategy_order = pipeline.get("strategyOrder")
                    require(isinstance(strategy_order, list) and "model" in strategy_order and "hd-image-2.5d" in strategy_order, f"{scoped}: subjectPipeline.strategyOrder should include model and hd-image-2.5d", failures)

                subject = scene.get("subject")
                require(isinstance(subject, dict) and bool(subject.get("name")), f"{scoped}: researched subject needs scene.subject.name", failures)
                subject_data = subject if isinstance(subject, dict) else {}
                visual_cues = subject_data.get("visualCues")
                material_cues = subject_data.get("materialCues")
                require(isinstance(visual_cues, list) and len(visual_cues) >= 3, f"{scoped}: researched subject needs at least 3 visual cues", failures)
                require(isinstance(material_cues, list) and bool(material_cues), f"{scoped}: researched subject needs material cues", failures)
                references = scene.get("references") or subject_data.get("references")
                require(isinstance(references, list) and bool(references), f"{scoped}: researched subject needs source references", failures)

                canva_assets = scene.get("canvaAssets", {})
                canva_exports = canva_assets.get("exports") if isinstance(canva_assets, dict) else None
                selected_strategy = pipeline.get("selectedStrategy", "") if isinstance(pipeline, dict) else ""
                has_realism_path = bool(scene.get("modelUrl")) or bool(scene.get("realismImages")) or bool(canva_exports) or "procedural" in str(selected_strategy)
                require(has_realism_path, f"{scoped}: researched subject needs a model, HD image layers, Canva exports, or an explicit procedural fallback", failures)
                warn(bool(scene.get("modelUrl")) or bool(scene.get("realismImages")) or bool(canva_exports), f"{scoped}: no captured model or HD/Canva layer configured; realism depends on procedural fallback", warnings)

    warn(len(all_presets) >= min(3, chapter_count), f"{label}: low preset variety; page may feel repetitive", warnings)
    return {
        "pages": len(pages),
        "chapters": chapter_count,
        "presets": sorted(all_presets),
    }


def load_site_validator(script_dir: Path):
    validator_path = script_dir / "validate-cinematic-site.py"
    spec = importlib.util.spec_from_file_location("cinematic_site_validator", validator_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load validator: {validator_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def audit_plugin(plugin_root: Path, failures: list[str], warnings: list[str]) -> dict:
    manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
    skill_root = plugin_root / "skills" / "cinematic-site-builder"
    template_root = plugin_root / "assets" / "templates" / "vanilla-three-vite"
    starters_root = plugin_root / "assets" / "starter-configs"
    references_root = skill_root / "references"

    require(manifest_path.exists(), "missing .codex-plugin/plugin.json", failures)
    require((plugin_root / "README.md").exists(), "missing plugin README.md", failures)
    require((skill_root / "SKILL.md").exists(), "missing skill SKILL.md", failures)
    require((skill_root / "scripts" / "import-cinematic-media.py").exists(), "missing media import script", failures)
    require(template_root.exists(), "missing vanilla-three-vite template", failures)

    for relative in REQUIRED_RELEASE_FILES:
        require((plugin_root / relative).exists(), f"missing release file: {relative}", failures)

    release_text_checks = {
        "README.md": ["alpha / developer preview", "License And Assets", "ATTRIBUTION.md", "INSTALL.md", "GITHUB_PUBLISH.md"],
        "INSTALL.md": ["Install As A Local Codex Plugin", "Scaffold A Site Manually", "Asset Licensing"],
        "GITHUB_PUBLISH.md": ["gh repo create cinematic-site-builder", "Initial open-source release", "v0.1.0 alpha"],
        "NOTICE.md": ["MIT License", "Third-party", "Media assets"],
        "THIRD_PARTY_LICENSES.md": ["Three.js", "Vite", "Playwright"],
        "ATTRIBUTION.md": ["Yellow Crane Tower", "MonsieurRoi", "Creative Commons Attribution-ShareAlike 3.0"],
        "SECURITY.md": ["Reporting a vulnerability", "Asset and network safety"],
        "CONTRIBUTING.md": ["Rules for assets", "Local checks"],
    }
    for relative, tokens in release_text_checks.items():
        path = plugin_root / relative
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for token in tokens:
            require(token in text, f"{relative} missing release token: {token}", failures)

    leaked_paths = []
    for path in iter_text_files(plugin_root):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if any(marker in text for marker in LOCAL_PATH_MARKERS):
            leaked_paths.append(str(path.relative_to(plugin_root)))
    require(not leaked_paths, "text files contain local machine path markers: " + ", ".join(sorted(leaked_paths)), failures)

    if manifest_path.exists():
        manifest = read_json(manifest_path)
        require(manifest.get("skills") == "./skills/", "plugin manifest must expose ./skills/", failures)
        require(manifest.get("license") == "MIT", "plugin manifest should declare MIT license", failures)
        capabilities = " ".join(manifest.get("interface", {}).get("capabilities", []))
        require("Scene presets" in capabilities, "plugin manifest should advertise scene presets", failures)
        require("Validation scripts" in capabilities, "plugin manifest should advertise validation scripts", failures)
        require("Real subject 3D pipeline" in capabilities, "plugin manifest should advertise real subject 3D pipeline", failures)

    pyc_files = list(plugin_root.rglob("*.pyc"))
    require(not pyc_files, "plugin package contains .pyc files: " + ", ".join(str(path) for path in pyc_files), failures)

    for relative, tokens in REQUIRED_TEMPLATE_TOKENS.items():
        path = template_root / relative
        require(path.exists(), f"template missing {relative}", failures)
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for token in tokens:
            require(token in text, f"{relative} missing quality token: {token}", failures)

    for name in REQUIRED_REFERENCE_FILES:
        require((references_root / name).exists(), f"missing reference file: {name}", failures)

    require((template_root / "public" / "media" / "interface-overview.svg").exists(), "template missing default media asset: interface-overview.svg", failures)
    require((template_root / "public" / "media" / "interface-detail.svg").exists(), "template missing default media asset: interface-detail.svg", failures)
    require((template_root / "public" / "media" / "ATTRIBUTION.md").exists(), "template missing media attribution file", failures)
    require((template_root / "THIRD_PARTY_LICENSES.md").exists(), "template missing third-party license file", failures)
    require((template_root / "public" / "media" / "canva-assets.json").exists(), "template missing Canva asset manifest", failures)
    require((template_root / "public" / "media" / "real-subject-pipeline.json").exists(), "template missing real subject pipeline manifest", failures)
    require((template_root / "public" / "media" / "canva" / "yellow-crane-tower-photo.jpg").exists(), "template missing local Yellow Crane Tower realism photo", failures)
    require((template_root / "public" / "vendor" / "three.module.min.js").exists(), "template missing Three.js module vendor asset", failures)
    require((template_root / "public" / "vendor" / "three.core.min.js").exists(), "template missing Three.js core vendor asset", failures)
    require((template_root / "public" / "vendor" / "addons" / "loaders" / "GLTFLoader.js").exists(), "template missing GLTF model loader vendor asset", failures)
    require((template_root / "public" / "vendor" / "addons" / "utils" / "BufferGeometryUtils.js").exists(), "template missing GLTF utility vendor asset", failures)

    starter_summaries = {}
    starter_paths = sorted(starters_root.glob("*.json"))
    require(bool(starter_paths), "missing starter configs", failures)
    for starter_path in starter_paths:
        try:
            config = read_json(starter_path)
        except Exception as exc:
            failures.append(f"{starter_path.name}: invalid JSON: {exc}")
            continue
        starter_summaries[starter_path.stem] = audit_config(config, f"starter:{starter_path.stem}", failures, warnings)

    return {
        "starters": starter_summaries,
        "template": str(template_root),
    }


def audit_project(project: Path, validator, failures: list[str], warnings: list[str]) -> dict:
    result = validator.validate_project(project)
    if not result.get("ok"):
        failures.extend(f"project validator: {item}" for item in result.get("failures", []))

    visual_report = project / "artifacts" / "visual-report.json"
    if visual_report.exists():
        try:
            report = read_json(visual_report)
            if not report.get("ok"):
                failures.extend(f"visual smoke: {item}" for item in report.get("failures", []))
        except Exception as exc:
            failures.append(f"visual-report.json is invalid: {exc}")
    else:
        warnings.append(f"{project}: no artifacts/visual-report.json; run npm run visual:smoke when Playwright is available")

    screenshot_paths = sorted((project / "artifacts").glob("*.png")) if (project / "artifacts").exists() else []
    if screenshot_paths:
        small = [path.name for path in screenshot_paths if path.stat().st_size < 5000]
        require(not small, f"{project}: screenshots appear too small: {', '.join(small)}", failures)
    else:
        warnings.append(f"{project}: no screenshot artifacts found")

    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit the cinematic-site-builder plugin quality gates.")
    parser.add_argument("--plugin", default=".", help="Path to cinematic-site-builder plugin root")
    parser.add_argument("--project", help="Optional generated project to validate with plugin quality gates")
    args = parser.parse_args()

    plugin_root = Path(args.plugin).resolve()
    script_dir = Path(__file__).resolve().parent
    failures: list[str] = []
    warnings: list[str] = []

    plugin_summary = audit_plugin(plugin_root, failures, warnings)
    validator = load_site_validator(script_dir)

    project_summary = None
    if args.project:
        project_summary = audit_project(Path(args.project).resolve(), validator, failures, warnings)

    result = {
        "ok": not failures,
        "plugin": str(plugin_root),
        "pluginSummary": plugin_summary,
        "projectSummary": project_summary,
        "warnings": warnings,
        "failures": failures,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())






