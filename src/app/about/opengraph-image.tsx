import { portfolioConfig } from "@/config/site";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = `About ${portfolioConfig.name}`;
export const size = shareImageSize;
export const contentType = "image/png";

/* The About page's own card: its heading, with the portrait, the same
   layout as the home card. The page passes this route to pageMetadata, which
   is what publishes it (see src/lib/metadata.ts on the shallow merge). */
export default async function OpengraphImage() {
  return renderShareImage({
    title: portfolioConfig.copy.aboutHeading,
    kicker: "About",
    portrait: true,
  });
}
