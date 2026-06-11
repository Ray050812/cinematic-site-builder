#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, "..");
const pluginRoot = path.resolve(skillRoot, "..", "..");

function parseArgs(argv) {
  const args = { starter: "ai-product", template: "vanilla-three-vite" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--name") args.name = argv[++i];
    else if (arg === "--out") args.out = argv[++i];
    else if (arg === "--starter") args.starter = argv[++i];
    else if (arg === "--template") args.template = argv[++i];
    else if (arg === "--force") args.force = true;
  }
  return args;
}

function safeProjectName(name) {
  return String(name || "cinematic-site")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "cinematic-site";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = safeProjectName(args.name);
  const outRoot = path.resolve(args.out || process.cwd());
  const target = path.join(outRoot, name);
  const templateDir = path.join(pluginRoot, "assets", "templates", args.template);
  const starterPath = path.join(pluginRoot, "assets", "starter-configs", `${args.starter}.json`);

  if (!existsSync(templateDir)) {
    throw new Error(`Unknown template: ${args.template}`);
  }
  if (!existsSync(starterPath)) {
    throw new Error(`Unknown starter config: ${args.starter}`);
  }
  if (existsSync(target) && !args.force) {
    throw new Error(`Target exists: ${target}. Pass --force to overwrite intentionally.`);
  }

  await mkdir(outRoot, { recursive: true });
  await cp(templateDir, target, { recursive: true, force: Boolean(args.force), errorOnExist: !args.force });

  const starter = await readFile(starterPath, "utf8");
  const packagePath = path.join(target, "package.json");
  const configPath = path.join(target, "site.config.js");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  packageJson.name = name;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(configPath, `export default ${starter.trim()};\n`);

  console.log(JSON.stringify({
    ok: true,
    project: target,
    template: args.template,
    starter: args.starter,
    next: [
      `cd ${target}`,
      "npm install",
      "npm run validate:config",
      "npm run dev"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
