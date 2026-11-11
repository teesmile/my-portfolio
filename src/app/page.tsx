import type { Metadata, Viewport } from "next";

import Hero from "@/features/landing/hero";
import SelectedWork from "@/features/landing/selected-work";
import ToolsRow from "@/features/landing/tools-row";
import Reveals from "@/components/layout/reveals";
import JsonLd from "@/components/ui/json-ld";
import { personJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { feedAlternate } from "@/lib/metadata";

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
  alternates: { canonical: "/", types: feedAlternate },
};

/* The person the site is about, in full, and the site itself. Every other
   page refers to this Person by its @id (src/lib/structured-data.ts), so
   `sameAs` — this domain and those three profiles are one identity — is
   stated once for the whole site. */
export default function HomePage() {
  return (
    <>
      <JsonLd nodes={[personJsonLd, websiteJsonLd]} />
      <Hero />
      <Reveals initial={0} />
      <SelectedWork />
      <ToolsRow />
    </>
  );
}
