import type { Metadata } from "next";
import { Syne, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
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
  style: ["normal", "italic"],
  axes: ["opsz"],
});

/* Runs before first paint so a light-mode reader never sees the dark default
   flash past. Dark needs no class, so this only ever adds one. */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||(!t&&window.matchMedia("(prefers-color-scheme: light)").matches)){document.documentElement.classList.add("light")}}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://anthonyugwuja.dev"),
  title: {
    default: "Anthony Ugwuja — frontend developer",
    template: "%s — Anthony Ugwuja",
  },
  description:
    "I trained as a pharmacist. Now I build React interfaces, and I review AI-generated code for a living.",
  openGraph: {
    title: "Anthony Ugwuja — frontend developer",
    description:
      "I trained as a pharmacist. Now I build React interfaces, and I review AI-generated code for a living.",
    url: "/",
    siteName: `${portfolioConfig.name} portfolio`,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthony Ugwuja — frontend developer",
    description:
      "I trained as a pharmacist. Now I build React interfaces, and I review AI-generated code for a living.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Navbar />
        <main className="flex flex-1 flex-col pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
