# Install And Use Cinematic Site Builder

This document is for people who want to use the plugin after cloning or downloading the repository.

## Requirements

- Codex with local plugin support.
- Node.js 20+ and npm for generated-site development.
- Python 3 is optional, but useful for node-free validation scripts.
- A modern browser with WebGL support for visual QA.

## Install As A Local Codex Plugin

1. Clone or download this repository.

```bash
git clone <repo-url> cinematic-site-builder
```

2. Add the repository root to your Codex local plugin configuration.

Use an absolute path to the folder that contains `.codex-plugin/plugin.json`:

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

On Windows, use escaped backslashes or forward slashes:

```json
{
  "plugins": [
    {
      "name": "cinematic-site-builder",
      "source": {
        "source": "local",
        "path": "C:/Users/you/Projects/cinematic-site-builder"
      }
    }
  ]
}
```

3. Restart or reload Codex so it discovers the plugin.

4. Ask Codex to use the plugin:

```txt
Use cinematic-site-builder to create a cinematic animated site for a Wuhan travel experience.
```

or:

```txt
Use cinematic-site-builder to create a Lusion-like product launch page with a mouse-zoomable 3D hero.
```

## Scaffold A Site Manually

From the plugin skill directory:

```bash
cd cinematic-site-builder/skills/cinematic-site-builder
node scripts/init-cinematic-site.mjs --name my-cinematic-site --out ../../.. --starter ai-product
```

Available starters:

- `ai-product`
- `creative-studio`
- `product-launch`
- `studio-case`
- `lusion-lab`
- `wuhan-landmark`

Then enter the generated project:

```bash
cd my-cinematic-site
npm install
npm run validate:config
npm run test:logic
npm run test:real-subject
npm run build:smoke
npm run dev
```

Open the Vite URL printed by `npm run dev`.

## Validate Without Node

If Node/npm are unavailable, use the Python validator from the plugin skill directory:

```bash
python scripts/validate-cinematic-site.py --project /absolute/path/to/generated-site
```

For plugin release checks:

```bash
python scripts/audit-cinematic-quality.py --plugin /absolute/path/to/cinematic-site-builder
```

## Real Subject Workflow

When asking for a real-world subject, include the subject and the realism goal:

```txt
Use cinematic-site-builder to create a Wuhan site where Yellow Crane Tower is the main interactive 3D subject. Search for references, use real photos when licensed, and make the photo layer follow the 3D model.
```

The plugin will prefer this order:

1. Licensed or user-provided `.glb` / `.gltf`.
2. Reconstructed 3D assets.
3. HD image / Canva 2.5D realism layers.
4. Procedural reconstruction fallback.

If the result uses a fallback instead of a captured model, Codex should state that clearly.

## Asset Licensing

Do not assume media assets are MIT-licensed. Generated sites should keep:

- `THIRD_PARTY_LICENSES.md`
- `public/media/ATTRIBUTION.md`

If you add your own images, videos, Canva exports, or 3D models, add their source, author, license, and modification notes to the attribution file.

The bundled Wuhan demo photo is Creative Commons Attribution-ShareAlike 3.0 and must keep attribution.

## Troubleshooting

- Plugin not found: confirm the configured path points to the folder containing `.codex-plugin/plugin.json`.
- Site cannot run: confirm Node.js 20+ and npm are installed.
- WebGL is blank: try `?fallback=1`, check the browser console, then run `npm run validate:config`.
- Real-world subject is not realistic enough: provide a real `.glb` / `.gltf`, higher-resolution photos, or Canva cutouts and reference them from `scene.modelUrl`, `scene.realismImages`, or `scene.canvaAssets.exports`.
