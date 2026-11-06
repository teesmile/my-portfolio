import type { NextConfig } from "next";

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
};

export default nextConfig;
