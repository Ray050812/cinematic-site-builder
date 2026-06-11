#!/usr/bin/env python3
import argparse
import json
import re
import shutil
from pathlib import Path


def safe_project_name(value: str | None) -> str:
    name = re.sub(r"[^a-z0-9-]+", "-", (value or "cinematic-site").lower())
    name = re.sub(r"-+", "-", name).strip("-")
    return (name[:64] or "cinematic-site")


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold a cinematic site from bundled plugin assets.")
    parser.add_argument("--name", default="cinematic-site")
    parser.add_argument("--out", default=".")
    parser.add_argument("--starter", default="ai-product")
    parser.add_argument("--template", default="vanilla-three-vite")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    skill_root = script_dir.parent
    plugin_root = skill_root.parent.parent
    name = safe_project_name(args.name)
    out_root = Path(args.out).resolve()
    target = out_root / name
    template_dir = plugin_root / "assets" / "templates" / args.template
    starter_path = plugin_root / "assets" / "starter-configs" / f"{args.starter}.json"

    if not template_dir.exists():
        raise SystemExit(f"Unknown template: {args.template}")
    if not starter_path.exists():
        raise SystemExit(f"Unknown starter config: {args.starter}")
    if target.exists():
        if not args.force:
            raise SystemExit(f"Target exists: {target}. Pass --force to overwrite intentionally.")
        shutil.rmtree(target)

    out_root.mkdir(parents=True, exist_ok=True)
    shutil.copytree(template_dir, target)

    package_path = target / "package.json"
    package_data = json.loads(package_path.read_text(encoding="utf-8"))
    package_data["name"] = name
    package_path.write_text(json.dumps(package_data, indent=2) + "\n", encoding="utf-8")

    starter = starter_path.read_text(encoding="utf-8").strip()
    (target / "site.config.js").write_text(f"export default {starter};\n", encoding="utf-8")

    print(json.dumps({
        "ok": True,
        "project": str(target),
        "template": args.template,
        "starter": args.starter,
        "next": [
            f"cd {target}",
            "npm install",
            "npm run validate:config",
            "npm run dev"
        ]
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
