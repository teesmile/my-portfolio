'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { portfolioConfig } from '@/config/site';
import ThemeToggle from './theme-toggle';

export default function Navbar() {
  const pathname = usePathname();
  /* The menu remembers which route it was opened on, so any navigation —
     a nav link, the wordmark, or the back button — closes it without an
     effect syncing state to the path. */
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMenuOpen = menuPath === pathname;
  const setIsMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);

  /* Route state is the source of truth for "where am I", so a deep link and a
     reload are both correct without any scroll bookkeeping. */
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuPath(null);
    };

    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-(--container-view) items-center justify-between px-6">
        <Link
          href="/"
          className="relative z-50 font-display text-lg text-ink transition-colors hover:text-accent"
        >
          {portfolioConfig.name}
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            {portfolioConfig.navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`underline decoration-2 underline-offset-[6px] transition-colors ${
                    isActive(link.href)
                      ? 'text-ink decoration-accent'
                      : 'text-muted decoration-transparent hover:text-ink'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                aria-current={isActive('/resume') ? 'page' : undefined}
                className={`underline decoration-2 underline-offset-[6px] transition-colors ${
                  isActive('/resume')
                    ? 'text-ink decoration-accent'
                    : 'text-muted decoration-transparent hover:text-ink'
                }`}
              >
                Resume
              </Link>
            </li>
          </ul>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-60 -m-2 p-2 text-muted transition-colors hover:text-ink md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              {isMenuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-ink/40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-0 top-16 bottom-0 z-45 bg-surface px-6 pt-10 md:hidden"
            >
              <ul className="flex flex-col">
                {[...portfolioConfig.navLinks, { name: 'Resume', href: '/resume' } as const].map((link) => (
                  <li key={link.name} className="border-b border-line">
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={
                        isActive(link.href)
                          ? 'block py-5 font-display text-lg text-ink'
                          : 'block py-5 font-display text-lg text-muted'
                      }
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
