#!/usr/bin/env node
/**
 * Fails the build if an em dash or en dash appears in text a visitor reads.
 *
 * House style is the plain hyphen: " - " between parts of a sentence or a
 * title, "-" with no spaces in a range such as 2017-2023. This runs before
 * `next build`, so a long dash cannot ship from any page, title, meta
 * description, share card, alt text, structured data or CV.
 *
 * It parses the source rather than grepping it. A grep would also flag
 * comments, which nobody visiting the site reads; the parser sees exactly
 * the text that can reach the page: string literals, template text and JSX
 * text in src/, every string value in src/**\/*.json, and text files served
 * from public/. It catches the characters themselves, their HTML entities
 * (&mdash; &ndash; &#8212; &#8211; and the hex forms) and – / —
 * escapes.
 */
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ts = createRequire(import.meta.url)("typescript");
const root = process.cwd();
const LONG_DASH = /[–—]|&[mn]dash;|&#821[12];|&#x201[34];|\\u201[34]/i;
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
      const raw = node.getText(source);
      if (LONG_DASH.test(raw)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        hits.push(`${rel(file)}:${line}  ${raw.trim().slice(0, 90)}`);
      }
    }
    ts.forEachChild(node, visit);
  })(source);
}

function checkJson(file) {
  (function visit(value, at) {
    if (typeof value === "string") {
      if (LONG_DASH.test(value)) hits.push(`${rel(file)} ${at}  ${value.slice(0, 90)}`);
    } else if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) visit(inner, `${at}.${key}`);
    }
  })(JSON.parse(readFileSync(file, "utf8")), "$");
}

function checkText(file) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => LONG_DASH.test(line) && hits.push(`${rel(file)}:${i + 1}  ${line.trim().slice(0, 90)}`));
}

files(path.join(root, "src"), (name) => /\.tsx?$/.test(name)).forEach(checkSource);
files(path.join(root, "src"), (name) => name.endsWith(".json")).forEach(checkJson);
files(path.join(root, "public"), (name) => PUBLIC_TEXT.test(name)).forEach(checkText);

if (hits.length) {
  console.error(`Long dash in visible text (use "-", spaced " - " between parts, unspaced in ranges):\n  ${hits.join("\n  ")}`);
  process.exit(1);
}
console.log("check-dashes: no em or en dashes in visible text");
