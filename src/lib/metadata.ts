import type { Metadata } from "next";

/**
 * Next merges metadata shallowly: a route that sets only `title` and
 * `description` keeps the root's `openGraph` block untouched, so every article
 * and case study was publishing the homepage's og:title and og:url. This
 * builds the social fields per route from the same two strings.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}
