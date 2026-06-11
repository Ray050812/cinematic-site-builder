export function createFallbackRenderer({ canvas, config, reducedMotion }) {
  const ctx = canvas.getContext("2d");
  const particles = Array.from({ length: reducedMotion ? 80 : 180 }, (_, index) => ({
    seed: index * 17.17,
    radius: 0.6 + (index % 5) * 0.4
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    update(snapshot, time) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const compact = width < 720;
      const cx = compact ? width * 0.82 : width * 0.66;
      const cy = compact ? height * 0.36 : height * 0.5;
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height));
      gradient.addColorStop(0, `${config.theme?.color || "#8cecff"}33`);
      gradient.addColorStop(0.42, `${config.theme?.accent || "#ffd08a"}16`);
      gradient.addColorStop(1, `${config.theme?.background || "#05070a"}ff`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const pulse = reducedMotion ? 0.4 : 0.4 + Math.sin(time * 0.8) * 0.2;
      for (const p of particles) {
        const a = p.seed + snapshot.progress * 8;
        const orbit = compact
          ? 48 + (p.seed % 190) + snapshot.local * 60
          : 90 + (p.seed % 320) + snapshot.local * 120;
        const x = cx + Math.cos(a * 0.17) * orbit + snapshot.pointer.x * 24;
        const y = cy + Math.sin(a * 0.13) * orbit * (compact ? 0.42 : 0.55) + snapshot.pointer.y * 24;
        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.seed % 3 === 0 ? `${config.theme?.accent || "#ffd08a"}aa` : `${config.theme?.color || "#8cecff"}99`;
        ctx.fill();
      }

      ctx.strokeStyle = `${config.theme?.color || "#8cecff"}44`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        const radius = compact
          ? 54 + i * 38 + snapshot.progress * 54
          : 86 + i * 56 + snapshot.progress * 90;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
}
