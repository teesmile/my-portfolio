import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { portfolioConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { TechList } from "@/components/ui/tech";
import StickyHero from "@/components/layout/sticky-hero";
import PinnedBack from "@/components/layout/pinned-back";
import Image from "next/image";
import Reveals from "@/components/layout/reveals";
import { ExternalLinkIcon } from "@/components/ui/icons";
import TechGlitch from "@/components/ui/tech-glitch";
import Link from "next/link";
import type { Route } from "next";
import JsonLd from "@/components/ui/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { published } from "@/config/writing";
import { ButtonLink } from "@/components/ui/button";
import { textLinkClass } from "@/components/ui/text-link";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolioConfig.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioConfig.projects.find((p) => p.slug === slug);

  if (!project) {
    return {};
  }

  return pageMetadata({
    title: project.seo.title,
    description: project.seo.description,
    path: `/work/${project.slug}`,
    type: "article",
    image: `/work/${project.slug}/opengraph-image`,
  });
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = portfolioConfig.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  /* Pieces of writing about this project, and its neighbours on /work, so
     a case study is never a dead end. */
  const related = published.filter((entry) => entry.project?.href === `/work/${project.slug}`);
  const { projects } = portfolioConfig;
  const index = projects.indexOf(project);
  const neighbours = [
    { label: "Previous", item: projects[index - 1] },
    { label: "Next", item: projects[index + 1] },
  ].filter((n): n is { label: string; item: (typeof projects)[number] } => n.item !== undefined);

  return (
    <article className="block">
      <JsonLd
        nodes={[
          breadcrumbJsonLd([
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />
      <Reveals />
      <TechGlitch />
      <StickyHero
        backHref="/work"
        backLabel="All work"
        title={project.title}
        meta={`${project.status ?? project.year} · ${project.role}`}
        flipId={`work-${project.slug}`}
      >
        {project.preview ? (
          <Image
            src={project.preview}
            alt={project.title}
            fill
            /* The page's LCP on every case study. `preload` adds the
               <link rel="preload"> but no fetch priority; this puts
               fetchPriority="high" on both the preload and the <img> so the
               image is not queued behind scripts. The bigger cost was
               bandwidth spent before it: see the text font in the root
               layout. */
            preload
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : null}
      </StickyHero>

      {/* The sheet: a solid surface that rides up over the hero. It owns the
          page background from here down, which is what makes it read as a
          sheet rather than a transparent column. */}
      <div data-sheet className="relative z-10 min-h-screen bg-surface px-4 sm:px-6 py-16 md:py-20">
        <PinnedBack href="/work" label="All work" mode="covered" />

        <div className="mx-auto max-w-(--container-view)">
          {/* Three grid children, so the order on a phone is the sections,
              then the actions (the live project and the source), then
              "More work"; from lg up the actions take the right column
              beside the sections and "More work" follows the sections. */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-y-16">
            <div className="lg:col-span-7 lg:row-start-1">
              <p
                data-reveal="load"
                className="max-w-(--container-reading) text-base text-ink"
              >
                {project.description}
              </p>

              <h2 data-reveal className="mt-12 text-lg text-accent">
                What it does
              </h2>
              <ul className="mt-5 flex max-w-(--container-reading) flex-col gap-3 text-sm text-muted">
                {project.highlights.map((highlight) => (
                  <li key={highlight} data-reveal className="border-l border-line pl-4">
                    {highlight}
                  </li>
                ))}
              </ul>

              {project.hard?.length ? (
                <>
                  <h2 data-reveal className="mt-14 text-lg text-accent">
                    What was hard
                  </h2>
                  <div className="mt-5 flex max-w-(--container-reading) flex-col gap-4 text-sm text-ink">
                    {project.hard.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} data-reveal>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              ) : null}

              <h2 data-reveal className="mt-14 text-lg text-accent">
                Architecture
              </h2>
              {project.architecture ? (
                <dl className="mt-5 flex max-w-(--container-reading) flex-col">
                  {[
                    ["Data model", project.architecture.dataModel],
                    ["API", project.architecture.api],
                    ["Auth", project.architecture.auth],
                    ["Hosting", project.architecture.hosting],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      data-reveal
                      className="grid grid-cols-[7rem_1fr] gap-4 border-t border-line py-4 text-sm"
                    >
                      <dt className="text-2xs text-muted">{label}</dt>
                      <dd className="text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p data-reveal className="mt-4 max-w-(--container-reading) text-sm text-muted">
                  Frontend only: no server, no database, no sign-in. The section
                  stays here because the next build has all three.
                </p>
              )}
            </div>

            <aside data-reveal className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
              <h2 className="text-2xs text-muted">Built with</h2>
              <div className="mt-3">
                <TechList items={project.tech} />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 max-sm:justify-center">
                {/* Before launch the address serves a "Coming soon" page,
                    so the button names the address rather than promising a
                    live project. */}
                <ButtonLink href={project.link} external>
                  {project.status ? `Open ${new URL(project.link).host}` : "Open the live project"}
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </ButtonLink>
                {project.repo ? (
                  <ButtonLink href={project.repo} variant="secondary" external>
                    Read the source
                  </ButtonLink>
                ) : null}
              </div>
            </aside>

            <nav aria-label="Related" data-reveal className="max-w-(--container-reading) border-t border-line pt-6 text-sm lg:col-span-7 lg:row-start-2">
                {related.length ? (
                  <>
                    <p className="text-2xs text-muted">Related writing</p>
                    <ul className="mt-2 mb-6 flex flex-col gap-2">
                      {related.map((entry) => (
                        <li key={entry.slug}>
                          <Link href={`/writing/${entry.slug}` as Route} className={textLinkClass}>
                            {entry.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className="text-2xs text-muted">More work</p>
                {/* Case studies are buttons everywhere on the site. The
                    previous/next sense is in the accessible name, where a
                    screen reader hears it, and in the order. */}
                <ul className="mt-3 flex flex-wrap gap-3 max-sm:justify-center">
                  {neighbours.map(({ label, item }) => (
                    <li key={item.slug}>
                      <ButtonLink href={`/work/${item.slug}`} variant="secondary" size="sm" aria-label={`${label}: ${item.title}`}>
                        {item.title}
                      </ButtonLink>
                    </li>
                  ))}
                  <li>
                    <ButtonLink href="/work/renal-dosing-task" variant="secondary" size="sm">
                      Renal dose check (AI evaluation sample)
                    </ButtonLink>
                  </li>
                </ul>
              </nav>
          </div>
        </div>
      </div>
    </article>
  );
}
