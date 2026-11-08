import { renalTraps } from "@/content/renal-dosing";
import LeaseGate from "./lease-gate";

/**
 * The renal write-up's key idea as an 8s loop: one lab row, two readings.
 *
 * Every number comes from the renal snapshot (PT002 under the
 * µmol/L-as-mg/dL mistake), the same source as the showcase and the
 * write-up's figure, so the three cannot disagree.
 *
 * SVG and CSS only (the .renal-loop rules in globals.css): no script runs
 * per frame. The element's resting styles are the *finished* frame — both
 * readings and the caption showing — and the keyframes only apply while
 * motion is allowed and the loop owns the motion lease, i.e. it is on
 * screen and nothing higher-priority is moving. So reduced motion, no
 * JavaScript and "held" all show the same meaningful still, never an empty
 * first frame. The loop starts and ends on the same frame (header only), so
 * it repeats without a seam.
 */
export default function RenalLoop() {
  const trap = renalTraps.find((t) => t.mistake === "cr_umol_as_mgdl")!;
  const { correct, careless } = trap;
  const value = String(correct.creatinine.value);
  const unit = correct.creatinine.unit;

  return (
    <LeaseGate id="renal" className="renal-gate h-full w-full">
      <svg
        viewBox="0 0 320 200"
        className="renal-loop h-full w-full"
        role="img"
        aria-label={`${trap.patient_id}'s lab row, creatinine ${value} ${unit}, read two ways. With the unit column: ${correct.crcl_ml_min} mL/min, correct. Without it: ${careless.crcl_ml_min} mL/min, kidneys "failed", drug withheld. Same row. Two readings.`}
      >
        <g fontFamily="var(--font-mono)" fontSize="9">
          {/* The header never animates: the loop's first and last frame. */}
          <text x="20" y="24" fill="var(--muted)">labs.csv</text>
          <text x="20" y="44" fill="var(--muted)">patient_id</text>
          <text x="110" y="44" fill="var(--muted)">creatinine</text>
          <text x="200" y="44" fill="var(--muted)">unit</text>
          <line x1="20" y1="50" x2="300" y2="50" stroke="var(--line)" />

          <rect className="rl-sweep" x="16" y="55" width="288" height="18" fill="var(--ink)" />
          <g className="rl-row">
            <text x="20" y="68" fill="var(--ink)">{trap.patient_id}</text>
            <text x="110" y="68" fill="var(--ink)">{value}</text>
            <text x="200" y="68" fill="var(--ink)">{unit}</text>
            <line x1="20" y1="78" x2="300" y2="78" stroke="var(--line)" />
          </g>

          <path className="rl-link" d="M160 80 C160 92 84 88 84 100" pathLength={1} stroke="var(--line)" fill="none" />
          <path className="rl-link" d="M160 80 C160 92 236 88 236 100" pathLength={1} stroke="var(--line)" fill="none" />

          <g className="rl-good" textAnchor="middle">
            <text x="84" y="114" fill="var(--muted)" fontSize="8">with the unit column</text>
            <text x="84" y="136" fill="var(--accent)" fontSize="17" fontFamily="var(--font-display)">
              {correct.crcl_ml_min} mL/min
            </text>
            <text x="84" y="151" fill="var(--accent)" fontSize="8">correct</text>
          </g>

          <g className="rl-bad" textAnchor="middle">
            <text x="236" y="114" fill="var(--muted)" fontSize="8">without it</text>
            <text x="236" y="136" fill="var(--wrong)" fontSize="17" fontFamily="var(--font-display)">
              {careless.crcl_ml_min} mL/min
            </text>
            <text x="236" y="151" fill="var(--wrong)" fontSize="8">kidneys &lsquo;failed&rsquo;, drug withheld</text>
          </g>

          <text className="rl-cap" x="160" y="184" textAnchor="middle" fill="var(--ink)" fontSize="11" fontFamily="var(--font-display)">
            Same row. Two readings.
          </text>
        </g>
      </svg>
    </LeaseGate>
  );
}
