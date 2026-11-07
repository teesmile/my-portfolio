import Link from "next/link";
import { portfolioConfig } from "@/config/site";
import DefectDeck from "./defect-deck";
import HeroSequence from "./hero-sequence";

export default function Hero() {
  return (
    <section className="editor-surface flex flex-1 flex-col justify-center px-6 py-16 md:py-20">
      <div className="editor-guides relative mx-auto w-full max-w-(--container-view)">
        <div className="flex gap-4 md:gap-6">
          {/* The gutter: decorative, so its numbers are not text at all.
              aria-hidden kept them from screen readers but not from the
              document — crawlers indexed "01 02 03 04 05" and a copied
              headline brought them along. They are drawn by a CSS counter
              now, which renders but is never part of the page's text. */}
          <div
            aria-hidden="true"
            className="editor-gutter hidden shrink-0 select-none font-mono text-2xs text-muted/50 sm:block"
          >
            {[1, 2, 3, 4, 5].map((line) => (
              <div key={line} />
            ))}
          </div>

          <div className="min-w-0 flex-1">
        {/* Full container width is not a style choice: at the hero size the
            statement only fits three lines at 1280 across the whole container,
            which /lab/type measures rather than guesses. */}
        <HeroSequence
          headline={portfolioConfig.headline}
          monoLine={portfolioConfig.monoLine}
          flag={portfolioConfig.monoFlag}
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="flex items-baseline gap-8">
              <Link
                href="/work"
                className="text-lg text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
              >
                See the work
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                How I got here
              </Link>
            </div>

            <p className="mt-10 max-w-[34ch] text-sm text-muted">
              {portfolioConfig.copy.heroSupport}
            </p>
          </div>

          <div data-hero-deck className="lg:col-span-7 lg:col-start-6">
            <DefectDeck />
          </div>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
}
