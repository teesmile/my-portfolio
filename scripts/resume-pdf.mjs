#!/usr/bin/env node
/**
 * Prints /resume to a PDF and then checks what an ATS would actually read.
 *
 *   pnpm resume                 default order
 *   pnpm resume --variant ai    AI-evaluation-led order, saved alongside
 *
 * The PDF is generated from the same component and the same data as the page,
 * so the document cannot drift from the site. The check afterwards is the
 * point: a resume that looks right and extracts as mush is worse than no PDF,
 * because nobody sees the failure.
 */
import { spawn, execFileSync } from "node:child_process";
import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";

/* Ask the OS for a port nobody is using. A fixed port meant a leftover server
   from an earlier run kept the port, this script's own server failed to bind
   silently, and the PDF was printed from whatever that old process was
   serving — which is exactly the kind of stale output this script exists to
   prevent. */
const freePort = () =>
  new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

const variantArg = process.argv.indexOf("--variant");
const variant = variantArg > -1 ? process.argv[variantArg + 1] : "default";
const PORT = await freePort();
const DEBUG_PORT = await freePort();
const OUT = path.join(
  process.cwd(),
  "public",
  variant === "ai" ? "Anthony-Ugwuja-Resume-AI.pdf" : "Anthony-Ugwuja-Resume.pdf",
);

/* The PDF is printed from the built app, so anything newer than the build
   would print as it used to look. Checking resume.ts alone was not enough:
   the page component and the print stylesheet decide the presentation, and a
   text-only ATS check cannot see that the layout is stale. So the whole of
   src/ counts, plus the config that shapes the build. */
const buildId = path.join(process.cwd(), ".next", "BUILD_ID");
const built = await stat(buildId).catch(() => null);

async function newestMtime(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let newest = 0;

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const mtime = entry.isDirectory()
      ? await newestMtime(full)
      : (await stat(full)).mtimeMs;
    if (mtime > newest) newest = mtime;
  }

  return newest;
}

const newestSource = Math.max(
  await newestMtime(path.join(process.cwd(), "src")),
  (await stat(path.join(process.cwd(), "next.config.ts"))).mtimeMs,
);

if (!built || newestSource > built.mtimeMs) {
  console.log(built ? "source is newer than the build — rebuilding" : "no build found — building");
  execFileSync("pnpm", ["build"], { stdio: "ignore" });
}

const server = spawn("pnpm", ["start", "--port", String(PORT)], { stdio: "ignore" });
const chrome = spawn("chromium", ["--headless","--no-sandbox","--disable-gpu",
  `--remote-debugging-port=${DEBUG_PORT}`,"about:blank"], { stdio: "ignore" });
const stop = () => { server.kill("SIGKILL"); chrome.kill("SIGKILL"); };
process.on("exit", stop);
process.on("SIGINT", () => { stop(); process.exit(1); });
process.on("uncaughtException", (error) => { console.error(error); stop(); process.exit(1); });

async function ready(check, label) {
  for (let i = 0; i < 60; i += 1) {
    try { const value = await check(); if (value) return value; } catch {}
    await wait(400);
  }
  throw new Error(`${label} never became ready`);
}

const url = `http://localhost:${PORT}/resume${variant === "ai" ? "?variant=ai" : ""}`;
await ready(() => fetch(url).then((r) => r.ok), "the server");
const target = await ready(async () => {
  const pages = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`).then((r) => r.json());
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
const send = (method, params = {}) => {
  const i = ++id;
  socket.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pending.set(i, r));
};

await send("Page.enable");
await send("Emulation.setEmulatedMedia", { media: "print" });
await send("Page.navigate", { url });
await wait(3500);

const { data } = await send("Page.printToPDF", {
  printBackground: false,
  paperWidth: 8.27,
  paperHeight: 11.69,
  marginTop: 0.55, marginBottom: 0.55, marginLeft: 0.55, marginRight: 0.55,
  displayHeaderFooter: false,
});
const bytes = Buffer.from(data, "base64");
await writeFile(OUT, bytes);
socket.close();
stop();

/* ---- what an ATS reads ---------------------------------------------- */

const sourceRaw = await readFile(path.join(process.cwd(), "src/content/resume.ts"), "utf8");
/* Comments describe the data; they are not the data. */
const source = sourceRaw
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  /* Not preceded by a colon, or this eats the // inside every https:// URL
     and then reports those URLs as text the PDF invented. */
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
/* Values only: quoted strings with no newline in them. Keys in a TS object
   literal are unquoted, so this picks up content and not structure. */
const ignore = new Set(["default", "ai"]);
/* The variant not being printed, and hrefs, which are attributes rather than
   text a reader or a parser ever sees. */
/* Anchored to the titles block: a bare /ai: '...'/ also matches the AI PDF
   path, and the wrong title then gets required in the wrong document. */
const titlesBlock = /titles:\s*\{([\s\S]*?)\}/.exec(sourceRaw)?.[1] ?? "";
const otherTitle = variant === "ai"
  ? /default:\s*'([^']+)'/.exec(titlesBlock)?.[1]
  : /ai:\s*'([^']+)'/.exec(titlesBlock)?.[1];
const isHref = (value) => /^(https?:|mailto:|tel:|\/)/.test(value);
const strings = [...source.matchAll(/'([^'\n\\]{4,})'|"([^"\n\\]{4,})"/g)]
  .map((m) => m[1] ?? m[2])
  .filter((value) => !ignore.has(value) && !isHref(value) && value !== otherTitle);

const txt = path.join(process.cwd(), ".capture-resume.txt");
execFileSync("pdftotext", ["-layout", OUT, txt]);
const extracted = await readFile(txt, "utf8");
/* Dashes survive the round trip in several forms; normalise both sides so a
   typographic en dash is not reported as missing content. */
const normalise = (value) => value.replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ").trim();
const flat = normalise(extracted);

console.log("\n".padEnd(72, "-"));
console.log(extracted.trim());
console.log("".padEnd(72, "-"));

const failures = [];

/* Every bullet, heading and line from the data must survive the round trip. */
const mustAppear = strings.filter((s) => /[a-z]{3}/i.test(s));
for (const text of mustAppear) {
  if (!flat.includes(normalise(text))) {
    failures.push(`missing from the PDF text: "${text.slice(0, 68)}"`);
  }
}

/* Any word in the PDF that is not a word in the source is either two words
   fused together or something web-only that leaked into print. */
/* URLs print without their scheme, so compare them without one. */
const stripScheme = (value) => value.replace(/^(https?:)?\/\//, "").replace(/\/$/, "");
const sourceWords = new Set(
  source.toLowerCase().replace(/[^a-z0-9+#./:-]+/g, " ").split(/\s+/)
    .flatMap((word) => [word, stripScheme(word)])
    .filter(Boolean),
);
const unknown = [...new Set(
  flat.toLowerCase().replace(/[^a-z0-9+#./|-]+/g, " ").split(/\s+/)
    .map(stripScheme)
    .filter((w) => w.length > 3 && !sourceWords.has(w) && !/^[0-9.]+$/.test(w)),
)];
if (unknown.length) failures.push(`words in the PDF that are not in resume.ts: ${unknown.join(", ")}`);

/* Anything that exists only for the web has no business in a document. */
for (const webOnly of ["Download PDF", "Get in touch", "Switch between light and dark"]) {
  if (flat.includes(webOnly)) failures.push(`web-only text in the PDF: "${webOnly}"`);
}

console.log(`${path.relative(process.cwd(), OUT)} — ${Math.round(bytes.length / 1024)} KB, variant: ${variant}`);

if (failures.length) {
  console.error(`\nATS check failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

console.log("ATS check passed: every bullet and heading survives extraction, no fused words, no web-only text.");
process.exit(0);
