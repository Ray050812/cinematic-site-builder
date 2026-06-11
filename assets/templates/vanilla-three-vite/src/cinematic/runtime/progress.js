import { buildSnapshot, clamp01 } from "./logic.js";

export function createProgressController({ chapters, inertia = 0.085, initialProgress = 0 }) {
  const startProgress = clamp01(initialProgress);
  const state = {
    progress: startProgress,
    targetProgress: startProgress,
    zoom: 0,
    targetZoom: 0,
    pointer: { x: 0, y: 0, active: false, zooming: false }
  };

  function setTarget(value) {
    state.targetProgress = clamp01(value);
  }

  function step(delta) {
    setTarget(state.targetProgress + delta);
  }

  function setZoom(value) {
    state.targetZoom = clamp01(value);
  }

  function stepZoom(delta) {
    setZoom(state.targetZoom + delta);
  }

  window.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.shiftKey || event.ctrlKey) {
      stepZoom(-event.deltaY / 900);
    } else {
      step(event.deltaY / 3200);
    }
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "PageDown") step(0.1);
    if (event.key === "ArrowUp" || event.key === "PageUp") step(-0.1);
    if (event.key === "Home") setTarget(0);
    if (event.key === "End") setTarget(1);
    if (event.key === "+" || event.key === "=") stepZoom(0.12);
    if (event.key === "-" || event.key === "_") stepZoom(-0.12);
    if (event.key === "Escape") setZoom(0);
  });

  let touchStartY = 0;
  window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const y = event.touches[0]?.clientY || touchStartY;
    step((touchStartY - y) / 1800);
    touchStartY = y;
  }, { passive: true });

  let zoomStartY = 0;
  let zoomStart = 0;

  window.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target?.closest?.("a, button")) return;
    state.pointer.zooming = true;
    zoomStartY = event.clientY;
    zoomStart = state.targetZoom;
    document.body.dataset.zooming = "true";
  });

  window.addEventListener("pointerup", () => {
    state.pointer.zooming = false;
    delete document.body.dataset.zooming;
  });

  window.addEventListener("pointercancel", () => {
    state.pointer.zooming = false;
    delete document.body.dataset.zooming;
  });

  window.addEventListener("pointermove", (event) => {
    state.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    state.pointer.active = true;
    if (state.pointer.zooming) {
      setZoom(zoomStart + (zoomStartY - event.clientY) / 360);
    }
  });

  return {
    state,
    setTarget,
    setZoom,
    tick() {
      state.progress += (state.targetProgress - state.progress) * inertia;
      state.zoom += (state.targetZoom - state.zoom) * 0.12;
      if (Math.abs(state.targetProgress - state.progress) < 0.0001) state.progress = state.targetProgress;
      if (Math.abs(state.targetZoom - state.zoom) < 0.0001) state.zoom = state.targetZoom;
      return buildSnapshot(chapters, state.progress, state.targetProgress, state.pointer, state.zoom);
    }
  };
}
