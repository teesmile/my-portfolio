import { renal, renalTraps } from "@/content/renal-dosing";

/* Inline figures for the renal benchmark write-up. They read the same
   snapshot as the showcase, so a number in a drawing can never disagree with
   the number on /work/renal-dosing-task. Drawn from the tokens; --warn marks
   the misread value, as it does in the showcase's chart tables. */

const label = { fontSize: 8, fill: "var(--muted)" } as const;
const strong = { fontSize: 8, fill: "var(--ink)" } as const;
const mono = { fontFamily: "var(--font-mono)" } as const;

function Frame({
  children,
  caption,
  viewBox,
  title,
}: {
  children: React.ReactNode;
  caption: string;
  viewBox: string;
  title: string;
}) {
  return (
    <figure className="my-8 border-y border-line py-6">
      <svg viewBox={viewBox} className="w-full" role="img" aria-label={title}>
        {children}
      </svg>
      <figcaption className="mt-4 text-2xs text-muted">{caption}</figcaption>
    </figure>
  );
}

/** One lab row, read twice. */
export function OneRowTwoReadings() {
  const trap = renalTraps.find((t) => t.mistake === "cr_umol_as_mgdl")!;
  const { correct, careless } = trap;

  return (
    <Frame
      viewBox="0 0 420 132"
      title={`The row ${trap.patient_id}, creatinine ${correct.creatinine.value} ${correct.creatinine.unit}. Read with the unit column, CrCl is ${correct.crcl_ml_min}. Read without it, CrCl is ${careless.crcl_ml_min}.`}
      caption="Same row, same formula. The only difference is whether the unit column was read."
    >
      <text x="8" y="14" {...label} {...mono}>labs.csv</text>
      <rect x="8" y="22" width="190" height="22" fill="none" stroke="var(--line)" />
      <text x="16" y="37" {...strong} {...mono}>{trap.patient_id}, {correct.creatinine.value},</text>
      <text x="100" y="37" {...strong} {...mono}>{correct.creatinine.unit}</text>
      <path d="M100 41q3 -2 6 0t6 0t6 0t6 0t6 0" stroke="var(--warn)" fill="none" />

      <path d="M198 33c30 0 30 -14 56 -14" stroke="var(--line)" fill="none" />
      <path d="M198 33c30 0 30 64 56 64" stroke="var(--line)" fill="none" />

      <text x="262" y="12" {...label}>reads the unit: ÷ 88.4</text>
      <text x="262" y="24" {...strong} {...mono}>{correct.creatinine.mg_dl.toFixed(2)} mg/dL</text>
      <text x="262" y="38" {...strong}>CrCl {correct.crcl_ml_min} mL/min</text>

      <text x="262" y="82" {...label}>skips the unit</text>
      <text x="262" y="94" {...strong} {...mono}>{careless.creatinine.mg_dl} mg/dL</text>
      <text x="262" y="108" fontSize="8" fill="var(--warn)">CrCl {careless.crcl_ml_min} mL/min</text>
      <text x="262" y="122" {...label}>flags an order that was fine</text>
    </Frame>
  );
}

/** Which mistake moves which patient's answer. Each row lights one family. */
export function TrapIsolation() {
  const patients = renal.patients.map((p) => p.patient_id);
  const left = 112;
  const cell = 19;

  return (
    <Frame
      viewBox={`0 0 ${left + patients.length * cell + 8} ${30 + renalTraps.length * 14 + 8}`}
      title="A grid of the ten simulated mistakes against the fifteen patients. Each mistake changes only the patients built for its trap family, and no patient is changed by two families."
      caption="Ten mistakes, fifteen patients. Every row hits only its own family's patients, and no column is hit by two families. PT015 is the control: nothing moves it."
    >
      {patients.map((id, i) => (
        <text key={id} x={left + i * cell + cell / 2} y="20" textAnchor="middle" {...label} {...mono}>
          {id.slice(-2)}
        </text>
      ))}
      {renalTraps.map((trap, row) => {
        const hit = new Set([trap.patient_id, ...trap.also_changed]);
        return (
          <g key={trap.slug}>
            <text x="8" y={36 + row * 14} {...label}>
              {trap.name.length > 26 ? `${trap.name.slice(0, 25)}…` : trap.name}
            </text>
            {patients.map((id, i) => (
              <rect
                key={id}
                x={left + i * cell + 4}
                y={28 + row * 14}
                width={cell - 8}
                height="9"
                fill={hit.has(id) ? "var(--ink)" : "none"}
                stroke="var(--line)"
              />
            ))}
          </g>
        );
      })}
    </Frame>
  );
}

/** A blanket rule fixes the trap and breaks the look-alike. */
export function MagnitudeRule() {
  const heavy = renalTraps.find((t) => t.mistake === "weight_unit_by_magnitude")!;
  const frail = renalTraps.find((t) => t.mistake === "cr_unit_by_magnitude")!;

  const row = (y: number, rule: string, input: string, wrong: string, right: string, flags: string) => (
    <g>
      <text x="8" y={y} {...label}>rule: {rule}</text>
      <rect x="8" y={y + 6} width="96" height="20" fill="none" stroke="var(--line)" />
      <text x="14" y={y + 20} {...strong} {...mono}>{input}</text>
      <path d={`M110 ${y + 16}h20m0 0-5-4m5 4-5 4`} stroke="var(--ink)" fill="none" />
      <text x="138" y={y + 14} fontSize="8" fill="var(--warn)">{wrong}</text>
      <text x="138" y={y + 26} {...label}>should be {right}</text>
      <text x="300" y={y + 20} {...strong}>{flags}</text>
    </g>
  );

  return (
    <Frame
      viewBox="0 0 420 116"
      title={`Two blanket rules. Weight over 140 must be pounds turns ${heavy.patient_id}'s genuine 150 kg into ${heavy.careless.weight.kg} kg. Creatinine under 20 must be mg/dL turns ${frail.patient_id}'s 16 µmol/L into 16 mg/dL.`}
      caption="Each rule catches the obvious trap and breaks a real patient. Only the unit column is right every time."
    >
      {row(
        14,
        "weight over 140 must be lb",
        `${heavy.patient_id} 150 kg`,
        `${heavy.careless.weight.kg.toFixed(0)} kg, CrCl ${heavy.careless.crcl_ml_min}`,
        `CrCl ${heavy.correct.crcl_ml_min}`,
        `flags ${heavy.careless.flagged_order_ids.length}, should flag ${heavy.correct.flagged_order_ids.length}`,
      )}
      {row(
        70,
        "creatinine under 20 must be mg/dL",
        `${frail.patient_id} 16 µmol/L`,
        `16 mg/dL, CrCl ${frail.careless.crcl_ml_min}`,
        `CrCl ${frail.correct.crcl_ml_min}`,
        `flags ${frail.careless.flagged_order_ids.length}, should flag ${frail.correct.flagged_order_ids.length}`,
      )}
    </Frame>
  );
}

/** Must pass against must fail, every one graded by the real tests. */
export function GradingEvidence() {
  const pass = renal.agents.filter((a) => a.expect_pass);
  const fail = renal.agents.filter((a) => !a.expect_pass);
  const square = (i: number, x0: number, ok: boolean, filled: boolean) => (
    <rect
      key={i}
      x={x0 + (i % 9) * 18}
      y={34 + Math.floor(i / 9) * 18}
      width="13"
      height="13"
      fill={filled ? "var(--ink)" : "none"}
      stroke={ok ? "var(--line)" : "var(--warn)"}
    />
  );

  return (
    <Frame
      viewBox="0 0 420 100"
      title={`${pass.length} configurations must pass and all ${pass.filter((a) => a.passed).length} do. ${fail.length} must fail and all ${fail.filter((a) => !a.passed).length} do.`}
      caption="Filled squares passed the real test file; hollow ones failed it. Every square is on the side it was supposed to land on."
    >
      <text x="8" y="16" {...strong}>must pass</text>
      <text x="8" y="26" {...label}>reference, baseline, 6 defensible variants</text>
      {pass.map((a, i) => square(i, 8, a.passed === a.expect_pass, a.passed))}
      <text x="220" y="16" {...strong}>must fail</text>
      <text x="220" y="26" {...label}>10 single mistakes, 7 malformed outputs</text>
      {fail.map((a, i) => square(i, 220, a.passed === a.expect_pass, a.passed))}
    </Frame>
  );
}

/** Why a 1% tolerance cannot change which band a patient lands in. */
export function ToleranceMargin() {
  const tightest = [...renal.margins].sort((a, b) => a.margin - b.margin)[0];
  const { crcl, nearest_edge: edge, margin } = tightest;
  const lo = Math.min(crcl, edge) - 2;
  const hi = Math.max(crcl, edge) + 2;
  const x = (v: number) => 20 + ((v - lo) / (hi - lo)) * 380;
  const tol = crcl * renal.tolerance;

  return (
    <Frame
      viewBox="0 0 420 86"
      title={`${tightest.patient_id}: reference CrCl ${crcl}, nearest band edge ${edge}, a ${(margin * 100).toFixed(1)}% gap. The accepted range, plus or minus 1%, stops well short of the edge.`}
      caption={`The closest any patient gets to a band edge is ${(margin * 100).toFixed(1)}%. Anything the 1% tolerance accepts stays in the same band, so it can't turn a right flag into a wrong one.`}
    >
      <line x1="20" y1="48" x2="400" y2="48" stroke="var(--line)" />
      <rect x={x(crcl - tol)} y="38" width={x(crcl + tol) - x(crcl - tol)} height="20" fill="var(--ink)" opacity="0.14" />
      <line x1={x(crcl)} y1="32" x2={x(crcl)} y2="64" stroke="var(--ink)" />
      <text x={x(crcl)} y="24" textAnchor="middle" {...strong}>{tightest.patient_id} {crcl}</text>
      <text x={x(crcl)} y="78" textAnchor="middle" {...label}>±1% accepted</text>
      <line x1={x(edge)} y1="28" x2={x(edge)} y2="68" stroke="var(--accent)" strokeDasharray="3 3" />
      <text x={x(edge)} y="20" textAnchor="middle" {...label}>band edge {edge}</text>
    </Frame>
  );
}
