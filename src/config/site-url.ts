/**
 * The one address this site has.
 *
 * Kept in its own module because `next.config.ts` imports it too, and that
 * file cannot reach the `@/` alias. Everything that needs to name the site —
 * the redirects, `metadataBase`, the canonical tags, the sitemap, robots.txt
 * and the structured data — reads it from here, so there is one place to
 * change it and no second copy to drift.
 *
 * No `www`, no trailing slash: a canonical URL has to match the address that
 * actually serves a 200, character for character.
 */
export const SITE_URL = "https://anthonyugwuja.dev";

/**
 * Production hosts that used to serve this site and now redirect to it.
 *
 * Google indexed `teesmile.vercel.app` and chose it as the canonical, because
 * three hosts served identical HTML and none of them said which one was the
 * original. A 308 from the old hosts is the part of that fix a crawler cannot
 * argue with; the canonical tag is the part that tells it which address to
 * keep.
 *
 * Exact hosts only. Preview deployments live on `teesmile-git-<branch>.
 * vercel.app` and must keep serving their own content — a preview that
 * redirected to production would be useless for reviewing a branch.
 */
export const LEGACY_HOSTS = ["teesmile.vercel.app", "teesmilex.vercel.app"];
