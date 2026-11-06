import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { writing, readingTime } from "@/config/writing";
import OnThisPage from "@/features/writing/on-this-page";
import Illustration from "@/features/writing/illustrations";
import Figure from "@/features/writing/figures";
import Reveals from "@/components/layout/reveals";

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
  });
}

export default async function WritingEntryPage({ params }: Params) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="px-6 py-20 md:py-24">
      <Reveals />
      <div className="mx-auto max-w-(--container-view)">
        <Link
          href="/writing"
          className="text-2xs text-muted transition-colors hover:text-ink"
        >
          &larr; Writing
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <h1 className="mt-3 max-w-[22ch] text-xl text-ink md:text-2xl">
            {entry.title}
          </h1>
          <p className="mt-5 max-w-(--container-reading) text-base text-muted">
            {entry.standfirst}
          </p>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          {/* The measure stays narrow; the rail carries what you would
              otherwise cram into the body. */}
          <div className="flex max-w-(--container-reading) flex-col gap-10 lg:col-span-7">
            {entry.sections.map((section) => (
              <section key={section.id} id={section.id} data-reveal className="scroll-mt-24">
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
            <div className="sticky top-24 border-t border-line pt-5">
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
    </article>
  );
}
