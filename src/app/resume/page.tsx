import { Fragment } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { resumeFor, type Variant } from "@/content/resume";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  fullTitle: "Resume - Anthony Ugwuja, full-stack developer, AI evaluator",
  description:
    "Resume of Anthony Ugwuja: full-stack developer (React, Next.js, TypeScript, Node.js) and AI evaluator, pharmacist by training. PDF versions included.",
  path: "/resume",
});

/* Section headings carry the CV's one accent: the heading itself is set in
   it. Nothing else on the page takes it except the link buttons. */
function SectionHeading({ label }: { label: string }) {
  return (
    <div data-section-heading className="mt-10 first:mt-0">
      <h2 className="text-sm text-cv-accent">{label}</h2>
    </div>
  );
}

/* Body text runs the full measure: justified, last line left, never
   hyphenated (a break hyphen extracts as a fused or split word). */
const JUSTIFY = "text-justify-body";

/* A link as a small outlined button: the accent's colour, no underline. A
   real <a>, so it stays a clickable link annotation in the PDF. */
function LinkButton({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      data-cv-button
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="mr-1 inline-block border border-cv-accent px-2 py-0.5 text-2xs leading-5 text-cv-accent no-underline transition-colors hover:bg-cv-accent hover:text-surface"
    >
      {label}
      {external ? <span className="sr-only print:hidden"> (opens in a new tab)</span> : null}
    </a>
  );
}

/**
 * One column, in a fixed order: summary, skills, experience, projects, then
 * education and credentials under one heading, then languages. A version
 * that carries no projects drops that section rather than printing an empty
 * heading.
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
    <section data-cv-sheet className="px-4 sm:px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-reading)">
        {/* Centred: name, title line and contact lines. Centring changes no
            text, so the extraction reads the same three lines in order. */}
        <header className="border-b border-line pb-6 text-center">
          <h1 data-cv-name className="text-2xl text-ink">{resume.name}</h1>
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
          <SectionHeading label={resume.sections.summary} />
          <div className="mt-3">
            {resume.summary.map((line) => (
              <p key={line} className={`mb-2 text-sm text-ink last:mb-0 ${JUSTIFY}`}>
                {line}
              </p>
            ))}
          </div>

          <SectionHeading label={resume.sections.skills} />
          <div className="mt-3 flex flex-col gap-2">
            {resume.skills.map((group) => (
              <p key={group.label} className="text-2xs leading-6">
                <span className="font-display text-ink">{group.label}: </span>
                <span className="text-ink">
                  {group.items.map((item, index) => (
                    <span key={item}>
                      {index > 0 ? ", " : ""}
                      {/* Short items hold together ("Tailwind CSS"); a long
                          one may wrap, or it drops whole to the next line
                          and leaves a short line behind it. */}
                      <span className={item.split(" ").length < 3 ? "whitespace-nowrap" : undefined}>{item}</span>
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
                {/* Three lines, one fact each, joined only by commas: what a
                    parser maps to title, employer and location, and dates. */}
                <h3 className="font-display text-base text-ink">{role.title}</h3>
                <p className="mt-0.5 text-2xs text-muted">
                  {role.company}, {role.location}
                </p>
                <p className="text-2xs text-muted">
                  <span className="whitespace-nowrap">{role.period}</span>
                </p>
                {role.note ? (
                  <p className="mt-0.5 text-2xs text-muted">{role.note}</p>
                ) : null}
                <ul className={`mt-2 flex flex-col gap-1.5 text-2xs leading-6 text-ink ${JUSTIFY}`}>
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
                <p className={`mt-0.5 text-2xs leading-6 text-ink ${JUSTIFY}`}>{project.line}</p>
                {/* Both links on one line, each unbreakable in itself: a URL
                    that wraps mid-token extracts as two words, but the line
                    may break at the separator between them. Three projects
                    at two link lines each is three lines of paper. */}
                {/* The case study on the site, then the live site: whichever
                    exist, as buttons. In the PDF both stay real links. */}
                {/* Inline, with a real space between them rather than a flex
                    gap: a gap adds no text, and the PDF's text layer would read
                    "Case studyLive site". */}
                <p className="mt-1.5">
                  {[
                    project.caseStudy ? <LinkButton key="case" href={project.caseStudy} label="Case study" /> : null,
                    project.url ? <LinkButton key="live" href={project.url} label="Live site" external /> : null,
                  ]
                    .filter(Boolean)
                    .map((button, index) => (
                      <Fragment key={index}>
                        {index > 0 ? " " : null}
                        {button}
                      </Fragment>
                    ))}
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
                {/* Qualification, institution, dates: one fact per line, as
                    in Experience, so a parser maps each to its field. */}
                <h3 className="font-display text-sm text-ink">{item.title}</h3>
                <p className="text-2xs leading-6 text-muted">{item.institution}</p>
                <p className="text-2xs leading-6 text-muted">
                  <span className="whitespace-nowrap">{item.period}</span>
                </p>
                {item.note ? (
                  <p className="text-2xs leading-6 text-muted">{item.note}</p>
                ) : null}
              </article>
            ))}
            {/* Credentials follow the qualifications in the same section,
                in the same three-line shape. */}
            {resume.credentials.map((credential) => (
              <article key={credential.label}>
                <h3 className="font-display text-sm text-ink">{credential.label}</h3>
                <p className="text-2xs leading-6 text-muted">{credential.issuer}</p>
                {credential.date ? (
                  <p className="text-2xs leading-6 text-muted">
                    <span className="whitespace-nowrap">{credential.date}</span>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          {resume.languages ? (
            <p className="mt-4 text-2xs leading-6 text-muted">
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
