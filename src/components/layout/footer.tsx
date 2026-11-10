import { portfolioConfig } from "@/config/site";

export default function Footer() {
  return (
    /* Its own layer on the page surface: nothing in a page's content, however
       it is transformed, can paint over the footer or take its clicks. */
    <footer className="relative z-10 border-t border-line bg-surface px-4 pt-6 sm:px-6 md:pt-10">
      <div className="mx-auto flex max-w-(--container-view) flex-col items-start gap-4 text-left text-2xs text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p>
          &copy; {new Date().getFullYear()} {portfolioConfig.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {portfolioConfig.socials.map((social) => (
            <li key={social.name}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-line underline-offset-[6px] transition-colors hover:text-ink"
              >
                {social.name}
              </a>
            </li>
          ))}
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
