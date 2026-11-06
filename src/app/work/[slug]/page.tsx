import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import { TechList } from "@/components/ui/tech";

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
    title: project.title,
    description: project.description,
    path: `/work/${project.slug}`,
  });
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = portfolioConfig.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <Link
          href="/work"
          className="text-2xs text-muted transition-colors hover:text-ink"
        >
          &larr; Work
        </Link>

        <header className="mt-8 border-b border-line pb-10">
          <h1 className="max-w-[20ch] text-xl text-ink md:text-2xl">
            {project.title}
          </h1>
          <p className="mt-4 text-2xs text-muted">
            {project.year} &middot; {project.role}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="max-w-(--container-reading) text-base text-ink">
              {project.description}
            </p>

            <h2 className="mt-12 text-lg text-ink">What it does</h2>
            <ul className="mt-5 flex max-w-(--container-reading) flex-col gap-3 text-sm text-muted">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="border-l border-line pl-4">
                  {highlight}
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-lg text-ink">Architecture</h2>
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
                    className="grid grid-cols-[7rem_1fr] gap-4 border-t border-line py-4 text-sm"
                  >
                    <dt className="text-2xs text-muted">{label}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 max-w-(--container-reading) text-sm text-muted">
                Frontend only: no server, no database, no sign-in. The section
                stays here because the next build has all three.
              </p>
            )}
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="text-2xs text-muted">Built with</h2>
            <div className="mt-3">
              <TechList items={project.tech} />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
              >
                Open the live project
              </a>
              {project.repo ? (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted underline decoration-line underline-offset-[6px] transition-colors hover:text-ink"
                >
                  Read the source
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
