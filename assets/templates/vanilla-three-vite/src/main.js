import siteConfig from "../site.config.js";
import { selectActivePage, validateSiteConfig } from "./cinematic/runtime/logic.js";
import { createProgressController } from "./cinematic/runtime/progress.js";
import { createDomLayer } from "./cinematic/runtime/domLayer.js";
import { createFallbackRenderer } from "./cinematic/runtime/fallbackCanvas.js";

const canvas = document.querySelector("#scene");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(window.location.search);
const forceFallback = params.has("fallback");
const initialProgress = Number.parseFloat(params.get("progress") || "0");

validateSiteConfig(siteConfig);
const activePage = selectActivePage(siteConfig, window.location.pathname);
const runtimeConfig = {
  ...siteConfig,
  activePage,
  chapters: activePage.chapters
};
document.title = siteConfig.meta?.title || siteConfig.meta?.brand || "Cinematic Site";
document.documentElement.style.setProperty("--color-main", siteConfig.theme?.color || "#8cecff");
document.documentElement.style.setProperty("--color-accent", siteConfig.theme?.accent || "#ffd08a");
document.documentElement.style.setProperty("--color-bg", siteConfig.theme?.background || "#05070a");

const progress = createProgressController({
  chapters: runtimeConfig.chapters,
  inertia: prefersReducedMotion ? 0.2 : 0.085,
  initialProgress: Number.isFinite(initialProgress) ? initialProgress : 0
});
const dom = createDomLayer(runtimeConfig, progress);

async function boot() {
  let renderer;
  try {
    if (forceFallback) throw new Error("Fallback requested");
    const { createThreeRenderer } = await import("./cinematic/runtime/threeLayer.js");
    renderer = await createThreeRenderer({ canvas, config: runtimeConfig, reducedMotion: prefersReducedMotion });
    document.body.dataset.renderMode = "webgl";
  } catch (error) {
    console.warn("[cinematic-site] WebGL renderer unavailable; using fallback.", error);
    renderer = createFallbackRenderer({ canvas, config: runtimeConfig, reducedMotion: prefersReducedMotion });
    document.body.dataset.renderMode = "fallback";
    document.body.dataset.renderError = String(error?.message || error).slice(0, 180);
  }

  function frame(time) {
    const snapshot = progress.tick();
    document.body.dataset.zoom = snapshot.zoom.toFixed(3);
    dom.update(snapshot);
    renderer.update(snapshot, time * 0.001);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

boot();


