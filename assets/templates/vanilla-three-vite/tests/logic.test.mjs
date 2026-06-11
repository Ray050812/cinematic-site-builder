import test from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, chapterAt, clamp01, localProgress, normalizeSiteConfig, selectActivePage, smoothstep, validateSiteConfig } from "../src/cinematic/runtime/logic.js";
import config from "../site.config.js";

test("clamp01 bounds values", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(2), 1);
});

test("smoothstep maps phase between edges", () => {
  assert.equal(smoothstep(0, 1, -1), 0);
  assert.equal(smoothstep(0, 1, 2), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
});

test("local progress is normalized", () => {
  assert.equal(localProgress([0.25, 0.75], 0.25), 0);
  assert.equal(localProgress([0.25, 0.75], 0.5), 0.5);
  assert.equal(localProgress([0.25, 0.75], 0.75), 1);
});

test("chapter lookup follows configured ranges", () => {
  assert.equal(chapterAt(config.chapters, 0.05).id, config.chapters[0].id);
  assert.equal(chapterAt(config.chapters, 0.95).id, config.chapters.at(-1).id);
});

test("snapshot carries clamped interactive zoom", () => {
  const snapshot = buildSnapshot(config.chapters, 0.05, 0.05, { x: 0, y: 0 }, 1.4);
  assert.equal(snapshot.zoom, 1);
});

test("starter config validates", () => {
  assert.equal(validateSiteConfig(config), true);
});

test("single-page configs normalize into pages", () => {
  const normalized = normalizeSiteConfig(config);
  assert.equal(normalized.pages.length, 1);
  assert.equal(normalized.pages[0].route, "/");
});

test("multi-page configs select by route", () => {
  const multi = {
    pages: [
      { id: "home", route: "/", chapters: config.chapters },
      { id: "case", route: "/case", chapters: config.chapters }
    ]
  };
  assert.equal(selectActivePage(multi, "/case").id, "case");
  assert.equal(validateSiteConfig(multi), true);
});

