'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portfolioConfig } from '@/config/site';
import ThemeToggle from './theme-toggle';

export default function Navbar() {
  const pathname = usePathname();
  /* The menu remembers which route it was opened on, so any navigation —
     a nav link, the wordmark, or the back button — closes it without an
     effect syncing state to the path. */
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMenuOpen = menuPath === pathname;
  const panelRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Closing runs the exit tween first and clears state in its onComplete, so
     the element cannot unmount mid-animation — unmounting first is what left
     a single frame of the panel at full opacity under the old library. */
  const closeMenu = () => {
    const panel = panelRef.current;

    if (!panel || prefersReducedMotion()) {
      setMenuPath(null);
      return;
    }

    gsap.to(panel, {
      opacity: 0,
      y: -8,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setMenuPath(null),
    });
  };

  const setIsMenuOpen = (open: boolean) => {
    if (open) {
      setMenuPath(pathname);
      return;
    }
    closeMenu();
  };

  useGSAP(
    () => {
      if (!isMenuOpen || !panelRef.current || prefersReducedMotion()) return;

      gsap.from(panelRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.22,
        ease: 'power2.out',
      });
    },
    { dependencies: [isMenuOpen] },
  );

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
            className="relative z-60 flex w-[5.25rem] items-center justify-center gap-2 border border-line px-3 py-1.5 text-2xs text-ink transition-colors hover:border-ink md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              {isMenuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      </nav>

      {isMenuOpen ? (
        /* Phase 2's transition. The enter tween is a gsap.from inside
           useGSAP, so its start values land before paint; the exit tween owns
           the unmount through onComplete. Both are proven flash-free by the
           per-frame opacity logger. */
        <div
          id="mobile-menu"
          ref={panelRef}
          className="fixed inset-x-0 top-16 bottom-0 z-45 bg-surface px-6 pt-10 md:hidden"
        >
          <ul className="flex flex-col">
            {[...portfolioConfig.navLinks, { name: 'Resume', href: '/resume' } as const].map((link) => (
              <li key={link.name} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-5 font-display text-lg underline decoration-2 underline-offset-[6px] transition-colors ${
                    isActive(link.href)
                      ? 'text-ink decoration-accent'
                      : 'text-muted decoration-transparent hover:text-ink hover:decoration-accent active:text-ink active:decoration-accent'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
