# Real Subject 3D Pipeline

Use this pipeline whenever the user asks for a real-world subject to become the main cinematic 3D object: a landmark, city, product, vehicle, venue, artifact, artwork, installation, or branded object.

## Goal

Create the most realistic interactive hero possible from available evidence and assets. The result should still use the plugin interaction system: WebGL rendering, pointer parallax, scroll progress, drag-to-zoom, responsive DOM copy, fallback rendering, and screenshot validation.

## Decision Ladder

1. Real 3D model: use licensed, public-domain, user-provided, or client-owned `.glb` / `.gltf` through `scene.modelUrl`.
2. Reconstructed 3D: use multi-view photos, depth maps, Gaussian splats, NeRF, or image-to-3D output when a model can be generated outside the template.
3. HD image 2.5D: use real photos, Canva exports, transparent cut-outs, depth cards, material crops, and WebGL image rotator layers through `scene.realismImages` and `scene.canvaAssets.exports`.
4. Procedural reconstruction: use `subject.visualCues`, color/material cues, architecture type, and known silhouette markers as a fallback. Clearly report that this is an approximate reconstruction.

## Required Research Step

Before building a real subject site, Codex must browse/search unless the user explicitly provides enough source material. Collect:

- 3-5 source links.
- The subject's official or common name and native name where relevant.
- Category and location.
- Silhouette cues.
- Material cues.
- Color cues.
- Important contextual environment.
- Available asset candidates: model URLs, photo URLs, user-provided files, Canva exports, or generated image assets.

## Subject Profile Shape

```json
{
  "subjectPipeline": {
    "id": "real-subject-3d-pipeline",
    "strategyOrder": ["model", "reconstructed-3d", "hd-image-2.5d", "procedural-fallback"],
    "selectedStrategy": "hd-image-2.5d",
    "realismTarget": "highest-available",
    "requiresResearch": true,
    "requiresBrowserValidation": true
  },
  "scene": {
    "preset": "researched-3d-subject",
    "modelUrl": "/models/subject.glb",
    "photoFollowModel": true,
    "photoOffsetX": -0.16,
    "photoOffsetY": 0.03,
    "photoOffsetZ": -0.7,
    "photoRotationY": 0.05,
    "photoScale": 1.02,
    "realismImages": [
      { "src": "/media/canva/subject-front.webp", "role": "front-hd-reference", "aspect": 1.6 },
      { "src": "/media/canva/subject-detail.webp", "role": "material-detail", "aspect": 1.4 }
    ],
    "canvaAssets": {
      "workflow": "export-transparent-png-or-webp-at-2x",
      "exports": [
        { "src": "/media/canva/subject-cutout.webp", "role": "transparent-cutout" }
      ]
    },
    "subject": {
      "name": "Subject name",
      "nativeName": "Optional native name",
      "category": "landmark",
      "location": "City or region",
      "visualCues": ["signature silhouette", "material cue", "color cue", "detail cue"],
      "materialCues": ["stone", "tile", "glass", "metal"],
      "references": [
        { "title": "Source title", "url": "https://..." }
      ]
    }
  }
}
```

Set `scene.photoFollowModel` to `true` when the first real photo or Canva cutout should move as part of the main 3D subject instead of orbiting independently. Use the photo offset, rotation, and scale fields to align that real image layer with the procedural or loaded model, then keep secondary `realismImages` as orbiting depth/detail cards.

## Canva Realism Pass

Use Canva when it helps produce cleaner realism assets:

- Cut out the subject from high-resolution references.
- Create front/detail/night/material views.
- Export transparent PNG/WebP at 2x or 4k.
- Keep a front view, a side/detail crop, and optional atmosphere/background layers.
- Save files under `public/media/canva/`.
- Reference the exports from `scene.realismImages` or `scene.canvaAssets.exports`.

## Render Verification

A real subject delivery is not ready until the agent verifies:

- `body[data-render-mode="webgl"]` is set.
- The main subject is visible in the first viewport.
- Pointer movement changes the subject orientation or parallax.
- Drag-to-zoom changes `body[data-zoom]` and visually pulls the subject closer.
- HD image or Canva layers render when configured.
- Mobile viewport has no horizontal overflow and keeps the main subject visible.
- The final answer states whether the render used a real model, reconstructed asset, HD 2.5D images, or procedural fallback.
