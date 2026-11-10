import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/config/site";
import { SITE_URL } from "@/config/site-url";
import { published } from "@/config/writing";
import { renalTraps } from "@/content/renal-dosing";

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
  "/work/renal-dosing-task",
  "/writing",
  "/about",
  "/resume",
  "/contact",
] as const;

/* The lab routes are instruments, not pages: a type specimen that counts its
   own rendered lines and a nav measurement harness. They keep their canonical
   tags — if either is ever linked, it should still name one address — but
   they carry `noindex` and stay out of the sitemap. /lab is here too, because
   the only thing it links to is the type specimen: an index whose entire
   contents are excluded has nothing public to offer a search result. */

/* Real dates, not the build's. Every route used to carry the time of the
   deploy, which told a crawler that all 24 pages changed every time anything
   did, so the signal meant nothing. Each date now comes from the content it
   describes: a piece's own updated/published time, a case study's `updated`,
   the dated map in site.ts for the standalone pages and the renal pages, and
   for an index the newest date among what it lists. They are written in the
   data, not read from git at build time, because the deploy build cannot be
   relied on to have the repository's history. */
const newest = (...dates: string[]) => dates.reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a));

export default function sitemap(): MetadataRoute.Sitemap {
  const { projects, pagesUpdated } = portfolioConfig;
  const pieceDate = (entry: (typeof published)[number]) => entry.updated ?? entry.published;
  const writingDate = newest(...published.map(pieceDate));
  const workDate = newest(pagesUpdated.renal, ...projects.map((project) => project.updated));
  const lastmod: Record<(typeof STATIC_ROUTES)[number], string> = {
    "/": newest(workDate, writingDate),
    "/work": workDate,
    "/work/renal-dosing-task": pagesUpdated.renal,
    "/writing": writingDate,
    "/about": pagesUpdated.about,
    "/resume": pagesUpdated.resume,
    "/contact": pagesUpdated.contact,
  };

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: lastmod[path],
    })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: project.updated,
    })),
    ...renalTraps.map((trap) => ({
      url: `${SITE_URL}/work/renal-dosing-task/${trap.slug}`,
      lastModified: pagesUpdated.renal,
    })),
    /* Published pieces only: a draft is reachable by its URL for review and
       carries noindex, so listing it here would contradict itself. */
    ...published.map((entry) => ({
      url: `${SITE_URL}/writing/${entry.slug}`,
      lastModified: pieceDate(entry),
    })),
  ];
}
