
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import { portfolioConfig } from '@/config/site';
import ThemeToggle from './theme-toggle';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const { theme } = useTheme();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavClick = (name: string) => {
    setActiveSection(name);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/20 border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-bold text-lg text-fuchsia-500 dark:text-fuchsia-400 tracking-tight relative z-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="37" height="36" fill="none" viewBox="0 0 37 36">
            <defs>
              <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="logo_gradient_light" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
            </defs>
            <path
              fill={theme === 'dark' ? "url(#logo_gradient)" : "url(#logo_gradient_light)"}
              fillRule="evenodd"
              d="M36.35 20.05c.86-1.48.86-3.3 0-4.78L29.5 3.39A4.79 4.79 0 0025.35 1h-13.7c-1.72 0-3.3.91-4.15 2.4L.64 15.26a4.79 4.79 0 000 4.78L7.5 31.93a4.79 4.79 0 004.14 2.39h13.71c1.71 0 3.3-.91 4.15-2.4l6.85-11.87z M11.5 9h14v5h-4.5v13h-5v-13h-4.5V9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        
        <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <ul className="hidden md:flex space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            {portfolioConfig.navLinks.map((link) => (
                <li key={link.name}>
                <a 
                    href={link.href} 
                    onClick={() => handleNavClick(link.name)}
                    className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                    activeSection === link.name 
                        ? "text-fuchsia-700 dark:text-fuchsia-200 bg-fuchsia-100 dark:bg-fuchsia-900/20 border border-fuchsia-300 dark:border-fuchsia-500/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]" 
                        : "hover:text-fuchsia-600 dark:hover:text-fuchsia-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                    {link.name}
                </a>
                </li>
            ))}
            </ul>
            
            {/* Theme Toggle (Desktop) */}
            <div className="hidden md:block">
                <ThemeToggle />
            </div>
            
            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 md:hidden z-[60]">
                <ThemeToggle />
                <button 
                    onClick={toggleMenu} 
                    className="p-2 text-2xl hover:scale-110 transition-transform focus:outline-none select-none"
                    aria-label="Toggle menu"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isMobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
                                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                            >
                                😠
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ opacity: 0, rotate: 180, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: -180, scale: 0.5 }}
                                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                            >
                                😛
                            </motion.div>
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
                className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm md:hidden h-[100dvh]"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay - Side Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-[55] w-[65vw] h-[100dvh] bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-l border-gray-200 dark:border-fuchsia-900/30 shadow-2xl shadow-purple-900/20 dark:shadow-purple-900/50 flex flex-col pt-32 md:hidden"
            >
                <ul className="flex flex-col items-start px-8 space-y-8 text-xl font-medium text-gray-700 dark:text-gray-300">
                    {portfolioConfig.navLinks.map((link, i) => (
                        <motion.li 
                            key={link.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="w-full"
                        >
                            <a 
                                href={link.href} 
                                onClick={() => handleNavClick(link.name)}
                                className={`block w-full py-2 transition-colors border-b border-gray-200 dark:border-white/10 ${
                                    activeSection === link.name 
                                    ? "text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/50" 
                                    : "hover:text-fuchsia-500 dark:hover:text-fuchsia-300"
                                }`}
                            >
                                {link.name}
                            </a>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
