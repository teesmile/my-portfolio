import { portfolioConfig } from "@/config/site";
import { highlight } from "@/lib/highlight";
import DeckInteractive from "./deck-interactive";

/* Highlighting stays on the server: Shiki runs at build time and the browser
   receives coloured markup, not a highlighter. Only the interaction is a
   client component. */
export default async function DefectDeck() {
  const cards = await Promise.all(
    portfolioConfig.defects.map(async (defect) => {
      const source = [...defect.lines, ...defect.fix].join("\n");
      const added = defect.fix.map((_, index) => defect.lines.length + index + 1);

      return {
        context: defect.context,
        verdict: defect.verdict,
        html: await highlight(source, defect.language, {
          removed: [defect.markedLine],
          added,
        }),
      };
    }),
  );

  return <DeckInteractive cards={cards} />;
}
