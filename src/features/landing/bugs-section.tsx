import { portfolioConfig } from "@/config/site";
import DefectDeck from "./defect-deck";

/**
 * The deck of bugs, directly under the hero as its own section: a heading
 * and one line of intro at the left, the deck at the right (stacked on a
 * phone). It used to sit inside the hero, where on a phone it pushed the
 * first screen to two and a half; here it is the first thing the reader
 * scrolls to, and it arrives with the scroll reveals.
 *
 * Not content-visibility: auto like the sections further down: the deck's
 * clock and its swipe hint are keyed to whether it is on screen, and it
 * is close enough to the fold to be laid out with the page.
 */
export default function BugsSection() {
  const { copy } = portfolioConfig;

  return (
    <section aria-labelledby="bugs" className="px-4 sm:px-6 pt-20 pb-8 md:pt-28 md:pb-12">
      <div className="mx-auto grid max-w-(--container-view) gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 data-reveal id="bugs" className="text-xl text-accent">
            {copy.deckHeading}
          </h2>
          <p data-reveal className="mt-4 max-w-[36ch] text-sm text-muted">
            {copy.deckIntro}
          </p>
        </div>
        <div data-reveal className="lg:col-span-7 lg:col-start-6">
          <DefectDeck />
        </div>
      </div>
    </section>
  );
}
