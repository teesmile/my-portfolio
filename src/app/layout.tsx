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

  metadataBase: new URL("https://teesmile.vercel.app"), 

  title: {
    default: "Teesmile Portfolio",
    template: "%s | Teesmile", // This allows child pages to have "Projects | Teesmile"
  },
  description: "Frontend Engineer and Creative web3 artist",
  
  openGraph: {
    title: "Teesmile Portfolio",
    description: "Frontend Engineer and Creative web3 artist",
    url: "/",
    siteName: "Teesmile Portfolio",
    images: [
      {
        url: "/previewimg.png", // Next.js automatically looks in the 'public' folder
        width: 1200,
        height: 630,
        alt: "Teesmile Portfolio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Teesmile",
    description: "Frontend Engineer and Creative web3 artist",
    images: ["/previewimg.png"], // Looks in 'public' folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* I added geistMono.variable here so you can actually use the mono font if needed */}
      <body className={`${inter.className} ${geistMono.variable} min-h-screen flex flex-col antialiased transition-colors duration-500 bg-[radial-gradient(circle_at_center,#f3e8ff_0%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,#4c0566_0%,#000000_100%)] text-gray-900 dark:text-gray-100`}>
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