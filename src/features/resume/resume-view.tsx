import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { DocSection, ResumeDocument } from "@/content/resume-document";
import { buttonClass } from "@/components/ui/button";
import { textLinkClass } from "@/components/ui/text-link";

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
      className="mr-1 inline-block rounded-button border border-cv-accent px-2 py-0.5 text-2xs leading-5 text-cv-accent no-underline transition-colors hover:bg-cv-accent hover:text-surface"
    >
      {label}
      {external ? <span className="sr-only print:hidden"> (opens in a new tab)</span> : null}
    </a>
  );
}

/* `*text*` is an italic span (a species name in a citation); a DOI is a
   link that never breaks, because a DOI split at a slash extracts as two
   words. Nothing else is interpreted. */
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\*([^*]+)\*|doi:(\S+?)(?=[.,;]?(?:\s|$))/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    if (match[1] !== undefined) {
      parts.push(<em key={at}>{match[1]}</em>);
    } else {
      parts.push(
        <a key={at} href={`https://doi.org/${match[2]}`} className="whitespace-nowrap">
          doi:{match[2]}
        </a>,
      );
    }
    last = at + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/* Every date range is nowrap: a range broken across lines ("Nov 2025 -" /
   "Present") reads as two facts. Nowrap rather than U+00A0, which would also
   end up in the extracted text an ATS parses. Short lines only, so a long
   line can still wrap. */
function MetaLine({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`text-2xs leading-6 text-muted ${className}`}>
      {text.length <= 30 ? <span className="whitespace-nowrap">{text}</span> : text}
    </p>
  );
}

function Section({ section, compact }: { section: DocSection; compact: boolean }) {
  switch (section.kind) {
    case "paragraphs":
      return (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3">
            {section.paragraphs.map((line) => (
              <p key={line} className={`mb-2 text-sm text-ink last:mb-0 ${JUSTIFY}`}>
                <Rich text={line} />
              </p>
            ))}
          </div>
        </>
      );

    case "skills":
      return (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3 flex flex-col gap-2">
            {section.groups.map((group) => (
              <p key={group.label ?? group.items.join()} className="text-2xs leading-6">
                {group.label ? <span className="font-display text-ink">{group.label}: </span> : null}
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
        </>
      );

    case "roles":
      return (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3 flex flex-col gap-6">
            {section.roles.map((role) => (
              <article key={`${role.title}-${role.sites[0]?.period}`}>
                {/* One fact per line, joined only by commas: what a parser
                    maps to title, employer and location, and dates. A
                    combined entry repeats the employer and dates pair. */}
                <h3 className="font-display text-base text-ink">{role.title}</h3>
                {role.sites.map((site, index) =>
                  compact ? (
                    <p key={`${site.company}-${site.period}`} className="mt-0.5 text-2xs text-muted">
                      {site.company}, {site.location}, <span className="whitespace-nowrap">{site.period}</span>
                    </p>
                  ) : (
                    <Fragment key={`${site.company}-${site.period}`}>
                      <p className={`${index === 0 ? "mt-0.5" : "mt-1"} text-2xs text-muted`}>
                        {site.company}, {site.location}
                      </p>
                      <p className="text-2xs text-muted">
                        <span className="whitespace-nowrap">{site.period}</span>
                      </p>
                    </Fragment>
                  ),
                )}
                {role.note ? <p className="mt-0.5 text-2xs text-muted">{role.note}</p> : null}
                <ul className={`mt-2 flex flex-col gap-1.5 text-2xs leading-6 text-ink ${JUSTIFY}`}>
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="border-l border-line pl-3">
                      <Rich text={bullet} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      );

    case "projects":
      return section.projects.length ? (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3 flex flex-col gap-4">
            {section.projects.map((project) => (
              <article key={project.name}>
                <h3 className="font-display text-sm text-ink">{project.name}</h3>
                <p className={`mt-0.5 text-2xs leading-6 text-ink ${JUSTIFY}`}>{project.line}</p>
                {/* The case study on the site, then the live site: whichever
                    exist, as buttons. In the PDF both stay real links.
                    Inline, with a real space between them rather than a flex
                    gap: a gap adds no text, and the PDF's text layer would
                    read "Case studyLive site". */}
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
      ) : null;

    case "entries":
      return (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3 flex flex-col gap-3">
            {section.entries.map((entry) => (
              <article key={entry.title}>
                {/* Title, then one fact per line (institution, dates), as
                    in Experience, so a parser maps each to its field. */}
                <h3 className="font-display text-sm text-ink">{entry.title}</h3>
                {compact ? (
                  <p className="text-2xs leading-6 text-muted">
                    {entry.lines.map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 ? ", " : null}
                        <span className={line.length <= 30 ? "whitespace-nowrap" : undefined}>{line}</span>
                      </Fragment>
                    ))}
                  </p>
                ) : (
                  entry.lines.map((line) => <MetaLine key={line} text={line} />)
                )}
              </article>
            ))}
          </div>
          {section.after?.map((line, index) => (
            <p key={line.text} className={`${index === 0 ? "mt-4" : "mt-1"} text-2xs leading-6 text-muted`}>
              {line.label ? <span className="text-muted">{line.label}: </span> : null}
              <span className="text-ink">{line.text}</span>
            </p>
          ))}
        </>
      );

    case "citations":
      return (
        <>
          <SectionHeading label={section.heading} />
          <div className="mt-3 flex flex-col gap-3">
            {section.groups.map((group) => (
              <article key={group.label || group.items[0]}>
                {group.label ? <h3 className="font-display text-sm text-ink">{group.label}</h3> : null}
                <ul className={`${group.label ? "mt-1" : ""} flex flex-col gap-1.5 text-2xs leading-6 text-ink`}>
                  {group.items.map((item) => (
                    <li key={item} className="border-l border-line pl-3">
                      <Rich text={item} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      );
  }
}

/**
 * One column, in the order the document gives. Single column is not a style
 * choice: a two-column document interleaves in the text stream when it is
 * extracted, which is how "todo-app…vercel.app/" once ended up fused to the
 * next project's name. A parser reads this top to bottom in the order a
 * person would.
 */
export default function ResumeView({ doc }: { doc: ResumeDocument }) {
  return (
    <section data-cv-sheet className="px-4 sm:px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-reading)">
        {/* Centred: name, title line and contact lines. Centring changes no
            text, so the extraction reads the same three lines in order. */}
        <header className="border-b border-line pb-6 text-center">
          <h1 data-cv-name className="text-2xl text-ink">{doc.name}</h1>
          <p className="mt-2 text-sm text-muted">{doc.title}</p>

          {/* Written out as text with visible separators so a parser reads
              it, and linked so a person can click it. Every item holds
              together and the line breaks only at the separators: breaking
              inside an item is what produced "github.co" + "m/teesmile" in
              extraction. */}
          <p className="mt-4 text-2xs leading-7 text-muted">
            {(doc.contact ?? []).map((item, index) => (
              <Fragment key={item.text}>
                {index > 0 ? " | " : null}
                <span className="whitespace-nowrap">
                  {item.href ? <a href={item.href}>{item.text}</a> : item.text}
                </span>
              </Fragment>
            ))}
          </p>

          {doc.pdfHref ? (
            <a
              data-no-print
              href={doc.pdfHref}
              download
              className={buttonClass("secondary", "sm", "mt-5")}
            >
              Download PDF
            </a>
          ) : null}
        </header>

        <div className="mt-8">
          {doc.sections.map((section) => (
            <Section key={section.heading} section={section} compact={Boolean(doc.compactMeta)} />
          ))}
        </div>

        <Link
          data-no-print
          href="/contact"
          className={`mt-12 inline-block text-sm ${textLinkClass}`}
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
