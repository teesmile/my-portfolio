import type { Metadata, Viewport } from "next";
import { Syne, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScrollSync from "@/providers/scroll-sync";
import { portfolioConfig } from "@/config/site";

const display = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const text = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  /* Upright only. No page sets italic, but asking for it made next/font
     preload a second ~120 KB file at high priority on every route, ahead
     of each page's largest image. Browsers synthesise an oblique if italic
     is ever used before the face is added back. */
  axes: ["opsz"],
});

/* Runs before first paint, so no visitor sees the wrong theme flash past.
   The order of authority: a choice made with the switch on this device
   (stored), then the device's own setting, then light. Dark is the case
   that has to be detected, so a device that reports no preference, or a
   browser too old to say, gets light. Until the visitor uses the switch,
   the page also follows the device when it changes (an evening dark mode,
   say) without a reload. Storage that throws (blocked, private mode) reads
   as "no choice made". */
const themeScript = `(function(){var d=document.documentElement,m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)");function stored(){try{return localStorage.getItem("theme")}catch(e){return null}}function apply(){var t=stored();d.classList.toggle("light",t?t==="light":!(m&&m.matches))}apply();if(m&&m.addEventListener)m.addEventListener("change",function(){if(!stored())apply()})})();`;

/* viewport-fit: cover is what makes env(safe-area-inset-*) report anything
   other than zero on a notched phone. */
export const viewport: Viewport = {
  viewportFit: "cover",
};

const { seo } = portfolioConfig;

export const metadata: Metadata = {
  metadataBase: new URL("https://anthonyugwuja.dev"),
  title: {
    default: seo.title,
    template: "%s - Anthony Ugwuja",
  },
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: "/",
    siteName: `${portfolioConfig.name} portfolio`,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: portfolioConfig.xHandle,
    creator: portfolioConfig.xHandle,
    title: seo.title,
    description: seo.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* The theme script adds "light" to <html> before React hydrates, so the
       class React finds differs from the one it rendered, by design. */
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ScrollSync>
          <Navbar />
          {/* overflow: clip, not hidden: it makes no scroll container, so
              the sticky heroes still stick to the viewport. What it stops
              is the document changing height under the reader: a scroll
              reveal holds a waiting item 48px lower with a transform, and a
              transformed last item below the fold made the page 48px
              taller until it was revealed. */}
          <main className="flex flex-1 flex-col overflow-clip pt-(--nav-height)">{children}</main>
          <Footer />
        </ScrollSync>
      </body>
    </html>
  );
}
