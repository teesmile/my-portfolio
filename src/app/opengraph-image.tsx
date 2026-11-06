import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/config/site";

export const alt = "Anthony Ugwuja — frontend developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Built from the same palette and display face as the site, so it cannot drift
   away from the design the way a hand-exported PNG does. Satori reads WOFF and
   TTF but not the WOFF2 that next/font downloads, which is why this font file
   is committed separately. */
export default async function OpengraphImage() {
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
        <div style={{ display: "flex", width: "72px", height: "6px", backgroundColor: "#f0b429" }} />
        <div style={{ display: "flex", fontSize: 56, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: "900px" }}>
          {portfolioConfig.statement}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9ba3ad" }}>
          <span>{portfolioConfig.name}</span>
          <span>{portfolioConfig.location}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Syne", data: display, style: "normal", weight: 700 },
      ],
    },
  );
}
