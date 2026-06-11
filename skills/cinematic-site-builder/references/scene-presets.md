# Scene Presets

## researched-3d-subject

Use this preset when the user names a real-world subject that should become the main interactive 3D object: a city landmark, venue, product, vehicle, artifact, or object. Codex should search for references first, then encode a structured subject profile in `scene.subject`.

Preferred realism path: attach a licensed/user-provided `.glb` or `.gltf` with `scene.modelUrl`. The runtime loads it through `GLTFLoader`, normalizes it into the hero stage, animates camera orbit, pointer parallax, particles, scan rings, and drag-to-zoom. Add high-resolution photos or Canva exports through `scene.realismImages` or `scene.canvaAssets.exports`; the first real photo can follow the main model through `scene.photoFollowModel`, while secondary images render as rotating 2.5D image-depth cards around the subject.

Fallback path: when no model is available, use `subjectType`, `landmark`, `architecture`, `visualCues`, colors, and counts to generate a procedural reconstruction. For `landmark: "yellow-crane-tower"`, the fallback builds a tiered pavilion silhouette with upturned eaves, red columns, green roof surfaces, gold window bands, river haze, and orbiting detail points.

```json
{
  "preset": "researched-3d-subject",
  "subjectType": "landmark",
  "landmark": "yellow-crane-tower",
  "location": "Wuhan, Hubei, China",
  "architecture": "tiered-pavilion",
  "subjectPipeline": {
    "id": "real-subject-3d-pipeline",
    "strategyOrder": ["model", "reconstructed-3d", "hd-image-2.5d", "procedural-fallback"],
    "selectedStrategy": "model",
    "realismTarget": "highest-available"
  },
  "modelUrl": "/models/yellow-crane-tower.glb",
  "photoFollowModel": true,
  "photoOffsetX": -0.16,
  "photoOffsetY": 0.03,
  "photoOffsetZ": -0.7,
  "photoRotationY": 0.05,
  "photoScale": 1.02,
  "realismImages": [
    { "src": "/media/canva/tower-front.webp", "role": "front-hd-reference", "aspect": 1.6 },
    { "src": "/media/canva/tower-eaves-detail.webp", "role": "material-detail", "aspect": 1.4 }
  ],
  "subject": {
    "name": "Yellow Crane Tower",
    "nativeName": "黄鹤楼",
    "visualCues": ["tiered pavilion", "upturned eaves", "green roof", "red columns"],
    "materialCues": ["green tile roof", "red columns", "gold trim"]
  },
  "references": [
    { "title": "official or reliable source title", "url": "https://..." }
  ]
}
```
## ai-era-sphere

Best for a first-viewport hero where the user must immediately see a real 3D moving object. It renders a procedural nebula sphere with physical material, bump/roughness detail, surface particles, halo particles, scan rings, stream lines, module blocks, and portal rings. It supports interactive mouse pull-in through the runtime `zoom` snapshot.

Config keys: `surfaceDots`, `haloParticles`, `closeDetailParticles`, `color`, `accent`, `hot`.

Interaction: hold the primary mouse button and drag vertically to pull the camera closer or farther. Use `Shift + wheel` for fine zoom. Normal wheel scroll still drives chapter progress.

Example:

```json
{
  "preset": "ai-era-sphere",
  "surfaceDots": 680,
  "haloParticles": 1500,
  "closeDetailParticles": 900
}
```

Use presets as the primary construction material.

## particle-field

Best for hero scenes, spatial AI/data products, abstract brands, and transitions. It creates depth with animated particles, pointer attraction, and progress-based brightness.

Config keys: `density`, `color`, `accent`, `speed`, `depth`, `mouse`.

## video-composite

Best for Lusion-like hero sections and AI-video-style product moments. It maps a real `mp4`/`webm` or poster texture onto a WebGL plane, adds shader distortion, scanlines, edge glow, depth particles, and optional scroll-scrubbing so the page feels driven by real pixels rather than only procedural geometry.

Config keys: `video`, `poster`, `media`, `scrub`, `particles`.

Example:

```json
{
  "preset": "video-composite",
  "video": "/media/hero-loop.mp4",
  "poster": "/media/hero-poster.webp",
  "scrub": true
}
```

If `video` is missing, the preset uses `poster`, then the first `media` item, then a generated fallback texture.

## light-ribbon

Best for premium brand moments and section transitions. It uses curved luminous strokes and bloom-like additive blending. Use sparingly to avoid a generic neon look.

Config keys: `count`, `color`, `accent`, `twist`, `speed`.

## depth-composite

Best for premium hero sections, product narrative beats, media-heavy launches, and Lusion-like interface films. It combines layered shader planes, real or generated media textures, soft scanlines, additive light beams, and depth particles into one right-side stage so the page feels like a composed scene instead of separate effects.

Config keys: `panels`, `particles`, `media`, `distortion`, `beams`, `depth`.

`media` accepts an array of public asset paths or objects with `src`, for example:

```json
{
  "preset": "depth-composite",
  "panels": 5,
  "media": [
    "/media/product-screen-a.png",
    "/media/product-screen-b.jpg"
  ]
}
```

When no media is provided, the preset uses generated interface textures so the scene still has tangible detail.

## distorted-media-plane

Best for product images, work thumbnails, video stills, and portfolio pieces. It maps DOM-like content to WebGL planes and applies subtle wave/displacement.

Config keys: `media`, `distortion`, `hover`, `syncDom`.

## modular-interface

Best for AI, SaaS, dashboards, fintech, industrial systems, and technical products. It renders floating modules, HUD lines, and phase-driven reveal.

Config keys: `modules`, `grid`, `accent`, `labels`, `hover`.

## portal-transition

Best for final CTA, chapter convergence, and page route transitions. It compresses particles and rings toward a central vanishing point.

Config keys: `rings`, `intensity`, `color`, `accent`, `cameraPush`.

## gallery-scroll-sync

Best for portfolios and case study lists. DOM cards remain semantic while WebGL planes mirror their positions.

Config keys: `items`, `syncSelector`, `distortion`, `parallax`.

## product-orbit

Best for product launches, hardware reveals, platform cores, and hero object moments when no real 3D model is available. It renders a procedural faceted core with orbit rings and satellites so the page has a tangible object rather than only abstract particles.

Config keys: `core`, `rings`, `satellites`, `cameraPush`.

## Selection Pattern

For a 1-page product site, use `video-composite -> modular-interface -> portal-transition`.
For a studio/portfolio, use `light-ribbon -> gallery-scroll-sync -> distorted-media-plane`.
For a launch page, use `video-composite -> product-orbit -> depth-composite -> portal-transition`.




