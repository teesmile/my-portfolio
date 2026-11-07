import type { Metadata } from "next";
import { portfolioConfig } from "@/config/site";
import { PhoneIcon, PinIcon } from "@/components/ui/icons";
import CopyEmail from "@/features/contact/copy-email";
import LocalClock from "@/features/contact/local-clock";
import ContactEntrance from "@/features/contact/contact-entrance";

export const metadata: Metadata = {
  title: "Contact",
  description: "Open to remote frontend work and code evaluation.",
};

/* One screen, deliberately: everything here fits without scrolling at
   1280x800 and 390x844, which is checked rather than assumed. The arrival
   animation belongs to Phase 2. */
export default function ContactPage() {
  const linkedin = portfolioConfig.socials.find((s) => s.name === "LinkedIn");
  const github = portfolioConfig.socials.find((s) => s.name === "GitHub");

  return (
    <section className="flex flex-1 items-center px-6 py-6 md:py-10">
      <ContactEntrance />
      <div className="mx-auto w-full min-w-0 max-w-(--container-view)">
        <h1 className="max-w-[18ch] text-lg text-ink md:text-xl">
          {portfolioConfig.copy.contactHeading}
        </h1>

        <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div data-contact-left className="lg:col-span-6">
            <CopyEmail email={portfolioConfig.email} />

            <a
              href={`tel:${portfolioConfig.phone.replace(/\s/g, "")}`}
              className="group flex items-center gap-3 border-t border-line py-3 md:py-4"
            >
              <span className="text-muted transition-colors group-hover:text-ink">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-2xs text-muted">Phone, tap to call</span>
                <span className="block text-sm text-ink">{portfolioConfig.phone}</span>
              </span>
            </a>

            <div className="flex items-center gap-3 border-y border-line py-3 md:py-4">
              <span className="text-muted">
                <PinIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-2xs text-muted">
                  {portfolioConfig.location} &middot;{" "}
                  {portfolioConfig.takingWork
                    ? "taking work"
                    : "not taking work"}
                </span>
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
