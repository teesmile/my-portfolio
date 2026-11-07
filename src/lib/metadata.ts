import type { Metadata } from "next";

/**
 * Next merges metadata shallowly: a route that sets only `title` and
 * `description` keeps the root's `openGraph` block untouched, so every article
 * and case study was publishing the homepage's og:title and og:url. This
 * builds the social fields per route from the same two strings.
 *
 * It is also where every route's canonical URL comes from. `path` is relative
 * and Next resolves it against `metadataBase`, so a canonical can never name
 * a host other than the one address this site has. The root layout
 * deliberately sets no canonical: metadata is inherited, so a canonical on the
 * layout would silently become every page's canonical the moment a route
 * forgot its own. No canonical is a weak signal; the wrong canonical tells a
 * crawler to drop the page.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  /** "article" for a case study or a piece of writing; a section index is not one. */
  type?: "website" | "article";
  /**
   * Keep the page out of search results while leaving it reachable.
   *
   * `follow` stays true: the page should not be indexed, but the links on it
   * are still worth crawling. The canonical stays too — if the page is ever
   * linked from elsewhere, it should still say which address it lives at.
   */
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type },
    twitter: { card: "summary_large_image", title, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
