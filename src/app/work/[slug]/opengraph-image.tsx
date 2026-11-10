import { portfolioConfig } from "@/config/site";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

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
  });
}
