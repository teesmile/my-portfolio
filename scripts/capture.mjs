#!/usr/bin/env node
/**
 * Captures each live project at 1440x900 and writes a WebP under 200 KB to
 * public/work/<slug>.webp. Re-runnable: `pnpm capture`.
 *
 * Targets are read out of src/config/site.ts so the list cannot drift from the
 * projects the site actually shows. No iframes: every capture is a real page
 * load in headless Chromium, driven over the DevTools protocol.
 *
 * It waits in real time. It used to pass --virtual-time-budget, which
 * fast-forwards the page's clock instead of waiting: timers and animations
 * run instantly, but IndexedDB, which answers on its own schedule, never
 * caught up, so the todo app was captured mid-load with its spinner showing
 * every time. A page is now ready when its load event has fired, its fonts
 * are in, and any project-specific loading text (WAIT_FOR_GONE) has been
 * absent for a full second. Absent for a second, not merely absent: the
 * todo app renders its loading text client-side, so it is also absent in
 * the moment before the app mounts. Anything still loading after 20 s fails
 * the run with the URL and the text it was waiting on.
 */
import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { promisify } from "node:util";
import { setTimeout as wait } from "node:timers/promises";
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
const TIMEOUT_MS = 20_000;
const SETTLE_MS = 1_000;

/* Text a project shows while it is still loading, matched against
   textContent so visually hidden status text counts. */
const WAIT_FOR_GONE = {
  "todo-app": "Loading tasks",
};

async function targets() {
  const source = await readFile(path.join(root, "src/config/site.ts"), "utf8");
  const found = [];
  const pattern = /slug:\s*"([^"]+)"[\s\S]*?link:\s*"([^"]+)"/g;

  for (const match of source.matchAll(pattern)) {
    found.push({ slug: match[1], url: match[2] });
  }

  return found;
}

const freePort = () =>
  new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

async function browser() {
  const port = await freePort();
  const chrome = spawn(
    "chromium",
    ["--headless=new", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${port}`, "about:blank"],
    { stdio: "ignore" },
  );

  let target;
  for (let i = 0; i < 50 && !target; i += 1) {
    await wait(200);
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = pages.find((page) => page.type === "page");
    } catch {}
  }
  if (!target) throw new Error("chromium never opened a DevTools connection");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));

  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message.result ?? { error: message.error });
      pending.delete(message.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const i = ++id;
      pending.set(i, resolve);
      socket.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }))?.result?.value;

  return {
    send,
    evaluate,
    close: () => {
      socket.close();
      chrome.kill("SIGKILL");
    },
  };
}

/* Real time, polled. Ready once the load event has fired and the loading
   text has been absent for SETTLE_MS in a row. */
async function waitUntilReady({ evaluate }, { slug, url }) {
  const text = WAIT_FOR_GONE[slug];
  const started = Date.now();
  let clearSince = null;

  while (Date.now() - started < TIMEOUT_MS) {
    const state = await evaluate(
      `({ loaded: document.readyState === "complete",
          loading: ${text ? `document.body?.textContent.includes(${JSON.stringify(text)}) ?? true` : "false"} })`,
    );

    if (state?.loaded && !state.loading) {
      clearSince ??= Date.now();
      if (Date.now() - clearSince >= SETTLE_MS) {
        await evaluate("document.fonts.ready.then(() => true)");
        return Date.now() - started;
      }
    } else {
      clearSince = null;
    }

    await wait(250);
  }

  throw new Error(
    text
      ? `${slug}: "${text}" was still on the page after ${TIMEOUT_MS / 1000}s at ${url}. The app never finished loading; nothing was captured.`
      : `${slug}: ${url} had not finished loading after ${TIMEOUT_MS / 1000}s; nothing was captured.`,
  );
}

async function capture(target) {
  const { slug, url } = target;
  const png = path.join(stageDir, `${slug}.png`);
  const webp = path.join(outDir, `${slug}.webp`);

  /* One fresh browser per project: a clean profile each time, so one app's
     storage can never leak into another's capture. */
  const page = await browser();
  try {
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.send("Page.enable");
    await page.send("Page.navigate", { url });
    const waited = await waitUntilReady(page, target);

    const { data } = await page.send("Page.captureScreenshot", { format: "png" });
    await writeFile(png, Buffer.from(data, "base64"));
    target.waited = waited;
  } finally {
    page.close();
  }

  for (const quality of QUALITIES) {
    await run("convert", [png, "-resize", `${WIDTH}x${HEIGHT}`, "-quality", String(quality), webp]);
    const { size } = await stat(webp);

    if (size <= MAX_BYTES) {
      return { slug, url, size, quality, waited: target.waited };
    }
  }

  const { size } = await stat(webp);
  throw new Error(`${slug} is ${Math.round(size / 1024)} KB, over the 200 KB budget`);
}

/* Projects whose preview is captured by hand. Roasted's result card exists
   only after a live roast (three paid APIs, a different result each time),
   so an automatic capture would freeze its splash or empty form, and would
   overwrite the real result card in public/work/roasted.webp. */
const HAND_CAPTURED = new Set(["roasted"]);

const list = (await targets()).filter(({ slug }) => {
  if (!HAND_CAPTURED.has(slug)) return true;
  console.log(`${slug.padEnd(24)} skipped: preview is captured by hand`);
  return false;
});

if (list.length === 0) {
  console.error("No targets found in src/config/site.ts");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
await mkdir(stageDir, { recursive: true });

try {
  for (const target of list) {
    const result = await capture(target);
    console.log(
      `${result.slug.padEnd(24)} ${String(Math.round(result.size / 1024)).padStart(4)} KB  q${result.quality}  ready in ${(result.waited / 1000).toFixed(1)}s  ${result.url}`,
    );
  }
} catch (error) {
  console.error(`\ncapture failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await rm(stageDir, { recursive: true, force: true });
}

if (!process.exitCode) console.log(`\n${list.length} captures written to public/work/`);
