/* A banner per piece, drawn from the tokens and from the same idea as that
   piece's rail illustration — the rail version summarises, this one sets the
   scene. SVG rather than an image: it costs nothing to load, scales to any
   hero size, and follows the theme without a second file. */

import { ILL } from "@/lib/illustration";

function RoutesBanner() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="One long page redrawn as six separate routes">
      <rect width="1200" height="420" fill="var(--raised)" />
      <rect x="70" y="24" width="340" height="356" fill={ILL.panel} stroke={ILL.edge} strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="90" y={40 + i * 56} width="300" height="36" fill={ILL.shape} />
      ))}
      <path d="M440 210h70m0 0-14-10m14 10-14 10" stroke={ILL.accent} fill="none" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const lit = i === 0;
        return (
          <g key={i}>
            <rect
              x={580 + col * 190}
              y={60 + row * 160}
              width="160"
              height="130"
              fill={lit ? ILL.accentSoft : ILL.panel}
              stroke={lit ? ILL.accent : ILL.edge}
              strokeWidth="2"
            />
            <rect x={600 + col * 190} y={80 + row * 160} width="80" height="12" fill={lit ? ILL.accentFill : ILL.shape} />
          </g>
        );
      })}
    </svg>
  );
}

function BytesBanner() {
  /* Area-accurate: 2,507,195 / 11,582 is 216x, so the side ratio is ~14.7. */
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="A 2.4 MB image drawn to scale beside its 11.6 KB replacement">
      <rect width="1200" height="420" fill="var(--raised)" />
      <rect x="120" y="45" width="330" height="330" fill={ILL.errorSoft} stroke={ILL.error} strokeWidth="2" />
      <rect x="620" y="352" width="23" height="23" fill={ILL.accentFill} stroke={ILL.accent} strokeWidth="2" />
      <path d="M620 340v-26h70" stroke={ILL.edge} fill="none" strokeWidth="2" />
      <text x="620" y="300" fontSize="20" fill={ILL.accent}>the same image, 11,582 bytes</text>
      <text x="285" y="220" textAnchor="middle" fontSize="22" fill={ILL.error}>2,507,195 bytes</text>
    </svg>
  );
}

function ChartBanner() {
  /* A ward chart as a filled panel of rows, one cell marked the way the hero
     marks its own flag: the whole piece is about that one cell. */
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Rows of a ward chart with one creatinine unit marked as misread">
      <rect width="1200" height="420" fill="var(--raised)" />
      <rect x="70" y="40" width="1060" height="340" fill={ILL.panel} stroke={ILL.edge} strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <line x1="90" y1={70 + i * 46} x2="1110" y2={70 + i * 46} stroke={ILL.edge} strokeWidth="1.5" />
          {[0, 1, 2, 3].map((c) => {
            const misread = c === 2 && i === 3;
            return misread ? (
              <rect key={c} x={598} y={74 + i * 46} width="144" height="32" fill={ILL.errorSoft} stroke={ILL.error} strokeWidth="2" />
            ) : (
              <rect key={c} x={110 + c * 250} y={84 + i * 46} width={90 + ((i + c) % 3) * 30} height="12" fill={ILL.shape} />
            );
          })}
        </g>
      ))}
      <rect x={610} y={84 + 3 * 46} width="120" height="12" fill={ILL.error} />
      <path d="M610 222q10 -7 20 0t20 0t20 0t20 0t20 0t20 0" stroke={ILL.error} strokeWidth="3" fill="none" />
    </svg>
  );
}

const art: Record<string, () => React.ReactElement> = {
  "building-a-renal-dose-check-benchmark": ChartBanner,
  'every-section-is-a-route': RoutesBanner,
  'what-unoptimized-turns-off': BytesBanner,
};

export default function HeroArt({ slug }: { slug: string }) {
  const Drawing = art[slug];
  return Drawing ? <Drawing /> : <div className="h-full w-full bg-raised" />;
}
