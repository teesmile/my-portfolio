import Link from "next/link";
import { portfolioConfig } from "@/config/site";
import RenalLoop from "@/features/landing/renal-loop";

/**
 * The evaluation work on /work.
 *
 * First on the page, ahead of every project (the Projects rule in CLAUDE.md).
 * Same rule and rhythm as a project entry, different anatomy: where a project
 * has a screenshot, this has the sample task, because the real work cannot be
 * shown. The copy says "the sample below", so the sample sits under the
 * paragraph at every width rather than beside it on desktop.
 *
 * Its visual is the sample itself: the renal loop, in the same 16:10 frame
 * a project's screenshot gets, so every entry on /work shows its work. It
 * plays while in view and holds the motion lease; under reduced motion it
 * rests on its finished frame.
 */
export default function EvaluationEntry() {
  const { evaluation } = portfolioConfig;

  return (
    <article data-reveal className="grid gap-8 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12">
      <Link
        href="/work/renal-dosing-task"
        aria-label="See the renal dose check showcase"
        className="block lg:col-span-5 lg:col-start-8 lg:row-start-1"
      >
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-clip border border-line bg-raised p-3">
          <RenalLoop />
        </div>
      </Link>

      <div className="lg:col-span-7 lg:row-start-1">
        <p className="text-2xs text-muted">
          {evaluation.period} &middot; {evaluation.role}
        </p>
        <h2 className="mt-3 text-xl text-ink">{evaluation.title}</h2>
        <p className="mt-4 max-w-(--container-reading) text-sm text-muted">
          {evaluation.body}
        </p>

        <aside className="mt-8 max-w-(--container-reading) border-l border-line pl-4">
          <h3 className="text-2xs text-muted">The sample</h3>
          <p className="mt-2 font-display text-base text-ink">{evaluation.sample.title}</p>
          <p className="mt-2 text-sm text-muted">{evaluation.sample.summary}</p>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <Link
              href="/work/renal-dosing-task"
              className="text-sm text-accent underline decoration-accent/40 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-accent"
            >
              See the traps and the evidence
            </Link>
            <a
              href={evaluation.sample.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted underline decoration-line underline-offset-[6px] transition-colors hover:text-ink"
            >
              Read the source
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
