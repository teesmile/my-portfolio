import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import { PinIcon } from "@/components/ui/icons";
import { siWhatsapp } from "simple-icons";
import CopyEmail from "@/features/contact/copy-email";
import LocalClock from "@/features/contact/local-clock";
import ContactEntrance from "@/features/contact/contact-entrance";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  fullTitle: "Contact Anthony Ugwuja - remote full-stack and AI evaluation",
  description:
    "Open to remote full-stack and AI evaluation work. Based in Nigeria: working hours overlap fully with the UK and Europe, partly with the US East Coast.",
  path: "/contact",
});

/* One screen at 1280x800, checked rather than assumed. On a 390x844 phone
   the heading, email, location and "What I can help with" fill the first
   screen and the clock and "Currently" follow below: the four help lines
   were worth more than keeping the clock in view. The arrival
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
            <CopyEmail email={portfolioConfig.email}>
              {/* The second way in, beside the first. wa.me opens the app on
                  a phone and WhatsApp Web on a desktop, with the greeting
                  already typed. The mark is the simple-icons one the tools
                  rows use, drawn in the button's own colour: buttons are
                  chrome, and chrome stays neutral. */}
              <a
                href={`https://wa.me/${portfolioConfig.whatsapp}?text=${encodeURIComponent(portfolioConfig.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1 text-2xs text-muted transition-colors hover:border-ink hover:text-ink"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
                  <path d={siWhatsapp.path} />
                </svg>
                <span className="sr-only">Message me on </span>WhatsApp
              </a>
            </CopyEmail>

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

            <div className="border-b border-line py-3 md:py-4">
              <h2 className="text-2xs text-muted">What I can help with</h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink">
                {portfolioConfig.copy.helpWith.map((line) => (
                  <li key={line.slice(0, 30)}>{line}</li>
                ))}
              </ul>
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
