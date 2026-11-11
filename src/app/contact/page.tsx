import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { portfolioConfig } from "@/config/site";
import { MailIcon, PinIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";
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
   the heading, the two ways in, location and "What I can help with" fill the
   first screen and the clock follows below. The profiles are in the footer,
   as marks, on every page; they are not repeated here. */
export default function ContactPage() {
  const whatsapp = `https://wa.me/${portfolioConfig.whatsapp}?text=${encodeURIComponent(portfolioConfig.whatsappMessage)}`;

  return (
    <section className="flex flex-1 items-center px-4 sm:px-6 py-6 md:py-10">
      <ContactEntrance />
      <div className="mx-auto w-full min-w-0 max-w-(--container-view)">
        <h1 className="text-lg text-ink sm:max-w-[18ch] md:text-xl">
          {portfolioConfig.copy.contactHeading}
        </h1>

        <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div data-contact-left className="lg:col-span-6">
            {/* Two ways in, side by side at every width. The address on the
                left is a plain link that opens the visitor's own mail app.
                WhatsApp on the right is one icon button under a short label:
                wa.me opens the app on a phone and WhatsApp Web on a desktop,
                with the greeting already typed. The mark is WhatsApp's own
                glyph file, unaltered (public/brand/whatsapp): white on the
                dark theme, black on the light one, so the button stays as
                neutral as the rest of the chrome. */}
            <div className="flex items-start justify-between gap-6 border-t border-line py-4 md:py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-1 text-muted">
                  <MailIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-2xs text-muted">Email</span>
                  <a
                    href={`mailto:${portfolioConfig.email}`}
                    className="block text-sm text-ink underline decoration-line underline-offset-[5px] transition-colors [overflow-wrap:anywhere] hover:text-accent"
                  >
                    {portfolioConfig.email}
                  </a>
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-2">
                <span className="text-2xs text-muted">Send a DM</span>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("secondary", "md", "h-14 w-14 px-0")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB brand SVG shown as-is; next/image adds nothing here */}
                  <img src="/brand/whatsapp/Digital_Glyph_White_RGB_2026.svg" alt="" width={28} height={28} className="block h-7 w-7 light:hidden" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
                  <img src="/brand/whatsapp/Digital_Glyph_Black_RGB_2026.svg" alt="" width={28} height={28} className="hidden h-7 w-7 light:block" />
                  <span className="sr-only">Send a DM on WhatsApp (opens in a new tab)</span>
                </a>
              </div>
            </div>

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
          </div>

          <div data-contact-right className="lg:col-span-5 lg:col-start-8">
            <LocalClock />
          </div>
        </div>
      </div>
    </section>
  );
}
