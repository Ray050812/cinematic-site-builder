export function createDomLayer(config, progressController) {
  const brand = document.querySelector("[data-brand]");
  const nav = document.querySelector("[data-nav]");
  const chaptersRoot = document.querySelector("#chapters");
  const progressBar = document.querySelector("[data-progress-bar]");
  const progressLabel = document.querySelector("[data-progress-label]");
  const activeLabel = document.querySelector("[data-active-label]");

  brand.textContent = config.meta?.brand || config.meta?.title || "Cinematic";

  const chapterEls = new Map();
  chaptersRoot.innerHTML = "";
  nav.innerHTML = "";

  if (Array.isArray(config.pages) && config.pages.length > 1) {
    config.pages.forEach((page) => {
      const link = document.createElement("a");
      link.className = "page-link";
      link.href = page.route;
      link.textContent = page.label || page.id;
      link.setAttribute("aria-current", page.id === config.activePage?.id ? "page" : "false");
      nav.append(link);
    });
  }

  config.chapters.forEach((chapter, index) => {
    const section = document.createElement("section");
    section.className = "chapter";
    section.dataset.chapter = chapter.id;
    section.dataset.preset = chapter.scene?.preset || "";
    section.innerHTML = `
      <p class="eyebrow">${chapter.copy.eyebrow || chapter.label || chapter.id}</p>
      <h${index === 0 ? "1" : "2"}>${chapter.copy.title}</h${index === 0 ? "1" : "2"}>
      <p>${chapter.copy.body || ""}</p>
      ${chapter.copy.cta ? `<a class="cta" href="${chapter.copy.ctaHref || `#${chapter.id}`}">${chapter.copy.cta}</a>` : ""}
    `;
    chaptersRoot.append(section);
    chapterEls.set(chapter.id, section);

    const button = document.createElement("button");
    button.type = "button";
    button.title = chapter.label || chapter.id;
    button.textContent = String(index + 1);
    button.addEventListener("click", () => progressController.setTarget(chapter.range[0]));
    nav.append(button);
  });

  const navButtons = [...nav.querySelectorAll("button")];

  return {
    update(snapshot) {
      progressBar.style.width = `${Math.round(snapshot.progress * 1000) / 10}%`;
      progressLabel.textContent = `${Math.round(snapshot.progress * 100)}%`;
      activeLabel.textContent = snapshot.activeChapter.label || snapshot.activeChapter.id;
      const filmSweep = 18 + snapshot.progress * 64 + Math.sin(snapshot.local * Math.PI) * 9;
      const filmEnergy = Math.sin(snapshot.local * Math.PI);
      document.documentElement.style.setProperty("--film-sweep", `${filmSweep.toFixed(2)}%`);
      document.documentElement.style.setProperty("--film-phase", snapshot.local.toFixed(4));
      document.documentElement.style.setProperty("--film-energy", filmEnergy.toFixed(4));
      document.documentElement.style.setProperty("--film-opacity", (0.32 + filmEnergy * 0.12).toFixed(4));
      document.documentElement.style.setProperty("--film-drift", `${((snapshot.local - 0.5) * 10).toFixed(2)}px`);

      config.chapters.forEach((chapter, index) => {
        const phase = snapshot.phases[chapter.id];
        const el = chapterEls.get(chapter.id);
        const active = chapter.id === snapshot.activeChapterId;
        const entrance = Math.sin(Math.min(1, phase) * Math.PI);
        el.classList.toggle("is-active", active);
        const readableOpacity = active ? Math.max(0.94, entrance) : Math.max(0, entrance * 0.18);
        const isResearchedSubject = chapter.scene?.preset === "researched-3d-subject";
        const isCenteredHero = chapter.scene?.preset === "ai-era-sphere";
        el.style.opacity = String(readableOpacity);
        if (isResearchedSubject) {
          el.style.transform = `translate3d(0, ${((1 - Math.max(0.45, entrance)) * 10).toFixed(2)}px, 0)`;
        } else if (isCenteredHero) {
          const y = -43 + (1 - Math.max(0.45, entrance)) * 5;
          el.style.transform = `translate3d(-50%, ${y.toFixed(2)}%, 0)`;
          if (window.innerWidth <= 720) {
            el.style.transform = `translate3d(-50%, ${(-42 + (1 - Math.max(0.45, entrance)) * 5).toFixed(2)}%, 0)`;
          }
        } else {
          el.style.transform = `translate3d(0, ${(-50 + (1 - Math.max(0.45, entrance)) * 5).toFixed(2)}%, 0)`;
          if (window.innerWidth <= 720) el.style.transform = `translate3d(0, ${(1 - Math.max(0.45, entrance)) * 8}px, 0)`;
        }
        navButtons[index]?.setAttribute("aria-current", String(active));
      });
    }
  };
}



