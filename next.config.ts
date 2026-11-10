import type { NextConfig } from "next";

import { LEGACY_HOSTS, SITE_URL } from "./src/config/site-url";

const nextConfig: NextConfig = {
  // Stable in Next 16: a <Link href> to a route that does not exist is a type
  // error, so Phase 1/2/3 cannot ship a dead link to /work/[slug] by accident.
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  /**
   * One address, permanently.
   *
   * `has: [{ type: "host" }]` is matched as `new RegExp(`^${value}$`)` against
   * the lowercased hostname with the port stripped, so the dots are escaped:
   * an unescaped `.` matches any character, and `teesmile.vercel.app` would
   * then also match a host like `teesmileXvercel.app`. Anchored and escaped,
   * it matches those two hosts and nothing else — `teesmile-git-phase-2.
   * vercel.app` and every other preview deployment serve their own branch as
   * before.
   *
   * `permanent: true` is a 308 rather than a 301: the method and body survive,
   * and search engines treat it as permanent either way.
   */
  async redirects() {
    return [
      /* The portrait was replaced by new file names so no cache could serve
         the old cutout. A page, share card or link saved before the swap
         still asks for /profile.webp; it gets the new portrait instead of a
         404. Listed first so it also applies after a host redirect. */
      { source: "/profile.webp", destination: "/portrait-clean-v2.webp", permanent: true },
      /* The archive page was removed: the site lists finished, working
         projects only, and the early training it held is on the About
         timeline. Old links and search results land on /work, not a 404. */
      { source: "/work/archive", destination: "/work", permanent: true },
      /* Everything on an old host moves to the same path here, except a
         Google site-verification file (google + 16 hex digits + .html). That
         one is served where it is asked for, so the old address can be
         verified in Search Console and Change of Address run from it;
         verification is re-checked, so the file has to keep answering. */
      ...LEGACY_HOSTS.map((host) => ({
        source: "/:path((?!google[0-9a-f]{16}\\.html$).*)",
        has: [{ type: "host" as const, value: host.replace(/\./g, "\\.") }],
        destination: `${SITE_URL}/:path`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
