import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import HeroPreview, { type HeroVariant } from "@/features/landing/hero-preview/hero-preview";

type Params = { params: Promise<{ variant: string }> };

const VARIANTS: HeroVariant[] = ["a", "b", "c"];

/* Three fixed pages, nothing else. Unlisted: not in the nav, the sitemap or
   any link outside these pages, and noindex. Delete this route once a
   variant replaces the live hero. */
export const dynamicParams = false;

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { variant } = await params;
  return pageMetadata({
    title: `Hero preview ${variant.toUpperCase()}`,
    description: "An unlisted design preview of the home page hero.",
    path: `/preview/hero/${variant}`,
    noindex: true,
  });
}

export default async function HeroPreviewPage({ params }: Params) {
  const { variant } = await params;
  if (!VARIANTS.includes(variant as HeroVariant)) notFound();
  return <HeroPreview variant={variant as HeroVariant} />;
}
