# Security Policy

## Supported status

This plugin is currently an alpha/developer-preview project. Security reports are still welcome, but the public API and file layout may change before a stable release.

## Reporting a vulnerability

If you find a security issue, open a private report through your repository host if available, or contact the maintainer privately before publishing details. Include:

- The affected plugin version or commit.
- A minimal reproduction.
- Whether the issue affects plugin scaffolding, generated-site runtime code, browser validation, or media import.
- Any sensitive data exposure risk.

## Asset and network safety

The plugin is designed to help Codex research subjects and compose media-rich WebGL sites. Do not add untrusted downloads, scraped media, credentials, cookies, private URLs, or user secrets to a generated project.

Before shipping a generated site:

- Verify every media/model asset has a source, license, and redistribution permission.
- Keep attribution files with the generated project.
- Do not commit API keys, tokens, cookies, `.env` files, build caches, or browser artifacts.
- Review any user-provided media for malware risk before serving it publicly.

## Generated code

Generated sites should be reviewed before deployment. The validation scripts check structure, known presets, local asset references, and rendering hooks, but they do not replace security review.
