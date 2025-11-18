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
  title: "Teesmile Portfolio",
  description: "Frontend Engineer and Creative web3 artist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased transition-colors duration-500 bg-[radial-gradient(circle_at_center,_#f3e8ff_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,_#4c0566_0%,_#000000_100%)] text-gray-900 dark:text-gray-100`}>
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
