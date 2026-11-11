#!/usr/bin/env node
/**
 * The Phase 2 gate: five scenarios, recorded at 4x CPU throttle, reporting the
 * longest frame in each. The budget is 16.7ms — one frame at 60fps.
 *
 * Frame times come from requestAnimationFrame deltas inside the page rather
 * than from a trace file, because the question is what the reader's display
 * actually missed, and a dropped frame shows up as a long gap either way.
 *
 *   node scripts/measure-frames.mjs [origin]
 */
import { startGroup, stopAll, stopOnExit } from "./lib/processes.mjs";
import { setTimeout as wait } from "node:timers/promises";

const origin = process.argv[2] ?? "http://localhost:3000";
/* --reduced runs the same five scenarios with prefers-reduced-motion on, which
   turns every animation off. It is the control: whatever is still slow with
   motion disabled is the cost of rendering the route, not of animating it. */
const reducedMotion = process.argv.includes("--reduced");
const port = 9370;
const BUDGET = 16.7;

stopOnExit();
startGroup("chromium", ["--headless","--no-sandbox","--disable-gpu",
  `--remote-debugging-port=${port}`,"--window-size=1280,900","about:blank"], { stdio: "ignore" });

async function endpoint() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = pages.find((p) => p.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await wait(250);
  }
  throw new Error("devtools never came up");
}

const socket = new WebSocket(await endpoint());
await new Promise((r) => socket.addEventListener("open", r, { once: true }));

let id = 0;
const pending = new Map();
socket.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) => {
  const i = ++id;
  socket.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pending.set(i, r));
};
const ev = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }))?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Emulation.setCPUThrottlingRate", { rate: 4 });
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }],
});
console.log(reducedMotion ? "control run: motion disabled\n" : "motion enabled\n");

const RECORD = `window.__frames = []; (function(){
  let last = performance.now();
  const loop = (t) => { window.__frames.push(+(t - last).toFixed(1)); last = t; window.__raf = requestAnimationFrame(loop); };
  window.__raf = requestAnimationFrame(loop);
})(); 'recording'`;

const STOP = `(cancelAnimationFrame(window.__raf), window.__frames.slice(2))`;

async function scenario(name, run) {
  await ev(RECORD);
  await run();
  const frames = (await ev(STOP)) ?? [];
  const longest = frames.length ? Math.max(...frames) : 0;
  const over = frames.filter((f) => f > BUDGET).length;
  const verdict = longest <= BUDGET ? "PASS" : "over";
  console.log(
    `${name.padEnd(26)} longest ${longest.toFixed(1).padStart(6)}ms  frames ${String(frames.length).padStart(4)}  over budget ${String(over).padStart(3)}  ${verdict}`,
  );
  return { name, longest, over, frames: frames.length };
}

const results = [];

await send("Page.navigate", { url: `${origin}/` });
await wait(3000);

results.push(await scenario("cold navigation to /work", async () => {
  await ev(`document.querySelector('nav a[href="/work"]').click()`);
  await wait(1500);
}));

results.push(await scenario("browser Back", async () => {
  await ev(`history.back()`);
  await wait(1500);
}));

results.push(await scenario("mid-flight cancel", async () => {
  await ev(`document.querySelector('nav a[href="/work"]').click()`);
  await wait(70);
  await ev(`document.querySelector('nav a[href="/about"]').click()`);
  await wait(1500);
}));

await send("Page.navigate", { url: `${origin}/work/todo-app` });
await wait(2500);
results.push(await scenario("case-study scroll", async () => {
  for (let i = 0; i < 10; i += 1) {
    await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 640, y: 500, deltaX: 0, deltaY: 300 });
    await wait(140);
  }
  await wait(600);
}));

results.push(await scenario("offline mid-navigation", async () => {
  await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await ev(`document.querySelector('a[href="/work"]')?.click()`);
  await wait(1800);
  await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
}));

/* Nothing may be left mid-transition after the offline attempt. */
const stranded = await ev(`(() => {
  const main = document.querySelector('main > div');
  const op = main ? +getComputedStyle(main).opacity : 1;
  return { templateOpacity: op, bodyOverflow: document.body.style.overflow || '(none)', drawerOpen: !!document.getElementById('mobile-menu') };
})()`);
console.log("\nafter offline attempt:", JSON.stringify(stranded));

const failed = results.filter((r) => r.longest > BUDGET);
console.log(failed.length ? `\n${failed.length} scenario(s) over the 16.7ms budget` : "\nall five scenarios inside the 16.7ms budget");

socket.close();
stopAll();
process.exit(0);
