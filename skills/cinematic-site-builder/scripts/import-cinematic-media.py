#!/usr/bin/env python3
import argparse
import json
import re
import shutil
from pathlib import Path


ALLOWED_EXTENSIONS = {".avif", ".gif", ".jpg", ".jpeg", ".mp4", ".png", ".svg", ".webm", ".webp"}
IMAGE_EXTENSIONS = {".avif", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".webm"}


def load_export_default_json(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").strip()
    match = re.match(r"export\s+default\s+(.+);\s*$", text, re.S)
    if not match:
        raise ValueError("site.config.js must contain `export default <object>;`")
    return json.loads(match.group(1))


def write_export_default_json(path: Path, config: dict) -> None:
    path.write_text(f"export default {json.dumps(config, indent=2)};\n", encoding="utf-8")


def safe_asset_name(path: Path) -> str:
    stem = re.sub(r"[^a-z0-9-]+", "-", path.stem.lower()).strip("-") or "media"
    stem = re.sub(r"-+", "-", stem)[:56].strip("-") or "media"
    return f"{stem}{path.suffix.lower()}"


def unique_target(media_dir: Path, name: str) -> Path:
    candidate = media_dir / name
    if not candidate.exists():
        return candidate
    stem = candidate.stem
    suffix = candidate.suffix
    for index in range(2, 1000):
        candidate = media_dir / f"{stem}-{index}{suffix}"
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"Unable to find unique filename for {name}")


def normalized_pages(config: dict) -> list[dict]:
    pages = config.get("pages")
    if isinstance(pages, list) and pages:
        return pages
    return [{"id": "home", "route": "/", "chapters": config.get("chapters") or []}]


def find_target_chapter(config: dict, page_id: str | None, chapter_id: str | None, preset: str) -> tuple[dict, dict]:
    pages = normalized_pages(config)
    for page in pages:
        if page_id and page.get("id") != page_id and page.get("route") != page_id:
            continue
        for chapter in page.get("chapters") or []:
            if chapter_id and chapter.get("id") != chapter_id:
                continue
            scene = chapter.setdefault("scene", {})
            if chapter_id or scene.get("preset") == preset:
                return page, chapter
    target = f"page={page_id or '*'}, chapter={chapter_id or '*'}, preset={preset}"
    raise ValueError(f"No target chapter found for {target}")


def copy_assets(project: Path, assets: list[str]) -> list[str]:
    media_dir = project / "public" / "media"
    media_dir.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for raw in assets:
        source = Path(raw).expanduser().resolve()
        if not source.exists() or not source.is_file():
            raise FileNotFoundError(f"Asset does not exist: {source}")
        if source.suffix.lower() not in ALLOWED_EXTENSIONS:
            allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
            raise ValueError(f"Unsupported asset type for {source.name}; allowed: {allowed}")
        target = unique_target(media_dir, safe_asset_name(source))
        shutil.copy2(source, target)
        urls.append(f"/media/{target.name}")
    return urls


def main() -> int:
    parser = argparse.ArgumentParser(description="Copy media assets into a generated cinematic site and update scene.media.")
    parser.add_argument("--project", required=True, help="Path to the generated cinematic site project")
    parser.add_argument("--assets", nargs="+", required=True, help="Image/SVG assets to copy into public/media")
    parser.add_argument("--page", help="Target page id or route. Defaults to any page.")
    parser.add_argument("--chapter", help="Target chapter id. Defaults to the first matching preset.")
    parser.add_argument("--preset", default="depth-composite", help="Preset to target when --chapter is omitted")
    parser.add_argument("--as", dest="target_field", choices=["media", "poster", "video"], default="media", help="Config field to update")
    parser.add_argument("--replace", action="store_true", help="Replace existing scene.media instead of appending")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    config_path = project / "site.config.js"
    if not config_path.exists():
        raise SystemExit(f"Missing generated site config: {config_path}")

    config = load_export_default_json(config_path)
    asset_paths = [Path(item).expanduser().resolve() for item in args.assets]
    if args.target_field == "video":
        if len(asset_paths) != 1:
            raise SystemExit("--as video expects exactly one video asset")
        if asset_paths[0].suffix.lower() not in VIDEO_EXTENSIONS:
            raise SystemExit("--as video expects .mp4 or .webm")
    if args.target_field == "poster":
        if len(asset_paths) != 1:
            raise SystemExit("--as poster expects exactly one image asset")
        if asset_paths[0].suffix.lower() not in IMAGE_EXTENSIONS:
            raise SystemExit("--as poster expects an image asset")
    copied_urls = copy_assets(project, args.assets)
    page, chapter = find_target_chapter(config, args.page, args.chapter, args.preset)
    scene = chapter.setdefault("scene", {})
    if args.target_field in {"poster", "video"}:
        scene[args.target_field] = copied_urls[0]
    else:
        existing = [] if args.replace else list(scene.get("media") or [])
        scene["media"] = existing + copied_urls
    write_export_default_json(config_path, config)

    print(json.dumps({
        "ok": True,
        "project": str(project),
        "page": page.get("id") or page.get("route"),
        "chapter": chapter.get("id"),
        "field": args.target_field,
        "assets": copied_urls,
        "config": str(config_path),
        "next": [
            f"python validate-cinematic-site.py --project {project}",
            "npm run dev"
        ]
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
