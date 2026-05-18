
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import ThemeToggle from './theme-toggle';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener("keydown", closeOnEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavClick = (name: string) => {
    setActiveSection(name);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-black/45">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/#home" className="relative z-50 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
          Anthony<span className="bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent">.</span>
        </Link>
        
        <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <ul className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-200 md:flex">
            {portfolioConfig.navLinks.map((link) => (
                <li key={link.name}>
                <Link 
                    href={link.href} 
                    onClick={() => handleNavClick(link.name)}
                    className={`transition-all duration-300 ${
                    activeSection === link.name 
                        ? "bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] bg-clip-text text-transparent" 
                        : "hover:text-violet-300"
                    }`}
                >
                    {link.name}
                </Link>
                </li>
            ))}
            </ul>
            
            <Link
              href="/resume"
              className="hidden rounded-sm bg-linear-to-r from-[#5b5cff] to-[#8b5cf6] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 md:inline-flex"
            >
              View Resume
            </Link>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 md:hidden z-[60]">
                <button 
                    onClick={toggleMenu} 
                    className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-950 transition hover:border-violet-300 hover:text-violet-600 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:text-violet-300"
                    aria-label="Toggle menu"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isMobileMenuOpen ? (
                            <motion.svg
                                key="close"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
                                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </motion.svg>
                        ) : (
                            <motion.svg
                                key="open"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ opacity: 0, rotate: 180, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: -180, scale: 0.5 }}
                                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                            >
                                <path d="M4 6h16" />
                                <path d="M4 12h16" />
                                <path d="M4 18h16" />
                            </motion.svg>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[50] h-[100dvh] bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay - Side Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                id="mobile-menu"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-[55] flex h-[100dvh] w-[72vw] flex-col border-l border-zinc-200 bg-white/95 pt-32 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:border-white/10 dark:bg-[#111111]/95 md:hidden"
            >
                <div className="absolute right-8 top-20">
                  <ThemeToggle />
                </div>
                <ul className="flex flex-col items-start space-y-8 px-8 text-xl font-medium text-zinc-800 dark:text-zinc-200">
                    {portfolioConfig.navLinks.map((link, i) => (
                        <motion.li 
                            key={link.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="w-full"
                        >
                            <Link 
                                href={link.href} 
                                onClick={() => handleNavClick(link.name)}
                                className={`block w-full border-b border-zinc-200 py-2 transition-colors dark:border-white/10 ${
                                    activeSection === link.name 
                                    ? "border-violet-400/40 text-violet-300" 
                                    : "hover:text-violet-300"
                                }`}
                            >
                                {link.name}
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
