import config from "../site.config.js";
import { normalizeSiteConfig, validateSiteConfig } from "../src/cinematic/runtime/logic.js";

const allowedPresets = new Set([
  "particle-field",
  "ai-era-sphere",
  "researched-3d-subject",
  "video-composite",
  "light-ribbon",
  "depth-composite",
  "distorted-media-plane",
  "modular-interface",
  "portal-transition",
  "gallery-scroll-sync",
  "product-orbit"
]);

try {
  validateSiteConfig(config);
  const normalized = normalizeSiteConfig(config);
  const ids = new Set();
  for (const page of normalized.pages) {
    for (const chapter of page.chapters) {
      const scopedId = `${page.id}:${chapter.id}`;
      if (ids.has(scopedId)) throw new Error(`Duplicate chapter id: ${scopedId}`);
      ids.add(scopedId);
      if (!allowedPresets.has(chapter.scene?.preset)) {
        throw new Error(`Unknown preset in ${scopedId}: ${chapter.scene?.preset}`);
      }
    }
  }
  console.log(JSON.stringify({
    ok: true,
    title: config.meta?.title,
    pages: normalized.pages.map((page) => ({
      id: page.id,
      route: page.route,
      chapters: page.chapters.map((chapter) => ({
        id: chapter.id,
        range: chapter.range,
        preset: chapter.scene?.preset
      }))
    }))
  }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

