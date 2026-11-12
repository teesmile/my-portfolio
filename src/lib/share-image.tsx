import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/config/site";

export const shareImageSize = { width: 1200, height: 630 };

/* The strip along the bottom that stays empty on every card: X prints the
   page's domain over the bottom-left corner of a card's image, and it used
   to land on the byline. */
const CLEAR_BOTTOM = 120;

/* The card's palette: the site's dark surface, ink and muted, and the
   accent. Satori renders outside the browser and cannot read @theme
   tokens, so these are the one hand-copied set (globals.css). */
const SURFACE = "#141312";
const INK = "#edeff2";
const MUTED = "#9ba3ad";
const ACCENT = "#f0b429";

/* Visuals a card can carry on its right. Each is a PNG committed next to
   this file (Satori reads PNG, not WebP), with the size it is drawn at. */
const VISUALS = {
  /* The About cutout at 500px: head and shoulders, the shoulders running
     off the bottom edge as they do in the hero. */
  portrait: { file: "share-portrait.png", width: 400, height: 402, right: 56, bottom: 0 },
  /* The ballot site's home page on a phone, in a simple frame, standing on
     the bottom edge. */
  "ballot-phone": { file: "share-ballot-phone.png", width: 380, height: 735, right: 72, bottom: -200 },
} as const;

export type ShareVisual = keyof typeof VISUALS;

/**
 * One renderer for the typeset share cards (the home page, About and the
 * case studies), so they cannot drift apart visually. Writing pieces are
 * photographed from /share/[slug] instead and only fall back to this.
 *
 * Satori reads WOFF and TTF but not the WOFF2 next/font downloads, which is
 * why the font file is committed.
 *
 * Layout: a round accent dot and the kicker at the top, the title and
 * byline in the middle, the bottom strip clear. With a visual, the text
 * keeps to the left two thirds and the visual stands in the right third.
 */
export async function renderShareImage({
  title,
  kicker,
  subtitle,
  visual,
  titleSize,
}: {
  title: string;
  kicker: string;
  /** A second, smaller line under the title. */
  subtitle?: string;
  visual?: ShareVisual;
  /** The title's font size; the default suits two or three lines. */
  titleSize?: number;
}) {
  const art = visual ? VISUALS[visual] : null;
  const [display, image] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/syne-700.woff")),
    art ? readFile(join(process.cwd(), "src/lib", art.file)) : null,
  ]);
  const imageSrc = image ? `data:image/png;base64,${image.toString("base64")}` : null;
  const size = titleSize ?? (art ? 58 : 64);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: SURFACE,
          color: INK,
          fontFamily: "Syne",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: art ? "760px" : "100%",
            height: "100%",
            padding: `64px 0 ${CLEAR_BOTTOM}px 72px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 24, color: MUTED }}>
            <div style={{ display: "flex", width: "16px", height: "16px", borderRadius: "8px", backgroundColor: ACCENT }} />
            {kicker}
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, paddingRight: art ? "0px" : "72px" }}>
            <div style={{ display: "flex", fontSize: size, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: art ? "688px" : "1000px" }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: "flex", marginTop: "22px", fontSize: 28, lineHeight: 1.3, color: MUTED, maxWidth: "688px" }}>
                {subtitle}
              </div>
            ) : null}
            {/* The byline sits under the title, not along the bottom edge: a
                case study shared on its own still says who wrote it, and
                nothing of it falls in the strip X prints over. */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "36px", fontSize: 24, color: MUTED }}>
              <div style={{ display: "flex", color: INK }}>{portfolioConfig.name}</div>
              {kicker === portfolioConfig.title ? null : <div style={{ display: "flex" }}>{portfolioConfig.title}</div>}
            </div>
          </div>
        </div>

        {imageSrc && art ? (
          /* eslint-disable-next-line @next/next/no-img-element -- Satori markup, not the DOM */
          <img
            src={imageSrc}
            width={art.width}
            height={art.height}
            alt=""
            style={{ position: "absolute", right: `${art.right}px`, bottom: `${art.bottom}px`, width: `${art.width}px`, height: `${art.height}px` }}
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
