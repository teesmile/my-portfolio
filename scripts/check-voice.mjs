#!/usr/bin/env node
/**
 * Fails the build if a stock phrase appears in text a visitor reads: the
 * site's copy, the Writing pieces and the CV content.
 *
 * The phrases live in scripts/voice-phrases.txt, one per line, so the list
 * can grow without touching this file. Like the dash check beside it, this
 * parses the source rather than grepping it: it reads string literals,
 * template text and JSX text in src/, every string value in src/**\/*.json,
 * and text files served from public/, and never comments, which no visitor
 * reads.
 *
 *   node scripts/check-voice.mjs          fail on any hit
 *   node scripts/check-voice.mjs --list   print every hit, exit 0
 */
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ts = createRequire(import.meta.url)("typescript");
const root = process.cwd();
const listOnly = process.argv.includes("--list");

const phrases = readFileSync(path.join(root, "scripts", "voice-phrases.txt"), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

/* "leverage" -> leverage, leverages, leveraged, leveraging;
   "robust" -> robust, robustly, robustness. A space matches any whitespace,
   a hyphen also matches a space. */
function pattern(phrase) {
  const body = phrase
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((part) => (/^\s+$/.test(part) ? "\\s+" : part === "-" ? "[-\\s]" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("");
  const ending = phrase.endsWith("e")
    ? `${body.slice(0, -1)}(?:e|es|ed|ing)`
    : phrase.endsWith("y")
      ? `${body.slice(0, -1)}(?:y|ies)`
      : `${body}(?:s|es|ed|ing|ly|ness)?`;
  return new RegExp(`\\b${ending}\\b`, "i");
}
const rules = phrases.map((phrase) => ({ phrase, re: pattern(phrase) }));

const TEXT_KINDS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.JsxText,
]);
const PUBLIC_TEXT = /\.(txt|html|xml|json|webmanifest|md)$/;

const hits = [];
const rel = (file) => path.relative(root, file);

function check(text, where) {
  for (const { phrase, re } of rules) {
    const match = text.match(re);
    if (match) hits.push(`${where}  "${match[0]}" (${phrase})  ${text.trim().replace(/\s+/g, " ").slice(0, 100)}`);
  }
}

function files(dir, test) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, test);
    return test(entry.name) ? [full] : [];
  });
}

function checkSource(file) {
  const text = readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  (function visit(node) {
    if (TEXT_KINDS.has(node.kind)) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      check(node.getText(source), `${rel(file)}:${line}`);
    }
    ts.forEachChild(node, visit);
  })(source);
}

function checkJson(file) {
  (function visit(value, at) {
    if (typeof value === "string") check(value, `${rel(file)} ${at}`);
    else if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) visit(inner, `${at}.${key}`);
    }
  })(JSON.parse(readFileSync(file, "utf8")), "$");
}

function checkText(file) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => check(line, `${rel(file)}:${i + 1}`));
}

files(path.join(root, "src"), (name) => /\.tsx?$/.test(name)).forEach(checkSource);
files(path.join(root, "src"), (name) => name.endsWith(".json")).forEach(checkJson);
files(path.join(root, "public"), (name) => PUBLIC_TEXT.test(name)).forEach(checkText);

if (hits.length) {
  const report = `Stock phrase in visible text (the list is scripts/voice-phrases.txt):\n  ${hits.join("\n  ")}`;
  if (listOnly) {
    console.log(report);
  } else {
    console.error(report);
    process.exit(1);
  }
} else {
  console.log(`check-voice: none of ${rules.length} stock phrases in visible text`);
}
