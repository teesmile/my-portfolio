import type { Metadata, Viewport } from "next";

import Hero from "@/features/landing/hero";
import SelectedWork from "@/features/landing/selected-work";
import ToolsRow from "@/features/landing/tools-row";
import Reveals from "@/components/layout/reveals";
import { portfolioConfig } from "@/config/site";
import { SITE_URL } from "@/config/site-url";

/* Only the canonical. The root layout already carries this page's title,
   description and Open Graph block, and restating the title here would run it
   through the layout's "%s — Anthony Ugwuja" template and publish the name
   twice. */
/* The browser's own bar (Android Chrome) takes the hero's surface on this
   page, so it continues the hero instead of drawing another seam above it.
   The values are --raised in each theme, the hero's background. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#15171a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Structured data for the person the site is about.
 *
 * `sameAs` is the part that earns its place: it tells a search engine that
 * this domain and those three profiles are one identity, which is the same
 * question — "which address is really him?" — that the canonical tag answers
 * for the pages. The profile links come from the site config rather than
 * being retyped, so an account that changes in the footer changes here too.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: portfolioConfig.name,
  url: SITE_URL,
  jobTitle: "Full-stack developer and AI evaluator",
  sameAs: portfolioConfig.socials.map((social) => social.url),
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD is data, not markup: it is read from the response HTML, so it
          has to be in the server-rendered output rather than injected later. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <Reveals initial={0} />
      <SelectedWork />
      <ToolsRow />
    </>
  );
}
