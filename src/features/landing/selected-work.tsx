import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { portfolioConfig } from "@/config/site";
import { published } from "@/config/writing";

/* Three previews, three kinds of thing: a drawn chart for the benchmark,
   the real capture for the app, a drawn page for the writing. They share a
   frame and a rule, not a template, so the row reads as three pieces of work
   rather than three tiles. */

const label = { fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-mono)" } as const;
const ink = { fontSize: 11, fill: "var(--ink)", fontFamily: "var(--font-mono)" } as const;

/** labs.csv, with the misread unit underlined the way the hero underlines
 *  its own flag. */
function ChartPreview() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="A row of a ward chart with a creatinine of 150 µmol/L, and the clearance a careless agent gets from it.">
      <text x="20" y="34" {...label}>labs.csv</text>
      {["patient_id", "creatinine", "unit"].map((head, i) => (
        <text key={head} x={20 + i * 96} y="62" {...label}>{head}</text>
      ))}
      <line x1="20" y1="70" x2="300" y2="70" stroke="var(--line)" />
      <text x="20" y="90" {...ink}>PT002</text>
      <text x="116" y="90" {...ink}>150</text>
      <text x="212" y="90" {...ink}>µmol/L</text>
      <path d="M212 96q4 -3 8 0t8 0t8 0t8 0t8 0" stroke="var(--warn)" fill="none" />
      <line x1="20" y1="100" x2="300" y2="100" stroke="var(--line)" />
      <text x="20" y="120" {...label}>PT004</text>
      <text x="116" y="120" {...label}>16</text>
      <text x="212" y="120" {...label}>µmol/L</text>
      <line x1="20" y1="130" x2="300" y2="130" stroke="var(--line)" />
      <text x="20" y="168" {...label}>CrCl</text>
      <text x="76" y="168" {...ink}>32.5</text>
      <text x="118" y="168" {...label}>not</text>
      <text x="148" y="168" fontSize="11" fill="var(--warn)" fontFamily="var(--font-mono)">0.4</text>
      <text x="178" y="168" {...label}>mL/min</text>
    </svg>
  );
}

/** A page with an inline figure halfway down: the house rule for every
 *  piece, drawn as the preview of all of them. */
function PagePreview() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label="A page of writing with a diagram set into the text.">
      <rect x="20" y="22" width="150" height="9" fill="var(--ink)" opacity="0.8" />
      {[46, 58, 70].map((y, i) => (
        <rect key={y} x="20" y={y} width={i === 2 ? 120 : 180} height="4" fill="var(--muted)" opacity="0.45" />
      ))}
      <line x1="20" y1="86" x2="300" y2="86" stroke="var(--line)" />
      <rect x="32" y="98" width="56" height="34" fill="none" stroke="var(--line)" />
      <path d="M96 115h34m0 0-6-4m6 4-6 4" stroke="var(--accent)" fill="none" />
      <rect x="140" y="98" width="56" height="34" fill="none" stroke="var(--accent)" />
      <line x1="20" y1="144" x2="300" y2="144" stroke="var(--line)" />
      {[158, 170, 182].map((y, i) => (
        <rect key={y} x="20" y={y} width={i === 1 ? 200 : 170} height="4" fill="var(--muted)" opacity="0.45" />
      ))}
    </svg>
  );
}

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

  const cards: Card[] = [
    {
      href: "/work/renal-dosing-task",
      meta: `AI evaluation · ${evaluation.period}`,
      title: evaluation.sample.title,
      line: evaluation.sample.teaser,
      preview: <ChartPreview />,
    },
    {
      href: `/work/${todo.slug}` as Route,
      meta: `${todo.year} · ${todo.role}`,
      title: todo.title,
      line: "A local-first task list, built for a phone.",
      preview: (
        <Image
          src={todo.preview!}
          alt={`${todo.title}, the live app`}
          fill
          sizes="(min-width: 768px) 30vw, 100vw"
          className="object-cover object-top"
        />
      ),
    },
    {
      href: "/writing",
      meta: `Writing · ${published.length} pieces`,
      title: portfolioConfig.copy.writingHeading.replace(/\.$/, ""),
      line: "Short write-ups on choices made while building this site and the things on it.",
      preview: <PagePreview />,
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
