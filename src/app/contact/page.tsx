import type { Metadata } from "next";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Open to remote frontend and AI code evaluation work.",
};

/* Short by design: this view arrives and stays put. No panel, no stack of
   competing buttons, nothing that would make it scroll. */
export default function ContactPage() {
  const linkedin = portfolioConfig.socials.find((s) => s.name === "LinkedIn");
  const github = portfolioConfig.socials.find((s) => s.name === "GitHub");

  return (
    <section className="flex flex-1 items-center px-6 py-20">
      <div className="mx-auto w-full min-w-0 max-w-(--container-view)">
        <h1 className="max-w-[16ch] text-xl text-ink md:text-2xl">
          {portfolioConfig.copy.contactHeading}
        </h1>

        <p className="mt-6 text-sm text-muted">{portfolioConfig.copy.contactNote}</p>

        <a
          href={`mailto:${portfolioConfig.email}`}
          className="mt-10 inline-block max-w-full [overflow-wrap:anywhere] font-display text-lg text-accent underline decoration-accent/40 underline-offset-[8px] transition-[text-decoration-color] hover:decoration-accent md:text-xl"
        >
          {portfolioConfig.email}
        </a>

        <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 text-sm md:grid-cols-3">
          <div>
            <dt className="text-2xs text-muted">Phone</dt>
            <dd className="mt-1 text-ink">{portfolioConfig.phone}</dd>
          </div>
          <div>
            <dt className="text-2xs text-muted">Based in</dt>
            <dd className="mt-1 text-ink">
              {portfolioConfig.location} &middot; {portfolioConfig.availability}
            </dd>
          </div>
          <div>
            <dt className="text-2xs text-muted">Elsewhere</dt>
            <dd className="mt-1 flex gap-4 text-ink">
              {linkedin ? (
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-line underline-offset-[6px] transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>
              ) : null}
              {github ? (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-line underline-offset-[6px] transition-colors hover:text-accent"
                >
                  GitHub
                </a>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
