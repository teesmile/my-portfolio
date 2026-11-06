import { writing } from "@/config/writing";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Writing — Anthony Ugwuja";
export const size = shareImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return writing.map((entry) => ({ slug: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  return renderShareImage({
    title: entry?.title ?? "Writing",
    kicker: entry ? entry.topic : "Writing",
  });
}
