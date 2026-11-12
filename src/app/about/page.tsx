import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/ui/json-ld";
import { SITE_URL } from "@/config/site-url";
import { WEBSITE_ID, breadcrumbJsonLd, personJsonLd } from "@/lib/structured-data";
import Image from "next/image";
import { portfolioConfig } from "@/config/site";
import { siteExperience } from "@/content/resume";
import { TechList } from "@/components/ui/tech";
import StackRows from "@/features/about/stack-rows";
import Reveals from "@/components/layout/reveals";
import { textLinkClass } from "@/components/ui/text-link";
import { stagger } from "@/components/layout/stagger";
import TechGlitch from "@/components/ui/tech-glitch";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = pageMetadata({
  title: "About",
  fullTitle: "About Anthony Ugwuja - full-stack developer and AI evaluator",
  description:
    "Full-stack developer and AI evaluator who checks model-written code and clinical answers, with a pharmacy degree behind it. Experience, talks and stack.",
  path: "/about",
  image: "/about/opengraph-image",
});

export default function AboutPage() {
  const { copy, stack, timeline, talks } = portfolioConfig;

  return (
    <section className="px-4 sm:px-6 py-20 md:py-24">
      {/* A profile page about one person: the full Person as its main entity,
          the form search engines read for profile pages. */}
      <JsonLd
        nodes={[
          { "@type": "ProfilePage", url: `${SITE_URL}/about`, mainEntity: personJsonLd, isPartOf: { "@id": WEBSITE_ID } },
          breadcrumbJsonLd([{ name: "About", path: "/about" }]),
        ]}
      />
      <Reveals />
      <TechGlitch />
      <div className="mx-auto max-w-(--container-view)">
        <div className="grid min-w-0 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="min-w-0 lg:col-span-7">
            <h1 data-reveal="rise" className="max-w-[20ch] text-xl text-ink md:text-2xl">
              {copy.aboutHeading}
            </h1>

            <div className="mt-10 flex max-w-(--container-reading) flex-col gap-6 text-base text-ink">
              {copy.aboutParagraphs.map((paragraph, index) => (
                <p key={paragraph.slice(0, 40)} data-reveal="" style={stagger(index)}>
                  {paragraph}
                </p>
              ))}
            </div>

            <h2 data-reveal="" className="mt-16 text-lg text-accent">How I got here</h2>
            <p data-reveal="" className="mt-3 max-w-(--container-reading) text-sm text-muted">
              Two tracks, running at the same time rather than one replacing the
              other.
            </p>
            <ol className="mt-6 flex max-w-(--container-reading) flex-col">
              {timeline.map((entry, index) => (
                <li
                  key={entry.label}
                  data-reveal=""
                  style={stagger(index)}
                  className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-4 text-sm"
                >
                  <span className="text-2xs text-muted tabular-nums">
                    {entry.period ?? ""}
                  </span>
                  <span className={entry.track === "code" ? "text-ink" : "text-muted"}>
                    {entry.label}
                  </span>
                  <span className="text-2xs text-muted">
                    {entry.track === "code" ? "code" : "pharmacy"}
                  </span>
                </li>
              ))}
            </ol>

            {/* The timeline's grid, so a talk reads as one more dated entry
                on its track rather than as a separate kind of card. */}
            <h2 data-reveal="" className="mt-16 text-lg text-accent">Talks</h2>
            <ol className="mt-6 flex max-w-(--container-reading) flex-col">
              {talks.map((talk, index) => (
                <li
                  key={talk.title}
                  data-reveal=""
                  style={stagger(index)}
                  className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-4 text-sm"
                >
                  <span className="text-2xs text-muted tabular-nums">{talk.period}</span>
                  <div className="min-w-0">
                    <p className="text-ink">{talk.title}</p>
                    <p className="mt-1 text-2xs text-muted">{talk.venue}</p>
                    <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-2xs">
                      {[
                        ["Slides", talk.slides],
                        ["PDF", talk.pdf],
                      ].map(([label, href]) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 ${textLinkClass}`}
                        >
                          {label}
                          <ExternalLinkIcon className="h-3 w-3" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ))}
                    </p>
                  </div>
                  <span className="text-2xs text-muted">{talk.track}</span>
                </li>
              ))}
            </ol>

            <h2 data-reveal="" className="mt-16 text-lg text-accent">Experience</h2>
            <div className="mt-6 flex max-w-(--container-reading) flex-col gap-8">
              {siteExperience.map((role, index) => (
                <article key={`${role.title}-${role.period}`} data-reveal="" style={stagger(index)} className="border-t border-line pt-5">
                  {/* The CVs space their ranges ("Nov 2025 - Present") for
                      parsers; the site writes ranges unspaced. */}
                  <p className="text-2xs text-muted tabular-nums">{role.period.replace(" - ", "-")}</p>
                  <h3 className="mt-2 font-display text-base text-ink">{role.title}</h3>
                  <p className="mt-1 text-sm text-muted">{role.company}, {role.location}</p>
                  {role.note ? (
                    <p className="mt-1 text-2xs text-muted">{role.note}</p>
                  ) : null}
                  {/* The bullets are the resume's own, in the master's order,
                      so this page and the PDF cannot describe the job two
                      different ways. */}
                  {role.bullets.length ? (
                    <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                      {role.bullets.map((bullet) => (
                        <li key={bullet} className="border-l border-line pl-3">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {role.tech.length ? (
                    <div className="mt-3">
                      <TechList items={role.tech} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            {/* No frame, no border, no backing panel: the source is a clean
                cutout, so anything behind it reads as a box the photo was
                pasted into — and in light mode that box was white. */}
            {/* On a phone the column is the full width and the portrait
                would fill it edge to edge; it is held to a smaller square
                and centred instead, as a photo rather than a banner. */}
            <div className="relative aspect-square w-full max-sm:mx-auto max-sm:max-w-72">
              <Image
                src="/portrait-clean-v2.webp"
                alt={`${portfolioConfig.name} portrait`}
                fill
                sizes="(min-width: 1024px) 24rem, 100vw"
                className="object-contain"
                preload
              />
            </div>

            <h2 className="mt-12 text-2xs text-muted">{copy.aboutStackHeading}</h2>
            <div className="mt-5">
              <StackRows layers={stack} />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 max-sm:justify-center">
              <ButtonLink href="/resume">Read the resume</ButtonLink>
              <ButtonLink href={portfolioConfig.resumePdf} variant="secondary" download>
                Download PDF
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
