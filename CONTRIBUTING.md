# Contributing

Thanks for helping improve Cinematic Site Builder.

## Project goals

The plugin should help Codex create cinematic, scroll-driven frontend sites with:

- A real 3D/WebGL hero object whenever possible.
- Clear fallbacks when real models are unavailable.
- Source-backed real-world subject profiles.
- Explicit asset licensing and attribution.
- Browser-verifiable rendering quality.

## Contribution areas

- Scene presets and shader effects.
- Real-subject asset pipelines, including `.glb` / `.gltf`, image-depth layers, Gaussian splats, and photogrammetry exports.
- Starter configs for useful site categories.
- Validation scripts, visual smoke tests, and performance budgets.
- Documentation, examples, and attribution templates.

## Rules for assets

Do not commit media or 3D models unless one of these is true:

- You created it and can license it for redistribution.
- It is public domain.
- It is under a license compatible with redistribution and the attribution is included.
- It is a small placeholder created specifically for this project.

Every committed third-party media asset needs an entry in `ATTRIBUTION.md` or a nearby attribution file.

## Local checks

From the plugin root, run:

```bash
python skills/cinematic-site-builder/scripts/audit-cinematic-quality.py --plugin .
```

Inside a generated project, run:

```bash
npm install
npm run validate:config
npm run test:logic
npm run test:real-subject
npm run build:smoke
```

Run `npm run visual:smoke` when Playwright is available.
