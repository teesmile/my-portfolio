import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { highlight } from "@/lib/highlight";
import Reveals from "@/components/layout/reveals";
import PinnedBack from "@/components/layout/pinned-back";
import { describeTest, findTrap, renal, renalTraps } from "@/content/renal-dosing";
import { ChartRows, FictionalNote, TestName, WalkColumn, familyLabel } from "@/features/renal/parts";
import JsonLd from "@/components/ui/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";

type Params = { params: Promise<{ trap: string }> };

/* Ten pages, all known at build time. Anything else is a 404 rather than a
   render attempt. */
export const dynamicParams = false;

export function generateStaticParams() {
  return renalTraps.map((trap) => ({ trap: trap.slug }));
}

/* Search copy. The page's opening sentence (`why`, from the task's own data)
   leads the description, so the part a search result shows is the part that
   differs from page to page; four are shortened here to fit, without
   touching the snapshot. Titles skip the name template to keep under ~60. */
const SEARCH_LEAD: Record<string, string> = {
  "discontinued-order": "The flag lands on a drug nobody is taking: a false alarm that invites a fix to a dose that doesn't exist.",
  "latest-creatinine": "A creatinine from a kidney injury that has healed makes the patient look sicker, so fine orders get flagged.",
  "frail-low-creatinine": "Guess the unit from a frail 90-year-old's low creatinine and she looks like she's in kidney failure.",
  "genuine-150-kg": "Treating every big weight as pounds halves the patients for whom actual-weight dosing matters most.",
};
const SEARCH_NAME: Record<string, string> = {
  "frail-low-creatinine": "Low creatinine that really is µmol/L",
};

function searchCopy(trap: NonNullable<ReturnType<typeof findTrap>>) {
  const title = `${SEARCH_NAME[trap.slug] ?? trap.name} - clinical AI benchmark`;
  const description = `${SEARCH_LEAD[trap.slug] ?? trap.why} A trap from a clinical AI-agent benchmark.`;
  /* Fails the build rather than ship a snippet search results would cut. */
  if (title.length > 60 || description.length > 160) {
    throw new Error(`${trap.slug}: search title ${title.length}/60 or description ${description.length}/160 too long`);
  }
  return { title, description };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const trap = findTrap((await params).trap);
  if (!trap) return {};
  const { title, description } = searchCopy(trap);

  return pageMetadata({
    title: trap.name,
    fullTitle: title,
    description,
    path: `/work/renal-dosing-task/${trap.slug}`,
    type: "article",
    image: `/work/renal-dosing-task/${trap.slug}/opengraph-image`,
  });
}

export default async function TrapPage({ params }: Params) {
  const trap = findTrap((await params).trap);
  if (!trap) notFound();

  const index = renalTraps.indexOf(trap);
  const previous = renalTraps[index - 1];
  const next = renalTraps[index + 1];

  const own = trap.failures.filter((failure) => describeTest(failure.test).patient === trap.patient_id);
  const sources = await Promise.all(
    Array.from(new Set(own.map((failure) => describeTest(failure.test).name))).map(async (name) => ({
      name,
      html: await highlight(
        name === "test_clearance_within_one_percent" ? renal.testSource.clearance : renal.testSource.flags,
        "python",
      ),
    })),
  );

  return (
    <article className="px-4 sm:px-6 py-20 md:py-24">
      <JsonLd
        nodes={[
          breadcrumbJsonLd([
            { name: "Work", path: "/work" },
            { name: "Renal dose check", path: "/work/renal-dosing-task" },
            { name: trap.name, path: `/work/renal-dosing-task/${trap.slug}` },
          ]),
        ]}
      />
      <Reveals />
      <div className="mx-auto max-w-(--container-view)">
        <PinnedBack href="/work/renal-dosing-task" label="Renal dose check" />

        <p className="text-2xs text-muted">
          {trap.kind === "trap" ? "Trap" : "Valid look-alike"} &middot; {familyLabel(trap.family)} &middot; patient{" "}
          {trap.patient_id}
        </p>
        <h1 data-reveal="load" className="mt-3 max-w-[22ch] text-xl text-ink md:text-2xl">
          {trap.name}
        </h1>
        <p data-reveal="load" style={{ "--reveal-delay": "100ms" } as React.CSSProperties} className="mt-6 max-w-(--container-reading) text-base text-ink">
          {trap.why}
        </p>

        <div className="mt-8">
          <FictionalNote compact />
        </div>

        <section className="mt-16" aria-labelledby="rows">
          <h2 data-reveal id="rows" className="text-lg text-accent">The patient&apos;s rows</h2>
          <p data-reveal className="mt-4 max-w-(--container-reading) text-sm text-muted">
            Exactly what the agent sees for {trap.patient_id}, copied from the chart. The value this mistake misreads is underlined.
          </p>
          <div data-reveal>
            <ChartRows trap={trap} />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="readings">
          <h2 data-reveal id="readings" className="text-lg text-accent">Two readings of the same rows</h2>
          <p data-reveal className="mt-4 max-w-(--container-reading) text-sm text-muted">
            Every step is shown. Where the careless reading goes wrong, the value is underlined.
          </p>
          <div data-reveal className="mt-8 grid gap-12 md:grid-cols-2 md:gap-10">
            <WalkColumn
              title="What a careless agent computes"
              lead={trap.slip}
              walk={trap.careless}
              against={trap.correct}
              mark
              sex={trap.patient.sex}
              age={trap.patient.age_years}
            />
            <WalkColumn
              title="The correct answer"
              lead="Reads the unit, status, frequency and time columns as the instruction says, and flags only a daily dose strictly over the band's limit."
              walk={trap.correct}
              against={trap.careless}
              crclLabel={trap.calculated ? "Calculated CrCl" : "CrCl"}
              sex={trap.patient.sex}
              age={trap.patient.age_years}
            />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="test">
          <h2 data-reveal id="test" className="text-lg text-accent">
            {own.length > 1 ? "The tests that catch it" : "The test that catches it"}
          </h2>
          <p data-reveal className="mt-4 max-w-(--container-reading) text-sm text-muted">
            The careless output, graded by the task&apos;s real test file. This is what pytest printed.
          </p>
          <ul data-reveal className="mt-6 flex max-w-(--container-reading) flex-col gap-4">
            {own.map((failure) => (
              <li key={failure.test} className="border-l border-line pl-4">
                <p className="font-mono text-2xs text-ink">
                  <TestName test={failure.test} />
                  <span className="mt-1 block break-all text-muted">{failure.test}</span>
                </p>
                <pre className="mt-2 overflow-x-auto font-mono text-2xs text-ink">{failure.message}</pre>
              </li>
            ))}
          </ul>

          {sources.map((source) => (
            <figure key={source.name} data-reveal className="mt-8 max-w-(--container-reading) border-y border-line py-4">
              <figcaption className="font-mono text-2xs text-muted">tests/test_outputs.py</figcaption>
              <div className="mt-3" dangerouslySetInnerHTML={{ __html: source.html }} />
            </figure>
          ))}

          {trap.also_changed.length ? (
            <p data-reveal className="mt-8 max-w-(--container-reading) text-sm text-muted">
              The same mistake also changes {trap.also_changed.join(", ")}, which share this trap family, and
              fails {trap.failures.length - own.length} more of their tests. No patient from another family moves.
            </p>
          ) : (
            <p data-reveal className="mt-8 max-w-(--container-reading) text-sm text-muted">
              No other patient&apos;s answer moves under this mistake, so this one failure is the whole signal.
            </p>
          )}
        </section>

        <nav aria-label="Other traps" className="mt-20 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-2">
          {previous ? (
            <Link href={`/work/renal-dosing-task/${previous.slug}`} className="text-muted transition-colors hover:text-ink">
              <span aria-hidden="true">&larr;</span> {previous.name}
            </Link>
          ) : (
            <Link href="/work/renal-dosing-task" className="text-muted transition-colors hover:text-ink">
              <span aria-hidden="true">&larr;</span> All traps
            </Link>
          )}
          {next ? (
            <Link
              href={`/work/renal-dosing-task/${next.slug}`}
              className="text-muted transition-colors hover:text-ink sm:text-right"
            >
              {next.name} <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <Link href="/work/renal-dosing-task#evidence" className="text-muted transition-colors hover:text-ink sm:text-right">
              The evidence <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
