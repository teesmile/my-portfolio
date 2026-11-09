import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { portfolioConfig } from "@/config/site";
import DefectDeck from "../defect-deck";
import SettleNow from "./settle-now";
import CorrectedLine from "./corrected-line";

export type HeroVariant = "a" | "b" | "c";

/**
 * Three candidate heroes for /, compared side by side on a phone before one
 * replaces the live hero. None has the editor gutter numbers, the typing
 * caret or the wavy underline. All keep the live deck, beside the text on
 * desktop and below it on a phone.
 *
 *   a  clean: headline, supporting line, "what AI gets wrong" in amber
 *   b  a, plus the portrait cutout with an amber rim light
 *   c  a, but the line gets one word wrong and corrects it, once
 */
export default function HeroPreview({ variant }: { variant: HeroVariant }) {
  const { headline, monoLine, monoFlag, copy } = portfolioConfig;
  const at = monoLine.indexOf(monoFlag);
  const before = monoLine.slice(0, at);
  const after = monoLine.slice(at + monoFlag.length);

  /* "what AI gets wrong" → typed as "what AI gets right", then fixed. */
  const flagWords = monoFlag.split(" ");
  const fixedWord = flagWords[flagWords.length - 1];
  const lead = `${before}${flagWords.slice(0, -1).join(" ")} `;

  return (
    <section className="editor-surface flex min-h-[calc(100dvh-var(--nav-height))] flex-col justify-center px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto w-full max-w-(--container-view)">
        <div className={variant === "b" ? "grid items-center gap-10 lg:grid-cols-12" : ""}>
          <div className={variant === "b" ? "lg:col-span-8" : ""}>
            <h1 className="text-headline-sm text-ink lg:text-headline">{headline}</h1>

            {variant === "c" ? (
              <CorrectedLine before={lead} wrong="right" right={fixedWord} after={after} />
            ) : (
              <p className="mt-6 font-mono-brand text-mono-sm text-muted lg:text-mono">
                {before}
                <span className="whitespace-nowrap text-ill-accent">{monoFlag}</span>
                {after}
              </p>
            )}
          </div>

          {variant === "b" ? (
            /* Desktop: the right of the headline row. Phone: its own block
               after the supporting text (see below), never beside the
               headline. */
            <div className="hidden lg:col-span-4 lg:block">
              <Portrait />
            </div>
          ) : null}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="flex items-baseline gap-8">
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
            <p className="mt-10 max-w-[34ch] text-sm text-muted">{copy.heroSupport}</p>

            {variant === "b" ? (
              <div className="mx-auto mt-10 w-48 lg:hidden">
                <Portrait />
              </div>
            ) : null}
          </div>

          <div data-hero-deck className="lg:col-span-7 lg:col-start-6">
            <DefectDeck />
          </div>
        </div>

        <nav aria-label="Hero previews" className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-2xs text-muted">
          <span>Hero preview {variant.toUpperCase()} of three, unlisted</span>
          {(["a", "b", "c"] as const).map((v) => (
            <Link
              key={v}
              href={`/preview/hero/${v}` as Route}
              aria-current={v === variant ? "page" : undefined}
              className={v === variant ? "text-ink" : "underline decoration-line underline-offset-4 hover:text-ink"}
            >
              {v.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>

      {variant === "c" ? null : <SettleNow />}
    </section>
  );
}

/* The cutout with an amber rim light: stacked drop-shadows follow the
   cutout's alpha edge, a tight bright one for the rim and a wide soft one
   for the glow, offset left so the light reads as coming from one side. */
function Portrait() {
  return (
    <div className="relative aspect-square w-full">
      <Image
        src="/profile.webp"
        alt={`${portfolioConfig.name}`}
        fill
        sizes="(min-width: 1024px) 24rem, 12rem"
        className="object-contain [filter:drop-shadow(-1.5px_0_0_var(--ill-accent-fill))_drop-shadow(-10px_-2px_24px_color-mix(in_oklab,var(--ill-accent-fill)_45%,transparent))]"
      />
    </div>
  );
}
