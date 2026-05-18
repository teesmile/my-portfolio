import { portfolioConfig } from "@/config/site";

export default function ServicesSection() {
  return (
    <section className="bg-white px-6 py-24 dark:bg-[#171717]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Services
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white md:text-4xl">
            What I <span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">do.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {portfolioConfig.services.map((service, index) => {
            const featured = index === 0;

            return (
              <article
                key={service.title}
                className={`relative min-h-72 rounded-lg border p-8 transition duration-300 ${
                  featured
                    ? "border-violet-400/50 bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] text-white"
                    : "border-violet-400/25 bg-zinc-50 text-zinc-950 hover:border-violet-300 dark:border-violet-400/30 dark:bg-[#202020] dark:text-zinc-100"
                }`}
              >
                <span
                  className={`absolute right-7 top-5 text-5xl font-semibold ${
                    featured ? "text-white/10" : "text-zinc-950/[0.04] dark:text-white/[0.04]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className={`mb-8 flex h-10 w-10 items-center justify-center rounded-full border ${
                    featured
                      ? "border-white/25"
                      : "border-zinc-200 text-violet-600 dark:border-white/15 dark:text-violet-300"
                  }`}
                >
                  {index === 0 ? "</>" : index === 1 ? "{}" : "UI"}
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <div
                  className={`my-5 h-px w-20 ${
                    featured ? "bg-white/25" : "bg-zinc-200 dark:bg-white/15"
                  }`}
                />
                <p
                  className={`text-sm leading-7 ${
                    featured ? "text-white/85" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
