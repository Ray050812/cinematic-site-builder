export default {
  "meta": {
    "title": "Neural Orb - Immersive AI Interface",
    "brand": "Neural Orb",
    "description": "A cinematic AI-era website generated from the modified cinematic-site-builder plugin runtime."
  },
  "theme": {
    "color": "#6ee7ff",
    "accent": "#fff0b8",
    "background": "#030407",
    "density": "premium"
  },
  "chapters": [
    {
      "id": "hero",
      "label": "Subject",
      "range": [0, 0.24],
      "copy": {
        "eyebrow": "Real Subject Hero",
        "title": "A photographed landmark becomes a cinematic 3D subject",
        "body": "The starter scene combines procedural architecture, HD image layers, model-follow photo anchoring, mouse zoom, and scroll-synced WebGL motion."
      },
      "scene": {
        "preset": "researched-3d-subject",
        "subject": {
          "name": "Yellow Crane Tower",
          "type": "landmark",
          "location": "Wuhan, China"
        },
        "subjectType": "landmark",
        "architecture": "tiered-pavilion",
        "landmark": "Yellow Crane Tower",
        "location": "Wuhan",
        "photoFollowModel": true,
        "scale": 1.08,
        "particles": 720,
        "imageLayers": 5,
        "imageOrbitRadius": 1.86,
        "imageRotateSpeed": 0.13,
        "photoOffsetX": -0.16,
        "photoOffsetY": 0.03,
        "photoOffsetZ": -0.7,
        "photoScale": 1.04,
        "realismImages": [
          {
            "src": "/media/canva/yellow-crane-tower-photo.jpg",
            "role": "featured-real-photo",
            "aspect": 0.72,
            "featuredHeight": 1.78,
            "height": 0.9,
            "anisotropy": 8
          }
        ]
      }
    },
    {
      "id": "film",
      "label": "Film",
      "range": [0.2, 0.44],
      "copy": {
        "eyebrow": "Video Composite Layer",
        "title": "Generated footage becomes navigable space",
        "body": "Poster frames and future mp4/webm loops can be treated with scanlines, glow, distortion, and scroll-scrubbed depth."
      },
      "scene": {
        "preset": "video-composite",
        "poster": "/media/interface-overview.svg",
        "media": ["/media/interface-detail.svg"],
        "scrub": true,
        "particles": 260
      }
    },
    {
      "id": "depth",
      "label": "Depth",
      "range": [0.4, 0.64],
      "copy": {
        "eyebrow": "Depth Interface",
        "title": "Every screen bends into the orbital field",
        "body": "Layered media planes, beams, particles, and scanlines make product UI feel embedded in the same cinematic system."
      },
      "scene": {
        "preset": "depth-composite",
        "panels": 6,
        "particles": 380,
        "media": [
          "/media/interface-overview.svg",
          "/media/interface-detail.svg"
        ]
      }
    },
    {
      "id": "system",
      "label": "Mesh",
      "range": [0.6, 0.84],
      "copy": {
        "eyebrow": "Control Mesh",
        "title": "Signals organize into operational modules",
        "body": "Floating blocks reveal how Codex can swap content, media, presets, and motion parameters without rewriting the renderer."
      },
      "scene": {
        "preset": "modular-interface",
        "modules": 12
      }
    },
    {
      "id": "ship",
      "label": "Gate",
      "range": [0.8, 1],
      "copy": {
        "eyebrow": "Launch Gate",
        "title": "A site generator built for cinematic product worlds",
        "body": "The plugin packages the workflow, templates, realistic 3D hero system, WebGL media presets, fallback rendering, and validation.",
        "cta": "Enter the build"
      },
      "scene": {
        "preset": "portal-transition",
        "rings": 11,
        "intensity": 0.92
      }
    }
  ]
};
