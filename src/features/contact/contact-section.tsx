import Link from "next/link";
import { portfolioConfig } from "@/config/site";

export default function ContactSection() {
  const linkedin = portfolioConfig.socials.find(
    (social) => social.name === "LinkedIn",
  );
  const github = portfolioConfig.socials.find((social) => social.name === "GitHub");

  return (
    <section id="contact" className="scroll-mt-24 bg-zinc-50 px-6 py-24 dark:bg-[#111111]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Get in touch
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white md:text-4xl">
            Contact <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">me.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            I am currently open to remote frontend development and AI code
            evaluation opportunities.
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-[#202020] dark:ring-0 md:p-10">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <h3 className="text-2xl font-semibold text-zinc-950 dark:text-white">
                Have an opportunity or project idea?
              </h3>
              <p className="mt-2 text-xl font-semibold bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Let&apos;s discuss.
              </p>
              <div className="mt-8 space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
                <p>{portfolioConfig.phone}</p>
                <p>{portfolioConfig.email}</p>
                <p>{portfolioConfig.location} / {portfolioConfig.availability}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {portfolioConfig.email ? (
                <a
                  href={`mailto:${portfolioConfig.email}`}
                  className="inline-flex items-center justify-center rounded-sm bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Email Anthony
                </a>
              ) : null}
              <Link
                href="/resume"
                className="inline-flex items-center justify-center rounded-sm border border-violet-400/30 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
              >
                View Resume
              </Link>
              {linkedin ? (
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-sm border border-violet-400/30 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                >
                  LinkedIn
                </a>
              ) : null}
              {github ? (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-sm border border-violet-400/30 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
