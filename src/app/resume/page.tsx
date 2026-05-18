import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { portfolioConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `${portfolioConfig.name} resume and frontend engineering profile.`,
};

function hasResumePdf() {
  const resumePath = path.join(
    process.cwd(),
    "public",
    portfolioConfig.resumePdf.replace(/^\//, ""),
  );

  return fs.existsSync(resumePath);
}

export default function ResumePage() {
  const pdfAvailable = hasResumePdf();
  const linkedin = portfolioConfig.socials.find(
    (social) => social.name === "LinkedIn",
  );
  const github = portfolioConfig.socials.find((social) => social.name === "GitHub");

  return (
    <main className="bg-zinc-50 px-6 py-16 text-zinc-950 dark:bg-[#111111] dark:text-zinc-100">
      <div className="mx-auto max-w-5xl rounded-lg border border-violet-400/20 bg-white p-6 shadow-2xl shadow-black/10 dark:bg-[#181818] dark:shadow-black/20 md:p-10">
        <header className="border-b border-zinc-200 pb-8 dark:border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Resume
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-zinc-950 dark:text-white md:text-6xl">
                {portfolioConfig.name.toUpperCase()}
              </h1>
              <p className="mt-3 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                {portfolioConfig.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                  className="rounded-sm border border-violet-400/30 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:border-violet-300 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
              >
                Back Home
              </Link>
              {pdfAvailable ? (
                <a
                  href={portfolioConfig.resumePdf}
                  download
                  className="rounded-sm bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white transition hover:brightness-110"
                >
                  Download PDF
                </a>
              ) : (
                <span className="rounded-sm border border-dashed border-white/20 px-5 py-2.5 text-sm font-semibold text-zinc-500">
                  PDF pending
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{portfolioConfig.phone}</span>
            <span>{portfolioConfig.email}</span>
            {linkedin ? <span>{linkedin.url.replace("https://", "")}</span> : null}
            {github ? <span>{github.url.replace("https://", "")}</span> : null}
            <span>{portfolioConfig.location}</span>
            <span>{portfolioConfig.availability}</span>
          </div>
        </header>

        <div className="grid gap-10 pt-10 md:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-10">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Core Skills
              </h2>
              <div className="mt-5 space-y-5">
                {portfolioConfig.skills.map((group) => (
                  <div key={group.label}>
                    <h3 className="font-semibold text-zinc-950 dark:text-white">{group.label}</h3>
                    <p className="mt-1 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                      {group.items.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Education & Training
              </h2>
              <div className="mt-5 space-y-6">
                {portfolioConfig.resume.education.map((item) => (
                  <article key={item.title}>
                    <h3 className="font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.institution} | {item.period}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                      {item.details.map((detail) => (
                        <li key={detail} className="flex gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-r from-[#5b5cff] to-[#8b5cf6]" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-10">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Professional Summary
              </h2>
              <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-300">
                {portfolioConfig.resume.summary}
              </p>
              <ul className="mt-5 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {portfolioConfig.resume.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-r from-[#5b5cff] to-[#8b5cf6]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Experience
              </h2>
              <div className="mt-5 space-y-8">
                {portfolioConfig.resume.experience.map((item) => (
                  <article key={`${item.role}-${item.period}`}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
                          {item.role}
                        </h3>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          {item.company}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-zinc-500">
                        {item.period}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-r from-[#5b5cff] to-[#8b5cf6]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">
                Selected Projects
              </h2>
              <div className="mt-5 space-y-6">
                {portfolioConfig.projects.slice(0, 3).map((project) => (
                  <article
                    key={project.id}
                    className="border-b border-zinc-200 dark:border-white/10 pb-6 last:border-b-0"
                  >
                    <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.tech.join(", ")}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                      {project.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-r from-[#5b5cff] to-[#8b5cf6]" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
