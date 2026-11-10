import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { AUTHOR, dateOf, published, writing, readingTime } from "@/config/writing";
import JsonLd from "@/components/ui/json-ld";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { WEBSITE_ID, breadcrumbJsonLd, personRef } from "@/lib/structured-data";
import { SITE_URL } from "@/config/site-url";
import { pageMetadata } from "@/lib/metadata";
import StickyHero from "@/components/layout/sticky-hero";
import PinnedBack from "@/components/layout/pinned-back";
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
    fullTitle: entry.seo.title,
    description: entry.seo.description,
    path: `/writing/${entry.slug}`,
    type: "article",
    image: `/writing/${entry.slug}/opengraph-image`,
    noindex: Boolean(entry.draft),
    article: { publishedTime: entry.published, modifiedTime: entry.updated, author: AUTHOR },
  });
}

export default async function WritingEntryPage({ params }: Params) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  if (!entry) {
    notFound();
  }

  /* Structured data for the piece: the same timestamps as the meta tags, so
     a crawler reading either finds one answer, and the author by reference
     to the one Person described on the home page. */
  const articleJsonLd = {
    "@type": "Article",
    headline: entry.title,
    description: entry.standfirst,
    datePublished: entry.published,
    dateModified: entry.updated ?? entry.published,
    author: personRef,
    publisher: personRef,
    isPartOf: { "@id": WEBSITE_ID },
    image: `${SITE_URL}/writing/${entry.slug}/opengraph-image`,
    mainEntityOfPage: `${SITE_URL}/writing/${entry.slug}`,
  };
  const others = published.filter((item) => item.slug !== entry.slug);

  return (
    <article className="block">
      <JsonLd
        nodes={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Writing", path: "/writing" },
            { name: entry.title, path: `/writing/${entry.slug}` },
          ]),
        ]}
      />
      <Reveals />

      <StickyHero
        backHref="/writing"
        backLabel="All writing"
        title={entry.title}
        meta={`${dateOf(entry)} · ${readingTime(entry)} min read · ${entry.topic}`}
        scrim="band"
        mobileAspect="square"
      >
        <HeroArt slug={entry.slug} />
      </StickyHero>

      <div data-sheet className="relative z-10 min-h-screen bg-surface px-4 sm:px-6 py-16 md:py-20">
        <PinnedBack href="/writing" label="All writing" mode="covered" />
        <div className="mx-auto max-w-(--container-view)">
          {entry.draft ? (
            <p className="mb-8 max-w-(--container-reading) border-y border-line py-3 text-2xs text-muted">
              Draft. Not listed on Writing and not indexed until it&apos;s published.
            </p>
          ) : null}
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
                  {section.links?.length ? (
                    <ul className="mt-5 flex flex-col gap-2 text-sm">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            {...(link.href.startsWith("http")
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
                          >
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              {/* Where the piece leads next: the project it is about, then the
                  rest of the writing. Plain links, the same weight as the
                  section links above. */}
              <nav aria-label="Related" data-reveal className="border-t border-line pt-6 text-sm">
                {entry.project ? (
                  <p>
                    <span className="text-2xs text-muted">The project</span>
                    <br />
                    {entry.project.href.startsWith("/") ? (
                      <Link href={entry.project.href as Route} className="text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent">
                        {entry.project.name}
                      </Link>
                    ) : (
                      <a href={entry.project.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent">
                        {entry.project.name}
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                ) : null}
                {others.length ? (
                  <>
                    <p className="mt-5 text-2xs text-muted">More writing</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {others.map((item) => (
                        <li key={item.slug}>
                          <Link href={`/writing/${item.slug}` as Route} className="text-ink underline decoration-line underline-offset-[6px] transition-colors hover:text-accent">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </nav>
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="sticky top-[calc(var(--nav-height)+1.5rem)] border-t border-line pt-5">
                <dl className="flex flex-col gap-3 text-2xs text-muted">
                  <div className="flex justify-between gap-4">
                    <dt>Published</dt>
                    <dd className="tabular-nums text-ink">
                      <time dateTime={entry.published}>{dateOf(entry)}</time>
                    </dd>
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
