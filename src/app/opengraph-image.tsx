import { portfolioConfig } from "@/config/site";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = portfolioConfig.seo.title;
export const size = shareImageSize;
export const contentType = "image/png";

/* Uses the same renderer as the case studies, so every share card on the
   site is one file's worth of hand-copied palette rather than four: Satori
   renders outside the browser and cannot read @theme tokens. The headline
   and the line under it, with the portrait on the right. */
export default async function OpengraphImage() {
  return renderShareImage({
    title: portfolioConfig.headline,
    subtitle: portfolioConfig.monoLine,
    kicker: portfolioConfig.title,
    portrait: true,
  });
}
