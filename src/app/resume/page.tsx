import type { Metadata } from "next";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `${portfolioConfig.name} — frontend development and AI code evaluation.`,
};

/* The one place a rule carries the accent. The working rules state the exception:
   the resume is read as a document rather than navigated, and the rules are
   what separate its parts. */
function SectionRule() {
  return <div className="mb-3 h-0.5 w-10 bg-accent-strong" aria-hidden="true" />;
}

export default function ResumePage() {
  const { resume, skills, projects } = portfolioConfig;

  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <header className="border-b border-line pb-10">
          <h1 className="text-xl text-ink md:text-2xl">{portfolioConfig.name}</h1>
          <p className="mt-3 text-sm text-muted">{portfolioConfig.title}</p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-2xs text-muted">
            <span>{portfolioConfig.email}</span>
            <span>{portfolioConfig.phone}</span>
            <span>{portfolioConfig.location}</span>
            <span>{portfolioConfig.availability}</span>
          </p>
        </header>

        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <p className="max-w-(--container-reading) text-base text-ink">
              {resume.summary}
            </p>
            <ul className="mt-6 flex max-w-(--container-reading) flex-col gap-3 text-sm text-muted">
              {resume.highlights.map((highlight) => (
                <li key={highlight} className="border-l border-line pl-4">
                  {highlight}
                </li>
              ))}
            </ul>

            {/* Hierarchy: role in display type, company and dates quieter and
                smaller, bullets smaller again. The accent appears once, as the
                present marker, and never on a rule. */}
            <div className="mt-20">
              <SectionRule />
              <h2 className="text-2xs text-muted">Experience</h2>
            </div>
            <div className="mt-6 flex flex-col gap-12">
              {resume.experience.map((item) => (
                <article key={`${item.role}-${item.period}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-display text-lg text-ink">{item.role}</h3>
                    <p className="flex items-center gap-2 text-2xs text-muted tabular-nums">
                      {item.present ? (
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-accent-strong"
                          aria-hidden="true"
                        />
                      ) : null}
                      {item.period}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{item.company}</p>
                  <ul className="mt-5 flex flex-col gap-2.5 text-sm text-muted">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="border-l border-line pl-4">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-20">
              <SectionRule />
              <h2 className="text-2xs text-muted">Selected projects</h2>
            </div>
            <div className="mt-6 flex flex-col gap-6">
              {projects.map((project) => (
                <article key={project.slug}>
                  <h3 className="font-display text-base text-ink">
                    <Link
                      href={`/work/${project.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {project.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-2xs text-muted">{project.tech.join(", ")}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="">
              <SectionRule />
              <h2 className="text-2xs text-muted">Education</h2>
            </div>
            <div className="mt-5 flex flex-col gap-8">
              {resume.education.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-base text-ink">{item.title}</h3>
                  <p className="mt-1 text-2xs text-muted tabular-nums">
                    {item.institution} &middot; {item.period}
                  </p>
                  {item.details.map((detail) => (
                    <p key={detail} className="mt-3 text-sm text-muted">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-14">
              <SectionRule />
              <h2 className="text-2xs text-muted">Licensure</h2>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {resume.credentials.map((credential) => (
                <div key={credential.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-ink">{credential.label}</dt>
                  <dd className="text-2xs text-muted tabular-nums">{credential.year}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-14">
              <SectionRule />
              <h2 className="text-2xs text-muted">Skills</h2>
            </div>
            <dl className="mt-5 flex flex-col gap-4">
              {skills.map((group) => (
                <div key={group.label}>
                  <dt className="text-sm text-ink">{group.label}</dt>
                  <dd className="mt-1 text-2xs text-muted">{group.items.join(", ")}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/contact"
              className="mt-14 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
            >
              Get in touch
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
