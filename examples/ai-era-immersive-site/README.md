# AI Era Immersive Site

Live demo: https://ai-era-immersive-site.vercel.app/

This example is a single-file immersive frontend prototype for an AI-era landing experience. It combines fixed-stage scrolling, procedural Canvas/WebGL visuals, a 3D light sphere, menu interactions, chapter transitions, cursor feedback, and a Canvas fallback.

## Files

- `index.html` - complete static source with inline CSS and JavaScript.

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

```bash
npx serve .
```

## Dependencies

The page imports Three.js from `https://esm.sh/three@0.165.0` at runtime for the WebGL renderer. If the import fails, the page falls back to its built-in Canvas renderer.

## License

The example source is covered by the repository MIT license unless otherwise noted.

