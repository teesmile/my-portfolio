import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site-url";

/**
 * Crawlable in production, closed everywhere else.
 *
 * Every preview deployment serves a complete copy of the site on its own
 * `.vercel.app` host. That is how `teesmile.vercel.app` came to outrank the
 * real domain in the first place: duplicate HTML on a host nobody told the
 * crawler to ignore. A preview build ships `Disallow: /` so it can never
 * compete with the pages it is a draft of.
 *
 * `VERCEL_ENV` is read at build time, which is the right time: each
 * deployment bakes in the answer for what it is — "production", "preview" or
 * "development" — and a local build, where the variable is absent, is
 * treated as not-production and stays closed.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
