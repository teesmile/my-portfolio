import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {

  metadataBase: new URL("https://anthonyugwuja.dev"), 

  title: {
    default: "Anthony Ugwuja | Frontend Engineer",
    template: "%s | Anthony Ugwuja",
  },
  description: "Frontend engineer building polished, performant React and Next.js interfaces.",
  
  openGraph: {
    title: "Anthony Ugwuja | Frontend Engineer",
    description: "Frontend engineer building polished, performant React and Next.js interfaces.",
    url: "/",
    siteName: "Anthony Ugwuja Portfolio",
    images: [
      {
        url: "/previewimg.png",
        width: 1200,
        height: 630,
        alt: "Anthony Ugwuja Portfolio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Anthony Ugwuja",
    description: "Frontend engineer building polished, performant React and Next.js interfaces.",
    images: ["/previewimg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} ${inter.variable} ${geistMono.variable} bg-zinc-50 text-zinc-950 dark:bg-[#111111] dark:text-zinc-100`}>
        <ThemeProvider>
            <Navbar />
            <div className="flex-grow pt-16">
               {children}
            </div>
            <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
