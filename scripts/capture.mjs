#!/usr/bin/env node
/**
 * Captures each live project at 1440x900 and writes a WebP under 200 KB to
 * public/work/<slug>.webp. Re-runnable: `pnpm capture`.
 *
 * Targets are read out of src/config/site.ts so the list cannot drift from the
 * projects the site actually shows. No iframes: every capture is a real page
 * load in headless Chromium, with a virtual time budget so webfonts and
 * above-the-fold images settle before the shot.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const root = process.cwd();
const outDir = path.join(root, "public", "work");
/* Snap-confined Chromium cannot write into /tmp, so staging lives in-project. */
const stageDir = path.join(root, ".capture");

const WIDTH = 1440;
const HEIGHT = 900;
const MAX_BYTES = 200 * 1024;
const QUALITIES = [80, 72, 64, 56];

async function targets() {
  const source = await readFile(path.join(root, "src/config/site.ts"), "utf8");
  const found = [];
  const pattern = /slug:\s*"([^"]+)"[\s\S]*?link:\s*"([^"]+)"/g;

  for (const match of source.matchAll(pattern)) {
    found.push({ slug: match[1], url: match[2] });
  }

  return found;
}

async function capture({ slug, url }) {
  const png = path.join(stageDir, `${slug}.png`);
  const webp = path.join(outDir, `${slug}.webp`);

  await run("chromium", [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    `--virtual-time-budget=9000`,
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${png}`,
    url,
  ]).catch(() => {
    throw new Error(`chromium failed on ${url}`);
  });

  for (const quality of QUALITIES) {
    await run("convert", [png, "-resize", `${WIDTH}x${HEIGHT}`, "-quality", String(quality), webp]);
    const { size } = await stat(webp);

    if (size <= MAX_BYTES) {
      return { slug, url, size, quality };
    }
  }

  const { size } = await stat(webp);
  throw new Error(`${slug} is ${Math.round(size / 1024)} KB, over the 200 KB budget`);
}

const list = await targets();

if (list.length === 0) {
  console.error("No targets found in src/config/site.ts");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
await mkdir(stageDir, { recursive: true });

for (const target of list) {
  const result = await capture(target);
  console.log(
    `${result.slug.padEnd(24)} ${String(Math.round(result.size / 1024)).padStart(4)} KB  q${result.quality}  ${result.url}`,
  );
}

await rm(stageDir, { recursive: true, force: true });
console.log(`\n${list.length} captures written to public/work/`);
