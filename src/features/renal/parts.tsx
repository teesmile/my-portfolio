import Link from "next/link";
import type { Culprit, OrderStep, Trap, Walk } from "@/content/renal-dosing";
import { describeTest, shiftOf } from "@/content/renal-dosing";

/* Shared pieces for /work/renal-dosing-task and its trap pages. All server
   components: the showcase is a document, and nothing on it needs to run in
   the browser beyond the site's shared reveal. */

const FAMILY: Record<string, string> = {
  creatinine_unit: "creatinine unit",
  weight_unit: "weight unit",
  order_status: "order status",
  frequency: "frequency",
  latest_lab: "latest lab",
  limit_boundary: "limit boundary",
  malformed: "malformed output",
  none: "no mistake",
};

export const familyLabel = (family: string) => FAMILY[family] ?? family;

/** Said once per page, before anything a reader could mistake for guidance. */
export function FictionalNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="About the data"
      className="max-w-(--container-reading) border-y border-line py-4 text-sm text-ink"
    >
      <p>
        <span className="font-display">The drugs and dose limits are fictional.</span>{" "}
        {compact
          ? "The patients are synthetic. Nothing here is clinical guidance."
          : "Aldrovexin, Bremazotan, Cylvarone, Dorvatinex and Exalmizide were invented for this benchmark, and so was every clearance band and maximum dose. The fifteen patients are synthetic. Nothing here is clinical guidance, and none of it should be used to dose a real person."}
      </p>
    </aside>
  );
}

/**
 * The traps as a ruled sheet, not a deck of cards: cells share their
 * hairlines the way a printed table does, so the grid reads as one object
 * with ten entries rather than ten floating tiles. The last line of each cell
 * is the number the mistake changes, set in monospace, because that number
 * is the whole argument.
 */
export function TrapGrid({ traps, label }: { traps: Trap[]; label: string }) {
  return (
    <ul
      aria-label={label}
      /* Each cell draws all four sides and overlaps its neighbours by a
         pixel, so a short row (the two look-alikes) ends where its cells end
         instead of trailing a rule across empty columns. */
      className="mt-6 grid pl-px pt-px sm:grid-cols-2 lg:grid-cols-4"
    >
      {traps.map((trap) => (
        <li key={trap.slug} data-reveal className="-ml-px -mt-px border border-line">
          <Link
            href={`/work/renal-dosing-task/${trap.slug}`}
            className="group flex h-full flex-col p-5 transition-colors hover:bg-raised focus-visible:bg-raised"
          >
            <p className="text-2xs text-muted">
              {trap.patient_id} &middot; {familyLabel(trap.family)}
            </p>
            <h3 className="mt-2 text-base text-ink transition-colors group-hover:text-accent">
              {trap.name}
            </h3>
            <p className="mt-2 text-xs text-muted">{trap.why}</p>
            <p className="mt-auto pt-5 font-mono text-2xs text-ink">
              {shiftOf(trap)}
              <span aria-hidden="true" className="float-right text-muted transition-colors group-hover:text-accent">
                &rarr;
              </span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---- the trap page ---------------------------------------------------- */

/** A wide table on a narrow phone scrolls inside its own box, and the box
 *  takes focus so a keyboard can scroll it too. */
export function Scroller({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="mt-3 overflow-x-auto">
      {children}
    </div>
  );
}

function Misread({ children }: { children: React.ReactNode }) {
  return (
    <mark className="bg-transparent text-ink underline decoration-warn decoration-wavy decoration-1 underline-offset-4">
      {children}
      <span className="sr-only"> (the value this mistake misreads)</span>
    </mark>
  );
}

type Marks = Record<"patients" | "labs" | "meds", Set<string>>;

/** Which raw cells the mistake misreads, as "row:column". */
function culpritCells(trap: Trap): Marks {
  const marks: Marks = { patients: new Set(), labs: new Set(), meds: new Set() };
  const culprit: Culprit = trap.culprit;
  const used = trap.labs.findIndex((row) => row.collected_at === trap.correct.creatinine.collected_at);

  if (culprit === "creatinine_unit") {
    marks.labs.add(`${used}:creatinine`).add(`${used}:creatinine_unit`);
  }
  if (culprit === "weight_unit") marks.patients.add("0:weight").add("0:weight_unit");
  if (culprit === "collected_at") trap.labs.forEach((_, i) => marks.labs.add(`${i}:collected_at`));
  trap.meds.forEach((row, i) => {
    const careless = trap.careless.orders.find((o) => o.order_id === row.order_id);
    const correct = trap.correct.orders.find((o) => o.order_id === row.order_id);
    if (!careless || !correct) return;
    if (culprit === "status" && row.status !== "active") marks.meds.add(`${i}:status`);
    if (culprit === "frequency" && careless.per_day !== correct.per_day) marks.meds.add(`${i}:frequency`);
    if (culprit === "limit" && careless.flagged !== correct.flagged) marks.meds.add(`${i}:dose_mg`);
  });

  return marks;
}

function CsvTable({
  file,
  rows,
  marks,
  note,
}: {
  file: string;
  rows: Record<string, string>[];
  marks: Set<string>;
  note?: (index: number) => string | null;
}) {
  const columns = Object.keys(rows[0] ?? {});

  return (
    <figure className="mt-8">
      <figcaption className="font-mono text-2xs text-muted">{file}</figcaption>
      <Scroller label={`${file}, the rows for this patient`}>
        <table className="w-full border-collapse font-mono text-2xs">
          <thead>
            <tr className="border-b border-line text-muted">
              {columns.map((column) => (
                <th key={column} scope="col" className="whitespace-nowrap py-2 pr-5 text-left font-normal">
                  {column}
                </th>
              ))}
              {note ? <th scope="col" className="py-2 text-left font-normal"><span className="sr-only">Note</span></th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-line text-ink">
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap py-2 pr-5">
                    {marks.has(`${index}:${column}`) ? <Misread>{row[column]}</Misread> : row[column]}
                  </td>
                ))}
                {note ? <td className="whitespace-nowrap py-2 text-muted">{note(index)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </Scroller>
    </figure>
  );
}

export function ChartRows({ trap }: { trap: Trap }) {
  const marks = culpritCells(trap);
  const used = trap.correct.creatinine.collected_at;
  const lastInFile = trap.careless.creatinine.collected_at;

  return (
    <>
      <CsvTable file="patients.csv" rows={[trap.patient]} marks={marks.patients} />
      <CsvTable
        file="labs.csv"
        rows={trap.labs}
        marks={marks.labs}
        note={
          trap.labs.length > 1
            ? (index) => {
                const at = trap.labs[index].collected_at;
                if (at === used) return "latest by time";
                if (at === lastInFile) return "later in the file";
                return null;
              }
            : undefined
        }
      />
      <CsvTable file="meds.csv" rows={trap.meds} marks={marks.meds} />
    </>
  );
}

function Value({ off, children }: { off: boolean; children: React.ReactNode }) {
  return off ? <Misread>{children}</Misread> : <>{children}</>;
}

const band = ([min, max]: [number | null, number | null]) =>
  min === null ? `CrCl < ${max}` : max === null ? `CrCl ≥ ${min}` : `CrCl ${min}–${max}`;

const fmt = (n: number, digits = 1) =>
  Number.isInteger(n) ? String(n) : n.toFixed(digits);

/** One way of reading the chart, every step shown. `against` is the other
 *  reading: any step that differs from it is marked, so the two columns can
 *  be compared without hunting. */
export function WalkColumn({
  title,
  lead,
  walk,
  against,
  sex,
  age,
  mark = false,
  crclLabel = "CrCl",
}: {
  /** "Calculated CrCl" where the page should name the figure an estimate. */
  crclLabel?: string;
  /** Underline what differs from `against`. Only the careless reading marks:
   *  the squiggle means "misread", and the correct column has nothing wrong. */
  mark?: boolean;
  title: string;
  lead: string;
  walk: Walk;
  against: Walk;
  sex: string;
  age: string;
}) {
  const differs = (a: unknown, b: unknown) => mark && JSON.stringify(a) !== JSON.stringify(b);

  const weightOff = differs(walk.weight.read_as, against.weight.read_as);
  const scrOff = differs(walk.creatinine.mg_dl, against.creatinine.mg_dl);
  const crclOff = differs(walk.crcl_ml_min, against.crcl_ml_min);

  return (
    <div className="min-w-0 border-t border-line pt-5">
      <h3 className="text-base text-ink">{title}</h3>
      <p className="mt-2 text-xs text-muted">{lead}</p>

      <dl className="mt-5 flex flex-col font-mono text-2xs">
        {[
          [
            "Weight",
            <Value key="w" off={weightOff}>
              {walk.weight.value} read as {walk.weight.read_as} → {fmt(walk.weight.kg)} kg
            </Value>,
          ],
          [
            "Creatinine",
            <Value key="c" off={scrOff}>
              {walk.creatinine.value} {walk.creatinine.unit} ({walk.creatinine.collected_at}) read as{" "}
              {walk.creatinine.read_as} → {fmt(walk.creatinine.mg_dl, 2)} mg/dL
            </Value>,
          ],
          [
            crclLabel,
            <Value key="k" off={crclOff}>
              (140 − {age}) × {fmt(walk.weight.kg)} ÷ (72 × {fmt(walk.creatinine.mg_dl, 2)})
              {sex === "F" ? " × 0.85" : ""} = {walk.crcl_ml_min} mL/min
            </Value>,
          ],
        ].map(([label, value]) => (
          <div key={label as string} className="grid grid-cols-[8rem_1fr] gap-3 border-b border-line py-2.5">
            <dt className="text-muted">{label}</dt>
            <dd className="min-w-0 break-words text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <Scroller label={`${title}: each order checked`}>
        <table className="w-full border-collapse font-mono text-2xs">
          <thead>
            <tr className="border-b border-line text-muted">
              <th scope="col" className="py-2 pr-4 text-left font-normal">Order</th>
              <th scope="col" className="py-2 pr-4 text-left font-normal">Daily dose</th>
              <th scope="col" className="py-2 pr-4 text-left font-normal">Limit</th>
              <th scope="col" className="py-2 text-left font-normal">Flagged</th>
            </tr>
          </thead>
          <tbody>
            {walk.orders.map((order: OrderStep) => {
              const other = against.orders.find((o) => o.order_id === order.order_id);
              return (
                <tr key={order.order_id} className="border-b border-line align-top text-ink">
                  <th scope="row" className="whitespace-nowrap py-2 pr-4 text-left font-normal">
                    {order.order_id}
                    <span className="block text-muted">{order.drug}</span>
                  </th>
                  <td className="whitespace-nowrap py-2 pr-4">
                    {order.counted ? (
                      <Value off={differs(order.daily_mg, other?.daily_mg) || differs(order.counted, other?.counted)}>
                        {order.dose_mg} × {order.per_day} = {order.daily_mg} mg
                      </Value>
                    ) : (
                      <span className="text-muted">not active, skipped</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-4">
                    {order.counted ? (
                      <Value off={differs(order.limit_mg, other?.limit_mg)}>
                        {order.limit_mg} mg
                        <span className="block text-muted">{band(order.band)}</span>
                      </Value>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2">
                    <Value off={differs(order.flagged, other?.flagged)}>{order.flagged ? "yes" : "no"}</Value>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Scroller>

      <p className="mt-4 break-words font-mono text-2xs text-muted">
        <span className="sr-only">Output line: </span>
        {JSON.stringify({ crcl_ml_min: walk.crcl_ml_min, flagged_order_ids: walk.flagged_order_ids })}
      </p>
    </div>
  );
}

export function TestName({ test }: { test: string }) {
  const { short, patient } = describeTest(test);
  return (
    <span className="whitespace-nowrap">
      {short}
      {patient ? <span className="text-muted"> · {patient}</span> : null}
    </span>
  );
}
