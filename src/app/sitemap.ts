import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/config/site";
import { SITE_URL } from "@/config/site-url";
import { writing } from "@/config/writing";

/**
 * Every route, on the one address.
 *
 * The URLs are absolute and built from `SITE_URL`, not from the host the
 * request arrived on. That is the point: a sitemap fetched from any other
 * host still lists `anthonyugwuja.dev`, so it reinforces the canonical
 * instead of contradicting it.
 *
 * The dynamic sections are derived from the same config the pages render
 * from, so a new case study or article is in the sitemap the moment it
 * exists — a hand-written list is a list that goes stale.
 */
const STATIC_ROUTES = [
  "/",
  "/work",
  "/work/archive",
  "/writing",
  "/about",
  "/resume",
  "/contact",
];

/* The lab routes are instruments, not pages: a type specimen that counts its
   own rendered lines and a nav measurement harness. They keep their canonical
   tags — if either is ever linked, it should still name one address — but
   they carry `noindex` and stay out of the sitemap. /lab is here too, because
   the only thing it links to is the type specimen: an index whose entire
   contents are excluded has nothing public to offer a search result. */

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
    })),
    ...portfolioConfig.projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: now,
    })),
    ...writing.map((entry) => ({
      url: `${SITE_URL}/writing/${entry.slug}`,
      /* A piece's own date, because that is when it last changed in any way
         a reader would care about. */
      lastModified: new Date(entry.date),
    })),
  ];
}
