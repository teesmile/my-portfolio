import { portfolioConfig } from "@/config/site";

export default function SkillsSection() {
  return (
    <section className="bg-white px-6 py-20 dark:bg-[#1b1b1b]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Skills
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white md:text-4xl">
          Technical <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">skills.</span>
        </h2>
        <p className="mt-6 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          A practical frontend and evaluation toolkit for building interfaces,
          debugging behavior, and reviewing generated code with discipline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolioConfig.skills.map((group) => (
          <article
            key={group.label}
            className="rounded-lg border border-violet-400/20 bg-zinc-50 p-6 dark:bg-[#202020]"
          >
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
              {group.label}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-violet-400/20 px-3 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
