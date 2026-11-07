import Link from "next/link";
import { renal, renalTraps } from "@/content/renal-dosing";
import { Scroller, TestName, familyLabel } from "./parts";

const label = { fontSize: 9, fill: "var(--muted)" } as const;
const strong = { fontSize: 9, fill: "var(--ink)" } as const;

/** What a benchmark run is, left to right: the chart goes in, an answer file
 *  comes out, and tests that never see the agent's reasoning decide. */
export function PipelineFigure() {
  return (
    <figure className="my-8 border-y border-line py-6">
      <svg
        viewBox="0 0 440 112"
        className="w-full"
        role="img"
        aria-label="The chart files go to the agent in a terminal, the agent writes dose_check.jsonl, and 32 tests grade that file: pass or fail."
      >
        {["patients.csv", "labs.csv", "meds.csv", "rules.json"].map((file, i) => (
          <g key={file}>
            <rect x="6" y={10 + i * 23} width="86" height="18" fill="none" stroke="var(--line)" />
            <text x="12" y={22 + i * 23} {...label} fontFamily="var(--font-mono)">{file}</text>
          </g>
        ))}
        <path d="M98 56h24m0 0-5-4m5 4-5 4" stroke="var(--ink)" fill="none" />

        <rect x="128" y="30" width="96" height="52" fill="none" stroke="var(--ink)" />
        <text x="176" y="52" textAnchor="middle" {...strong}>agent</text>
        <text x="176" y="68" textAnchor="middle" {...label}>in a terminal</text>
        <path d="M230 56h24m0 0-5-4m5 4-5 4" stroke="var(--ink)" fill="none" />

        <rect x="260" y="44" width="88" height="24" fill="none" stroke="var(--line)" />
        <text x="304" y="60" textAnchor="middle" {...label} fontFamily="var(--font-mono)">dose_check.jsonl</text>
        <path d="M352 56h18m0 0-5-4m5 4-5 4" stroke="var(--ink)" fill="none" />

        <rect x="374" y="30" width="60" height="52" fill="none" stroke="var(--accent)" />
        <text x="404" y="52" textAnchor="middle" {...strong}>{renal.testCount} tests</text>
        <text x="404" y="68" textAnchor="middle" {...label}>pass / fail</text>

        <text x="49" y="106" textAnchor="middle" {...label}>the chart</text>
        <text x="304" y="106" textAnchor="middle" {...label}>one line per patient</text>
      </svg>
      <figcaption className="mt-4 text-2xs text-muted">
        The tests read only the answer file. A confident explanation earns nothing; a number outside 1% or one wrong order id fails.
      </figcaption>
    </figure>
  );
}

/** The smallest gap between a reference CrCl and a band edge, drawn to
 *  scale against the 1% tolerance. This is why tolerance cannot flip a flag. */
export function MarginFigure() {
  const tightest = [...renal.margins].sort((a, b) => a.margin - b.margin)[0];
  const { crcl, nearest_edge: edge, margin } = tightest;
  const lo = Math.min(crcl, edge) - 2;
  const hi = Math.max(crcl, edge) + 2;
  const x = (v: number) => 20 + ((v - lo) / (hi - lo)) * 400;
  const tol = crcl * renal.tolerance;

  return (
    <figure className="my-8 border-y border-line py-6">
      <svg
        viewBox="0 0 440 90"
        className="w-full"
        role="img"
        aria-label={`${tightest.patient_id}: reference CrCl ${crcl}, band edge at ${edge}, a ${(margin * 100).toFixed(1)}% gap. The 1% tolerance spans ${(crcl - tol).toFixed(1)} to ${(crcl + tol).toFixed(1)} and never reaches the edge.`}
      >
        <line x1="20" y1="50" x2="420" y2="50" stroke="var(--line)" />
        <rect x={x(crcl - tol)} y="40" width={x(crcl + tol) - x(crcl - tol)} height="20" fill="var(--ink)" opacity="0.14" />
        <line x1={x(crcl)} y1="34" x2={x(crcl)} y2="66" stroke="var(--ink)" />
        <text x={x(crcl)} y="26" textAnchor="middle" {...strong}>{crcl} reference</text>
        <text x={x(crcl)} y="80" textAnchor="middle" {...label}>±1% accepted</text>
        <line x1={x(edge)} y1="30" x2={x(edge)} y2="70" stroke="var(--accent)" strokeDasharray="3 3" />
        <text x={x(edge)} y="22" textAnchor="middle" {...label}>band edge {edge}</text>
      </svg>
      <figcaption className="mt-4 text-2xs text-muted">
        The tightest case, {tightest.patient_id}: {(margin * 100).toFixed(1)}% from the nearest band edge. The task requires at least 2% for every patient, twice the tolerance, so any answer the test accepts still lands in the right band.
      </figcaption>
    </figure>
  );
}

const testsSummary = (failures: { test: string }[]) => {
  if (failures.length === renal.testCount) return `all ${renal.testCount}`;
  return `${failures.length} of ${renal.testCount}`;
};

export function Evidence() {
  const reference = renal.agents.find((agent) => agent.name === "reference")!;
  const legit = renal.agents.filter((agent) => agent.expect_pass && agent.name !== "reference");
  const mistakes = renalTraps.map((trap) => ({
    trap,
    agent: renal.agents.find((agent) => agent.name === trap.mistake)!,
  }));
  const malformed = renal.agents.filter((agent) => agent.family === "malformed");
  const passed = reference.pytest.replace(/ in [\d.]+s$/, "");

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-12">
        <div data-reveal className="min-w-0 max-w-(--container-reading) lg:col-span-7">
          <h3 className="text-lg text-ink">The reference passes</h3>
          <p className="mt-4 text-base text-ink">
            The answer key comes from the reference solution, so the first thing to prove is that the key is right. A second implementation, written in SQL against the instruction alone and sharing no code with the reference, agrees on all {renal.independent.patients} patients: the same CrCl at 0.1 mL/min and the same flagged orders.
          </p>
          <pre className="mt-6 overflow-x-auto border-y border-line py-4 font-mono text-2xs text-ink">
            <span className="text-muted">$ pytest tests/test_outputs.py  # solve.py&apos;s output</span>
            {"\n"}
            {passed}
          </pre>
          <p className="mt-6 text-base text-ink">
            A grader can also be too strict. These defensible choices a careful agent might make all pass, which shows the 1% tolerance and the set comparison leave room for honest variation:
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
            {legit.map((agent) => (
              <li key={agent.name} className="border-l border-line pl-4">
                {agent.description} <span className="text-ink">· passes</span>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="min-w-0 lg:col-span-5">
          <MarginFigure />
        </div>
      </div>

      <h3 data-reveal className="mt-16 text-lg text-ink">Which mistake fails which test</h3>
      <p data-reveal className="mt-4 max-w-(--container-reading) text-base text-ink">
        One simulated agent runs with each mistake switched on alone, and the real test file grades it. Every mistake fails, and only on the patients built for it.
      </p>

      <div data-reveal>
        <Scroller label="Simulated mistakes and the tests each one fails">
          <table className="mt-3 w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs text-muted">
                <th scope="col" className="py-3 pr-6 font-normal">Simulated mistake</th>
                <th scope="col" className="py-3 pr-6 font-normal">Result</th>
                <th scope="col" className="py-3 font-normal">Tests that fail</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map(({ trap, agent }) => (
                <tr key={agent.name} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-6 text-left font-normal">
                    <Link
                      href={`/work/renal-dosing-task/${trap.slug}`}
                      className="text-sm text-ink underline decoration-line underline-offset-[6px] transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {trap.name}
                    </Link>
                    <span className="mt-1 block font-mono text-2xs text-muted">{agent.name}</span>
                  </th>
                  <td className="py-4 pr-6 text-2xs text-ink">
                    {agent.passed ? "passes" : "fails"}
                    <span className="block text-muted">{testsSummary(agent.failures)}</span>
                  </td>
                  <td className="py-4">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-2xs text-ink">
                      {agent.failures.map((failure) => (
                        <li key={failure.test}>
                          <TestName test={failure.test} />
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
              {malformed.map((agent) => (
                <tr key={agent.name} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-6 text-left font-normal">
                    <span className="text-sm text-ink">{agent.description[0].toUpperCase() + agent.description.slice(1)}</span>
                    <span className="mt-1 block font-mono text-2xs text-muted">
                      {agent.name} · {familyLabel(agent.family)}
                    </span>
                  </th>
                  <td className="py-4 pr-6 text-2xs text-ink">
                    {agent.passed ? "passes" : "fails"}
                    <span className="block text-muted">{testsSummary(agent.failures)}</span>
                  </td>
                  <td className="py-4">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-2xs text-ink">
                      {agent.failures.slice(0, 3).map((failure) => (
                        <li key={failure.test}>
                          <TestName test={failure.test} />
                        </li>
                      ))}
                      {agent.failures.length > 3 ? (
                        <li className="text-muted">and {agent.failures.length - 3} more</li>
                      ) : null}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroller>
      </div>

      <p data-reveal className="mt-6 max-w-(--container-reading) text-2xs text-muted">
        Graded with the task&apos;s own pytest suite when this page was built from commit{" "}
        <span className="font-mono">{renal.source.commit.slice(0, 7)}</span> ({renal.source.committed_at}). The run matched the evidence committed in the repository{renal.evidenceProblems.length ? "" : ", which reports no problems"}.
      </p>
    </>
  );
}
