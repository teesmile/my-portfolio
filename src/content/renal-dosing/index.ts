/**
 * The renal dose-check showcase, as data.
 *
 * Every number comes from `snapshot.json`, which `pnpm snapshot:renal` writes
 * by running the task repository's own simulator and pytest suite. Nothing
 * here reads that repository at runtime: the page is built from a frozen copy,
 * so a change over there cannot quietly change a claim over here. What this
 * file adds is the words a reader needs: each trap's name, its slug, and one
 * line on why it matters to a patient, all paraphrased from the task's README.
 *
 * The drugs and dose limits are fictional. The patients are synthetic.
 */
import snapshot from "./snapshot.json";

type Row = Record<string, string>;

export type OrderStep = {
  order_id: string;
  drug: string;
  status: string;
  dose_mg: number;
  frequency: string;
  per_day: number;
  daily_mg: number;
  band: [number | null, number | null];
  limit_mg: number;
  counted: boolean;
  flagged: boolean;
};

export type Walk = {
  weight: { value: number; unit: string; read_as: string; kg: number };
  creatinine: {
    value: number;
    unit: string;
    collected_at: string;
    read_as: string;
    mg_dl: number;
    labs_for_patient: number;
  };
  crcl_ml_min: number;
  orders: OrderStep[];
  flagged_order_ids: string[];
};

export type Failure = { kind: "failed" | "error"; test: string; message: string };

export type Agent = {
  name: string;
  family: string;
  description: string;
  expect_pass: boolean;
  passed: boolean;
  pytest: string;
  failures: Failure[];
};

type SnapshotTrap = {
  mistake: string;
  family: string;
  mistake_description: string;
  patient_id: string;
  design_note: string;
  correct: Walk;
  careless: Walk;
  failures: Failure[];
  also_changed: string[];
};

/** Which part of the chart the mistake misreads, so the page can mark it. */
export type Culprit =
  | "creatinine_unit"
  | "weight_unit"
  | "status"
  | "frequency"
  | "collected_at"
  | "limit";

type TrapCopy = {
  slug: string;
  mistake: string;
  kind: "trap" | "look-alike";
  name: string;
  /** One line, for the card: what it means for the patient. */
  why: string;
  /** What the careless agent does, in plain words. */
  slip: string;
  culprit: Culprit;
};

/* Order follows the task's own README: the four trap families first, the two
   checks that follow from the instruction next, the look-alikes last. */
const copy: TrapCopy[] = [
  {
    slug: "creatinine-units",
    mistake: "cr_umol_as_mgdl",
    kind: "trap",
    name: "Creatinine in µmol/L read as mg/dL",
    why: "Kidney function looks 88 times worse than it is, so a drug the patient needs gets withheld.",
    slip: "Reads 150 µmol/L as 150 mg/dL, skipping the ÷ 88.4 the unit column asks for.",
    culprit: "creatinine_unit",
  },
  {
    slug: "weight-units",
    mistake: "weight_lb_as_kg",
    kind: "trap",
    name: "Weight in lb read as kg",
    why: "Clearance is inflated 2.2 times, so the patient keeps a full-function dose their kidneys can't clear.",
    slip: "Reads 176 lb as 176 kg, skipping the × 0.4536 the unit column asks for.",
    culprit: "weight_unit",
  },
  {
    slug: "discontinued-order",
    mistake: "count_discontinued",
    kind: "trap",
    name: "A stopped order counted as active",
    why: "The flag lands on a drug nobody is taking. False alarms wear clinicians down and invite a fix to a dose that doesn't exist.",
    slip: "Checks every order in meds.csv, including the one whose status is discontinued.",
    culprit: "status",
  },
  {
    slug: "every-eight-hours",
    mistake: "freq_qNh_as_count",
    kind: "trap",
    name: "q8h read as eight doses a day",
    why: "Every eight hours is three doses, not eight. The misreading raises alarms on orders that are fine.",
    slip: "Takes the number in qNh as doses per day, so q8h becomes 8 a day and q12h becomes 12.",
    culprit: "frequency",
  },
  {
    slug: "twice-daily",
    mistake: "freq_bd_as_once",
    kind: "trap",
    name: "BD read as once a day",
    why: "Twice daily counted once halves the daily dose on paper and hides a real overdose.",
    slip: "Reads BD, Latin for twice a day, as once daily.",
    culprit: "frequency",
  },
  {
    slug: "three-times-daily",
    mistake: "freq_tds_as_twice",
    kind: "trap",
    name: "TDS read as twice a day",
    why: "Three doses counted as two drops the daily total under the limit and hides an overdose.",
    slip: "Reads TDS, Latin for three times a day, as twice daily.",
    culprit: "frequency",
  },
  {
    slug: "latest-creatinine",
    mistake: "lab_last_row_wins",
    kind: "trap",
    name: "The last row, not the latest result",
    why: "A creatinine from a kidney injury that has since recovered makes the patient look sicker than they are, and fine orders get flagged.",
    slip: "Keeps whichever creatinine row it reads last, not the one with the latest collected_at.",
    culprit: "collected_at",
  },
  {
    slug: "at-the-limit",
    mistake: "flag_at_limit",
    kind: "trap",
    name: "A dose exactly at the limit",
    why: "A daily dose equal to the maximum is within it. Flagging it is a false alarm on a correct order.",
    slip: "Flags daily dose ≥ limit, where the instruction says strictly greater.",
    culprit: "limit",
  },
  {
    slug: "frail-low-creatinine",
    mistake: "cr_unit_by_magnitude",
    kind: "look-alike",
    name: "A low creatinine that really is µmol/L",
    why: "A frail 90-year-old with little muscle has a low creatinine. Guess the unit from the number and she looks like she's in kidney failure.",
    slip: "Applies a blanket rule, values under 20 must be mg/dL, instead of reading the unit column.",
    culprit: "creatinine_unit",
  },
  {
    slug: "genuine-150-kg",
    mistake: "weight_unit_by_magnitude",
    kind: "look-alike",
    name: "A genuine 150 kg patient",
    why: "A rule that big numbers must be pounds halves the weight of exactly the patients actual-weight dosing matters most for.",
    slip: "Applies a blanket rule, weights over 140 must be lb, instead of reading the unit column.",
    culprit: "weight_unit",
  },
];

const traps = snapshot.traps as SnapshotTrap[];

export type Trap = TrapCopy &
  SnapshotTrap & {
    patient: Row;
    labs: Row[];
    meds: Row[];
  };

export const renal = {
  source: snapshot.source,
  tolerance: snapshot.crcl_rel_tolerance,
  rules: snapshot.rules as Record<
    string,
    { crcl_min: number | null; crcl_max: number | null; max_daily_dose_mg: number }[]
  >,
  patients: snapshot.patients as Row[],
  agents: snapshot.agents as Agent[],
  independent: snapshot.independent,
  margins: snapshot.band_edge_margins as {
    patient_id: string;
    crcl: number;
    nearest_edge: number;
    margin: number;
  }[],
  evidenceProblems: snapshot.evidence_problems as string[],
  testSource: snapshot.test_source,
  /** Every test the verifier runs: two whole-file checks, then two per patient. */
  testCount: 2 + snapshot.patients.length * 2,
  repo: snapshot.source.repo,
};

export const renalTraps: Trap[] = copy.map((entry) => {
  const data = traps.find((trap) => trap.mistake === entry.mistake);
  if (!data) {
    throw new Error(`snapshot.json has no trap for ${entry.mistake}; run pnpm snapshot:renal`);
  }
  const id = data.patient_id;

  return {
    ...entry,
    ...data,
    patient: (snapshot.patients as Row[]).find((row) => row.patient_id === id)!,
    labs: (snapshot.labs as Row[]).filter((row) => row.patient_id === id),
    meds: (snapshot.meds as Row[]).filter((row) => row.patient_id === id),
  };
});

export const findTrap = (slug: string) => renalTraps.find((trap) => trap.slug === slug);

/** "test_flagged_orders_exact[PT008]" → which check, and for whom. */
export function describeTest(test: string) {
  const match = test.match(/^(test_\w+?)(?:\[(\w+)\])?$/);
  const name = match?.[1] ?? test;
  const patient = match?.[2];
  const short =
    name === "test_clearance_within_one_percent"
      ? "CrCl within 1%"
      : name === "test_flagged_orders_exact"
        ? "Flagged set exact"
        : name === "test_exactly_the_expected_patients"
          ? "Every patient once"
          : name === "test_row_schema"
            ? "Row schema"
            : name;
  return { name, patient, short };
}

/** What changed for one patient, as the short numeric summary on a card. */
export function shiftOf(trap: Trap) {
  const { correct, careless } = trap;
  if (correct.crcl_ml_min !== careless.crcl_ml_min) {
    return `CrCl ${correct.crcl_ml_min} → ${careless.crcl_ml_min}`;
  }
  const added = careless.flagged_order_ids.filter((id) => !correct.flagged_order_ids.includes(id));
  const dropped = correct.flagged_order_ids.filter((id) => !careless.flagged_order_ids.includes(id));
  if (added.length) return `flags ${added.join(", ")} wrongly`;
  return `misses ${dropped.join(", ")}`;
}
