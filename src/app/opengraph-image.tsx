import { portfolioConfig } from "@/config/site";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Anthony Ugwuja — frontend developer";
export const size = shareImageSize;
export const contentType = "image/png";

/* Uses the same renderer as writing entries and case studies, so every share
   card on the site is one file's worth of hand-copied palette rather than
   four — Satori renders outside the browser and cannot read @theme tokens. */
export default async function OpengraphImage() {
  return renderShareImage({
    title: portfolioConfig.statement,
    kicker: portfolioConfig.title,
  });
}
