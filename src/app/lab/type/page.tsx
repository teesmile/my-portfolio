import type { Metadata } from "next";
import { Syne } from "next/font/google";
import { portfolioConfig } from "@/config/site";
import TypeMeasure from "./measure";

export const metadata: Metadata = {
  title: "Type specimen",
  description: "Choosing the hero statement by rule rather than by eye.",
};

const syne = Syne({ subsets: ["latin"] });

/* The typeface is settled (see docs/decisions.md); what changes now is the
   sentence. Candidates are listed in the order they should be preferred, and
   the rule picks the first that fits. */
const candidates = [
  {
    id: "pharmacist-engineer",
    text: "Pharmacist by training, engineer by choice. I ship across the stack and catch what AI gets wrong.",
  },
  {
    id: "build-with-ai",
    text: "I build with AI, and I'm paid to catch what it gets wrong.",
  },
  { id: "current", text: portfolioConfig.statement },
];

const leadings = [1.05];

const widths = [
  { id: "1280", label: "1280 viewport, full container", px: 1184, maxLines: 3, sizes: [56, 52, 48, 44, 40] },
  { id: "360", label: "360 viewport", px: 312, maxLines: 5, sizes: [28, 26, 24, 22, 20] },
];

export default function TypeLabPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-(--container-view)">
        <h1 className="text-xl text-ink">Hero statement specimen</h1>
        <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
          Ship the first candidate, in listed order, that fits three lines at
          1280 and five at 360, with leading between 0.95 and 1.05 and no
          mid-word breaks. The page measures itself.
        </p>

        <TypeMeasure />

        <div className="mt-12 flex flex-col gap-20">
          {candidates.map((candidate) => (
            <section key={candidate.id}>
              <h2 className="border-b border-line pb-3 text-lg text-ink">
                {candidate.id}
              </h2>

              {leadings.map((leading) => (
                <div key={leading} className="mt-8">
                  <p className="text-2xs text-muted">leading {leading}</p>
                  <div className="mt-4 flex flex-wrap gap-8">
                    {widths.map((width) => (
                      <div key={width.id} className="flex flex-col gap-4">
                        <p className="text-2xs text-muted">
                          {width.label} &middot; max {width.maxLines} lines
                        </p>
                        {width.sizes.map((size) =>
                          ["dark", "light"].map((theme) => (
                            <div
                              key={`${size}-${theme}`}
                              className={theme === "light" ? "light" : undefined}
                            >
                              <div
                                data-specimen
                                data-candidate={candidate.id}
                                data-leading={leading}
                                data-width={width.id}
                                data-size={size}
                                data-theme={theme}
                                data-max-lines={width.maxLines}
                                className="border border-line bg-surface p-5"
                                style={{ width: `${width.px + 40}px` }}
                              >
                                <p className="mb-2 font-mono text-2xs text-muted">
                                  {size}px / {theme}
                                </p>
                                <p
                                  data-text
                                  className={`${syne.className} text-ink`}
                                  style={{
                                    width: `${width.px}px`,
                                    fontSize: `${size}px`,
                                    lineHeight: leading,
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
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
