import type { Metadata } from "next";
import Link from "next/link";
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
    <article className="px-6 py-20 md:py-24">
      <Reveals />
      <div className="mx-auto max-w-(--container-view)">
        <Link href="/work" className="text-2xs text-muted transition-colors hover:text-ink">
          <span aria-hidden="true">&larr;</span> Work
        </Link>

        <p className="mt-8 text-2xs text-muted">Sample benchmark task &middot; AI evaluation</p>
        <h1 data-reveal className="mt-3 max-w-[20ch] text-xl text-ink md:text-2xl">
          Renal dose check: a ward chart with ten ways to be wrong
        </h1>

        <div className="mt-10">
          <FictionalNote />
        </div>

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
    </article>
  );
}
