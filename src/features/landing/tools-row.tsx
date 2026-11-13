import { portfolioConfig } from "@/config/site";
import { TechList } from "@/components/ui/tech";
import Marquee from "@/components/ui/marquee";
import LeaseGate from "./lease-gate";
import GlitchWhenNear from "./glitch-when-near";

/**
 * One slow row of the tools I use, near the foot of the home page.
 *
 * The same moving row, logos, brand colours and glitch as /about, reduced
 * to one line. It moves only
 * while it holds the motion lease, so it never drifts while the deck is
 * auto-advancing on the same screen.
 */
export default function ToolsRow() {
  const tools = Array.from(
    new Set(
      portfolioConfig.stack
        .filter((layer) => (layer.kind ?? "tool") === "tool")
        .flatMap((layer) => layer.items),
    ),
  );

  return (
    <section
      aria-labelledby="tools"
      /* Skipped until it is near, with its real content height as the
         placeholder (one line from md up, a stacked pair below): a guessed
         8rem made the page 49-108px taller until the row rendered, and the
         document shrank by that much under the reader. */
      className="border-t border-line px-4 sm:px-6 py-12 [contain-intrinsic-size:auto_5rem] [content-visibility:auto] md:py-14 md:[contain-intrinsic-size:auto_1.5rem]"
    >
      <div className="mx-auto flex max-w-(--container-view) flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <h2 id="tools" className="shrink-0 font-text text-2xs text-muted">
          Tools I use
        </h2>
        {/* Brand colours and the RGB-split glitch, exactly as on /about;
            the glitch sets itself up only when this row is near. */}
        <GlitchWhenNear />
        <LeaseGate id="tools" className="min-w-0 flex-1">
          <Marquee duration="140s" gap="2.5rem">
            <TechList items={tools} className="gap-x-10 whitespace-nowrap text-xs" />
          </Marquee>
        </LeaseGate>
      </div>
    </section>
  );
}
