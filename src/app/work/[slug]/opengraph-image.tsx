import { portfolioConfig } from "@/config/site";
import { renderShareImage, shareImageSize, type ShareVisual } from "@/lib/share-image";

/* A case study with something to show on the right of its card. */
const VISUAL_BY_SLUG: Record<string, ShareVisual> = {
  "whos-on-my-ballot": "ballot-phone",
};

export const alt = "Work - Anthony Ugwuja";
export const size = shareImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return portfolioConfig.projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = portfolioConfig.projects.find((item) => item.slug === slug);

  return renderShareImage({
    title: project?.title ?? "Work",
    kicker: project ? `${project.year} · ${project.role}` : "Work",
    visual: project ? VISUAL_BY_SLUG[project.slug] : undefined,
  });
}
