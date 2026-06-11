export function clamp01(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export function localProgress(range, progress) {
  if (!Array.isArray(range) || range.length !== 2) return 0;
  return clamp01((progress - range[0]) / (range[1] - range[0]));
}

export function chapterAt(chapters, progress) {
  const p = clamp01(progress);
  return chapters.find((chapter) => p >= chapter.range[0] && p <= chapter.range[1])
    || chapters.reduce((closest, chapter) => {
      const currentDistance = Math.min(Math.abs(p - chapter.range[0]), Math.abs(p - chapter.range[1]));
      const closestDistance = Math.min(Math.abs(p - closest.range[0]), Math.abs(p - closest.range[1]));
      return currentDistance < closestDistance ? chapter : closest;
    }, chapters[0]);
}

export function normalizeSiteConfig(config) {
  if (Array.isArray(config.pages) && config.pages.length > 0) {
    return {
      ...config,
      pages: config.pages.map((page, index) => ({
        id: page.id || `page-${index + 1}`,
        label: page.label || page.id || `Page ${index + 1}`,
        route: page.route || (index === 0 ? "/" : `/${page.id || `page-${index + 1}`}`),
        chapters: page.chapters || []
      }))
    };
  }
  return {
    ...config,
    pages: [{
      id: "home",
      label: "Home",
      route: "/",
      chapters: config.chapters || []
    }]
  };
}

export function selectActivePage(config, pathname = "/") {
  const normalized = normalizeSiteConfig(config);
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  return normalized.pages.find((page) => (page.route.replace(/\/+$/, "") || "/") === cleanPath)
    || normalized.pages[0];
}

export function buildSnapshot(chapters, progress, targetProgress, pointer, zoom = 0) {
  const current = chapterAt(chapters, progress);
  const phases = Object.fromEntries(chapters.map((chapter) => [
    chapter.id,
    smoothstep(chapter.range[0], chapter.range[1], progress)
  ]));
  return {
    progress: clamp01(progress),
    targetProgress: clamp01(targetProgress),
    activeChapter: current,
    activeChapterId: current.id,
    local: localProgress(current.range, progress),
    phases,
    zoom: clamp01(zoom),
    pointer
  };
}

export function validateSiteConfig(config) {
  if (!config || typeof config !== "object") throw new Error("site.config must export an object");
  const normalized = normalizeSiteConfig(config);
  if (normalized.pages.length < 1 || normalized.pages.length > 3) {
    throw new Error("site.config supports 1 to 3 pages");
  }
  for (const page of normalized.pages) {
    if (!Array.isArray(page.chapters) || page.chapters.length < 1) {
      throw new Error(`Page ${page.id} requires at least one chapter`);
    }
    for (const chapter of page.chapters) {
      if (!chapter.id || typeof chapter.id !== "string") throw new Error("Each chapter requires a string id");
      if (!Array.isArray(chapter.range) || chapter.range.length !== 2) {
        throw new Error(`Chapter ${chapter.id} requires range [start, end]`);
      }
      const [start, end] = chapter.range;
      if (start < 0 || end > 1 || start >= end) {
        throw new Error(`Chapter ${chapter.id} has invalid range`);
      }
      if (!chapter.copy?.title) throw new Error(`Chapter ${chapter.id} requires copy.title`);
      if (!chapter.scene?.preset) throw new Error(`Chapter ${chapter.id} requires scene.preset`);
    }
  }
  return true;
}
