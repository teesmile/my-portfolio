import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";
import { siteExperience } from "@/content/resume";
import { TechList } from "@/components/ui/tech";
import StackRows from "@/features/about/stack-rows";
import Reveals from "@/components/layout/reveals";
import TechGlitch from "@/components/ui/tech-glitch";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Pharmacist turned frontend developer, now paid to find what AI-written code gets wrong.",
  path: "/about",
});

export default function AboutPage() {
  const { copy, stack, timeline } = portfolioConfig;

  return (
    <section className="px-6 py-20 md:py-24">
      <Reveals />
      <TechGlitch />
      <div className="mx-auto max-w-(--container-view)">
        <div className="grid min-w-0 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="min-w-0 lg:col-span-7">
            <h1 data-reveal className="max-w-[20ch] text-xl text-ink md:text-2xl">
              {copy.aboutHeading}
            </h1>

            <div className="mt-10 flex max-w-(--container-reading) flex-col gap-6 text-base text-ink">
              {copy.aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} data-reveal>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-16 text-lg text-ink">How I got here</h2>
            <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
              Two tracks, running at the same time rather than one replacing the
              other.
            </p>
            <ol className="mt-6 flex max-w-(--container-reading) flex-col">
              {timeline.map((entry) => (
                <li
                  key={entry.label}
                  data-reveal
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

            <h2 className="mt-16 text-lg text-ink">Experience</h2>
            <div className="mt-6 flex max-w-(--container-reading) flex-col gap-8">
              {siteExperience.map((role) => (
                <article key={`${role.title}-${role.period}`} data-reveal className="border-t border-line pt-5">
                  <p className="text-2xs text-muted tabular-nums">{role.period}</p>
                  <h3 className="mt-2 font-display text-base text-ink">{role.title}</h3>
                  <p className="mt-1 text-sm text-muted">{role.company}</p>
                  <div className="mt-3">
                    <TechList items={role.tech} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            {/* No frame, no border, no backing panel: the source is a clean
                cutout, so anything behind it reads as a box the photo was
                pasted into — and in light mode that box was white. */}
            <div className="relative aspect-square w-full">
              <Image
                src="/profile.webp"
                alt={`${portfolioConfig.name} portrait`}
                fill
                sizes="(min-width: 1024px) 24rem, 100vw"
                className="object-contain"
                priority
              />
            </div>

            <h2 className="mt-12 text-2xs text-muted">{copy.aboutStackHeading}</h2>
            <div className="mt-5">
              <StackRows layers={stack} />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/resume"
                className="text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
              >
                Read the resume
              </Link>
              <a
                href={portfolioConfig.resumePdf}
                download
                className="border border-line px-3 py-1.5 text-2xs text-ink transition-colors hover:border-ink"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
