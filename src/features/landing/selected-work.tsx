import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { portfolioConfig } from "@/config/site";
import { published } from "@/config/writing";
import RenalLoop from "./renal-loop";
import { textLinkClass } from "@/components/ui/text-link";
import { stagger } from "@/components/layout/stagger";

/* Four previews, four kinds of thing: the lead project as it looks on a
   laptop, the benchmark's key idea as a loop, the app as it looks on a
   phone, the latest piece as it looks when shared. They share a frame and
   a rule, not a template, so the row reads as pieces of work rather than
   tiles. The order is the Work page's: the ballot first, the evaluation
   work second.

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
  const ballot = projects.find((project) => project.slug === "whos-on-my-ballot")!;
  const todo = projects.find((project) => project.slug === "todo-app")!;
  /* Newest first; on a tie the config order stands (Array sort is stable). */
  const newest = [...published].sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  const latest = newest[0];

  const cards: Card[] = [
    {
      href: `/work/${ballot.slug}` as Route,
      /* The same line as on the Work page: the launch date stands in for
         the year until launch day (site.ts). */
      meta: `${ballot.status ?? ballot.year} · ${ballot.role}`,
      title: ballot.title,
      line: "A non-partisan voter guide for Nigeria's 2027 elections: say where you vote, see every race on your ballot.",
      preview: (
        <Image
          src={ballot.preview!}
          alt={`${ballot.title} on a laptop`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 100vw"
          loading="lazy"
          className="object-cover object-top"
        />
      ),
    },
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
            alt={`${todo.title} on a phone: a greeting, search, filters and the Order switch, then the newest tasks`}
            fill
            sizes="(min-width: 1024px) 10vw, (min-width: 768px) 21vw, 46vw"
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
          sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 100vw"
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
      /* Laid out with the page. It used to be content-visibility: auto with
         a guessed placeholder height, and the page changed height by the
         difference when the browser got round to rendering it, which moved
         the scrollbar and the content under the reader. Four cards with
         lazy images cost next to nothing to lay out. */
      className="px-4 sm:px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-(--container-view)">
        <h2 data-reveal="" id="selected-work" className="text-xl text-accent">
          Selected work
        </h2>
        <ul className="mt-10 grid gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-6">
          {cards.map((card, index) => (
            <li key={card.href} data-reveal="" style={stagger(index)}>
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
        {/* The two newest pieces by name. The Writing card is one link, and a
            link cannot hold others, so they sit under the cards instead. */}
        <p data-reveal="" className="mt-12 text-sm text-muted">
          Latest writing:{" "}
          {newest.slice(0, 2).map((entry, i) => (
            <span key={entry.slug}>
              {i > 0 ? " and " : null}
              <Link
                href={`/writing/${entry.slug}` as Route}
                className={textLinkClass}
              >
                {entry.title}
              </Link>
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}
