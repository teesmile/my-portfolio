import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { writing } from "@/config/writing";
import { scenes } from "@/features/writing/scenes";
import { portfolioConfig } from "@/config/site";

type Params = { params: Promise<{ slug: string }> };

/**
 * The share image for a piece, laid out at exactly 1200×630 so `pnpm share`
 * can photograph it 1:1 — no scaling, which is what keeps the text sharp.
 * An instrument, not a page: unlisted, noindex, out of the sitemap. The
 * capture hides the site chrome and clips to [data-share-frame].
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return writing.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata({ title: "Share image", description: "Share image source.", path: `/share/${slug}`, noindex: true });
}

export default async function ShareImagePage({ params }: Params) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);
  const Scene = scenes[slug];
  if (!entry || !Scene) notFound();

  return (
    <div data-share-frame className="relative h-[630px] w-[1200px] shrink-0 overflow-hidden bg-surface">
      <Scene id={`share-${slug}`} className="absolute inset-0 h-full w-full" />
      {/* The title plate: a scrim rising from the bottom, as the article's
          own title band does, so the two read as one design. The text stops
          120px above the bottom edge: X prints the page's domain over the
          bottom-left of a card's image, and that strip stays clear on every
          card on the site. */}
      <div className="absolute inset-x-0 bottom-0 h-[440px] bg-[linear-gradient(to_top,var(--surface)_0%,var(--surface)_76%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 px-[60px] pb-[120px]">
        {/* The same round accent dot that opens every typeset card's top line. */}
        <p className="flex items-center gap-[18px] font-text text-[22px] text-muted">
          <span aria-hidden="true" className="inline-block h-4 w-4 rounded-full bg-ill-accent-fill" />
          Writing · {entry.topic}
        </p>
        <h1 className="mt-2 max-w-[1000px] text-balance font-display text-[50px] leading-[1.06] text-ink">{entry.title}</h1>
        <p className="mt-4 font-text text-[20px] text-muted">
          {portfolioConfig.name} · <span className="text-ill-accent">anthonyugwuja.dev</span>
        </p>
      </div>
    </div>
  );
}
