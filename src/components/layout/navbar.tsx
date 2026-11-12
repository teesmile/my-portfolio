'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE } from '@/lib/motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portfolioConfig } from '@/config/site';
import ThemeToggle from './theme-toggle';
import { buttonClass } from '@/components/ui/button';

export default function Navbar() {
  const pathname = usePathname();
  /* The menu remembers which route it was opened on, so any navigation —
     a nav link, the wordmark, or the back button — closes it without an
     effect syncing state to the path. */
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMenuOpen = menuPath === pathname;
  const panelRef = useRef<HTMLDivElement>(null);

  /* At the very top of the home page the bar is transparent, so the hero's
     surface and glow run to the top of the screen. From the first few
     pixels of scrolling it is the usual solid bar with a blur: transparent
     any longer, and the hero's links, paragraph and deck slid under the bar
     and mixed with the name and links. Keyed by pathname like the menu: on "/"
     it starts transparent (the server render agrees, so nothing flashes),
     every other route is solid without any effect running. */
  const [heroGoneOn, setHeroGoneOn] = useState<string | null>(null);
  const overHero = pathname === '/' && heroGoneOn !== pathname && !isMenuOpen;

  useEffect(() => {
    if (pathname !== '/') return;
    /* A 4px sentinel at the very top of the hero: visible only while the
       page is scrolled less than 4px. No scroll listener needed. */
    const top = document.querySelector('[data-home-top]');
    if (!top) return;
    const observer = new IntersectionObserver(([entry]) =>
      setHeroGoneOn(entry.isIntersecting ? null : '/'),
    );
    observer.observe(top);
    return () => observer.disconnect();
  }, [pathname]);

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
      duration: DURATION.fast,
      ease: EASE.in,
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
        duration: DURATION.base,
        ease: EASE.out,
      });
    },
    { dependencies: [isMenuOpen] },
  );

  /* Route state is the source of truth for "where am I", so a deep link and a
     reload are both correct without any scroll bookkeeping. */
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

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
      <nav
        data-over-hero={overHero ? '' : undefined}
        className={`fixed inset-x-0 top-0 z-50 border-b pt-(--safe-top) transition-[background-color,border-color,backdrop-filter] duration-(--duration-base) ${
          overHero ? 'border-transparent bg-transparent' : 'border-line bg-surface/85 backdrop-blur-md'
        }`}
      >
      <div className="mx-auto flex h-16 max-w-(--container-view) items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${portfolioConfig.name} - go to the home page`}
          aria-current={pathname === '/' ? 'page' : undefined}
          /* The one coloured thing in the bar: the name in the accent, so
             the bar has a mark rather than a row of equal words. */
          className="relative z-50 font-display text-lg text-accent transition-colors hover:text-ink"
        >
          {portfolioConfig.name}
        </Link>

        <div className="flex items-center gap-4">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            {portfolioConfig.navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`transition-colors ${isActive(link.href) ? 'text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                aria-current={isActive('/resume') ? 'page' : undefined}
                className={`transition-colors ${isActive('/resume') ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                Resume
              </Link>
            </li>
          </ul>

          {/* The two icon buttons sit flush with the content edge: the
              square tap area is wider than the mark inside it. */}
          <div className="-mr-3 flex items-center gap-1">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={buttonClass('icon', 'md', 'relative z-60 md:hidden')}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
          </button>
          </div>
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
          className="fixed inset-x-0 top-(--nav-height) bottom-0 z-45 bg-surface px-4 sm:px-6 pt-10 md:hidden"
        >
          <ul className="flex flex-col">
            {[...portfolioConfig.navLinks, { name: 'Resume', href: '/resume' } as const].map((link) => (
              <li key={link.name} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-5 font-display text-lg transition-colors ${
                    isActive(link.href) ? 'text-ink' : 'text-muted hover:text-ink active:text-ink'
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
