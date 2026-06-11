# Research To 3D Render Workflow

Use this workflow whenever the user asks for a real place, landmark, brand object, product, vehicle, venue, artwork, or culturally specific subject.

1. Search the web before designing. Prefer official sites, tourism/city portals, museum/product pages, documentation, or reputable encyclopedic sources.
2. Capture a compact source list in the generated project notes or final answer. Do not invent factual claims or visual details.
3. Choose the render strategy from `real-subject-3d-pipeline.md`: real model, reconstructed 3D, HD/Canva 2.5D, or procedural fallback.
4. Convert research into `scene.subject` and `scene.subjectPipeline`: name, native name if relevant, location, category, visual cues, material cues, color cues, silhouette, important surrounding context, selected strategy, and source references.
5. Prefer real 3D assets for realism. Use licensed, public-domain, user-provided, or client-owned `.glb`/`.gltf` assets through `scene.modelUrl`.
6. If no real model is available, use HD/Canva 2.5D layers or the `researched-3d-subject` procedural fallback and say it is an approximate dynamic reconstruction from references.
7. Run a Canva realism pass when possible: create cleaned front/detail crops, transparent cut-outs, or composite reference boards; export PNG/WebP at 2x or 4k; save under `public/media/canva/`; reference the files in `scene.realismImages` or `scene.canvaAssets.exports`.
8. Keep the interaction system consistent: pointer parallax, scroll progress, drag-to-zoom, mobile-safe layout, WebGL/fallback mode detection, and screenshots.

Minimum `scene.subject` shape:

```json
{
  "name": "Subject name",
  "nativeName": "Optional native name",
  "category": "landmark | product | vehicle | venue | object",
  "location": "Optional location",
  "visualCues": ["silhouette cue", "material cue", "color cue", "signature detail"],
  "materialCues": ["stone", "glass", "tile", "metal"],
  "references": [
    { "title": "Source title", "url": "https://..." }
  ]
}
```

