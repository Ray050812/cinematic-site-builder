---
name: cinematic-site-builder
description: "Use when the user asks Codex to create, adapt, or validate a Lusion-like cinematic animated website: scroll-driven WebGL/Three.js, visual storytelling, motion-heavy landing pages, 1-3 page immersive frontends, scene presets, canvas fallback, and visual smoke validation."
---

# Cinematic Site Builder

Use this skill to build 1-3 page cinematic, Lusion-like frontends with Codex. The plugin is a complete local kit: workflow instructions, a Vite/Three.js template, runtime modules, scene presets, starter configs, and validation scripts.

## Operating Rules

- Start from the bundled template unless the user explicitly asks to modify an existing project.
- Keep user-specific content in `site.config.js`, `src/content.js`, and CSS variables before changing runtime internals.
- Use scene presets first. Prefer `researched-3d-subject` when the brief names a real-world place, landmark, product, vehicle, artwork, or object that should become the main 3D subject. Prefer `ai-era-sphere` for abstract AI/energy/interface briefs. Only write bespoke shaders or render loops after the preset layer cannot satisfy the request.
- Drive animation from a single `progress` state, chapter-local phases, pointer state, and route/page transitions.
- Every generated site must have a readable fallback path: WebGL failure, `?fallback=1`, and reduced-motion mode.
- Validate before final response: config validation, build or syntax check when feasible, desktop/mobile visual smoke when dependencies are available.

## Workflow

- Research real-world subjects before building. When a user asks for a real city, landmark, product, person-created object, or venue, follow `references/real-subject-3d-pipeline.md`: browse/search for authoritative references, collect 3-5 source links, identify silhouette/material/color/detail cues, and encode them in `site.config.js` under `scene.subject`, `scene.references`, `scene.subjectPipeline`, and optionally `scene.modelUrl`.
- Use a real licensed/user-provided `.glb`/`.gltf` model via `scene.modelUrl` whenever realism matters. If no model is available, use the procedural fallback inside `researched-3d-subject` and clearly report that it is an approximate dynamic reconstruction from references, not a photogrammetry-grade model.
- Use Canva or photo-editing exports for realism layers when available: create/crop transparent PNG/WebP subject views, export at 2x or 4k, place them under `public/media/canva/`, and list them in `scene.realismImages` or `scene.canvaAssets.exports`. Set `scene.photoFollowModel: true` when the first real photo/cutout should inherit the main subject's 3D rotation, pull-in distance, and pointer parallax; secondary images render as rotating 2.5D image-depth cards around the subject.

1. Confirm the small set of missing inputs: page count, brand/product subject, required sections, available assets, target devices, and whether dependencies may be installed.
2. Choose a starter config from `assets/starter-configs/` or create one from the user brief.
3. Scaffold a project with `scripts/init-cinematic-site.mjs`. If Node cannot run, use the equivalent Python fallback `scripts/init-cinematic-site.py`.
4. Edit the generated `site.config.js` and content files to fit the user brief.
5. Import user-provided screenshots, posters, or videos with `scripts/import-cinematic-media.py` when assets are available.
6. Compose visuals from bundled presets. See `references/scene-presets.md` before inventing a new preset.
7. Run validation:
   - `python scripts/audit-cinematic-quality.py --plugin <plugin-root> --project <generated-project>` when maintaining this plugin or doing a release-quality pass
   - `python scripts/validate-cinematic-site.py --project <generated-project>` when Node/npm is unavailable
   - `npm run validate:config`
   - `npm run test:logic`
   - `npm run test:real-subject`
   - `npm run build:smoke` when the host should not write a `dist/` directory
   - `npm run serve:smoke` to verify `/`, `/case`, and fallback entry routing without a browser
   - `npm run build`
   - `npm run visual:smoke` when Playwright dependencies are installed
8. Inspect screenshots or browser output for blank canvas, text overlap, broken fallback, and mobile layout issues. Fix before final response.

## Scaffold Command

From the plugin skill directory, run:

```bash
node scripts/init-cinematic-site.mjs --name my-cinematic-site --out <workspace> --starter ai-product
```

If Node is not on PATH or is blocked by the host environment, run:

```bash
python scripts/init-cinematic-site.py --name my-cinematic-site --out <workspace> --starter ai-product
```

Use `--template vanilla-three-vite` to select the current bundled template. Pass `--force` only when intentionally replacing an existing generated project.

## Node-Free Validation

When npm cannot run, validate the generated project from this skill directory:

```bash
python scripts/validate-cinematic-site.py --project <generated-project>
```

This does not replace a real browser smoke test, but it verifies the scaffolded project contract: config shape, chapter ranges, known scene presets, package scripts, WebGL runtime files, Canvas fallback hooks, and core validation files.

## Importing Media

Use the importer to copy user assets into `public/media/` and update the right scene config:

```bash
python scripts/import-cinematic-media.py --project <generated-project> --assets hero-loop.mp4 --chapter hero --as video
python scripts/import-cinematic-media.py --project <generated-project> --assets hero-poster.webp --chapter hero --as poster
python scripts/import-cinematic-media.py --project <generated-project> --assets screen-a.png screen-b.png --chapter media --as media --replace
```

Use `--as video` for `video-composite`, `--as poster` for video fallback frames, and `--as media` for `depth-composite` planes.

For plugin maintenance or release checks, run:

```bash
python scripts/audit-cinematic-quality.py --plugin <plugin-root> --project <generated-project>
```

This audits the plugin manifest, README, starter configs, template quality guardrails, generated project contract, and any available visual smoke artifacts.

## References

- Use `references/intake.md` when the user request is underspecified.
- Use `references/scene-presets.md` when selecting or combining visuals.
- Use `references/real-subject-3d-pipeline.md` when the main 3D object should represent a real subject.
- Use `references/quality-rubric.md` before final validation.
- Use `references/performance-budget.md` when tuning assets, particles, postprocessing, or mobile behavior.
- Use `references/fallback-rules.md` for WebGL failure, reduced motion, and low-power modes.

## Expected Final Reply

Report the generated project path, preview command or running URL, validations that passed, validations skipped with reasons, and any remaining risks. Do not claim Lusion-level parity; say the project uses a Lusion-like cinematic site architecture and bundled presets.



