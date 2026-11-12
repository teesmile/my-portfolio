import Image from "next/image";
import { portfolioConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import CorrectedHeadline from "./corrected-line";

/**
 * The home hero, laid out like the share card: the headline, one small
 * supporting line and the two ways on at the left; the stylised portrait
 * at the right, lit from behind in its own blue and orange. On a phone the
 * two stack and centre, text first.
 *
 * The headline corrects itself once ("…what AI gets right" → "right" struck
 * in red → "wrong" in amber, corrected-line.tsx); that is the page's one
 * orchestrated moment. Most of the headline is plain server-rendered text,
 * so it is the page's first paint and its entrance only rises (never
 * fades). The line, the buttons and the portrait fade and rise a step
 * apart, from first paint, as CSS (globals.css, [data-reveal="load"]).
 *
 * The background is the hero's surface and its wash (globals.css,
 * .editor-surface and .hero-wash); the light behind the portrait is
 * .portrait-glow, in two arrangements chosen on the preview with ?hero=1
 * or ?hero=2 (layout.tsx). Nothing in the background moves.
 */
export default function Hero() {
  const { headline, headlineFlag, heroLine } = portfolioConfig;
  const at = headline.indexOf(headlineFlag);
  const before = headline.slice(0, at);
  const after = headline.slice(at + headlineFlag.length);
  const flagWords = headlineFlag.split(" ");
  const lead = `${before}${flagWords.slice(0, -1).join(" ")} `;
  const fixedWord = flagWords[flagWords.length - 1];

  return (
    /* Pulled up under the fixed nav: the negative margin cancels <main>'s
       top padding and the extra top padding puts the content back where it
       was, so the hero's surface runs to the very top of the screen (under
       the status bar too, with viewport-fit: cover) while the nav is
       transparent over it. The nav turns solid once the 4px sentinel below
       has scrolled out of view. */
    <section
      data-home-hero
      className="editor-surface relative -mt-(--nav-height) flex min-h-dvh flex-col justify-center overflow-hidden px-4 pt-[calc(var(--nav-height)+3rem)] sm:px-6 md:pt-[calc(var(--nav-height)+4rem)]"
    >
      {/* The nav is transparent only while this is in view: the first 4px. */}
      <span data-home-top aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" />
      <div aria-hidden="true" className="hero-wash" />

      {/* Text left, portrait right from lg up; stacked and centred below.
          The portrait column's bottom padding is what the second
          arrangement removes (globals.css) so the shoulders run off the
          hero's bottom edge as they do on the card. */}
      <div className="relative mx-auto grid w-full max-w-(--container-view) items-center gap-x-12 gap-y-12 pb-16 max-lg:text-center lg:grid-cols-12 lg:gap-x-16 lg:pb-20">
        <div className="flex flex-col max-lg:items-center lg:col-span-7">
          <CorrectedHeadline
            lead={lead}
            wrong="right"
            right={fixedWord}
            after={after}
            data-reveal="rise"
            className="max-w-[16ch] text-balance text-headline-sm text-ink lg:text-headline"
          />
          <p
            data-reveal="load"
            style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            className="mt-6 max-w-[40ch] text-base text-muted lg:mt-8 lg:text-lg lg:leading-[1.4]"
          >
            {heroLine}
          </p>

          {/* The two ways on: solid for the work, outlined for the person,
              the same width and height. */}
          <div
            data-reveal="load"
            style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
            className="mt-10 flex flex-wrap items-center gap-3 max-lg:justify-center lg:mt-12"
          >
            <ButtonLink href="/work" className="min-w-38">
              See my work
            </ButtonLink>
            <ButtonLink href="/about" variant="secondary" className="min-w-38">
              About me
            </ButtonLink>
          </div>
        </div>

        <div
          data-reveal="load"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          className="hero-portrait relative mx-auto w-full max-w-[17rem] self-end sm:max-w-[20rem] lg:col-span-5 lg:max-w-none lg:justify-self-end"
        >
          <div aria-hidden="true" className="portrait-glow" />
          <Portrait />
        </div>
      </div>
    </section>
  );
}

/* The same cutout as the share card and the About page (the clean one,
   without the baked rim light: the light now comes from behind it). A new
   file name over the old rim version, so no cache can serve that. */
function Portrait() {
  return (
    <div className="relative aspect-square w-full">
      <Image
        src="/portrait-clean-v2.webp"
        alt={portfolioConfig.name}
        fill
        /* Next 16: `preload` replaces the deprecated `priority`, and neither
           sets the image's own fetch priority. Without fetchPriority the
           portrait was fetched at Low priority and could queue behind
           scripts on a slow phone connection. */
        preload
        fetchPriority="high"
        sizes="(min-width: 1024px) 28rem, (min-width: 640px) 20rem, 17rem"
        className="object-contain"
      />
    </div>
  );
}
