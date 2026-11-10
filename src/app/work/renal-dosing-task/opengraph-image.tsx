import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Renal dose check: a clinical AI-agent benchmark — Anthony Ugwuja";
export const size = shareImageSize;
export const contentType = "image/png";

/* The showcase's own card. It used to share the site's generic card, so the
   page most likely to be passed around for AI-evaluation work previewed as a
   headline about something else. */
export default async function Image() {
  return renderShareImage({
    title: "Renal dose check: a ward chart with ten ways to be wrong",
    kicker: "Clinical AI-agent benchmark",
  });
}
