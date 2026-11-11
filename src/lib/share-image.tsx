import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/config/site";

export const shareImageSize = { width: 1200, height: 630 };

/* The strip along the bottom that stays empty on every card: X prints the
   page's domain over the bottom-left corner of a card's image, and it used
   to land on the byline. */
const CLEAR_BOTTOM = 120;

/**
 * One renderer for the typeset share cards (the home page, About and the
 * case studies), so they cannot drift apart visually. Writing pieces are
 * photographed from /share/[slug] instead and only fall back to this.
 *
 * Satori reads WOFF and TTF but not the WOFF2 next/font downloads, which is
 * why the font file is committed; it reads PNG but not WebP, which is why
 * the portrait is committed as one too (src/lib/share-portrait.png, the
 * About page's cutout at 500px).
 *
 * Layout: the kicker at the top, the title and byline in the middle, the
 * bottom strip clear. With `portrait`, the text keeps to the left two
 * thirds and the cutout stands in the right third, its shoulders running
 * off the bottom edge as they do in the hero.
 */
export async function renderShareImage({
  title,
  kicker,
  subtitle,
  portrait = false,
}: {
  title: string;
  kicker: string;
  /** A second, smaller line under the title. */
  subtitle?: string;
  portrait?: boolean;
}) {
  const [display, cutout] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/syne-700.woff")),
    portrait ? readFile(join(process.cwd(), "src/lib/share-portrait.png")) : null,
  ]);
  const portraitSrc = cutout ? `data:image/png;base64,${cutout.toString("base64")}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#121417",
          color: "#edeff2",
          fontFamily: "Syne",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: portrait ? "790px" : "100%",
            height: "100%",
            padding: `64px 0 ${CLEAR_BOTTOM}px 72px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: 24, color: "#9ba3ad" }}>
            <div style={{ display: "flex", width: "56px", height: "6px", backgroundColor: "#f0b429" }} />
            {kicker}
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, paddingRight: portrait ? "0px" : "72px" }}>
            <div style={{ display: "flex", fontSize: portrait ? 58 : 64, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: portrait ? "700px" : "1000px" }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: "flex", marginTop: "22px", fontSize: 28, lineHeight: 1.3, color: "#9ba3ad", maxWidth: "700px" }}>
                {subtitle}
              </div>
            ) : null}
            {/* The byline sits under the title, not along the bottom edge: a
                case study shared on its own still says who wrote it, and
                nothing of it falls in the strip X prints over. */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "36px", fontSize: 24, color: "#9ba3ad" }}>
              <div style={{ display: "flex", color: "#edeff2" }}>{portfolioConfig.name}</div>
              {kicker === portfolioConfig.title ? null : <div style={{ display: "flex" }}>{portfolioConfig.title}</div>}
            </div>
          </div>
        </div>

        {portraitSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element -- Satori markup, not the DOM */
          <img
            src={portraitSrc}
            width={400}
            height={402}
            alt=""
            style={{ position: "absolute", right: "56px", bottom: "0px", width: "400px", height: "402px" }}
          />
        ) : null}
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [{ name: "Syne", data: display, style: "normal", weight: 700 }],
    },
  );
}
