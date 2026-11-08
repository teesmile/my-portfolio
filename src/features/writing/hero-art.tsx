/* A banner per piece, drawn from the tokens and from the same idea as that
   piece's rail illustration — the rail version summarises, this one sets the
   scene. SVG rather than an image: it costs nothing to load, scales to any
   hero size, and follows the theme without a second file. */

function RoutesBanner() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="One long page redrawn as six separate routes">
      <rect width="1200" height="420" fill="var(--raised)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="90" y={40 + i * 56} width="300" height="36" fill="var(--muted)" opacity="0.18" />
      ))}
      <path d="M440 210h70m0 0-14-10m14 10-14 10" stroke="var(--accent)" fill="none" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <rect
            key={i}
            x={580 + col * 190}
            y={60 + row * 160}
            width="160"
            height="130"
            fill="none"
            stroke={i === 0 ? 'var(--accent)' : 'var(--line)'}
            strokeWidth="2"
          />
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
      <rect x="120" y="45" width="330" height="330" fill="var(--accent)" opacity="0.18" stroke="var(--accent)" strokeWidth="2" />
      <rect x="620" y="352" width="23" height="23" fill="var(--ink)" />
      <path d="M620 340v-26h70" stroke="var(--line)" fill="none" strokeWidth="2" />
      <text x="620" y="300" fontSize="20" fill="var(--muted)">the same image, 11,582 bytes</text>
      <text x="285" y="220" textAnchor="middle" fontSize="22" fill="var(--ink)">2,507,195 bytes</text>
    </svg>
  );
}

function ChartBanner() {
  /* A ward chart as rows of hairlines, one cell underlined the way the hero
     underlines its own flag: the whole piece is about that one cell. */
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Rows of a ward chart with one creatinine unit underlined">
      <rect width="1200" height="420" fill="var(--raised)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <line x1="90" y1={70 + i * 46} x2="1110" y2={70 + i * 46} stroke="var(--line)" strokeWidth="2" />
          {[0, 1, 2, 3].map((c) => (
            <rect key={c} x={110 + c * 250} y={84 + i * 46} width={c === 2 && i === 3 ? 120 : 90 + ((i + c) % 3) * 30} height="12" fill="var(--muted)" opacity={c === 2 && i === 3 ? 0.6 : 0.18} />
          ))}
        </g>
      ))}
      <path d="M610 222q10 -7 20 0t20 0t20 0t20 0t20 0t20 0" stroke="var(--warn)" strokeWidth="3" fill="none" />
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
