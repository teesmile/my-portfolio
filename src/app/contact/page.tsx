import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import { PinIcon } from "@/components/ui/icons";
import CopyEmail from "@/features/contact/copy-email";
import LocalClock from "@/features/contact/local-clock";
import ContactEntrance from "@/features/contact/contact-entrance";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  fullTitle: "Contact Anthony Ugwuja — remote full-stack and AI evaluation",
  description:
    "Open to remote full-stack and AI evaluation work. Based in Nigeria: working hours overlap fully with the UK and Europe, partly with the US East Coast.",
  path: "/contact",
});

/* One screen, deliberately: everything here fits without scrolling at
   1280x800 and 390x844, which is checked rather than assumed. The arrival
   animation belongs to Phase 2. */
export default function ContactPage() {
  const linkedin = portfolioConfig.socials.find((s) => s.name === "LinkedIn");
  const github = portfolioConfig.socials.find((s) => s.name === "GitHub");

  return (
    <section className="flex flex-1 items-center px-4 sm:px-6 py-6 md:py-10">
      <ContactEntrance />
      <div className="mx-auto w-full min-w-0 max-w-(--container-view)">
        <h1 className="text-lg text-ink sm:max-w-[18ch] md:text-xl">
          {portfolioConfig.copy.contactHeading}
        </h1>

        <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div data-contact-left className="lg:col-span-6">
            <CopyEmail email={portfolioConfig.email} />

            <div className="flex items-center gap-3 border-y border-line py-3 md:py-4">
              <span className="text-muted">
                <PinIcon className="h-4 w-4" />
              </span>
              {/* The one place the site states where I am, as a fact and what
                  it means for a team's day. Two lines on screen, two
                  sentences in the text. Block styling only separates them
                  visually: without the full stop the document runs the two
                  together for a screen reader, a crawler and anyone who
                  copies it. */}
              <span>
                <span className="block text-2xs text-muted">
                  {portfolioConfig.location} &middot;{" "}
                  {portfolioConfig.takingWork
                    ? "taking work"
                    : "not taking work"}
                  <span className="sr-only">.</span>
                </span>{" "}
                <span className="block text-sm text-ink">
                  {portfolioConfig.availability}
                </span>
              </span>
            </div>

            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-2xs md:mt-6">
              {[linkedin, github].map((social) =>
                social ? (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted underline decoration-line underline-offset-[6px] transition-colors hover:text-accent"
                  >
                    {social.name}
                  </a>
                ) : null,
              )}
            </p>
          </div>

          <div data-contact-right className="lg:col-span-5 lg:col-start-8">
            <LocalClock />
            <p className="mt-6 max-w-[34ch] border-t border-line pt-4 text-sm text-muted md:mt-8 md:pt-5">
              <span className="text-2xs text-muted">Currently </span>
              <span className="block text-ink">{portfolioConfig.currently}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
