#!/usr/bin/env node
/**
 * Reproduces layout shift across a *route change*, which a screenshot cannot
 * do. Drives headless Chromium over the DevTools Protocol: load a scrolling
 * page, measure the fixed nav, navigate client-side to a short page, measure
 * again. Any difference in the nav's left/right edge is the shake.
 *
 *   node scripts/measure-shift.mjs [origin] [width] [height]
 */
import { startGroup, stopAll, stopOnExit } from "./lib/processes.mjs";
import { setTimeout as wait } from "node:timers/promises";

const origin = process.argv[2] ?? "http://localhost:3000";
const width = Number(process.argv[3] ?? 1280);
const height = Number(process.argv[4] ?? 900);
const port = 9222;

stopOnExit();
startGroup("chromium", [
  "--headless",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--window-size=${width},${height}`,
  "about:blank",
], { stdio: "ignore" });

async function target() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* chromium is still starting */
    }
    await wait(250);
  }
  throw new Error("chromium devtools endpoint never appeared");
}

const socket = new WebSocket(await target());
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));

let nextId = 0;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result);
    pending.delete(message.id);
  }
});

function send(method, params = {}) {
  const id = (nextId += 1);
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result?.result?.value;
}

const MEASURE = `(() => {
  const nav = document.querySelector('nav');
  const rect = nav.getBoundingClientRect();
  return {
    path: location.pathname,
    navLeft: +rect.left.toFixed(2),
    navWidth: +rect.width.toFixed(2),
    wordmarkLeft: +document.querySelector('nav a').getBoundingClientRect().left.toFixed(2),
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    scrollbar: window.innerWidth - document.documentElement.clientWidth,
    pageScrolls: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  };
})()`;

await send("Page.enable");
await send("Runtime.enable");

await send("Page.navigate", { url: `${origin}/work` });
await wait(2500);
const before = await evaluate(MEASURE);

/* A real client-side navigation, not a fresh load: this is the transition the
   shake actually happens on. */
await evaluate(`document.querySelector('nav a[href="/contact"]').click()`);
await wait(1800);
const after = await evaluate(MEASURE);

const shifted =
  before.navLeft !== after.navLeft ||
  before.navWidth !== after.navWidth ||
  before.wordmarkLeft !== after.wordmarkLeft;

console.log(JSON.stringify({ shiftFree: !shifted, before, after }, null, 2));

socket.close();
stopAll();
process.exit(shifted ? 1 : 0);
