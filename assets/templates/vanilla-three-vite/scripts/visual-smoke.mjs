import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

async function importPlaywright() {
  try {
    return await import("@playwright/test");
  } catch {
    throw new Error("Playwright is not installed. Run npm install before npm run visual:smoke.");
  }
}

function screenshotSignal(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  return {
    bytes: buffer.length,
    uniqueByteValues: new Set(sample).size
  };
}

async function collectPageReport(page, url, screenshotPath) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.dataset.renderMode, null, { timeout: 8000 });
  await page.waitForTimeout(350);
  const renderMode = await page.locator("body").getAttribute("data-render-mode");
  const renderError = await page.locator("body").getAttribute("data-render-error");
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: false });
  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("#scene");
    const active = [...document.querySelectorAll(".chapter")]
      .filter((node) => Number.parseFloat(getComputedStyle(node).opacity || "0") > 0.4)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          id: node.dataset.chapter,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          opacity: Number.parseFloat(getComputedStyle(node).opacity || "0")
        };
      });
    const overlaps = [];
    for (let i = 0; i < active.length; i += 1) {
      for (let j = i + 1; j < active.length; j += 1) {
        const a = active[i];
        const b = active[j];
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (overlapX * overlapY > 1200) overlaps.push([a.id, b.id, Math.round(overlapX * overlapY)]);
      }
    }
    return {
      title: document.title,
      renderMode: document.body.dataset.renderMode,
      canvas: canvas ? {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight
      } : null,
      activeChapters: active,
      lowOpacityActive: active.filter((item) => item.opacity < 0.72),
      overlaps
    };
  });
  return {
    url,
    renderMode,
    renderError,
    screenshot: screenshotPath,
    screenshotSignal: screenshotSignal(screenshot),
    metrics
  };
}

const { chromium } = await importPlaywright();
const port = Number(process.env.SMOKE_PORT || 5205);
let server;

try {
  await mkdir("artifacts", { recursive: true });
  server = await createServer({
    root: process.cwd(),
    logLevel: "silent",
    clearScreen: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true
    }
  });
  await server.listen();

  const browser = await chromium.launch();
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const desktopHome = await collectPageReport(desktop, `http://127.0.0.1:${port}/`, path.join("artifacts", "desktop-home.png"));
  const desktopMid = await collectPageReport(desktop, `http://127.0.0.1:${port}/?progress=0.55`, path.join("artifacts", "desktop-mid-scroll.png"));

  const casePage = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const caseReport = await collectPageReport(casePage, `http://127.0.0.1:${port}/case`, path.join("artifacts", "desktop-case.png"));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobileFallback = await collectPageReport(mobile, `http://127.0.0.1:${port}/?fallback=1`, path.join("artifacts", "mobile-fallback.png"));

  await browser.close();

  const reports = [desktopHome, desktopMid, caseReport, mobileFallback];
  const failures = [];
  for (const report of reports) {
    if (!report.renderMode) failures.push(`${report.url}: render mode missing`);
    if (report.screenshotSignal.bytes < 5000 || report.screenshotSignal.uniqueByteValues < 24) {
      failures.push(`${report.url}: screenshot appears blank or too uniform`);
    }
    if (report.metrics?.overlaps?.length) {
      failures.push(`${report.url}: visible chapter overlap ${JSON.stringify(report.metrics.overlaps)}`);
    }
    if (report.metrics?.lowOpacityActive?.length) {
      failures.push(`${report.url}: active chapter opacity too low ${JSON.stringify(report.metrics.lowOpacityActive)}`);
    }
    if (report.metrics?.canvas && (report.metrics.canvas.clientWidth < 300 || report.metrics.canvas.clientHeight < 300)) {
      failures.push(`${report.url}: canvas viewport too small`);
    }
  }
  if (mobileFallback.renderMode !== "fallback") failures.push("mobile fallback did not activate fallback renderer");

  const result = {
    ok: failures.length === 0,
    failures,
    reports
  };
  await writeFile(path.join("artifacts", "visual-report.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (failures.length) process.exit(1);
} finally {
  if (server) await server.close();
}
