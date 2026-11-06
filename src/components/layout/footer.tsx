import { portfolioConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10">
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
    </footer>
  );
}
