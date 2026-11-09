import { Fragment } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { resumeFor, type Variant } from "@/content/resume";
import { ExternalLinkIcon } from "@/components/ui/icons";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  description:
    "Resume of Anthony Ugwuja: full-stack developer and AI evaluator, registered pharmacist.",
  path: "/resume",
});

/* The one place a rule carries the accent. The working rules state the exception:
   the resume is read as a document rather than navigated. */
function SectionHeading({ label }: { label: string }) {
  return (
    <div data-section-heading className="mt-10 first:mt-0">
      <div className="mb-2 h-0.5 w-10 bg-accent-strong" aria-hidden="true" />
      <h2 className="text-2xs tracking-wide text-muted">{label}</h2>
    </div>
  );
}

/**
 * One column, in a fixed order: summary, skills, experience, projects,
 * education, credentials, languages. A version that carries no projects
 * drops that section rather than printing an empty heading.
 *
 * Single column is not a style choice. A two-column document interleaves in
 * the text stream when it is extracted, which is how "todo-app…vercel.app/"
 * ended up fused to the next project's name. A parser reads this top to
 * bottom in the order a person would.
 */
export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string; private?: string }>;
}) {
  const params = await searchParams;
  const variant: Variant =
    params.variant === "ai" || params.variant === "general" ? params.variant : "default";

  /* `?private=1` is a request, not an authorisation.
     The phone number is only ever rendered when the *server* was started with
     RESUME_ALLOW_PRIVATE=1, which only `pnpm resume --private` does, on a
     localhost server it spawns and kills itself. A deployed instance never
     has the variable set, so the parameter does nothing there — which is the
     whole point: a URL anyone can type must not be able to reveal a number
     that is deliberately kept off the site. */
  const privateAllowed = process.env.RESUME_ALLOW_PRIVATE === "1";
  const resume = resumeFor(variant, privateAllowed && params.private === "1");

  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-reading)">
        <header className="border-b border-line pb-6">
          <h1 className="text-xl text-ink md:text-2xl">{resume.name}</h1>
          <p className="mt-2 text-sm text-muted">{resume.title}</p>

          {/* Written out as text with visible separators so a parser reads it,
              and linked so a person can click it. */}
          {/* Every item holds together and the line breaks only at the
              separators. Breaking inside an item is what produced
              "github.co" + "m/teesmile" in extraction, and splitting "Abuja,"
              from "Nigeria" reads badly; each item here is short enough to
              fit a 390px screen whole, so there is nothing to gain from
              letting one break. */}
          <p className="mt-4 text-2xs leading-7 text-muted">
            {resume.contact.map((item, index) => (
              <Fragment key={item.text}>
                {index > 0 ? " | " : null}
                <span className="whitespace-nowrap">
                  {item.href ? <a href={item.href}>{item.text}</a> : item.text}
                </span>
              </Fragment>
            ))}
          </p>

          <a
            data-no-print
            href={resume.pdfHref}
            download
            className="mt-5 inline-block border border-line px-4 py-2 text-2xs text-ink transition-colors hover:border-ink"
          >
            Download PDF
          </a>
        </header>

        <div className="mt-8">
          {resume.summary.map((line) => (
            <p key={line} className="mb-2 text-sm text-ink">
              {line}
            </p>
          ))}

          <SectionHeading label={resume.sections.skills} />
          <div className="mt-3 flex flex-col gap-2">
            {resume.skills.map((group) => (
              <p key={group.label} className="text-2xs leading-6">
                <span className="text-ink">{group.label}: </span>
                <span className="text-muted">
                  {group.items.map((item, index) => (
                    <span key={item}>
                      {index > 0 ? ", " : ""}
                      <span className="whitespace-nowrap">{item}</span>
                    </span>
                  ))}
                </span>
              </p>
            ))}
          </div>

          <SectionHeading label={resume.sections.experience} />
          <div className="mt-3 flex flex-col gap-6">
            {resume.experience.map((role) => (
              <article key={`${role.title}-${role.period}`}>
                <h3 className="font-display text-base text-ink">{role.title}</h3>
                <p className="mt-0.5 text-2xs text-muted">
                  {role.company} &middot; <span className="whitespace-nowrap">{role.period}</span>
                </p>
                {role.note ? (
                  <p className="mt-0.5 text-2xs text-muted">{role.note}</p>
                ) : null}
                <ul className="mt-2 flex flex-col gap-1.5 text-2xs leading-6 text-muted">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="border-l border-line pl-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {resume.projects.length ? (
            <>
              <SectionHeading label={resume.sections.projects} />
              <div className="mt-3 flex flex-col gap-4">
            {resume.projects.map((project) => (
              <article key={project.name}>
                <h3 className="font-display text-sm text-ink">{project.name}</h3>
                <p className="mt-0.5 text-2xs leading-6 text-muted">{project.line}</p>
                {/* Both links on one line, each unbreakable in itself: a URL
                    that wraps mid-token extracts as two words, but the line
                    may break at the separator between them. Three projects
                    at two link lines each is three lines of paper. */}
                <p className="mt-0.5 text-2xs text-muted">
                  {/* Scheme off, trailing slash off: the address a person
                      would type, and one character less to wrap. The href
                      keeps the URL exactly as the project config has it. */}
                  {/* A benchmark task has no live deploy, only its source;
                      the line shows what exists rather than a blank label. */}
                  {/* Live for an app, Showcase for a benchmark's write-up
                      page; then the source. Whichever exist, in that order. */}
                  {project.url ? (
                    <>
                      {/* A new tab on screen, so the portfolio stays open. The
                          icon and the tab note are screen-only: the PDF's
                          text is unchanged for the ATS check. */}
                      <a className="whitespace-nowrap" href={project.url} target="_blank" rel="noopener noreferrer">
                        Live: {project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <ExternalLinkIcon className="ml-1 inline h-3 w-3 align-[-0.1em] print:hidden" />
                        <span className="sr-only print:hidden">(opens in a new tab)</span>
                      </a>
                      {" | "}
                    </>
                  ) : null}
                  {project.showcase ? (
                    <>
                      <a className="whitespace-nowrap" href={project.showcase}>
                        Showcase: {project.showcase.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                      {" | "}
                    </>
                  ) : null}
                  <a className="whitespace-nowrap" href={project.repo}>
                    Code: {project.repo.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              </article>
            ))}
              </div>
            </>
          ) : null}

          <SectionHeading label={resume.sections.education} />
          <div className="mt-3 flex flex-col gap-3">
            {resume.education.map((item) => (
              <article key={item.title}>
                {/* Every date range is nowrap, here and in the role and
                    credential lines: a range broken across lines ("Nov 2025
                    –" / "Present") reads as two facts. Nowrap rather than
                    U+00A0, which would also end up in the extracted text an
                    ATS parses. pnpm resume checks every range survives on
                    one extracted line. */}
                {/* Qualification, institution and dates are one fact each and
                    read as one line. Experience entries earn the stacked
                    treatment because they carry bullets underneath. */}
                <p className="text-2xs leading-6">
                  <span className="font-display text-sm text-ink">{item.title}</span>
                  <span className="text-muted">
                    {" "}&mdash; {item.institution} &middot;{" "}
                    <span className="whitespace-nowrap">{item.period}</span>
                  </span>
                </p>
                {item.note ? (
                  <p className="text-2xs leading-6 text-muted">{item.note}</p>
                ) : null}
              </article>
            ))}
          </div>

          {/* Credentials and languages are four facts between them; they get
              one line each, label included, so the document ends on the page
              it started on. */}
          <div className="mt-6">
            <div className="mb-2 h-0.5 w-10 bg-accent-strong" aria-hidden="true" />
          </div>
          <p className="text-2xs leading-6 text-muted">
            <span className="text-muted">{resume.sections.credentials}: </span>
            {resume.credentials.map((credential, index) => (
              <Fragment key={credential.label}>
                {/* A literal separator, not a margin. `mx-2` puts visible
                    space on paper that is not in the text, so the page reads
                    "Nigeria|AI" and the PDF reads "Nigeria | AI" and the two
                    stop matching. */}
                {index > 0 ? " | " : null}
                <span className="text-ink">{credential.label}</span>, {credential.issuer}
                {credential.date ? <> &middot; <span className="whitespace-nowrap">{credential.date}</span></> : null}
              </Fragment>
            ))}
          </p>
          {resume.languages ? (
            <p className="text-2xs leading-6 text-muted">
              <span className="text-muted">{resume.sections.languages}: </span>
              <span className="text-ink">{resume.languages}</span>
            </p>
          ) : null}
        </div>

        <Link
          data-no-print
          href="/contact"
          className="mt-12 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
