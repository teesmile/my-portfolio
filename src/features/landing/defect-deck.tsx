import { portfolioConfig } from "@/config/site";
import { highlight } from "@/lib/highlight";

/* Four real bugs, fanned. Static in Phase 1: the top card is the one you read,
   the three behind it say there are more without demanding attention. Phase 2
   brings the next card forward with Flip, and that timeline is Anthony's. */

const fan = [
  "z-40 rotate-0 translate-x-0 translate-y-0",
  "z-30 rotate-[1.4deg] translate-x-2 translate-y-3",
  "z-20 rotate-[2.8deg] translate-x-4 translate-y-6",
  "z-10 rotate-[4.2deg] translate-x-6 translate-y-9",
];

export default async function DefectDeck() {
  const cards = await Promise.all(
    portfolioConfig.defects.map(async (defect) => {
      /* Original and corrected lines are highlighted as one block so the diff
         reads continuously: the removed line keeps its place, the fix follows. */
      const source = [...defect.lines, ...defect.fix].join("\n");
      const added = defect.fix.map((_, index) => defect.lines.length + index + 1);

      return {
        ...defect,
        html: await highlight(source, defect.language, {
          removed: [defect.markedLine],
          added,
        }),
      };
    }),
  );

  return (
    <div className="relative h-[27rem] w-full sm:h-[23rem]">
      {cards.map((card, index) => (
        <article
          key={card.context}
          className={`absolute inset-x-0 top-0 h-full origin-top-left cursor-pointer overflow-hidden border border-line bg-raised p-5 ${fan[index]}`}
        >
          <p className="font-display text-2xs text-muted">{card.context}</p>

          <div
            className="mt-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: card.html }}
          />

          <p className="mt-4 max-w-[54ch] text-xs text-muted">
            <span className="font-display text-ink">What breaks: </span>
            {card.verdict}
          </p>
        </article>
      ))}
    </div>
  );
}
