import Image from "next/image";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";
import DefectDeck from "./defect-deck";
import CorrectedLine from "./corrected-line";

/**
 * The home hero: the headline, a supporting line that corrects itself once
 * ("…what AI gets right" → "right" struck in red → "wrong" in amber), the
 * portrait cutout under an amber rim light, and the deck.
 *
 * The headline is plain server-rendered text with no entrance, so it is the
 * page's first paint. The page's one orchestrated moment is the correction
 * (corrected-line.tsx), and the deck's clock waits for it to settle.
 *
 * Warmth comes from a static amber glow behind the headline and portrait,
 * two radial gradients in the --ill-glow token. Nothing in the background
 * moves.
 *
 * Phones: the portrait is small and sits beside the supporting paragraph,
 * not above the deck, so the headline and the deck both stay within
 * reach. Desktop: it takes the right of the headline row.
 */
export default function Hero() {
  const { headline, monoLine, monoFlag, copy } = portfolioConfig;
  const at = monoLine.indexOf(monoFlag);
  const before = monoLine.slice(0, at);
  const after = monoLine.slice(at + monoFlag.length);
  const flagWords = monoFlag.split(" ");
  const lead = `${before}${flagWords.slice(0, -1).join(" ")} `;
  const fixedWord = flagWords[flagWords.length - 1];

  return (
    /* A full screen tall, and pulled up under the fixed nav: the negative
       margin cancels <main>'s top padding and the extra top padding puts the
       content back where it was, so the hero's surface and glow run to the
       very top of the screen (under the status bar too, with
       viewport-fit: cover) while the nav is transparent over it. The nav
       turns solid once the 4px sentinel below has scrolled out of view. */
    <section
      data-home-hero
      className="editor-surface relative -mt-(--nav-height) flex min-h-dvh flex-col justify-center overflow-hidden px-4 pb-16 pt-[calc(var(--nav-height)+4rem)] sm:px-6 md:pb-20 md:pt-[calc(var(--nav-height)+5rem)]"
    >
      {/* The nav is transparent only while this is in view: the first 4px. */}
      <span data-home-top aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_22%_28%,var(--ill-glow),transparent_70%),radial-gradient(38%_45%_at_82%_26%,var(--ill-glow),transparent_70%)]"
      />
      {/* One grid, two arrangements, and a single portrait element in both:
          two copies (one per breakpoint) meant two downloads, and the
          phone's lazy copy became the page's LCP at 2.9 s.
            phone    headline / links / [paragraph | portrait] / deck
            desktop  [headline | portrait] / [links + paragraph | deck] */}
      <div className="relative mx-auto grid w-full max-w-(--container-view) grid-cols-[1fr_7rem] gap-x-4 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-x-16">
        <div className="col-span-2 lg:col-span-8 lg:row-start-1 lg:self-center">
          <h1 className="text-headline-sm text-ink lg:text-headline">{headline}</h1>
          <CorrectedLine before={lead} wrong="right" right={fixedWord} after={after} />
        </div>

        <div className="col-span-2 mt-12 flex items-baseline gap-8 lg:col-span-4 lg:row-start-2 lg:mt-14">
          <Link
            href="/work"
            className="text-lg text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
          >
            See the work
          </Link>
          <Link href="/about" className="text-sm text-muted transition-colors hover:text-ink">
            How I got here
          </Link>
        </div>

        <p className="mt-8 self-end text-sm text-muted lg:col-span-4 lg:row-start-3 lg:mt-10 lg:max-w-[34ch] lg:self-start">
          {copy.heroSupport}
        </p>

        <div className="mt-8 self-end lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:mt-0 lg:self-center">
          <Portrait />
        </div>

        <div data-hero-deck className="col-span-2 mt-10 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-2 lg:mt-14">
          <DefectDeck />
        </div>
      </div>
    </section>
  );
}

/* The cutout with its amber rim light baked into the file
   (portrait-rim-v2.webp): a 2px rim just outside the silhouette and a soft
   halo centred on it. It used to be two CSS drop-shadows, and the wide one
   was offset 10px left: a blurred copy of the whole silhouette that read as
   a second, ghostly head beside the real one, while the thin one outlined
   every jag in a semi-transparent band along the hair. Baked, the light is
   identical in every browser and costs nothing to render. A new file name,
   so no image-optimizer or browser cache can serve the old cutout. */
function Portrait() {
  return (
    <div className="relative aspect-square w-full">
      <Image
        src="/portrait-rim-v2.webp"
        alt={portfolioConfig.name}
        fill
        priority
        sizes="(min-width: 1024px) 24rem, 7rem"
        className="object-contain"
      />
    </div>
  );
}
