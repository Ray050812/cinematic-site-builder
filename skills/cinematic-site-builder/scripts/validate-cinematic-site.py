#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path


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

REQUIRED_FILES = [
    "index.html",
    "package.json",
    "site.config.js",
    "src/main.js",
    "src/styles.css",
    "src/cinematic/runtime/logic.js",
    "src/cinematic/runtime/progress.js",
    "src/cinematic/runtime/domLayer.js",
    "src/cinematic/runtime/fallbackCanvas.js",
    "src/cinematic/runtime/threeLayer.js",
    "src/cinematic/presets/presetRegistry.js",
    "scripts/validate-config.mjs",
    "scripts/build-smoke.mjs",
    "scripts/serve-smoke.mjs",
    "scripts/visual-smoke.mjs",
    "tests/logic.test.mjs",
    "tests/real-subject-preset.test.mjs",
    "public/media/interface-overview.svg",
    "public/media/interface-detail.svg",
    "public/media/ATTRIBUTION.md",
    "public/media/canva-assets.json",
    "public/media/real-subject-pipeline.json",
    "THIRD_PARTY_LICENSES.md",
    "public/media/canva/yellow-crane-tower-photo.jpg",
    "public/vendor/three.module.min.js",
    "public/vendor/three.core.min.js",
    "public/vendor/addons/loaders/GLTFLoader.js",
    "public/vendor/addons/utils/BufferGeometryUtils.js",
]

REQUIRED_PACKAGE_SCRIPTS = [
    "dev",
    "build",
    "build:smoke",
    "serve:smoke",
    "validate:config",
    "test:logic",
    "test:real-subject",
    "visual:smoke",
]


def load_export_default_json(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").strip()
    match = re.match(r"export\s+default\s+(.+);\s*$", text, re.S)
    if not match:
        raise ValueError("site.config.js must contain `export default <object>;`")
    return json.loads(match.group(1))


def normalized_pages(config: dict) -> list[dict]:
    pages = config.get("pages")
    if isinstance(pages, list) and pages:
        normalized = []
        for index, page in enumerate(pages):
            if not isinstance(page, dict):
                normalized.append({"id": f"page-{index + 1}", "route": f"/page-{index + 1}", "chapters": []})
                continue
            page_id = page.get("id") or f"page-{index + 1}"
            normalized.append({
                "id": page_id,
                "route": page.get("route") or ("/" if index == 0 else f"/{page_id}"),
                "chapters": page.get("chapters") or [],
            })
        return normalized
    return [{
        "id": "home",
        "route": "/",
        "chapters": config.get("chapters") or [],
    }]


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def asset_src(item) -> str:
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        return item.get("src") or item.get("url") or ""
    return ""


def validate_local_asset(project: Path, scoped_id: str, field: str, src: str, failures: list[str]) -> None:
    require(bool(src), f"chapter {scoped_id} {field} item missing src", failures)
    if isinstance(src, str) and src.startswith("/"):
        require((project / "public" / src.lstrip("/")).exists(), f"chapter {scoped_id} {field} asset missing: {src}", failures)


def validate_scene_asset_list(project: Path, scoped_id: str, scene: dict, key: str, failures: list[str]) -> None:
    items = scene.get(key)
    if items is None:
        return
    require(isinstance(items, list), f"chapter {scoped_id} scene.{key} must be a list", failures)
    for item in items if isinstance(items, list) else []:
        validate_local_asset(project, scoped_id, f"scene.{key}", asset_src(item), failures)


def validate_project(project: Path) -> dict:
    failures: list[str] = []
    require(project.exists() and project.is_dir(), f"project does not exist: {project}", failures)
    if failures:
        return {"ok": False, "failures": failures}

    missing = [item for item in REQUIRED_FILES if not (project / item).exists()]
    require(not missing, "missing files: " + ", ".join(missing), failures)

    package_data = {}
    if (project / "package.json").exists():
        try:
            package_data = json.loads((project / "package.json").read_text(encoding="utf-8"))
        except Exception as exc:
            failures.append(f"package.json is invalid JSON: {exc}")

    scripts = package_data.get("scripts", {}) if isinstance(package_data, dict) else {}
    for script in REQUIRED_PACKAGE_SCRIPTS:
        require(script in scripts, f"package.json missing script: {script}", failures)

    config = {}
    if (project / "site.config.js").exists():
        try:
            config = load_export_default_json(project / "site.config.js")
        except Exception as exc:
            failures.append(f"site.config.js is invalid: {exc}")

    pipeline_manifest = project / "public" / "media" / "real-subject-pipeline.json"
    if pipeline_manifest.exists():
        try:
            pipeline_data = json.loads(pipeline_manifest.read_text(encoding="utf-8"))
            require(pipeline_data.get("id") == "real-subject-3d-pipeline", "real-subject-pipeline.json must use id real-subject-3d-pipeline", failures)
            require(isinstance(pipeline_data.get("strategyOrder"), list), "real-subject-pipeline.json missing strategyOrder", failures)
        except Exception as exc:
            failures.append(f"real-subject-pipeline.json is invalid JSON: {exc}")

    pages = normalized_pages(config) if isinstance(config, dict) else []
    require(1 <= len(pages) <= 3, "site.config.js must define 1 to 3 pages", failures)

    for page in pages:
        chapters = page["chapters"]
        require(isinstance(chapters, list) and bool(chapters), f"page {page['id']} requires non-empty chapters", failures)
        require(1 <= len(chapters) <= 8, f"page {page['id']} should keep chapters bounded", failures)
        seen_ids: set[str] = set()
        last_start = -1.0
        for index, chapter in enumerate(chapters):
            chapter_id = chapter.get("id", f"chapter-{index}") if isinstance(chapter, dict) else f"chapter-{index}"
            scoped_id = f"{page['id']}:{chapter_id}"
            require(isinstance(chapter.get("id"), str) and chapter.get("id"), f"chapter {scoped_id} missing id", failures)
            require(chapter_id not in seen_ids, f"duplicate chapter id: {scoped_id}", failures)
            seen_ids.add(chapter_id)

            range_value = chapter.get("range") if isinstance(chapter, dict) else None
            if not (isinstance(range_value, list) and len(range_value) == 2):
                failures.append(f"chapter {scoped_id} missing range [start, end]")
            else:
                start, end = range_value
                require(isinstance(start, (int, float)) and isinstance(end, (int, float)), f"chapter {scoped_id} range values must be numbers", failures)
                require(0 <= start < end <= 1, f"chapter {scoped_id} range must satisfy 0 <= start < end <= 1", failures)
                require(start >= last_start, f"chapter {scoped_id} starts before previous chapter", failures)
                last_start = start

            copy = chapter.get("copy", {}) if isinstance(chapter, dict) else {}
            require(bool(copy.get("title")), f"chapter {scoped_id} missing copy.title", failures)
            scene = chapter.get("scene", {}) if isinstance(chapter, dict) else {}
            preset = scene.get("preset")
            require(preset in ALLOWED_PRESETS, f"chapter {scoped_id} uses unknown preset: {preset}", failures)
            validate_scene_asset_list(project, scoped_id, scene, "media", failures)
            validate_scene_asset_list(project, scoped_id, scene, "realismImages", failures)
            validate_scene_asset_list(project, scoped_id, scene, "referenceImages", failures)
            for key in ("poster", "video"):
                src = scene.get(key)
                if isinstance(src, str) and src.startswith("/"):
                    require((project / "public" / src.lstrip("/")).exists(), f"chapter {scoped_id} {key} asset missing: {src}", failures)
            model_url = scene.get("modelUrl")
            if isinstance(model_url, str) and model_url:
                validate_local_asset(project, scoped_id, "scene.modelUrl", model_url, failures)
                require(model_url.lower().endswith((".glb", ".gltf")), f"chapter {scoped_id} scene.modelUrl should point to .glb or .gltf", failures)

            canva_assets = scene.get("canvaAssets", {})
            canva_exports = canva_assets.get("exports") if isinstance(canva_assets, dict) else None
            if canva_exports is not None:
                require(isinstance(canva_exports, list), f"chapter {scoped_id} scene.canvaAssets.exports must be a list", failures)
                for item in canva_exports if isinstance(canva_exports, list) else []:
                    validate_local_asset(project, scoped_id, "scene.canvaAssets.exports", asset_src(item), failures)

            if preset == "researched-3d-subject":
                pipeline = scene.get("subjectPipeline")
                require(isinstance(pipeline, dict), f"chapter {scoped_id} researched-3d-subject requires scene.subjectPipeline", failures)
                if isinstance(pipeline, dict):
                    require(pipeline.get("id") == "real-subject-3d-pipeline", f"chapter {scoped_id} subjectPipeline.id must be real-subject-3d-pipeline", failures)
                    require(bool(pipeline.get("selectedStrategy")), f"chapter {scoped_id} subjectPipeline requires selectedStrategy", failures)
                    strategy_order = pipeline.get("strategyOrder")
                    require(isinstance(strategy_order, list) and "hd-image-2.5d" in strategy_order, f"chapter {scoped_id} subjectPipeline.strategyOrder should include hd-image-2.5d", failures)

                subject = scene.get("subject")
                require(isinstance(subject, dict) and bool(subject.get("name")), f"chapter {scoped_id} researched-3d-subject requires scene.subject.name", failures)
                subject_data = subject if isinstance(subject, dict) else {}
                visual_cues = subject_data.get("visualCues")
                material_cues = subject_data.get("materialCues")
                require(isinstance(visual_cues, list) and len(visual_cues) >= 3, f"chapter {scoped_id} subject.visualCues should list at least 3 cues", failures)
                require(isinstance(material_cues, list) and bool(material_cues), f"chapter {scoped_id} subject.materialCues should list real material cues", failures)
                references = scene.get("references") or subject_data.get("references")
                require(isinstance(references, list) and bool(references), f"chapter {scoped_id} researched-3d-subject requires source references", failures)
                selected_strategy = pipeline.get("selectedStrategy", "") if isinstance(pipeline, dict) else ""
                has_realism_assets = bool(scene.get("modelUrl")) or bool(scene.get("realismImages")) or bool(canva_exports)
                require(has_realism_assets or "procedural" in str(selected_strategy) or bool(scene.get("landmark")), f"chapter {scoped_id} needs modelUrl, realismImages, Canva exports, or an explicit procedural landmark fallback", failures)

    source_checks = {
        "src/main.js": ["fallback", "renderMode", "dataset.zoom", "createThreeRenderer", "createFallbackRenderer"],
        "src/cinematic/runtime/progress.js": ["targetProgress", "wheel", "touchmove", "pointermove"],
        "src/cinematic/runtime/logic.js": ["smoothstep", "localProgress", "chapterAt", "validateSiteConfig"],
        "src/cinematic/runtime/threeLayer.js": ["WebGLRenderer", "createPresetObjects", "setPixelRatio"],
        "src/cinematic/runtime/fallbackCanvas.js": ["getContext(\"2d\")", "createRadialGradient", "arc"],
        "src/cinematic/presets/presetRegistry.js": ["createAiEraSphere", "createResearchedSubjectHero", "loadGltfSubjectModel", "createImageDepthRotator", "normalizeRealismImageSources", "createPhotoCutoutShader", "photoFollowModel", "model-follow-photo-anchor", "createYellowCraneTowerProcedural", "createDetailTexture", "createParticleField", "createVideoComposite", "VideoTexture", "createDepthComposite", "normalizeMediaSources", "TextureLoader", "uTexture", "createDistortedMediaPlane", "createGalleryScrollSync", "createProductOrbit"],
    }
    for relative, needles in source_checks.items():
        path = project / relative
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            require(needle in text, f"{relative} missing expected token: {needle}", failures)

    return {
        "ok": not failures,
        "project": str(project),
        "pages": len(pages),
        "chapters": sum(len(page["chapters"]) for page in pages),
        "presets": sorted({chapter.get("scene", {}).get("preset") for page in pages for chapter in page["chapters"] if isinstance(chapter, dict)}),
        "failures": failures,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a generated cinematic-site-builder project without Node/npm.")
    parser.add_argument("--project", required=True, help="Path to the generated site project")
    args = parser.parse_args()
    result = validate_project(Path(args.project).resolve())
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())






