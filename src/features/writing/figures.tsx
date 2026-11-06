/* Inline diagrams, drawn from the tokens, placed where the text explains the
   thing rather than collected at the top. Each one shows a mechanism: what
   goes in, what comes out, and where the problem is. */

const label = { fontSize: 8, fill: "var(--muted)" } as const;
const strong = { fontSize: 8, fill: "var(--ink)" } as const;

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

function AnchorsVsRoutes() {
  return (
    <Frame
      viewBox="0 0 420 120"
      title="One page with anchor jumps against six separate routes"
      caption="An anchor moves the scroll position. A route changes what the page is."
    >
      <rect x="8" y="10" width="70" height="100" fill="none" stroke="var(--line)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="14" y={16 + i * 16} width="58" height="11" fill="var(--muted)" opacity="0.3" />
      ))}
      <path d="M86 32c14 0 14 48 0 48" stroke="var(--accent)" fill="none" strokeDasharray="3 3" />
      <text x="92" y="30" {...label}>#about</text>
      <text x="92" y="86" {...label}>scrolls, same document</text>
      <text x="43" y="118" textAnchor="middle" {...label}>one page</text>

      <path d="M200 60h26m0 0-6-4m6 4-6 4" stroke="var(--ink)" fill="none" />

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const column = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g key={i}>
            <rect
              x={240 + column * 58}
              y={14 + row * 52}
              width="50"
              height="44"
              fill="none"
              stroke={i === 1 ? "var(--accent)" : "var(--line)"}
            />
            <rect x={246 + column * 58} y={20 + row * 52} width="26" height="4" fill="var(--muted)" opacity="0.5" />
          </g>
        );
      })}
      <text x="325" y="118" textAnchor="middle" {...label}>six routes, six titles</text>
    </Frame>
  );
}

function StateSource() {
  return (
    <Frame
      viewBox="0 0 420 118"
      title="Active state derived from scroll position against active state derived from the path"
      caption="Scroll position is a guess that needs maintaining. The path is already the answer."
    >
      <text x="8" y="16" {...label}>from scroll position</text>
      <rect x="8" y="24" width="180" height="30" fill="none" stroke="var(--line)" />
      <text x="16" y="43" {...label}>scrollY → compare offsets → guess</text>
      <text x="8" y="70" {...label}>deep link</text>
      <text x="70" y="70" {...strong}>wrong</text>
      <text x="8" y="84" {...label}>reload</text>
      <text x="70" y="84" {...strong}>wrong</text>
      <text x="8" y="98" {...label}>back button</text>
      <text x="70" y="98" {...strong}>wrong</text>

      <text x="232" y="16" {...label}>from the path</text>
      <rect x="232" y="24" width="180" height="30" fill="none" stroke="var(--accent)" />
      <text x="240" y="43" {...label}>usePathname() === href</text>
      <text x="232" y="70" {...label}>deep link</text>
      <text x="300" y="70" {...strong}>right</text>
      <text x="232" y="84" {...label}>reload</text>
      <text x="300" y="84" {...strong}>right</text>
      <text x="232" y="98" {...label}>back button</text>
      <text x="300" y="98" {...strong}>right</text>
    </Frame>
  );
}

function CutVsContinuous() {
  return (
    <Frame
      viewBox="0 0 420 100"
      title="A hard cut between routes against a continuous transition"
      caption="The same navigation, with and without a transition to carry it."
    >
      <rect x="8" y="20" width="80" height="54" fill="none" stroke="var(--line)" />
      <rect x="120" y="20" width="80" height="54" fill="none" stroke="var(--line)" />
      <path d="M96 47h16m0 0-5-4m5 4-5 4" stroke="var(--ink)" fill="none" />
      <text x="104" y="88" textAnchor="middle" {...label}>cut</text>

      <rect x="232" y="20" width="80" height="54" fill="none" stroke="var(--line)" />
      <rect x="332" y="20" width="80" height="54" fill="none" stroke="var(--accent)" />
      <path d="M314 47h14m0 0-5-4m5 4-5 4" stroke="var(--accent)" fill="none" />
      <rect x="296" y="32" width="40" height="30" fill="var(--accent)" opacity="0.18" />
      <text x="322" y="88" textAnchor="middle" {...label}>carried across</text>
    </Frame>
  );
}

function OversizedBox() {
  return (
    <Frame
      viewBox="0 0 420 150"
      title="A 1254 pixel image displayed in a 320 pixel box"
      caption="Everything outside the small square was downloaded and then thrown away."
    >
      <rect x="8" y="8" width="130" height="130" fill="var(--muted)" opacity="0.18" stroke="var(--line)" />
      <text x="73" y="76" textAnchor="middle" {...label}>1254 px</text>
      <rect x="170" y="75" width="33" height="33" fill="none" stroke="var(--accent)" />
      <text x="186" y="120" textAnchor="middle" {...label}>320 px</text>
      <text x="230" y="60" {...label}>sent: 2,507,195 bytes</text>
      <text x="230" y="76" {...strong}>shown: a 320 px circle</text>
      <text x="230" y="92" {...label}>16 bits per channel, opaque alpha</text>
    </Frame>
  );
}

function OptimizerBypass() {
  return (
    <Frame
      viewBox="0 0 420 110"
      title="The image pipeline with the optimizer skipped"
      caption="`unoptimized` removes the step. `quality` configures the step that no longer runs."
    >
      {[
        { x: 8, text: "source" },
        { x: 118, text: "optimizer" },
        { x: 228, text: "srcset" },
        { x: 338, text: "browser" },
      ].map((box) => (
        <g key={box.text}>
          <rect
            x={box.x}
            y="34"
            width="74"
            height="30"
            fill="none"
            stroke={box.text === "optimizer" ? "var(--accent)" : "var(--line)"}
            strokeDasharray={box.text === "optimizer" ? "4 3" : undefined}
          />
          <text x={box.x + 37} y="53" textAnchor="middle" {...label}>{box.text}</text>
        </g>
      ))}
      <path d="M84 49h30m0 0-5-4m5 4-5 4" stroke="var(--line)" fill="none" />
      <path d="M194 49h30m0 0-5-4m5 4-5 4" stroke="var(--line)" fill="none" />
      <path d="M304 49h30m0 0-5-4m5 4-5 4" stroke="var(--line)" fill="none" />
      <path d="M45 30C45 8 375 8 375 30" stroke="var(--accent)" fill="none" />
      <text x="210" y="14" textAnchor="middle" {...strong}>unoptimized: straight through, untouched</text>
      <text x="155" y="78" {...label}>quality={"{100}"} configures this box</text>
      <text x="155" y="92" {...strong}>which never runs</text>
    </Frame>
  );
}

function SrcsetPick() {
  return (
    <Frame
      viewBox="0 0 420 120"
      title="How sizes decides which srcset candidate the browser downloads"
      caption="The browser picks before it has your CSS. `sizes` is the only thing it can believe."
    >
      <text x="8" y="16" {...label}>candidates</text>
      {[32, 64, 128, 256, 384, 640, 828, 1080].map((width, index) => (
        <g key={width}>
          <rect
            x={8 + index * 50}
            y="26"
            width="44"
            height="22"
            fill="none"
            stroke={width === 640 ? "var(--accent)" : "var(--line)"}
          />
          <text x={30 + index * 50} y="41" textAnchor="middle" {...(width === 640 ? strong : label)}>
            {width}
          </text>
        </g>
      ))}
      <path d="M280 56v12h-30" stroke="var(--accent)" fill="none" />
      <text x="8" y="78" {...label}>sizes=&quot;320px&quot; + 2x screen</text>
      <text x="8" y="96" {...strong}>→ downloads the 640 candidate</text>
      <text x="8" y="112" {...label}>a copied responsive value describes a layout you do not have</text>
    </Frame>
  );
}

const figures: Record<string, () => React.ReactElement> = {
  "anchors-vs-routes": AnchorsVsRoutes,
  "state-source": StateSource,
  "cut-vs-continuous": CutVsContinuous,
  "oversized-box": OversizedBox,
  "optimizer-bypass": OptimizerBypass,
  "srcset-pick": SrcsetPick,
};

export default function Figure({ name }: { name?: string }) {
  if (!name) return null;
  const Drawing = figures[name];
  return Drawing ? <Drawing /> : null;
}
