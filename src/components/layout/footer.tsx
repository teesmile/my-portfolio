import { siGithub, siX } from "simple-icons";
import { portfolioConfig } from "@/config/site";
import { linkedin, type BrandIcon } from "@/components/ui/brand-icons";
import { wordmark } from "@/components/layout/wordmark";

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
        {/* The last mark's 44px box ends 12px past its glyph, so from sm up
            the row hangs that far past the container's edge and the glyph
            lines up with the edge. Only from sm up: on a phone the row is
            centred, and a negative margin there moves it off centre. */}
        <ul className="flex items-center gap-1 sm:-mr-3" aria-label="Profiles elsewhere">
          {portfolioConfig.socials.map((social) => {
            const mark = marks[social.iconKey];
            return (
              <li key={social.name}>
                {/* Icon only, 44px square so it is comfortable to tap; the
                    name is there for a screen reader and nobody else. No
                    box on hover: the pointer and the mark going from muted
                    to ink are the whole state. */}
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors duration-(--duration-fast) hover:text-ink"
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

      {/* The brand word, oversized, as the last thing on every page. Drawn
          as outlines (wordmark.ts, traced by scripts/wordmark.py) so it fills
          the column edge to edge before any font has loaded and whatever a
          device's fonts do. Purely decorative: aria-hidden, nothing
          focusable, and too faint to carry meaning, so it is held to no
          contrast ratio. Sizing is in globals.css (.footer-wordmark); the
          fade is the gradient here, in theme tokens, from the letter tops
          (the top of the viewBox) to the clip line at the bottom. */}
      <div aria-hidden="true" className="footer-wordmark-frame mx-auto mt-10 max-w-(--container-view) md:mt-16">
        <svg viewBox={wordmark.viewBox} className="footer-wordmark" focusable="false">
          <defs>
            <linearGradient id="footer-wordmark-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--surface)" }} />
              <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--line), var(--muted))" }} />
            </linearGradient>
          </defs>
          <path d={wordmark.d} fill="url(#footer-wordmark-fade)" />
        </svg>
      </div>
    </footer>
  );
}
