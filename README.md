# Cinematic Site Builder

`cinematic-site-builder` is a Codex plugin for generating 1-3 page Lusion-like cinematic frontends. It packages the agent workflow, Vite/Three.js project template, scroll-driven runtime, scene preset library, starter configs, and validation scripts in one installable plugin.

Status: alpha / developer preview. The plugin is useful for generating and validating cinematic WebGL sites, but real-world subject realism still depends on the assets available for a brief. A generated landmark site may use a real `.glb`/`.gltf`, reconstructed 3D asset, HD/Canva 2.5D layers, or a procedural approximation; the final delivery should say which path was used.

## License And Assets

Source code, configuration examples, scripts, and documentation are MIT-licensed unless otherwise noted. See `LICENSE`.

Third-party runtime dependencies and vendored files keep their own licenses. See `THIRD_PARTY_LICENSES.md`.

Media assets are not automatically covered by the MIT code license. The Wuhan/Yellow Crane Tower demo includes a Creative Commons Attribution-ShareAlike 3.0 photo from Wikimedia Commons; keep the attribution in `ATTRIBUTION.md` and the generated template's `public/media/ATTRIBUTION.md`.

The core architecture is:

```txt
content config -> fixed stage -> progress state machine -> layered renderers -> verifiable fallback
```

Use this plugin when the goal is not a normal section-based landing page, but a scroll-driven visual narrative where DOM copy, Canvas fallback, and WebGL/Three.js visuals all derive from one `progress: 0 -> 1` state.

For real places, landmarks, products, vehicles, venues, and objects, the plugin uses a `real-subject-3d-pipeline`: real `.glb` / `.gltf` model first, reconstructed 3D asset second, HD/Canva 2.5D image-depth layers third, and procedural reconstruction only as the explicit fallback.

## What Users Install

See `INSTALL.md` for the step-by-step local plugin configuration, generated-site workflow, and troubleshooting notes.

See `GITHUB_PUBLISH.md` for the first public GitHub repository setup, push commands, repository topics, and release notes.

Install or expose the plugin folder to Codex as a local plugin:

```txt
cinematic-site-builder/
  .codex-plugin/plugin.json
  skills/cinematic-site-builder/SKILL.md
  assets/templates/vanilla-three-vite/
  assets/starter-configs/
```

For local development, point your Codex plugin configuration at the repository root:

```json
{
  "plugins": [
    {
      "name": "cinematic-site-builder",
      "source": {
        "source": "local",
        "path": "/absolute/path/to/cinematic-site-builder"
      }
    }
  ]
}
```

After installation, users can ask Codex:

```txt
Use cinematic-site-builder to create a Lusion-like 2-page animated site for an AI product.
```

Codex should then use the bundled skill, scaffold a project, adapt `site.config.js`, compose presets, run validation, and inspect screenshots before final delivery.

## Scaffold A Project

From `skills/cinematic-site-builder/`, use Node when available:

```bash
node scripts/init-cinematic-site.mjs --name fluxframe-site --out <workspace> --starter lusion-lab
```

If Node is blocked or unavailable, use the Python fallback:

```bash
python scripts/init-cinematic-site.py --name fluxframe-site --out <workspace> --starter lusion-lab
```

Available starters:

- `ai-product`
- `creative-studio`
- `product-launch`
- `studio-case`
- `lusion-lab`
- `wuhan-landmark`

## Generated Project Workflow

Inside the generated project:

```bash
npm install
npm run validate:config
npm run test:logic
npm run build:smoke
npm run serve:smoke
npm run visual:smoke
npm run dev
```

When npm or Playwright is unavailable, use the plugin-side validator:

```bash
python scripts/validate-cinematic-site.py --project <generated-project>
```

To attach user-provided images or videos to a generated project:

```bash
python scripts/import-cinematic-media.py --project <generated-project> --assets hero-loop.mp4 --chapter hero --as video
python scripts/import-cinematic-media.py --project <generated-project> --assets hero-poster.webp --chapter hero --as poster
python scripts/import-cinematic-media.py --project <generated-project> --assets screen-a.png screen-b.png --chapter media --as media --replace
```

For plugin maintenance or release-quality checks, run:

```bash
python scripts/audit-cinematic-quality.py --plugin <plugin-root> --project <generated-project>
```

This checks the plugin manifest, README, starter configs, template quality guardrails, generated project contract, and any available visual smoke artifacts.

From the repository root, the release audit is:

```bash
python skills/cinematic-site-builder/scripts/audit-cinematic-quality.py --plugin .
```

The GitHub Actions workflow in `.github/workflows/release-check.yml` runs the plugin audit plus the template config/tests/build smoke checks.

## Quality Gate

Before calling a generated site ready, Codex should verify:

- WebGL path sets `body[data-render-mode="webgl"]`.
- `ai-era-sphere` gives every generated site an immediately visible, animated, mouse-zoomable 3D hero object.
- `researched-3d-subject` turns searched real-world subjects into a primary interactive 3D hero; it uses `scene.modelUrl` for real `.glb`/`.gltf` assets, `scene.realismImages` / `scene.canvaAssets` for high-resolution image rotator layers, and a procedural reconstruction fallback when no model is available.
- Real-subject pages must include `scene.subjectPipeline` with `id: "real-subject-3d-pipeline"` and a selected strategy so the final delivery can state whether it used a real model, reconstructed 3D, HD/Canva 2.5D layers, or procedural fallback.
- Public examples must keep `ATTRIBUTION.md` or an equivalent source/license record for every committed media or model asset.
- Fallback path works with `?fallback=1`.
- Desktop screenshots are not blank and do not hide the active chapter copy.
- Mobile fallback keeps title, body, nav, and progress visible without clipping.
- The stage keeps the progress-driven `film-layer` enabled for vignette, scanline, light sweep, and subtle color separation.
- Runtime zoom supports primary-button vertical drag and `Shift + wheel` for pulling into the main 3D effect.
- Real-world briefs must include source-backed `scene.subject.visualCues`, `scene.references`, and a clear note when the render is an approximate reconstruction instead of a captured model.
- Canva-exported or photo-edited assets should be 2x/4k PNG/WebP files under `public/media/canva/`, referenced from `scene.realismImages` or `scene.canvaAssets.exports`, and verified in WebGL screenshots. Set `scene.photoFollowModel: true` when the first real photo/cutout should inherit the main subject's 3D rotation, pull-in distance, and pointer parallax.
- `video-composite` supports real `mp4`/`webm` sources with poster fallback and WebGL shader treatment.
- `depth-composite` supports real media paths in `scene.media` and ships with default public interface SVGs.
- Chapter ranges, page count, scene presets, and package scripts pass validation.
- Plugin maintenance passes `audit-cinematic-quality.py` before distribution.
- The final answer reports validations that passed and any skipped checks with reasons.

## Extension Direction

The first-class delivery form is a Codex plugin. MCP can be added later for remote scene libraries, asset search, shader catalogs, or screenshot scoring, but the core workflow should remain local and installable so users can generate and iterate sites without operating an extra service.




