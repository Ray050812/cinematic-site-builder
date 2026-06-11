# Performance Budget

## Defaults

- Clamp device pixel ratio to `min(window.devicePixelRatio, 1.75)`.
- Use fewer particles on mobile or reduced-motion mode.
- Avoid large video by default; prefer procedural visuals or optimized images.
- Keep initial template JavaScript small enough for fast local iteration.

## Degradation

- Desktop high: full particle count, post effects, pointer interaction.
- Balanced: medium particle count, no expensive postprocessing.
- Mobile: reduced particles, simpler camera, no cursor-only interactions.
- Reduced motion: low-frequency ambient animation or static fallback.

## Asset Guidance

- Prefer glTF for models.
- Prefer compressed textures when the user supplies large images.
- Bake complex motion into lightweight curves, textures, or JSON data.
- Do not run expensive physics or fluid simulation in the main template.
