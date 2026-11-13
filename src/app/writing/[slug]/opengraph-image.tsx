import { readFile } from "node:fs/promises";
import path from "node:path";
import { writing } from "@/config/writing";
import { lighten, renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Writing - Anthony Ugwuja";
export const size = shareImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return writing.map((entry) => ({ slug: entry.slug }));
}

/**
 * The piece's scene and title, photographed at 1200×630 by `pnpm share`
 * from /share/[slug] and committed to public/share. Read at build time, so
 * the route is a static PNG, quantised the same way as the typeset cards.
 * If a capture is missing - a new piece before `pnpm share` has run - it
 * falls back to the typeset title card.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = writing.find((item) => item.slug === slug);

  try {
    return lighten(await readFile(path.join(process.cwd(), "public", "share", `${slug}.png`)));
  } catch {
    return renderShareImage({
      title: entry?.title ?? "Writing",
      kicker: entry ? entry.topic : "Writing",
    });
  }
}
