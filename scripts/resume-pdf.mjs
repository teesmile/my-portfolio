#!/usr/bin/env node
/**
 * Prints /resume to a PDF and then checks what an ATS would actually read.
 *
 *   pnpm resume                      the master, linked on the site
 *   pnpm resume --variant ai         health-AI evaluation
 *   pnpm resume --variant general    fintech and operations
 *
 * Every version may run to two pages, never with a stub second page.
 *   --private                        adds the phone number, gitignored folder
 *
 * The PDF is generated from the same component and the same data as the page,
 * so the document cannot drift from the site. The check afterwards is the
 * point: a resume that looks right and extracts as mush is worse than no PDF,
 * because nobody sees the failure.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile, stat } from "node:fs/promises";
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
/* --private writes a copy carrying the phone number into a gitignored
   folder. The public document and the site never show it. */
const isPrivate = process.argv.includes("--private");
const PORT = await freePort();
const DEBUG_PORT = await freePort();
const VARIANTS = { default: "Anthony-Ugwuja-Resume.pdf", ai: "Anthony-Ugwuja-Resume-AI.pdf", general: "Anthony-Ugwuja-Resume-General.pdf" };
if (!VARIANTS[variant]) {
  console.error(`unknown variant "${variant}" — expected one of ${Object.keys(VARIANTS).join(", ")}`);
  process.exit(1);
}
const fileName = VARIANTS[variant];
const OUT = isPrivate
  ? path.join(process.cwd(), "private", fileName.replace(".pdf", "-private.pdf"))
  : path.join(process.cwd(), "public", fileName);

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

/* The private view is off unless this server is told otherwise, and only a
   --private run tells it. The server is local, started here and killed when
   this process exits, so the variable never exists anywhere a visitor could
   reach. */
const server = spawn("pnpm", ["start", "--port", String(PORT)], {
  stdio: "ignore",
  env: { ...process.env, ...(isPrivate ? { RESUME_ALLOW_PRIVATE: "1" } : {}) },
});
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

const query = [variant === "default" ? "" : `variant=${variant}`, isPrivate ? "private=1" : ""]
  .filter(Boolean)
  .join("&");
const url = `http://localhost:${PORT}/resume${query ? `?${query}` : ""}`;
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
await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", { media: "print" });
await send("Page.navigate", { url });

/* Wait for the fonts, not for a guess. A cold `next start` can still be
   serving font files after three seconds, and a resume laid out in fallback
   metrics is wider, longer, and prints an extra page — which is how the same
   build produced one page from a warm server and two from a cold one. */
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }))?.result?.value;

await evaluate("document.fonts.ready.then(() => true)");

/* Then wait for the layout to stop moving, so nothing is still arriving. */
let previousHeight = -1;
for (let attempt = 0; attempt < 20; attempt += 1) {
  const height = await evaluate("document.documentElement.scrollHeight");
  if (height === previousHeight) break;
  previousHeight = height;
  await wait(250);
}

/* What the page actually renders, taken from the live DOM in print media.
   This is the expectation the extraction is checked against.

   It used to be scraped out of resume.ts with a regex, which was a proxy for
   this and a bad one: it could not tell which strings belonged to which
   version, so the moment one version carried a line another did not, the
   check demanded text the document was right to omit. `innerText` respects
   the print stylesheet, so everything hidden on paper is already gone. */
const renderedText = await evaluate(
  "document.querySelector('main').innerText",
);
const renderedLines = renderedText
  .split("\n")
  .map((line) => line.replace(/\s+/g, " ").trim())
  .filter(Boolean);

/* Normal margins, A4. Every version may run to two pages (CLAUDE.md,
   Resume rule), so the margins are a reader's margins, not a squeeze. */
const MARGINS = { marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75 };
/* Used only for the tight reprint below. */
const TIGHT_MARGINS = { marginTop: 0.6, marginBottom: 0.6, marginLeft: 0.65, marginRight: 0.65 };
/* Fewer extracted lines than this on page two is "a few stray lines": about
   a quarter of a page at 11pt. A second page that short reads as an
   accident, so the document is tightened onto one page instead. */
const MIN_SECOND_PAGE_LINES = 12;

async function pageLines(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  const counts = [];
  for (let page = 1; page <= doc.numPages; page += 1) {
    const content = await (await doc.getPage(page)).getTextContent();
    const rows = new Set(content.items.filter((item) => item.str.trim()).map((item) => Math.round(item.transform[5])));
    counts.push(rows.size);
  }
  return counts;
}

async function print(tight) {
  await evaluate(tight
    ? "(document.documentElement.dataset.fit = 'tight', true)"
    : "(delete document.documentElement.dataset.fit, true)");
  const { data } = await send("Page.printToPDF", {
    printBackground: false,
    paperWidth: 8.27,
    paperHeight: 11.69,
    ...(tight ? TIGHT_MARGINS : MARGINS),
    displayHeaderFooter: false,
  });
  const buffer = Buffer.from(data, "base64");
  return { buffer, lines: await pageLines(buffer), tight };
}

let printed = await print(false);
let fitNote = "";
if (printed.lines.length === 2 && printed.lines[1] < MIN_SECOND_PAGE_LINES) {
  const tight = await print(true);
  fitNote = `page two held ${printed.lines[1]} lines; `;
  if (tight.lines.length === 1) {
    printed = tight;
    fitNote += "tightened onto one page";
  } else {
    fitNote += `tightening still left ${tight.lines.length} pages (${tight.lines.join(" + ")} lines)`;
  }
}

const bytes = printed.buffer;
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, bytes);
socket.close();
stop();

/* ---- what an ATS reads ------------------------------------------------ */

/* A line is allowed to break after an explicit hyphen — "terminal-based" at
   the end of a line extracts as "terminal- based". Closing that gap on both
   sides keeps a real fusion visible while letting legitimate typography
   through; dashes are already folded to "-" first, so a date range reads the
   same way on both sides of the comparison. */
const normalise = (value) =>
  value.replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ").replace(/-\s+/g, "-").trim();
const stripScheme = (value) => value.replace(/^(https?:)?\/\//, "").replace(/\/$/, "");

/* The same normalisation on both sides, or "works." in the page never
   matches "works" in the document and every sentence-ending word is
   reported as invented. */
const trim = (word) => word.replace(/^[|:.,-]+|[|:.,-]+$/g, "");
const wordsOf = (text) =>
  text.toLowerCase().replace(/[^a-z0-9+#./:&-]+/g, " ").split(/\s+/)
    /* The halves of a hyphenated compound count as words of their own: the
       page says "terminal-based", and a break at the hyphen puts "terminal"
       and "based" in the document without inventing anything. */
    .flatMap((word) => [word, trim(word), stripScheme(word), stripScheme(trim(word)), ...word.split("-")])
    .filter(Boolean);

const renderedWords = new Set(wordsOf(renderedText));
/* Lines short enough to be punctuation or a stray separator prove nothing,
   and a line with no letters cannot fuse with its neighbour. */
const expectedLines = renderedLines.filter((line) => line.length >= 4 && /[a-z]{3}/i.test(line));

/* Two extractors, because they disagree. pdftotext reconstructs a layout;
   pdfjs walks the text stream the way a parser written against the PDF spec
   would. A document can look perfect in one and arrive fused in the other,
   and the fused one is what an unknown ATS might be running. */
async function extractWithPdfjs(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await readFile(file)), useSystemFonts: true }).promise;
  let text = "";

  for (let page = 1; page <= doc.numPages; page += 1) {
    const content = await (await doc.getPage(page)).getTextContent();
    for (const item of content.items) {
      text += item.str + (item.hasEOL ? "\n" : "");
    }
    text += "\n";
  }

  return { text, pages: doc.numPages };
}

const txt = path.join(process.cwd(), ".capture-resume.txt");
execFileSync("pdftotext", ["-layout", OUT, txt]);
const layoutText = await readFile(txt, "utf8");
const { text: streamText, pages } = await extractWithPdfjs(OUT);

console.log("\n".padEnd(72, "-"));
console.log(layoutText.trim());
console.log("".padEnd(72, "-"));

function check(label, raw) {
  const flat = normalise(raw);
  const problems = [];

  /* Case-insensitive: the document is allowed to capitalise a label the
     data writes in lower case. */
  const haystack = flat.toLowerCase();

  for (const line of expectedLines) {
    if (!haystack.includes(normalise(line).toLowerCase())) {
      problems.push(`${label}: missing "${line.slice(0, 64)}"`);
    }
  }

  const unknown = [...new Set(
    flat.toLowerCase().replace(/[^a-z0-9+#./|:&-]+/g, " ").split(/\s+/)
      /* Trailing punctuation belongs to the sentence, not the word: a label
         rendered as "Frontend:" is still the word "Frontend". */
      .map((word) => stripScheme(trim(word)))
      .filter((word) => word.length > 3 && !renderedWords.has(word) && !/^[0-9.]+$/.test(word)),
  )];
  if (unknown.length) problems.push(`${label}: fused or unknown words — ${unknown.join(", ")}`);

  for (const webOnly of ["Download PDF", "Get in touch", "Switch between light and dark"]) {
    if (flat.includes(webOnly)) problems.push(`${label}: web-only text "${webOnly}"`);
  }

  if (!isPrivate && /\+234|903 ?257/.test(flat)) {
    problems.push(`${label}: phone number in a public document`);
  }

  return problems;
}

const failures = [
  ...check("pdftotext", layoutText),
  ...check("pdfjs", streamText),
];

/* Two pages for every version (CLAUDE.md, Resume rule). A second page
   is allowed; a second page holding a few stray lines is not — the print
   above has already tried to close that up, so if one is left it fails. */
const pageLimit = 2;
if (pages > pageLimit) failures.push(`${pages} pages — the limit is ${pageLimit}`);
const lastPage = printed.lines[printed.lines.length - 1];
if (pages === 2 && lastPage < MIN_SECOND_PAGE_LINES) {
  failures.push(`page two holds only ${lastPage} lines, even after tightening — cut a line or two, or add a section's worth`);
}

console.log(`${path.relative(process.cwd(), OUT)} — ${Math.round(bytes.length / 1024)} KB, ${pages} page${pages === 1 ? "" : "s"} (${printed.lines.join(" + ")} lines${printed.tight ? ", tight" : ""}), variant: ${variant}${isPrivate ? ", private" : ""}${fitNote ? ` — ${fitNote}` : ""}`);

if (failures.length) {
  console.error(`\nATS check failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

console.log("ATS check passed in both extractors: every line survives, no fused words, no web-only text, within the page limit.");
process.exit(0);
