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
 * Documents kept off the site (a CV for another field, a copy tailored to
 * one job) are JSON files outside the repo, in the shape of
 * src/content/resume-document.ts, printed through the same page:
 *   --document <file.json> --out <file.pdf>
 *                                    prints that document, with the phone
 *   --variant <v> --dump <file.json> writes a version as such a document,
 *                                    as the starting point for a tailored copy
 *
 * The PDF is generated from the same component and the same data as the page,
 * so the document cannot drift from the site. The check afterwards is the
 * point: a resume that looks right and extracts as mush is worse than no PDF,
 * because nobody sees the failure.
 */
import { execFileSync } from "node:child_process";
import { startGroup, stopAll, stopOnExit } from "./lib/processes.mjs";
import { mkdir, readFile, readdir, writeFile, stat } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
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
const argValue = (flag) => {
  const at = process.argv.indexOf(flag);
  return at > -1 ? process.argv[at + 1] : undefined;
};
const documentFile = argValue("--document") && path.resolve(argValue("--document"));
const dumpFile = argValue("--dump") && path.resolve(argValue("--dump"));
/* A document kept off the site is private by definition: it carries the
   phone number, and it is only ever written where --out says. */
const isPrivate = process.argv.includes("--private") || Boolean(documentFile);
if (documentFile && !argValue("--out")) {
  console.error("--document needs --out: a private document is never written into the repo");
  process.exit(1);
}
/* --out writes somewhere else, for comparing a change without touching
   the real documents. */
const outArg = process.argv.indexOf("--out");
const PORT = await freePort();
const DEBUG_PORT = await freePort();
const VARIANTS = { default: "Anthony-Ugwuja-Resume.pdf", ai: "Anthony-Ugwuja-Resume-AI.pdf", general: "Anthony-Ugwuja-Resume-General.pdf" };
if (!VARIANTS[variant]) {
  console.error(`unknown variant "${variant}" — expected one of ${Object.keys(VARIANTS).join(", ")}`);
  process.exit(1);
}
const fileName = VARIANTS[variant];
/* The private copies live where the CVs are kept, one folder per audience,
   all under the same file name (the owner's rule, 27 Nov 2026). A document
   printed with --document names its own folder with --out. The repo's
   gitignored private/ folder keeps a copy too. On a machine without the
   folders (CI, a fresh clone) only the private/ copy is written. */
const CV_HOME = path.join(os.homedir(), "Downloads", "CV");
const CV_FOLDERS = { default: "Developer-jobs", ai: "AI-platforms", general: "Operations-roles" };
const privateCopy = path.join(process.cwd(), "private", fileName.replace(".pdf", "-private.pdf"));
const folderCopy = path.join(CV_HOME, CV_FOLDERS[variant], "Anthony-Ugwuja-Resume.pdf");
const folderExists = await stat(path.dirname(folderCopy)).then((s) => s.isDirectory()).catch(() => false);
const OUT = outArg > -1
  ? path.resolve(process.argv[outArg + 1])
  : isPrivate
    ? (folderExists ? folderCopy : privateCopy)
    : path.join(process.cwd(), "public", fileName);
/* The second place a private build is written, when it has one. */
const ALSO = outArg === -1 && isPrivate && folderExists ? privateCopy : null;

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
   --private run tells it. The server is local, started here and stopped
   with this script (scripts/lib/processes.mjs stops the whole process group,
   on every way out), so the variable never exists anywhere a visitor could
   reach. */
stopOnExit();
startGroup("pnpm", ["start", "--port", String(PORT)], {
  env: {
    ...process.env,
    ...(isPrivate || dumpFile ? { RESUME_ALLOW_PRIVATE: "1" } : {}),
    ...(documentFile ? { RESUME_DOCUMENT: documentFile } : {}),
  },
});
startGroup("chromium", ["--headless","--no-sandbox","--disable-gpu",
  `--remote-debugging-port=${DEBUG_PORT}`,"about:blank"]);

async function ready(check, label) {
  for (let i = 0; i < 60; i += 1) {
    try { const value = await check(); if (value) return value; } catch {}
    await wait(400);
  }
  throw new Error(`${label} never became ready`);
}

const query = [
  variant === "default" || documentFile ? "" : `variant=${variant}`,
  isPrivate ? "private=1" : "",
  documentFile ? "document=1" : "",
]
  .filter(Boolean)
  .join("&");
const url = `http://localhost:${PORT}/resume${query ? `?${query}` : ""}`;
await ready(() => fetch(url).then((r) => r.ok), "the server");

if (dumpFile) {
  const doc = await fetch(`http://localhost:${PORT}/resume/document?variant=${variant}`).then((r) => r.json());
  await mkdir(path.dirname(dumpFile), { recursive: true });
  await writeFile(dumpFile, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`wrote ${dumpFile} (variant: ${variant})`);
  stopAll();
  process.exit(0);
}
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

/* Normal margins, A4. Every version may run to two pages (the working rules,
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

/* Justified text, evened out one paragraph at a time.

   A justified line stretches its word spaces to reach the right edge, and
   with about ninety characters to a line some lines always land badly: one
   long word drops to the next line and the rest of the line opens up to
   twice its normal spacing. No single setting for the whole page fixes it
   (tried: word spacing, letter spacing and the column width, each moves the
   bad lines rather than removing them), because each paragraph breaks
   differently.

   So each justified block gets its own setting, chosen here, in print
   layout, before the PDF is made: letter spacing from a hundredth of an
   em tighter to half that looser (a tenth of a point at 11pt; looser than
   that and a word visibly spreads) and word spacing up to a fortieth of an
   em tighter, or a fortieth looser. Wider ranges were tried and pulled words so
   close they ran together, so lines that are too tight score against a
   setting as well as lines that are too open. The words never change, and neither does any paragraph's
   line count, so the page breaks stay where the content put them. Whichever
   setting leaves the block's lines least over-stretched wins; the
   untouched block wins ties. Done in the page, on the live layout, because that is
   where Chrome decides the line breaks.

   One hard floor: no gap between two words may close below a fifth of the
   font size. pdftotext in raw mode, the plainest reading of the document,
   ignores the space glyphs Chrome draws and splits words by the gaps
   alone, joining any two closer than that (measured on a test page in
   this font: joined at 0.1996em, kept at 0.2023em; so the floor is one
   percent above a fifth; "Linux.Works" was the case). A kerned pair across a space (a W drawn
   towards the full stop before it, a word after a V) can sit under it at
   natural spacing, so a setting that leaves any gap under the floor loses
   to any setting that does not, and the looser word spacing is there for
   the block that needs it. The same floor is then held on every other
   block of text, which is set left and otherwise untouched: the smallest
   loosening that lifts its tightest gap, or nothing. */
const evenJustified = `(() => {
  const LETTER = ["0em", "-0.01em", "-0.005em", "0.005em"];
  const WORD = ["0em", "-0.0125em", "-0.025em", "0.0125em"];
  const measure = (el) => {
    const words = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.data.matchAll(/\\S+/g)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rect = range.getBoundingClientRect();
        if (rect.width) words.push({ rect, text: match[0] });
      }
    }
    const lines = new Map();
    for (const word of words) {
      const key = Math.round(word.rect.top);
      if (!lines.has(key)) lines.set(key, []);
      lines.get(key).push(word);
    }
    const ordered = [...lines.keys()].sort((a, b) => a - b).map((key) => lines.get(key).sort((a, b) => a.rect.left - b.rect.left));
    /* A normal space in this block's own font, before any adjustment. Up
       to half as wide again is ordinary justification; beyond that a line
       reads as gappy. Below 85% of it, words start to run together, which
       is as bad, and counts four times as much. Both grow with the square
       of the excess, so two slightly open lines beat one badly open one.

       The space is measured on a canvas, which does not pick up the face
       the page prints in and so reads it about 13% narrow. The two
       thresholds were tuned by eye against that figure, and the column
       widths the documents have today follow from it, so it stays the
       score's base. The floor below needs the real widths, which come
       from hidden spans inside the block, in its own font. */
    const style = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = style.font;
    const space = ctx.measureText(" ").width;
    const widths = widthsIn(el, [...new Set(ordered.flatMap((line) => line.flatMap((w, i) => (i ? [line[i - 1].text, w.text, line[i - 1].text + " " + w.text] : []))))]);
    const floor = parseFloat(style.fontSize) * 0.202;
    /* The gap as a PDF reader sees it: from the end of one word's last
       glyph to the start of the next, with the kerning across the space
       (an "HIV" drawn tight to the word after it), the letter spacing
       after the last glyph and after the space, and the word spacing. A
       word's rectangle on the page hides that kerning inside the word,
       and a justified line only ever opens a gap wider than this, so this
       is the floor's measure on every line. */
    const ls = parseFloat(style.letterSpacing) || 0;
    const ws = parseFloat(style.wordSpacing) || 0;
    const extracted = (a, b) => widths.get(a + " " + b) - widths.get(a) - widths.get(b) + 2 * ls + ws;
    let worst = 0;
    let tightest = Infinity;
    let score = 0;
    ordered.forEach((line, index) => {
      let lineWorst = 0;
      let lineTightest = Infinity;
      for (let i = 1; i < line.length; i += 1) {
        const gap = line[i].rect.left - line[i - 1].rect.right;
        lineWorst = Math.max(lineWorst, gap);
        lineTightest = Math.min(lineTightest, gap);
        tightest = Math.min(tightest, extracted(line[i - 1].text, line[i].text));
      }
      /* The last line is set left, at natural spacing: it cannot be too
         open, only too tight. */
      if (index < ordered.length - 1) {
        worst = Math.max(worst, lineWorst);
        score += Math.max(0, lineWorst - space * 1.5) ** 2;
      }
      if (lineTightest < Infinity) score += 4 * Math.max(0, space * 0.85 - lineTightest) ** 2;
    });
    return { lines: ordered.length, worst, score, fused: tightest < floor };
  };
  /* A block that still joins a pair at every setting that keeps its line
     count: the smallest loosening of its word spacing that parts the pair,
     at natural letter spacing, even where that costs the block a line. A
     readable extraction outranks a line, and the page rules are checked on
     the printed result anyway. A citation with "HIV Treatment," (the T
     kerned towards the V across the space) was the case. */
  const LOOSER = ["0.0125em", "0.025em", "0.0375em", "0.05em"];
  const loosen = (el) => {
    el.style.letterSpacing = "";
    for (const word of LOOSER) {
      el.style.wordSpacing = word;
      if (!measure(el).fused) return;
    }
    el.style.wordSpacing = "";
  };
  /* The width of each text in the block's own font, at its natural letter
     and word spacing: spans out of the flow, read in one layout, removed. */
  const widthsIn = (el, texts) => {
    const spans = texts.map((text) => {
      const span = document.createElement("span");
      span.style.cssText = "position:absolute;visibility:hidden;white-space:pre;letter-spacing:0;word-spacing:0;pointer-events:none";
      span.textContent = text;
      el.appendChild(span);
      return [text, span];
    });
    const widths = new Map(spans.map(([text, span]) => [text, span.getBoundingClientRect().width]));
    for (const [, span] of spans) span.remove();
    return widths;
  };
  let total = 0;
  const JUSTIFIED = ".text-justify-body > li, p.text-justify-body";
  for (const el of document.querySelectorAll(JUSTIFIED)) {
    el.style.letterSpacing = "";
    el.style.wordSpacing = "";
    const base = measure(el);
    let best = { ...base, letter: "", word: "" };
    for (const letter of LETTER) {
      for (const word of WORD) {
        el.style.letterSpacing = letter;
        el.style.wordSpacing = word;
        const m = measure(el);
        const evener = m.score < best.score - 0.01 || (m.score <= best.score && m.worst < best.worst - 0.25);
        const better = best.fused ? !m.fused || evener : !m.fused && evener;
        if (m.lines <= base.lines && better) best = { ...m, letter, word };
      }
    }
    el.style.letterSpacing = best.letter;
    el.style.wordSpacing = best.word;
    total += best.score;
    if (best.fused) loosen(el);
  }
  for (const el of document.querySelectorAll("main p, main li, main h1, main h2, main h3, main dt, main dd")) {
    if (el.matches(JUSTIFIED) || el.closest(".text-justify-body")) continue;
    el.style.wordSpacing = "";
    if (measure(el).fused) loosen(el);
  }
  return total;
})()`;

/* The text column's width on paper, in CSS pixels: from a little narrower
   than the screen's reading column to the full printable width. Every width
   is evened out as above and scored; the PDF is printed at the best-scoring
   width that keeps the page rules (two pages, no stub second page). One
   width for the whole document, so every justified block shares one right
   edge. */
const MEASURES = [570, 578, 586, 594, 602, 610, 618, 626, 634, 642, 650];

async function print(tight) {
  await evaluate(tight
    ? "(document.documentElement.dataset.fit = 'tight', true)"
    : "(delete document.documentElement.dataset.fit, true)");
  const margins = tight ? TIGHT_MARGINS : MARGINS;

  /* Measured at the printable width, or the breaks it evens out are the
     window's, not the paper's: A4 less the side margins, in CSS pixels. */
  const paper = Math.round((8.27 - margins.marginLeft - margins.marginRight) * 96);
  const layoutAt = async (measure) => {
    await send("Emulation.setDeviceMetricsOverride", { width: paper, height: 1100, deviceScaleFactor: 1, mobile: false });
    await evaluate(`(document.documentElement.style.setProperty("--cv-measure", "${measure}px"), true)`);
    const score = await evaluate(evenJustified);
    await send("Emulation.clearDeviceMetricsOverride");
    return score;
  };

  const scored = [];
  for (const measure of MEASURES.filter((m) => m <= paper)) scored.push({ measure, score: await layoutAt(measure) });
  scored.sort((a, b) => a.score - b.score);

  let fallback = null;
  for (const { measure, score } of scored) {
    await layoutAt(measure);
    const { data } = await send("Page.printToPDF", {
      printBackground: false,
      paperWidth: 8.27,
      paperHeight: 11.69,
      ...margins,
      displayHeaderFooter: false,
    });
    const buffer = Buffer.from(data, "base64");
    const result = { buffer, lines: await pageLines(buffer), tight, measure, score };
    fallback ??= result;
    const pagesOk = result.lines.length === 1 || (result.lines.length === 2 && result.lines[1] >= MIN_SECOND_PAGE_LINES);
    if (pagesOk) return result;
  }
  return fallback;
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
if (ALSO) {
  await mkdir(path.dirname(ALSO), { recursive: true });
  await writeFile(ALSO, bytes);
}
socket.close();
stopAll();

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

/* Three readings, because they disagree. pdftotext reconstructs a layout,
   and in raw mode reads the stream in drawing order;
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
/* Raw mode: the text in the order the stream draws it, words split by the
   gaps between them alone. The least forgiving reading, and the one that
   showed "Linux.Works". */
execFileSync("pdftotext", ["-raw", OUT, txt]);
const rawText = await readFile(txt, "utf8");
const { text: streamText, pages } = await extractWithPdfjs(OUT);

console.log("\n".padEnd(72, "-"));
console.log(layoutText.trim());
console.log("".padEnd(72, "-"));

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ";
const dateRanges = [...new Set(
  normalise(renderedText).match(new RegExp(`(?:${MONTH})?\\d{4} -\\s?(?:Present|(?:${MONTH})?\\d{4})`, "g")) ?? [],
)];

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

  /* Every date range on one line. "Nov 2025 –" ending a line and "Present"
     starting the next reads as two facts to a person and splits the range
     for a parser. Checked per extracted line, not on the flattened text,
     because flattening is exactly what hides a break. */
  const extractedLines = raw.split("\n").map(normalise);
  for (const range of dateRanges) {
    if (!extractedLines.some((line) => line.includes(range))) {
      problems.push(`${label}: date range "${range}" is split across lines`);
    }
  }

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
  ...check("pdftotext -raw", rawText),
  ...check("pdfjs", streamText),
];

/* Two pages for every version (the working rules, Resume rule). A second page
   is allowed; a second page holding a few stray lines is not — the print
   above has already tried to close that up, so if one is left it fails. */
const pageLimit = 2;
if (pages > pageLimit) failures.push(`${pages} pages — the limit is ${pageLimit}`);
const lastPage = printed.lines[printed.lines.length - 1];
if (pages === 2 && lastPage < MIN_SECOND_PAGE_LINES) {
  failures.push(`page two holds only ${lastPage} lines, even after tightening — cut a line or two, or add a section's worth`);
}

console.log(`${path.relative(process.cwd(), OUT)} — ${Math.round(bytes.length / 1024)} KB, ${pages} page${pages === 1 ? "" : "s"} (${printed.lines.join(" + ")} lines${printed.tight ? ", tight" : ""}, measure ${printed.measure}px), ${documentFile ? `document: ${path.basename(documentFile)}` : `variant: ${variant}`}${isPrivate ? ", private" : ""}${fitNote ? ` — ${fitNote}` : ""}`);

if (failures.length) {
  console.error(`\nATS check failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

console.log("ATS check passed in all three readings: every line survives, no fused words, no web-only text, within the page limit.");
process.exit(0);
