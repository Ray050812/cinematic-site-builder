import { createServer } from "vite";

const port = Number(process.env.SMOKE_PORT || 5203);
const urls = [
  `http://127.0.0.1:${port}/`,
  `http://127.0.0.1:${port}/?fallback=1`,
  `http://127.0.0.1:${port}/case`
];

let server;

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    return {
      url,
      status: response.status,
      hasCanvas: text.includes('id="scene"'),
      hasModule: text.includes("/src/main.js")
    };
  } finally {
    clearTimeout(timer);
  }
}

try {
  server = await createServer({
    root: process.cwd(),
    logLevel: "silent",
    clearScreen: false,
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true
    }
  });
  await server.listen();
  const results = [];
  for (const url of urls) {
    results.push(await fetchWithTimeout(url));
  }
  const ok = results.every((result) => result.status === 200 && result.hasCanvas && result.hasModule);
  console.log(JSON.stringify({ ok, results }, null, 2));
  if (!ok) process.exit(1);
} catch (error) {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
} finally {
  if (server) await server.close();
}
