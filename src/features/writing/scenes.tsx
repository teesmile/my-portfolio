import snapshot from "@/content/renal-dosing/snapshot.json";
import { renalTraps } from "@/content/renal-dosing";
import { ILL } from "@/lib/illustration";

/**
 * Banner and share scenes for the Writing pieces: a real-looking thing each
 * piece is about — a ward chart, a browser, the actual portrait — rather than
 * abstract lines.
 *
 * One visual language across all three — application windows that cast a
 * shadow (--ill-shadow), the same window chrome, the illustration palette
 * for meaning — and each piece its own light, placed on its subject and
 * coloured by what the subject is: the renal chart is lit red at the misread
 * cell with a smaller amber light at the correct reading (a piece about an
 * error caught); the routes browser is lit amber (a piece about the fix);
 * the image piece is split, faint red on the oversized file and amber on
 * the phone (before and after).
 *
 * Every scene is drawn at 1200×630, the share-card size, with its key
 * content in the upper two-thirds: the share image shows the whole frame
 * under a title plate, and the article banner crops it to 21:9 (16:10 on a
 * phone) under the title band. SVG, so it is sharp at any size and follows
 * the theme without a second file.
 */

type SceneProps = {
  id: string;
  className?: string;
  preserveAspectRatio?: string;
  /** A crop of the 1200×630 scene; the phone banner uses a square one. */
  viewBox?: string;
};

const mono = "var(--font-mono)";
const display = "var(--font-display)";
const text = "var(--font-text)";

/** A light on the scene: centre and radius as fractions of the frame. */
type Light = { color: string; cx: number; cy: number; r: number };

function Defs({ id, lights }: { id: string; lights: Light[] }) {
  return (
    <defs>
      {lights.map((light, i) => (
        <radialGradient key={i} id={`${id}-light-${i}`} cx={light.cx} cy={light.cy} r={light.r}>
          <stop offset="0" style={{ stopColor: light.color }} />
          <stop offset="1" style={{ stopColor: "transparent" }} />
        </radialGradient>
      ))}
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="22" stdDeviation="26" style={{ floodColor: ILL.shadow }} />
      </filter>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" style={{ floodColor: ILL.shadow }} />
      </filter>
      <filter id={`${id}-glow`} x="-30%" y="-80%" width="160%" height="260%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  );
}

function Backdrop({ id, lights }: { id: string; lights: Light[] }) {
  return (
    <>
      <rect width="1200" height="630" fill="var(--surface)" />
      {lights.map((_, i) => (
        <rect key={i} width="1200" height="630" fill={`url(#${id}-light-${i})`} />
      ))}
    </>
  );
}

const LIGHTS: Record<string, Light[]> = {
  ward: [
    { color: ILL.glowError, cx: 0.56, cy: 0.42, r: 0.42 },
    { color: ILL.glow, cx: 0.86, cy: 0.62, r: 0.3 },
  ],
  routes: [{ color: ILL.glow, cx: 0.3, cy: 0.3, r: 0.75 }],
  portrait: [
    { color: ILL.glowError, cx: 0.2, cy: 0.35, r: 0.42 },
    { color: ILL.glow, cx: 0.78, cy: 0.35, r: 0.42 },
  ],
  domain: [
    { color: ILL.glowError, cx: 0.3, cy: 0.3, r: 0.38 },
    { color: ILL.glow, cx: 0.6, cy: 0.5, r: 0.45 },
  ],
};

/** A desktop application window: shadow, title bar, three lights. */
function Window({
  id,
  x,
  y,
  w,
  h,
  title,
  opacity = 1,
  children,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: React.ReactNode;
  opacity?: number;
  children?: React.ReactNode;
}) {
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx="12" fill="var(--raised)" filter={`url(#${id}-shadow)`} />
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx="12" fill="none" stroke={ILL.edge} />
      <path d={`M${x + 12} ${y + 0.5}h${w - 24}a11.5 11.5 0 0 1 11.5 11.5v30.5h-${w - 1}v-30.5a11.5 11.5 0 0 1 11.5-11.5z`} fill={ILL.panel} />
      <line x1={x} y1={y + 42} x2={x + w} y2={y + 42} stroke={ILL.edge} />
      <circle cx={x + 22} cy={y + 21} r="6" fill={ILL.error} />
      <circle cx={x + 42} cy={y + 21} r="6" fill={ILL.accentFill} />
      <circle cx={x + 62} cy={y + 21} r="6" fill={ILL.shape} />
      {title}
      {children}
    </g>
  );
}

/* ---- the renal piece: a ward chart with one cell misread ------------- */

export function WardChartScene({ id, className, preserveAspectRatio, viewBox = "0 0 1200 630" }: SceneProps) {
  const trap = renalTraps.find((t) => t.mistake === "cr_umol_as_mgdl")!;
  const latest = (pid: string) =>
    (snapshot.labs as Record<string, string>[])
      .filter((l) => l.patient_id === pid)
      .sort((a, b) => b.collected_at.localeCompare(a.collected_at))[0];
  type Row = { patient_id: string; age_years: string; sex: string; weight: string; weight_unit: string; lab: Record<string, string> };
  const rows: Row[] = (snapshot.patients as Omit<Row, "lab">[]).slice(0, 6).map((p) => ({ ...p, lab: latest(p.patient_id) }));
  const cols = { pid: 120, age: 270, sex: 340, weight: 410, cr: 560, unit: 660, at: 800 };
  const top = 186;
  const rowH = 46;
  const hit = rows.findIndex((r) => r.patient_id === trap.patient_id);
  const hitY = top + hit * rowH;

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio={preserveAspectRatio} role="img" aria-label={`A ward chart of synthetic patients. ${trap.patient_id}'s creatinine of ${trap.correct.creatinine.value} ${trap.correct.creatinine.unit} is lit red, read as mg/dL to give a clearance of ${trap.careless.crcl_ml_min}; the correct reading, in amber, gives ${trap.correct.crcl_ml_min} mL/min.`}>
      <Defs id={id} lights={LIGHTS.ward} />
      <Backdrop id={id} lights={LIGHTS.ward} />
      <Window
        id={id}
        x={80}
        y={50}
        w={1040}
        h={540}
        title={
          <>
            <text x={600} y={76} textAnchor="middle" fontFamily={text} fontSize="15" fill={ILL.detail}>Ward 4B · medication review</text>
            <text x={1100} y={76} textAnchor="end" fontFamily={text} fontSize="13" fill={ILL.detail}>synthetic patients · fictional drugs</text>
          </>
        }
      >
        <text x={cols.pid} y={128} fontFamily={display} fontSize="24" fill={ILL.text}>Creatinine results</text>
        <text x={cols.pid} y={152} fontFamily={text} fontSize="14" fill={ILL.detail}>latest result per patient · renal dose check</text>

        {[["patient", cols.pid], ["age", cols.age], ["sex", cols.sex], ["weight", cols.weight], ["creatinine", cols.cr], ["unit", cols.unit], ["collected", cols.at]].map(([label, x]) => (
          <text key={label as string} x={x as number} y={top - 10} fontFamily={mono} fontSize="14" fill={ILL.detail}>{label}</text>
        ))}
        <line x1={100} y1={top} x2={1100} y2={top} stroke={ILL.edge} />

        {/* The misread cell: a red glow under it, then the lit cell. */}
        <rect x={cols.cr - 14} y={hitY + 6} width={cols.at - cols.cr - 16} height={rowH - 12} fill={ILL.error} opacity="0.45" filter={`url(#${id}-glow)`} />
        <rect x={cols.cr - 14} y={hitY + 6} width={cols.at - cols.cr - 16} height={rowH - 12} rx="4" fill={ILL.errorSoft} stroke={ILL.error} strokeWidth="2" />

        {rows.map((r, i) => {
          const y = top + i * rowH + 30;
          const isHit = i === hit;
          return (
            <g key={r.patient_id} fontFamily={mono} fontSize="17" fill={ILL.text}>
              <text x={cols.pid} y={y}>{r.patient_id}</text>
              <text x={cols.age} y={y}>{r.age_years}</text>
              <text x={cols.sex} y={y}>{r.sex}</text>
              <text x={cols.weight} y={y}>{r.weight} {r.weight_unit}</text>
              <text x={cols.cr} y={y} fill={isHit ? ILL.error : ILL.text}>{r.lab.creatinine}</text>
              <text x={cols.unit} y={y} fill={isHit ? ILL.error : ILL.text}>{r.lab.creatinine_unit}</text>
              <text x={cols.at} y={y} fill={ILL.detail} fontSize="15">{r.lab.collected_at.replace("T", " ")}</text>
              <line x1={100} y1={top + (i + 1) * rowH} x2={1100} y2={top + (i + 1) * rowH} stroke={ILL.edge} opacity="0.6" />
            </g>
          );
        })}
      </Window>

      {/* Two readings of the same cell, as floating annotations. */}
      <path d={`M${cols.at - 30} ${hitY + rowH / 2} C 860 ${hitY + rowH / 2} 860 ${hitY - 32} 892 ${hitY - 32}`} stroke={ILL.error} strokeWidth="2" fill="none" />
      <g filter={`url(#${id}-soft)`}>
        <rect x={892} y={hitY - 70} width={256} height={76} rx="8" fill="var(--raised)" />
      </g>
      <rect x={892} y={hitY - 70} width={256} height={76} rx="8" fill={ILL.errorSoft} stroke={ILL.error} strokeWidth="2" />
      <text x={910} y={hitY - 42} fontFamily={mono} fontSize="15" fill={ILL.text}>read as {trap.careless.creatinine.value} mg/dL</text>
      <text x={910} y={hitY - 16} fontFamily={display} fontSize="20" fill={ILL.error}>CrCl {trap.careless.crcl_ml_min} · withheld</text>

      <path d={`M${cols.at - 30} ${hitY + rowH / 2} C 860 ${hitY + rowH / 2} 860 ${hitY + 92} 892 ${hitY + 92}`} stroke={ILL.accent} strokeWidth="2" fill="none" />
      <g filter={`url(#${id}-soft)`}>
        <rect x={892} y={hitY + 54} width={256} height={76} rx="8" fill="var(--raised)" />
      </g>
      <rect x={892} y={hitY + 54} width={256} height={76} rx="8" fill={ILL.accentSoft} stroke={ILL.accent} strokeWidth="2" />
      <text x={910} y={hitY + 82} fontFamily={mono} fontSize="15" fill={ILL.text}>÷ 88.4 = {trap.correct.creatinine.mg_dl.toFixed(2)} mg/dL</text>
      <text x={910} y={hitY + 108} fontFamily={display} fontSize="20" fill={ILL.accent}>CrCl {trap.correct.crcl_ml_min} mL/min</text>
    </svg>
  );
}

/* ---- the routes piece: a browser on /work, other routes behind -------- */

export function BrowserRoutesScene({ id, className, preserveAspectRatio, viewBox = "0 0 1200 630" }: SceneProps) {
  const behind = ["/contact", "/about", "/writing"];
  const urlBar = (x: number, y: number, w: number, path: string, front: boolean) => (
    <>
      <rect x={x + 90} y={y + 10} width={w - 120} height="22" rx="11" fill="var(--surface)" stroke={ILL.edge} />
      <text x={x + 110} y={y + 26} fontFamily={mono} fontSize="13" fill={ILL.detail}>
        anthonyugwuja.dev<tspan fill={front ? ILL.accent : ILL.text}>{path}</tspan>
      </text>
    </>
  );

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio={preserveAspectRatio} role="img" aria-label="A browser open on anthonyugwuja.dev/work, with the writing, about and contact routes open in windows behind it.">
      <Defs id={id} lights={LIGHTS.routes} />
      <Backdrop id={id} lights={LIGHTS.routes} />

      {behind.map((path, k) => {
        const depth = behind.length - k;
        const x = 200 + depth * 74;
        const y = 70 - depth * 22;
        return (
          <Window key={path} id={id} x={x} y={y} w={780} h={480} opacity={0.55 + k * 0.12} title={urlBar(x, y, 780, path, false)}>
            <rect x={x + 30} y={y + 70} width="220" height="20" rx="3" fill={ILL.shape} />
            <rect x={x + 30} y={y + 104} width="420" height="12" rx="3" fill={ILL.shape} opacity="0.7" />
          </Window>
        );
      })}

      <Window id={id} x={150} y={110} w={780} h={480} title={urlBar(150, 110, 780, "/work", true)}>
        {/* The page itself: nav with Work active, the heading, the entries. */}
        <text x={180} y={190} fontFamily={display} fontSize="16" fill={ILL.text}>Anthony Ugwuja</text>
        {["Work", "Writing", "About", "Contact"].map((item, i) => (
          <g key={item}>
            <text x={600 + i * 78} y={190} fontFamily={text} fontSize="15" fill={i === 0 ? ILL.accent : ILL.detail}>{item}</text>
            {i === 0 ? <rect x={600} y={197} width="38" height="2.5" fill={ILL.accentFill} /> : null}
          </g>
        ))}
        <line x1={150} y1={214} x2={930} y2={214} stroke={ILL.edge} opacity="0.6" />
        <text fontFamily={display} fontSize="34" fill={ILL.text}>
          <tspan x={180} y={268}>Things I’ve built, and what</tspan>
          <tspan x={180} y={308}>each one taught me.</tspan>
        </text>
        {[0, 1, 2].map((i) => {
          const x = 180 + i * 244;
          const lit = i === 0;
          return (
            <g key={i}>
              <rect x={x} y={340} width="226" height="140" rx="6" fill={lit ? ILL.accentSoft : ILL.panel} stroke={lit ? ILL.accent : ILL.edge} />
              <rect x={x + 16} y={500} width="150" height="12" rx="3" fill={ILL.shape} />
              <rect x={x + 16} y={522} width="190" height="9" rx="3" fill={ILL.shape} opacity="0.6" />
              {lit ? (
                <>
                  <rect x={x + 18} y={358} width="190" height="30" rx="3" fill="var(--raised)" stroke={ILL.edge} />
                  <rect x={x + 18} y={400} width="90" height="62" rx="3" fill={ILL.accentSoft} stroke={ILL.accent} />
                  <rect x={x + 118} y={400} width="90" height="62" rx="3" fill={ILL.errorSoft} stroke={ILL.error} />
                </>
              ) : (
                <>
                  <rect x={x + 18} y={358} width="190" height="104" rx="3" fill="var(--raised)" stroke={ILL.edge} />
                  <rect x={x + 32} y={374} width="110" height="10" rx="3" fill={ILL.shape} />
                  <rect x={x + 32} y={394} width="160" height="8" rx="3" fill={ILL.shape} opacity="0.6" />
                </>
              )}
            </g>
          );
        })}
      </Window>
    </svg>
  );
}

/* ---- the image piece: the actual portrait, as sent and as shown -------- */

export function PortraitBytesScene({ id, className, preserveAspectRatio, viewBox = "0 0 1200 630" }: SceneProps) {
  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio={preserveAspectRatio} role="img" aria-label="The portrait as a 1254 by 1254, 16-bit PNG of 2,507,195 bytes, beside a phone showing it at 320 pixels as an 11,582-byte WebP.">
      <Defs id={id} lights={LIGHTS.portrait} />
      <Backdrop id={id} lights={LIGHTS.portrait} />
      <clipPath id={`${id}-tile`}>
        <rect x={100} y={178} width={500} height={200} />
      </clipPath>
      <clipPath id={`${id}-avatar`}>
        <circle cx={935} cy={208} r={74} />
      </clipPath>

      <Window
        id={id}
        x={80}
        y={50}
        w={540}
        h={380}
        title={<text x={350} y={76} textAnchor="middle" fontFamily={mono} fontSize="14" fill={ILL.detail}>profile.png</text>}
      >
        {/* The file's facts first, as a file-info header: the upper part
            of the frame is the only part the share card's title plate and
            the banner's title band never cover. */}
        <rect x={100} y={102} width={500} height={66} rx="6" fill={ILL.errorSoft} stroke={ILL.error} />
        <text x={120} y={128} fontFamily={mono} fontSize="16" fill={ILL.text}>1254 × 1254 · 16 bits per channel</text>
        <text x={120} y={156} fontFamily={display} fontSize="22" fill={ILL.error}>2,507,195 bytes sent</text>
        <rect x={100} y={178} width={500} height={200} fill={ILL.errorSoft} />
        <image href="/portrait-clean-v2.webp" x={100} y={178} width={500} height={200} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-tile)`} />
        <rect x={100} y={178} width={500} height={200} fill="none" stroke={ILL.error} strokeWidth="3" />
      </Window>

      <path d="M640 196 H 760" stroke={ILL.accent} strokeWidth="2.5" fill="none" />
      <path d="M760 196 l-12 -8 m12 8 l-12 8" stroke={ILL.accent} strokeWidth="2.5" fill="none" />
      <text x={700} y={182} textAnchor="middle" fontFamily={text} fontSize="14" fill={ILL.detail}>WebP, 640 px</text>

      {/* A phone, showing the about page's 320 px circle. */}
      <g filter={`url(#${id}-shadow)`}>
        <rect x={800} y={40} width={270} height={560} rx="40" fill="var(--raised)" />
      </g>
      <rect x={800.5} y={40.5} width={269} height={559} rx="39.5" fill="none" stroke={ILL.edge} strokeWidth="2" />
      <rect x={814} y={56} width={242} height={528} rx="28" fill="var(--surface)" />
      <rect x={905} y={66} width={60} height={8} rx="4" fill={ILL.shape} />
      <rect x={832} y={96} width={90} height={9} rx="3" fill={ILL.shape} />
      <circle cx={935} cy={208} r={80} fill={ILL.glow} />
      <image href="/portrait-clean-v2.webp" x={861} y={134} width={148} height={148} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-avatar)`} />
      <circle cx={935} cy={208} r={74} fill="none" stroke={ILL.accent} strokeWidth="2.5" />
      {[310, 332, 354, 376].map((y, i) => (
        <rect key={y} x={834} y={y} width={i === 3 ? 120 : 200} height={9} rx="3" fill={ILL.shape} opacity={i === 0 ? 1 : 0.6} />
      ))}

      <g filter={`url(#${id}-soft)`}>
        <rect x={640} y={236} width={290} height={76} rx="8" fill="var(--raised)" />
      </g>
      <rect x={640} y={236} width={290} height={76} rx="8" fill={ILL.accentSoft} stroke={ILL.accent} strokeWidth="2" />
      <text x={660} y={264} fontFamily={mono} fontSize="15" fill={ILL.text}>shown at 320 px</text>
      <text x={660} y={296} fontFamily={display} fontSize="22" fill={ILL.accent}>11,582 bytes served</text>
    </svg>
  );
}

/* ---- the domain piece: a search for the name, old result out, new in --- */

export function DomainMoveScene({ id, className, preserveAspectRatio, viewBox = "0 0 1200 630" }: SceneProps) {
  const result = (y: number, host: string, title: string, state: "old" | "new" | "plain") => (
    <g>
      {state === "new" ? <rect x={196} y={y - 26} width={700} height={84} rx="6" fill={ILL.accentSoft} stroke={ILL.accent} /> : null}
      {state === "old" ? <rect x={196} y={y - 26} width={700} height={84} rx="6" fill={ILL.errorSoft} stroke={ILL.error} /> : null}
      <text x={220} y={y} fontFamily={mono} fontSize="13" fill={state === "new" ? ILL.accent : ILL.detail}>{host}</text>
      <text x={220} y={y + 30} fontFamily={text} fontSize="22" fill={ILL.text} opacity={state === "old" ? 0.6 : 1}>{title}</text>
      {state === "old" ? <line x1={216} y1={y + 22} x2={640} y2={y + 22} stroke={ILL.error} strokeWidth="2.5" /> : null}
    </g>
  );

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio={preserveAspectRatio} role="img" aria-label="A search for anthony ugwuja: the old teesmile.vercel.app result struck out, and anthonyugwuja.dev highlighted in its place.">
      <Defs id={id} lights={LIGHTS.domain} />
      <Backdrop id={id} lights={LIGHTS.domain} />
      <Window id={id} x={150} y={30} w={790} h={520}>
        <rect x={196} y={95} width={700} height={44} rx="22" fill="var(--surface)" stroke={ILL.edge} />
        <circle cx={226} cy={116} r="8" fill="none" stroke={ILL.detail} strokeWidth="2" />
        <path d="M232 122l7 7" stroke={ILL.detail} strokeWidth="2" />
        <text x={250} y={123} fontFamily={text} fontSize="18" fill={ILL.text}>anthony ugwuja</text>
        {result(190, "teesmile.vercel.app", "Anthony Ugwuja | Frontend Engineer", "old")}
        {result(290, "anthonyugwuja.dev", "Anthony Ugwuja - full-stack developer and AI evaluator", "new")}
        <rect x={220} y={390} width="420" height="12" rx="3" fill={ILL.shape} />
        <rect x={220} y={412} width="560" height="9" rx="3" fill={ILL.shape} opacity="0.6" />
      </Window>
      <text x={960} y={208} fontFamily={mono} fontSize="14" fill={ILL.error}>before</text>
      <text x={960} y={308} fontFamily={mono} fontSize="14" fill={ILL.accent}>a day later</text>
    </svg>
  );
}

export const scenes: Record<string, (props: SceneProps) => React.ReactElement> = {
  "building-a-renal-dose-check-benchmark": WardChartScene,
  "every-section-is-a-route": BrowserRoutesScene,
  "what-unoptimized-turns-off": PortraitBytesScene,
  "moving-to-a-custom-domain": DomainMoveScene,
};
