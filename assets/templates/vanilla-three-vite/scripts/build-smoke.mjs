import { build } from "vite";

try {
  const output = await build({
    root: process.cwd(),
    logLevel: "warn",
    clearScreen: false,
    build: {
      write: false
    }
  });
  const outputs = (Array.isArray(output) ? output.flatMap((item) => item.output || []) : output.output || [])
    .map((item) => ({ type: item.type, fileName: item.fileName }));
  console.log(JSON.stringify({ ok: true, outputs }, null, 2));
} catch (error) {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
}
