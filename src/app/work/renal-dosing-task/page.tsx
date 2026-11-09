import type { Metadata } from "next";
import StickyHero from "@/components/layout/sticky-hero";
import RenalLoop from "@/features/landing/renal-loop";
import { pageMetadata } from "@/lib/metadata";
import Reveals from "@/components/layout/reveals";
import { renal, renalTraps } from "@/content/renal-dosing";
import { FictionalNote, TrapGrid } from "@/features/renal/parts";
import { Evidence, PipelineFigure } from "@/features/renal/evidence";

export const metadata: Metadata = pageMetadata({
  title: "Renal dose check: a sample agent benchmark",
  description:
    "An original AI-agent benchmark: fifteen synthetic patients in a ward chart with mixed units, eight traps and two valid look-alikes, and the evidence that its grading is sound. Fictional drugs; not clinical guidance.",
  path: "/work/renal-dosing-task",
  type: "article",
});

/**
 * The renal dose-check showcase.
 *
 * Read top to bottom as an argument: what a benchmark is, what this one
 * tests, the ways an agent gets it wrong, and the evidence that the tests
 * tell right from wrong. Built entirely from a static snapshot of the task
 * repository; see src/content/renal-dosing.
 */
export default function RenalDosingPage() {
  const traps = renalTraps.filter((trap) => trap.kind === "trap");
  const lookAlikes = renalTraps.filter((trap) => trap.kind === "look-alike");

  return (
    <article className="block">
      <Reveals />

      {/* Opens like every other Work entry: the visual pinned, the content
          sliding up over it. The visual is the home card's loop, sized to
          the area above the title band. It gives up the motion lease once
          the sheet's top edge (the marker below) has covered most of it. */}
      <StickyHero
        backHref="/work"
        backLabel="All work"
        title="Renal dose check: a ward chart with ten ways to be wrong"
        meta="Sample benchmark task · AI evaluation"
        mobileAspect="square"
        scrim="band"
      >
        <div className="absolute inset-x-0 top-0 bottom-(--band-height) flex items-center justify-center px-4 pt-4 md:px-10 md:pt-8">
          <RenalLoop coveredBy="#renal-sheet-edge" />
        </div>
      </StickyHero>

      <div data-sheet className="relative z-10 min-h-screen bg-surface px-4 sm:px-6 py-16 md:py-20">
        <div id="renal-sheet-edge" aria-hidden="true" className="absolute inset-x-0 top-0 h-px" />
        <div className="mx-auto max-w-(--container-view)">
          <FictionalNote />

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <section data-reveal className="min-w-0 max-w-(--container-reading) lg:col-span-7" aria-labelledby="what">
              <h2 id="what" className="text-lg text-ink">What an agent benchmark is</h2>
              <div className="mt-4 flex flex-col gap-5 text-base text-ink">
                <p>
                  An agent benchmark hands an AI model a job in a real environment, here a Linux terminal with a few files in it, and grades what it produces with automated tests. The model can run commands, write code and check its own work. What it can&apos;t do is talk its way past the tests: they read the output file and nothing else.
                </p>
                <p>
                  This one gives the agent a small ward chart: {renal.patients.length} synthetic adults, their creatinine results and their medication orders, recorded in mixed units. For each patient it has to work out kidney function as creatinine clearance (CrCl, by the Cockcroft–Gault formula), then flag every active order whose daily dose is over the limit for that kidney function.
                </p>
                <p>
                  The instruction states the formula, the constants and the dosing rules. So the task doesn&apos;t test medical knowledge. It tests whether the agent reads the chart the way a careful pharmacist would: which unit a number is in, whether an order is still running, how often a dose is given, and which result is the latest.
                </p>
              </div>
              <PipelineFigure />
            </section>

            <aside data-reveal className="lg:col-span-4 lg:col-start-9">
              <dl className="flex flex-col border-t border-line text-sm">
                {[
                  ["Patients", `${renal.patients.length}, synthetic`],
                  ["Tests", `${renal.testCount}, all must pass`],
                  ["Traps", `${traps.length}`],
                  ["Valid look-alikes", `${lookAlikes.length}`],
                  ["CrCl tolerance", `${renal.tolerance * 100}% relative`],
                  ["Flagged orders", "exact set match"],
                ].map(([term, value]) => (
                  <div key={term} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-3">
                    <dt className="text-2xs text-muted">{term}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={renal.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
              >
                Read the task on GitHub
              </a>
            </aside>
          </div>

          <section className="mt-20" aria-labelledby="traps">
            <h2 data-reveal id="traps" className="text-lg text-ink">The traps</h2>
            <p data-reveal className="mt-4 max-w-(--container-reading) text-base text-ink">
              Each trap changes one patient&apos;s answer, or a small group built for the same trap, and no patient carries two. So when a patient fails, it points at one mistake. Open one to see the patient&apos;s rows and both readings of them.
            </p>
            <TrapGrid traps={traps} label="Traps" />
          </section>

          <section className="mt-20" aria-labelledby="look-alikes">
            <h2 data-reveal id="look-alikes" className="text-lg text-ink">Valid look-alikes</h2>
            <p data-reveal className="mt-4 max-w-(--container-reading) text-base text-ink">
              These two patients are legitimate. They&apos;re there to punish shortcuts, the blanket rules that guess a unit from the size of a number instead of reading the unit column.
            </p>
            <TrapGrid traps={lookAlikes} label="Valid look-alikes" />
          </section>

          <section className="mt-24" aria-labelledby="evidence">
            <h2 data-reveal id="evidence" className="text-xl text-ink">The evidence</h2>
            <p data-reveal className="mt-4 max-w-(--container-reading) text-base text-ink">
              A benchmark is only as good as its grading. Two things have to hold: the answer key is right, and the tests pass right answers and fail wrong ones.
            </p>
            <div className="mt-12">
              <Evidence />
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
