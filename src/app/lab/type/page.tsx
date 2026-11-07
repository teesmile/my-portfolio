import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Syne, Martian_Mono } from "next/font/google";
import { portfolioConfig } from "@/config/site";
import TypeMeasure from "./measure";

export const metadata: Metadata = pageMetadata({
  title: "Type specimen",
  description:
    "Sizing the hero's two voices by rule rather than by eye.",
  path: "/lab/type",
  noindex: true,
});

const syne = Syne({ subsets: ["latin"] });
const martian = Martian_Mono({ subsets: ["latin"] });

/* The hero speaks twice now, and the two voices have different rules: the
   headline may wrap, the typed line should read as one thought. */
const candidates = [
  {
    id: "headline-syne",
    text: portfolioConfig.headline,
    className: syne.className,
    leading: 1.05,
    max: { "1280": 2, "360": 4 } as Record<string, number>,
    sizes: { "1280": [64, 56, 52, 48, 44], "360": [32, 30, 28, 26, 24] } as Record<string, number[]>,
  },
  {
    id: "mono-martian",
    text: portfolioConfig.monoLine,
    className: martian.className,
    leading: 1.6,
    max: { "1280": 1, "360": 3 } as Record<string, number>,
    sizes: { "1280": [20, 18, 16, 15, 14], "360": [14, 13, 12, 11, 10] } as Record<string, number[]>,
  },
];

const widths = [
  { id: "1280", label: "1280 viewport, full container", px: 1184 },
  { id: "360", label: "360 viewport", px: 312 },
];

export default function TypeLabPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-(--container-view)">
        <h1 className="text-xl text-ink">Hero type specimen</h1>
        <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
          Ship the largest size that fits the line budget at both widths, in
          both themes, with no mid-word breaks. The page measures itself.
        </p>

        <TypeMeasure />

        <div className="mt-12 flex flex-col gap-20">
          {candidates.map((candidate) => (
            <section key={candidate.id}>
              <h2 className="border-b border-line pb-3 text-lg text-ink">
                {candidate.id} &middot; leading {candidate.leading}
              </h2>

              <div className="mt-6 flex flex-wrap gap-8">
                {widths.map((width) => (
                  <div key={width.id} className="flex flex-col gap-4">
                    <p className="text-2xs text-muted">
                      {width.label} &middot; max {candidate.max[width.id]} lines
                    </p>

                    {candidate.sizes[width.id].map((size) =>
                      ["dark", "light"].map((theme) => (
                        <div
                          key={`${size}-${theme}`}
                          className={theme === "light" ? "light" : undefined}
                        >
                          <div
                            data-specimen
                            data-candidate={candidate.id}
                            data-leading={candidate.leading}
                            data-width={width.id}
                            data-size={size}
                            data-theme={theme}
                            data-max-lines={candidate.max[width.id]}
                            className="border border-line bg-surface p-5"
                            style={{ width: `${width.px + 40}px` }}
                          >
                            <p className="mb-2 font-mono text-2xs text-muted">
                              {size}px / {theme}
                            </p>
                            <p
                              data-text
                              className={`${candidate.className} text-ink`}
                              style={{
                                width: `${width.px}px`,
                                fontSize: `${size}px`,
                                lineHeight: candidate.leading,
                                fontWeight: 700,
                                hyphens: "none",
                                overflowWrap: "normal",
                              }}
                            >
                              {candidate.text}
                            </p>
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
