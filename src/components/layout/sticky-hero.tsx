'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { takeFlip } from '@/lib/flip-state';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

/**
 * One hero for both long-form routes: case studies and writing pieces.
 *
 * It holds while the article rides up over it. Both layouts are
 * `position: sticky`, not a ScrollTrigger pin — a pin clones the element into
 * a wrapper and takes over its layout, which fights the Flip that brings a
 * work capture here from the Work index, and costs layout on every frame.
 *
 * Desktop sticks the whole hero under the nav. Mobile sticks it at a negative
 * offset so it scrolls up until only the band at its foot — back arrow, title
 * and a strip of the visual — remains, and that band holds. The offset is the
 * hero's own height minus the band's, in the units the aspect ratio uses, so
 * the two cannot drift apart.
 *
 * The band's height is measured rather than assumed. It used to be written
 * into the offset as a flat 4.75rem, which is the height of a band whose
 * title is exactly one line — and the `truncate` that kept it one line was
 * throwing away half of "A 2.4 MB portrait, and what unoptimized actually
 * turns off" on a phone, 554px of title in a 275px box, with the full text
 * nowhere else in the document. A measured offset lets the title wrap to
 * whatever it needs and still leaves the right strip showing.
 *
 * `flipId` is optional: a writing piece has no card to travel from, so it
 * simply arrives.
 */
export default function StickyHero({
  backHref,
  backLabel,
  title,
  meta,
  flipId,
  mobileAspect = "16/10",
  scrim = "frame",
  children,
}: {
  /* "frame" darkens the whole visual from the bottom up, which suits a photo
     or a banner. "band" leaves the visual at full strength and relies on the
     title band's own scrim: for a diagram whose meaning is in its colours. */
  scrim?: "frame" | "band";
  /* Square on phones for a visual that carries text (the renal loop): at
     16:10 the band left it ~100px of height on a 390px screen. Desktop is
     21:9 either way. */
  mobileAspect?: "16/10" | "square";
  /* Route rather than string: typedRoutes will not accept an untyped href,
     which is the point of having it on. */
  backHref: Route;
  backLabel: string;
  title: string;
  meta: string;
  flipId?: string;
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  /* A layout effect, not a GSAP one: this is a measurement the sticky offset
     depends on, and it has to be right before the first scroll. ResizeObserver
     rather than a one-off read, because the band's height changes when the
     webfont lands, when the phone rotates, and when a longer title wraps to a
     different number of lines. */
  useEffect(() => {
    const band = headingRef.current;
    const header = headerRef.current;
    if (!band || !header) return;

    const sync = () => header.style.setProperty('--band-height', `${band.offsetHeight}px`);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(band);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const state = flipId ? takeFlip(flipId) : null;

    if (state && !prefersReducedMotion()) {
      Flip.from(state, {
        targets: frameRef.current!,
        scale: true,
        absolute: true,
        duration: DURATION.slow,
        ease: EASE.inOut,
      });

      gsap.from(headingRef.current, {
        opacity: 0,
        y: 8,
        duration: DURATION.base,
        delay: 0.12,
        ease: EASE.out,
      });
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const sheet = document.querySelector('[data-sheet]');
      if (!sheet || !frameRef.current) return;

      gsap.to(frameRef.current, {
        opacity: 0.4,
        scale: 0.965,
        ease: 'none',
        scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top top', scrub: true },
      });
    });

    return () => mm.revert();
  });

  return (
    <header
      ref={headerRef}
      /* The inline band value is the pre-measurement fallback, used for the
         first paint and by anything that never runs the effect. --hero-h is
         the frame's height on a phone, from its aspect ratio: 62.5vw for
         16:10, 100vw for square. */
      style={
        {
          '--band-height': '4.75rem',
          '--hero-h': mobileAspect === 'square' ? '100vw' : '62.5vw',
        } as React.CSSProperties
      }
      className="sticky top-[calc(var(--nav-height)-var(--hero-h)+var(--band-height))] z-0 md:top-(--nav-height)"
    >
      <div
        ref={frameRef}
        data-flip-id={flipId}
        className={`relative w-full origin-top overflow-clip bg-raised md:aspect-[21/9] ${
          mobileAspect === 'square' ? 'aspect-square' : 'aspect-[16/10]'
        }`}
      >
        {children}
        {scrim === 'frame' ? (
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/55 to-transparent" />
        ) : null}

        {/* The band: whatever else scrolls away, this is what remains.
            It carries its own scrim. The frame's gradient is sized to the
            frame, so once the title wrapped to three lines the band reached
            up into the transparent half of it and the artwork started showing
            through the heading. A gradient on the band covers exactly the
            band, whatever height the title makes it. */}
        <div
          ref={headingRef}
          /* On a phone the back link sits above the title, not beside it:
             beside it, the title started ~90px in and long titles stacked
             into a tall, thin column. Desktop keeps them side by side. */
          className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-gradient-to-t from-surface via-surface/90 to-transparent px-4 pb-4 pt-10 sm:px-6 md:flex-row md:items-end md:gap-4 md:p-10"
        >
          <Link
            href={backHref}
            className="shrink-0 text-2xs text-muted transition-colors hover:text-accent md:pb-1"
          >
            <span aria-hidden="true">&larr;</span> {backLabel}
          </Link>
          <div className="w-full min-w-0">
            {/* Wraps. A heading a reader cannot finish is not a heading. */}
            <h1 className="text-balance text-lg text-ink md:text-2xl">{title}</h1>
            <p className="mt-1 text-2xs text-muted md:mt-3">{meta}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
