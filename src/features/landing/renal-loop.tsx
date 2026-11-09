import { renalTraps } from "@/content/renal-dosing";
import { ILL } from "@/lib/illustration";
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
export default function RenalLoop({ coveredBy }: { coveredBy?: string } = {}) {
  const trap = renalTraps.find((t) => t.mistake === "cr_umol_as_mgdl")!;
  const { correct, careless } = trap;
  const value = String(correct.creatinine.value);
  const unit = correct.creatinine.unit;

  return (
    /* It takes turns with anything waiting: 6 s in, inside the hold where
       both readings and the caption are showing — exactly the resting frame
       a held loop shows — it passes the lease on, so the hand-over does not
       jump. With nothing waiting it keeps looping (8 s cycle). */
    <LeaseGate id="renal" coveredBy={coveredBy} yieldAfterMs={6000} cycleMs={8000} className="renal-gate h-full w-full">
      <svg
        viewBox="0 0 320 200"
        className="renal-loop h-full w-full"
        role="img"
        aria-label={`${trap.patient_id}'s lab row, creatinine ${value} ${unit}, read two ways. With the unit column: ${correct.crcl_ml_min} mL/min, correct. Without it: ${careless.crcl_ml_min} mL/min, kidneys "failed", drug withheld. Same row. Two readings.`}
      >
        <g fontFamily="var(--font-mono)" fontSize="9">
          {/* The header never animates: the loop's first and last frame. */}
          <rect x="12" y="10" width="296" height="74" fill={ILL.panel} stroke={ILL.edge} />
          <text x="20" y="24" fill={ILL.detail}>labs.csv</text>
          <text x="20" y="44" fill={ILL.detail}>patient_id</text>
          <text x="110" y="44" fill={ILL.detail}>creatinine</text>
          <text x="200" y="44" fill={ILL.detail}>unit</text>
          <line x1="20" y1="50" x2="300" y2="50" stroke={ILL.edge} />

          <rect className="rl-sweep" x="16" y="55" width="288" height="18" fill={ILL.accentFill} />
          <g className="rl-row">
            <text x="20" y="68" fill={ILL.text}>{trap.patient_id}</text>
            <text x="110" y="68" fill={ILL.text}>{value}</text>
            <text x="200" y="68" fill={ILL.text}>{unit}</text>
            <line x1="20" y1="78" x2="300" y2="78" stroke={ILL.edge} />
          </g>

          <path className="rl-link" d="M160 84 C160 94 80 92 80 102" pathLength={1} stroke={ILL.accent} fill="none" />
          <path className="rl-link" d="M160 84 C160 94 238 92 238 102" pathLength={1} stroke={ILL.error} fill="none" />

          {/* Each reading lands on its own tinted panel; the panel is inside
              the animated group, so it arrives with its reading. */}
          <g className="rl-good" textAnchor="middle">
            <rect x="6" y="102" width="148" height="58" fill={ILL.accentSoft} stroke={ILL.accent} />
            <text x="80" y="116" fill={ILL.text} fontSize="8">with the unit column</text>
            <text x="80" y="138" fill={ILL.accent} fontSize="17" fontFamily="var(--font-display)">
              {correct.crcl_ml_min} mL/min
            </text>
            <text x="80" y="153" fill={ILL.accent} fontSize="8">correct</text>
          </g>

          <g className="rl-bad" textAnchor="middle">
            <rect x="158" y="102" width="160" height="58" fill={ILL.errorSoft} stroke={ILL.error} />
            <text x="238" y="116" fill={ILL.text} fontSize="8">without it</text>
            <text x="238" y="138" fill={ILL.error} fontSize="17" fontFamily="var(--font-display)">
              {careless.crcl_ml_min} mL/min
            </text>
            <text x="238" y="153" fill={ILL.error} fontSize="7.5">kidneys &lsquo;failed&rsquo;, drug withheld</text>
          </g>

          <text className="rl-cap" x="160" y="186" textAnchor="middle" fill={ILL.text} fontSize="11" fontFamily="var(--font-display)">
            Same row. Two readings.
          </text>
        </g>
      </svg>
    </LeaseGate>
  );
}
