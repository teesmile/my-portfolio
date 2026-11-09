#!/usr/bin/env node
/**
 * Photographs each Writing piece's share image: /share/<slug>, laid out at
 * exactly 1200×630, captured 1:1 at device scale 1 into
 * public/share/<slug>.png. The opengraph-image route serves that file.
 *
 *   pnpm build && pnpm share
 *
 * 1:1 is the point: a share card rendered at another size and resampled
 * blurs its type, and this one is mostly type and hairlines. The script
 * waits for fonts and images (the portrait scene embeds /profile.webp),
 * hides the site chrome, and checks each PNG's header reads 1200×630.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const root = process.cwd();
const outDir = path.join(root, "public", "share");
const WIDTH = 1200;
const HEIGHT = 630;

const freePort = () =>
  new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

if (!(await stat(path.join(root, ".next", "BUILD_ID")).catch(() => null))) {
  console.error("No build found. Run pnpm build first.");
  process.exit(1);
}

const source = await readFile(path.join(root, "src/config/writing.ts"), "utf8");
const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const PORT = await freePort();
const DEBUG = await freePort();
const server = spawn("pnpm", ["start", "--port", String(PORT)], { stdio: "ignore" });
const chrome = spawn("chromium", ["--headless=new", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${DEBUG}`, "about:blank"], { stdio: "ignore" });
const stop = () => { server.kill("SIGKILL"); chrome.kill("SIGKILL"); };
process.on("exit", stop);

async function ready(check, label) {
  for (let i = 0; i < 60; i += 1) {
    try { const value = await check(); if (value) return value; } catch {}
    await wait(400);
  }
  throw new Error(`${label} never became ready`);
}

await ready(() => fetch(`http://localhost:${PORT}/`).then((r) => r.ok), "the server");
const target = await ready(async () => {
  const pages = await fetch(`http://127.0.0.1:${DEBUG}/json/list`).then((r) => r.json());
  return pages.find((p) => p.type === "page")?.webSocketDebuggerUrl;
}, "chromium");

const socket = new WebSocket(target);
await new Promise((r) => socket.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); socket.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }))?.result?.value;

await send("Emulation.setDeviceMetricsOverride", { width: 1300, height: 900, deviceScaleFactor: 1, mobile: false });
/* Dark is the site's primary mode, and the share card follows it. */
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }, { name: "prefers-reduced-motion", value: "reduce" }] });
await mkdir(outDir, { recursive: true });

let failed = false;
for (const slug of slugs) {
  await send("Page.navigate", { url: `http://localhost:${PORT}/share/${slug}` });
  await ready(() => evaluate("document.readyState === 'complete' && !!document.querySelector('[data-share-frame]')"), `/share/${slug}`);
  await evaluate("document.fonts.ready.then(() => true)");
  /* SVG <image> elements have no load promise to await; wait until the
     portrait (if this scene has one) is in the resource timeline. */
  await ready(() => evaluate("![...document.querySelectorAll('svg image')].length || performance.getEntriesByType('resource').some((e) => e.name.includes('/profile.webp') && e.responseEnd > 0)"), `${slug} images`);
  await evaluate(`(() => { const s = document.createElement('style'); s.textContent = 'nav, footer { display: none !important } main { padding: 0 !important }'; document.head.append(s); document.documentElement.classList.remove('light'); return true; })()`);
  await wait(500);
  const box = await evaluate("(() => { const r = document.querySelector('[data-share-frame]').getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; })()");
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: box.x, y: box.y, width: WIDTH, height: HEIGHT, scale: 1 }, captureBeyondViewport: true });
  const png = Buffer.from(data, "base64");
  const w = png.readUInt32BE(16);
  const h = png.readUInt32BE(20);
  const file = path.join(outDir, `${slug}.png`);
  await writeFile(file, png);
  const ok = w === WIDTH && h === HEIGHT && box.w === WIDTH && box.h === HEIGHT;
  if (!ok) failed = true;
  console.log(`${slug.padEnd(40)} ${w}×${h}  ${Math.round(png.length / 1024)} KB${ok ? "" : "  << not 1200×630"}`);
}

socket.close();
stop();
if (failed) process.exit(1);
console.log(`\n${slugs.length} share images written to public/share/`);
