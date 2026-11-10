import type { Metadata } from "next";
import { portfolioConfig } from "@/config/site";

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
 *
 * Two more things the shallow merge costs, and this restores:
 *
 * - The share image. The root's `opengraph-image` reaches a child route only
 *   through the root's `openGraph` block, which the child's block replaces,
 *   so /about, /work and the rest were shared with no image at all. A route
 *   that generates its own card (a case study, an article) passes `image`,
 *   because once `images` is set here it is what Next publishes, ahead of
 *   the segment's own `opengraph-image` file.
 * - The name. The `%s — Anthony Ugwuja` template applies to `<title>` only,
 *   so a shared /about card was titled just "About".
 */
export function pageMetadata({
  title,
  fullTitle,
  description,
  path,
  type = "website",
  noindex = false,
  image = "/opengraph-image",
  article,
}: {
  title: string;
  /**
   * The whole <title>, bypassing the layout's "%s — Anthony Ugwuja"
   * template: for a title that already leads with the name, or one that
   * should spend its 60 characters on the subject instead. Also the share
   * title.
   */
  fullTitle?: string;
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
  /** The share card. Defaults to the site's; routes with their own pass it. */
  image?: string;
  /**
   * For a piece of writing: who wrote it and when it went out. Becomes
   * <meta name="author">, <link rel="author">, article:author and
   * article:published_time. Without it LinkedIn reports "No author found".
   */
  article?: { publishedTime: string; modifiedTime?: string; author: { name: string; url: string } };
}): Metadata {
  const shareTitle = fullTitle ?? `${title} — ${portfolioConfig.name}`;
  const images = [image];

  return {
    title: fullTitle ? { absolute: fullTitle } : title,
    description,
    alternates: { canonical: path },
    ...(article ? { authors: [article.author] } : {}),
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      type,
      images,
      ...(article && type === "article"
        ? {
            publishedTime: article.publishedTime,
            ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
            authors: [article.author.url],
          }
        : {}),
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
