import type { Metadata } from "next";
import Link from "next/link";
import { resumeFor, type Variant } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: "Frontend development and AI evaluation.",
};

/* The one place a rule carries the accent. CLAUDE.md states the exception:
   the resume is read as a document rather than navigated. */
function SectionRule() {
  return <div className="mb-3 h-0.5 w-10 bg-accent-strong" aria-hidden="true" />;
}

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const resume = resumeFor((variant === "ai" ? "ai" : "default") as Variant);

  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <header className="border-b border-line pb-10">
          <h1 className="text-xl text-ink md:text-2xl">{resume.name}</h1>
          <p className="mt-3 text-sm text-muted">{resume.title}</p>

          {/* Written out as text with visible separators so a parser reads it,
              and linked so a person can click it. */}
          <p className="mt-6 text-2xs leading-7 text-muted [overflow-wrap:anywhere]">
            {resume.contact.map((item, index) => (
              <span key={item.text}>
                {index > 0 ? <span className="mx-2">|</span> : null}
                {item.href ? (
                  <a href={item.href} className="text-muted">
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </span>
            ))}
          </p>

          <a
            data-no-print
            href={resume.pdfHref}
            download
            className="mt-6 inline-block border border-line px-4 py-2 text-2xs text-ink transition-colors hover:border-ink"
          >
            Download PDF
          </a>
        </header>

        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <p className="max-w-(--container-reading) text-base text-ink">
              {resume.summary}
            </p>

            <div className="mt-20">
              <SectionRule />
              <h2 className="text-2xs text-muted">{resume.sections.experience}</h2>
            </div>
            <div className="mt-6 flex flex-col gap-12">
              {resume.experience.map((role) => (
                <article key={`${role.title}-${role.period}`}>
                  <h3 className="font-display text-lg text-ink">{role.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">
                    {role.company} &middot; {role.period}
                  </p>
                  <ul className="mt-5 flex flex-col gap-2.5 text-sm text-muted">
                    {role.bullets.map((bullet) => (
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
              <h2 className="text-2xs text-muted">{resume.sections.projects}</h2>
            </div>
            <div className="mt-6 flex flex-col gap-8">
              {resume.projects.map((project) => (
                <article key={project.name}>
                  <h3 className="font-display text-base text-ink">{project.name}</h3>
                  <p className="mt-1.5 text-sm text-muted">{project.line}</p>
                  <p className="mt-1.5 text-2xs text-muted [overflow-wrap:anywhere]">
                    <a href={project.url}>{project.url.replace(/^https?:\/\//, "")}</a>
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div>
              <SectionRule />
              <h2 className="text-2xs text-muted">{resume.sections.education}</h2>
            </div>
            <div className="mt-5 flex flex-col gap-8">
              {resume.education.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-base text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-2xs text-muted">{item.institution}</p>
                  <p className="mt-1 text-2xs text-muted">{item.period}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <SectionRule />
              <h2 className="text-2xs text-muted">{resume.sections.licensure}</h2>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {resume.credentials.map((credential) => (
                <div key={credential.label}>
                  <p className="text-sm text-ink">{credential.label}</p>
                  <p className="mt-1 text-2xs text-muted">{credential.date}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <SectionRule />
              <h2 className="text-2xs text-muted">{resume.sections.skills}</h2>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              {resume.skills.map((group) => (
                <div key={group.label}>
                  <h3 className="text-sm text-ink">{group.label}</h3>
                  {/* Each term is its own non-breaking span: a line break
                      inside "rubric-based" extracts as two words. */}
                  <p className="mt-1.5 text-2xs leading-6 text-muted">
                    {group.items.map((item, index) => (
                      <span key={item}>
                        {index > 0 ? ", " : ""}
                        <span className="whitespace-nowrap">{item}</span>
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>

            <Link
              data-no-print
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
