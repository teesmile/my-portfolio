import type { Metadata, Viewport } from "next";
import { Syne, Source_Serif_4, Martian_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SmoothScroll from "@/providers/smooth-scroll";
import { portfolioConfig } from "@/config/site";

const display = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const mono = Martian_Mono({
  variable: "--font-martian",
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

/* Runs before first paint so a light-mode reader never sees the dark default
   flash past. Dark needs no class, so this only ever adds one. */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||(!t&&window.matchMedia("(prefers-color-scheme: light)").matches)){document.documentElement.classList.add("light")}}catch(e){}`;

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
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SmoothScroll>
          <Navbar />
          <main className="flex flex-1 flex-col pt-(--nav-height)">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
