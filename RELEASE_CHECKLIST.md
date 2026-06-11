# Release Checklist

Use this before publishing a public release.

## Repository hygiene

- [ ] `LICENSE`, `NOTICE.md`, `THIRD_PARTY_LICENSES.md`, `ATTRIBUTION.md`, `SECURITY.md`, and `CONTRIBUTING.md` exist.
- [ ] No local absolute paths, usernames, machine-specific directories, tokens, cookies, or `.env` values are committed.
- [ ] `.gitignore` excludes generated artifacts, dependencies, caches, and local environment files.
- [ ] The plugin manifest version is updated intentionally.

## Asset licensing

- [ ] Every committed photo, video, Canva export, generated image, and 3D model has attribution.
- [ ] Creative Commons assets are not described as MIT-licensed code assets.
- [ ] Generated examples keep their attribution files.

## Validation

- [ ] `python skills/cinematic-site-builder/scripts/audit-cinematic-quality.py --plugin .` passes.
- [ ] A generated starter project passes config validation and logic tests.
- [ ] Browser/WebGL visual smoke tests pass where Playwright/browser tooling is available.
- [ ] README limitations are honest about procedural reconstruction versus captured 3D models.

## Release notes

- [ ] Document new presets, config fields, and breaking changes.
- [ ] State known limitations.
- [ ] Include sample prompts and generated-site validation steps.
