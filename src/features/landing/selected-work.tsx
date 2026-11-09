import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { portfolioConfig } from "@/config/site";
import { published } from "@/config/writing";
import RenalLoop from "./renal-loop";

/* Three previews, three kinds of thing: the benchmark's key idea as a
   loop, the app as it looks on a phone, the latest piece as it looks when
   shared. They share a frame and a rule, not a template, so the row reads
   as three pieces of work rather than three tiles.

   Every frame is a fixed 16:10 box and every image fills it, so nothing can
   shift when an image arrives. Images are lazy: the section is below the
   fold by construction. */

type Card = {
  href: Route;
  meta: string;
  title: string;
  line: string;
  preview: React.ReactNode;
};

export default function SelectedWork() {
  const { evaluation, projects } = portfolioConfig;
  const todo = projects.find((project) => project.slug === "todo-app")!;
  /* Newest first; on a tie the config order stands (Array sort is stable). */
  const latest = [...published].sort((a, b) => Date.parse(b.published) - Date.parse(a.published))[0];

  const cards: Card[] = [
    {
      href: "/work/renal-dosing-task",
      meta: `AI evaluation · ${evaluation.period}`,
      title: evaluation.sample.title,
      line: evaluation.sample.teaser,
      preview: <RenalLoop />,
    },
    {
      href: `/work/${todo.slug}` as Route,
      meta: `${todo.year} · ${todo.role}`,
      title: todo.title,
      line: "A local-first task list, built for a phone.",
      /* The phone capture from the app's own README: the app is built
         for a phone first, so that is the honest picture of it. A column
         in the frame, cropped from the top. */
      preview: (
        <div className="absolute inset-y-0 left-1/2 w-[46%] -translate-x-1/2 border-x border-line">
          <Image
            src="/work/todo-app-phone.webp"
            alt={`${todo.title} on a phone: tasks grouped into Overdue and Today`}
            fill
            sizes="(min-width: 768px) 14vw, 46vw"
            loading="lazy"
            className="object-cover object-top"
          />
        </div>
      ),
    },
    {
      href: "/writing",
      meta: `Writing · ${published.length} pieces`,
      title: portfolioConfig.copy.writingHeading.replace(/\.$/, ""),
      line: "Short write-ups on choices made while building this site and the things on it.",
      preview: (
        <Image
          src={`/writing/${latest.slug}/opengraph-image`}
          alt={`Share card for “${latest.title}”`}
          fill
          sizes="(min-width: 768px) 30vw, 100vw"
          loading="lazy"
          /* Whole, never cropped: the card is typeset at 1200x630 with
             text near its edges, and cover cut the first letters off. */
          className="object-contain"
        />
      ),
    },
  ];

  return (
    <section
      aria-labelledby="selected-work"
      /* Below the fold by construction (the hero is a full screen), so the
         browser may skip its style, layout and paint until it is near. */
      className="px-6 py-20 [contain-intrinsic-size:auto_56rem] [content-visibility:auto] md:py-28"
    >
      <div className="mx-auto max-w-(--container-view)">
        <h2 data-reveal id="selected-work" className="text-xl text-ink">
          Selected work
        </h2>
        <ul className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
          {cards.map((card) => (
            <li key={card.href} data-reveal>
              <Link href={card.href} className="group block">
                <div className="relative aspect-[16/10] w-full overflow-clip border border-line bg-raised">
                  {card.preview}
                </div>
                <p className="mt-5 text-2xs text-muted">{card.meta}</p>
                <h3 className="mt-2 text-lg text-ink transition-colors group-hover:text-accent">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-[40ch] text-sm text-muted">{card.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
