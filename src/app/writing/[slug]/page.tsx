import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { writing, readingTime } from "@/config/writing";
import { pageMetadata } from "@/lib/metadata";
import StickyHero from "@/components/layout/sticky-hero";
import Reveals from "@/components/layout/reveals";
import HeroArt from "@/features/writing/hero-art";
import OnThisPage from "@/features/writing/on-this-page";
import Illustration from "@/features/writing/illustrations";
import Figure from "@/features/writing/figures";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return writing.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  if (!entry) {
    return {};
  }

  return pageMetadata({
    title: entry.title,
    description: entry.standfirst,
    path: `/writing/${entry.slug}`,
    type: "article",
  });
}

export default async function WritingEntryPage({ params }: Params) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="block">
      <Reveals />

      <StickyHero
        backHref="/writing"
        backLabel="Writing"
        title={entry.title}
        meta={`${entry.date} · ${readingTime(entry)} min read · ${entry.topic}`}
      >
        <HeroArt slug={entry.slug} />
      </StickyHero>

      <div data-sheet className="relative z-10 min-h-screen bg-surface px-6 py-16 md:py-20">
        <div className="mx-auto max-w-(--container-view)">
          <p className="max-w-(--container-reading) text-base text-muted">
            {entry.standfirst}
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            {/* The measure stays narrow; the rail carries what you would
                otherwise cram into the body. */}
            <div className="flex max-w-(--container-reading) flex-col gap-10 lg:col-span-7">
              {entry.sections.map((section) => (
                <section key={section.id} id={section.id} data-reveal className="scroll-mt-28">
                  <h2 className="text-lg text-ink">{section.heading}</h2>
                  <div className="mt-4 flex flex-col gap-5 text-base text-ink">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                  <Figure name={section.figure} />
                </section>
              ))}
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="sticky top-[calc(var(--nav-height)+1.5rem)] border-t border-line pt-5">
                <dl className="flex flex-col gap-3 text-2xs text-muted">
                  <div className="flex justify-between gap-4">
                    <dt>Published</dt>
                    <dd className="tabular-nums text-ink">{entry.date}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Reading time</dt>
                    <dd className="text-ink">{readingTime(entry)} min</dd>
                  </div>
                </dl>

                <OnThisPage sections={entry.sections} />

                <Illustration slug={entry.slug} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
