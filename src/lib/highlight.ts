import { createHighlighter, type Highlighter } from "shiki";

export type Language = "tsx" | "python";

/* One highlighter for the whole build. createHighlighter loads grammars and
   themes, so creating one per snippet would pay that cost eight times. */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-default", "github-light-default"],
      langs: ["tsx", "python"],
    });
  }

  return highlighterPromise;
}

/**
 * Highlights at build time and emits both themes into every token as CSS
 * custom properties, so switching the site theme re-colours the code without
 * shipping a highlighter to the browser or re-running anything.
 */
export async function highlight(
  code: string,
  lang: Language,
  marks: { removed?: number[]; added?: number[] } = {},
) {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang,
    themes: { dark: "github-dark-default", light: "github-light-default" },
    defaultColor: false,
    transformers: [
      {
        line(node, line) {
          if (marks.removed?.includes(line)) {
            this.addClassToHast(node, "line-removed");
          }
          if (marks.added?.includes(line)) {
            this.addClassToHast(node, "line-added");
          }
        },
      },
    ],
  });
}
