/* One drawing per piece, built from the site's own tokens. These are content,
   not chrome, so they may use colour — and each one draws the actual idea
   rather than decorating the page. */

function OneLongPage() {
  return (
    <svg viewBox="0 0 220 120" className="w-full" role="img" aria-label="One scrolling page of six sections, redrawn as six separate routes">
      {/* the old shape: one tall column of stacked sections */}
      <rect x="6" y="6" width="54" height="108" fill="none" stroke="var(--line)" />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <rect key={index} x="12" y={12 + index * 17} width="42" height="12" fill="var(--muted)" opacity="0.35" />
      ))}
      <text x="33" y="118" textAnchor="middle" fontSize="7" fill="var(--muted)">one page</text>

      <path d="M70 60h22m0 0-5-4m5 4-5 4" stroke="var(--accent)" fill="none" strokeWidth="1.5" />

      {/* the new shape: six framed views, each its own route */}
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const column = index % 3;
        const row = Math.floor(index / 3);
        return (
          <rect
            key={index}
            x={104 + column * 38}
            y={16 + row * 44}
            width="32"
            height="36"
            fill="none"
            stroke={index === 0 ? 'var(--accent)' : 'var(--line)'}
          />
        );
      })}
      <text x="161" y="118" textAnchor="middle" fontSize="7" fill="var(--muted)">six routes</text>
    </svg>
  );
}

function BytesToScale() {
  /* The squares are area-accurate: 2,507,195 / 11,582 is 216x, so the side
     ratio is the square root of that, about 14.7. */
  return (
    <svg viewBox="0 0 220 150" className="w-full" role="img" aria-label="The old image at 2.4 MB drawn to scale beside the 11.6 KB replacement">
      <rect x="6" y="6" width="132" height="132" fill="var(--accent)" opacity="0.25" stroke="var(--accent)" />
      <text x="72" y="76" textAnchor="middle" fontSize="9" fill="var(--ink)">2,507,195 B</text>

      <rect x="150" y="129" width="9" height="9" fill="var(--ink)" />
      <text x="166" y="138" fontSize="7" fill="var(--muted)">11,582 B</text>
      <path d="M150 124V112h20" stroke="var(--line)" fill="none" />
      <text x="150" y="106" fontSize="7" fill="var(--muted)">same image</text>
    </svg>
  );
}

/* The benchmark in one drawing: a chart row goes in, two readings come out,
   and the test keeps only the right one. */
function ChartToVerdict() {
  return (
    <svg viewBox="0 0 220 120" className="w-full" role="img" aria-label="A chart row read two ways; the test passes one reading and fails the other">
      <rect x="6" y="46" width="62" height="26" fill="none" stroke="var(--line)" />
      <text x="12" y="62" fontSize="7" fill="var(--ink)" fontFamily="var(--font-mono)">150 µmol/L</text>
      <path d="M68 59c20 0 20-30 40-30M68 59c20 0 20 30 40 30" stroke="var(--line)" fill="none" />
      <text x="112" y="32" fontSize="7" fill="var(--ink)">CrCl 32.5</text>
      <text x="112" y="92" fontSize="7" fill="var(--warn)">CrCl 0.4</text>
      <path d="M156 29h16M156 89h16" stroke="var(--line)" />
      <rect x="176" y="20" width="38" height="16" fill="none" stroke="var(--accent)" />
      <text x="195" y="31" textAnchor="middle" fontSize="7" fill="var(--ink)">pass</text>
      <rect x="176" y="80" width="38" height="16" fill="none" stroke="var(--line)" />
      <text x="195" y="91" textAnchor="middle" fontSize="7" fill="var(--muted)">fail</text>
      <text x="110" y="116" textAnchor="middle" fontSize="7" fill="var(--muted)">same row, two readings, one verdict</text>
    </svg>
  );
}

const drawings: Record<string, () => React.ReactElement> = {
  "building-a-renal-dose-check-benchmark": ChartToVerdict,
  "every-section-is-a-route": OneLongPage,
  "what-unoptimized-turns-off": BytesToScale,
};

export default function Illustration({ slug }: { slug: string }) {
  const Drawing = drawings[slug];

  if (!Drawing) {
    return null;
  }

  return (
    <figure className="mt-8 border-t border-line pt-5">
      <Drawing />
    </figure>
  );
}
