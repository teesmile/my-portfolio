import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";
import { TechList } from "@/components/ui/tech";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pharmacist turned frontend developer, now paid to find what AI-written code gets wrong.",
};

export default function AboutPage() {
  const { copy, stack, timeline, resume } = portfolioConfig;

  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-(--container-view)">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h1 className="max-w-[20ch] text-xl text-ink md:text-2xl">
              {copy.aboutHeading}
            </h1>

            <div className="mt-10 flex max-w-(--container-reading) flex-col gap-6 text-base text-ink">
              {copy.aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
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
              {resume.experience.map((role) => (
                <article key={`${role.role}-${role.period}`} className="border-t border-line pt-5">
                  <p className="text-2xs text-muted tabular-nums">{role.period}</p>
                  <h3 className="mt-2 font-display text-base text-ink">{role.role}</h3>
                  <p className="mt-1 text-sm text-muted">{role.company}</p>
                  <div className="mt-3">
                    <TechList items={role.tech} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-raised">
              <Image
                src="/profile.webp"
                alt={`${portfolioConfig.name} portrait`}
                fill
                sizes="(min-width: 1024px) 24rem, 100vw"
                className="object-cover"
              />
            </div>

            <h2 className="mt-12 text-2xs text-muted">{copy.aboutStackHeading}</h2>
            {/* Grouped by layer so the gaps are as visible as the strengths. */}
            <dl className="mt-5 flex flex-col gap-5">
              {stack.map((group) => (
                <div key={group.layer} className="border-t border-line pt-4">
                  <dt className="text-sm text-ink">{group.layer}</dt>
                  <dd className="mt-2">
                    {group.items.length > 0 ? (
                      <TechList items={group.items} />
                    ) : (
                      <p className="text-2xs text-muted">{copy.aboutDataEmpty}</p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href="/resume"
              className="mt-10 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
            >
              Read the resume
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
