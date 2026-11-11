import { siGithub, siX } from "simple-icons";
import { portfolioConfig } from "@/config/site";
import { linkedin, type BrandIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button";

/* The three profiles as marks only. GitHub and X are simple-icons; LinkedIn
   is not carried there, so its mark is in brand-icons.ts. */
const marks: Record<string, BrandIcon> = { github: siGithub, linkedin, twitter: siX };

export default function Footer() {
  return (
    /* Its own layer on the page surface: nothing in a page's content, however
       it is transformed, can paint over the footer or take its clicks. */
    <footer className="relative z-10 border-t border-line bg-surface px-4 pt-6 sm:px-6 md:pt-10">
      {/* Phones: the marks in one centred row, the copyright centred under
          them. From sm up: copyright left, marks right. The DOM keeps the
          copyright first either way; the column is reversed on phones. */}
      <div className="mx-auto flex max-w-(--container-view) flex-col-reverse items-center gap-4 text-center text-2xs text-muted sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} {portfolioConfig.name}
        </p>
        <ul className="-mr-3 flex items-center gap-1 sm:-mr-3" aria-label="Profiles elsewhere">
          {portfolioConfig.socials.map((social) => {
            const mark = marks[social.iconKey];
            return (
              <li key={social.name}>
                {/* Icon only, 44px square so it is comfortable to tap; the
                    name is there for a screen reader and nobody else. */}
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("icon")}
                >
                  <svg viewBox={mark.viewBox ?? "0 0 24 24"} className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d={mark.path} />
                  </svg>
                  <span className="sr-only">{social.name} (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* The brand word, oversized, as the last thing on every page. Purely
          decorative: aria-hidden, nothing focusable, and too faint to carry
          meaning, so it is held to no contrast ratio. Sizing and the fade are
          in globals.css (.footer-wordmark). */}
      <div aria-hidden="true" className="footer-wordmark-frame mx-auto mt-10 max-w-(--container-view) md:mt-16">
        <p className="footer-wordmark">{portfolioConfig.brandName.toLowerCase()}</p>
      </div>
    </footer>
  );
}
