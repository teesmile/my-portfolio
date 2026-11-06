import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/config/site";

export const shareImageSize = { width: 1200, height: 630 };

/**
 * One renderer for every per-page share card, so a writing entry and a case
 * study cannot drift apart visually. Satori reads WOFF and TTF but not the
 * WOFF2 next/font downloads, which is why the font file is committed.
 */
export async function renderShareImage({
  title,
  kicker,
}: {
  title: string;
  kicker: string;
}) {
  const display = await readFile(
    join(process.cwd(), "src/app/fonts/syne-700.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0c0d0f",
          color: "#edeff2",
          padding: "80px",
          fontFamily: "Syne",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: 24, color: "#9ba3ad" }}>
          <div style={{ display: "flex", width: "56px", height: "6px", backgroundColor: "#f0b429" }} />
          {kicker}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: "960px" }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#9ba3ad" }}>
          {portfolioConfig.name}
        </div>
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [{ name: "Syne", data: display, style: "normal", weight: 700 }],
    },
  );
}
