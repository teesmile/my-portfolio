'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { takeFlip } from '@/lib/flip-state';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

/**
 * The hero stays put and the details ride over it.
 *
 * Both layouts are `position: sticky`, not a ScrollTrigger pin. A pin clones
 * the element into a wrapper and takes over its layout, which fights the Flip
 * that brought this image here from the Work card; sticky leaves the element
 * exactly where it is and costs the compositor nothing.
 *
 * Desktop sticks the whole hero under the nav and lets the sheet cover it.
 * Mobile sticks it at a negative offset, so it scrolls up until only the band
 * at its foot — back arrow, title, a strip of the capture — is left, and that
 * band holds. The offset is the hero's own height minus the band's, in the
 * same units the aspect ratio uses, so the two cannot drift apart.
 *
 * The dim and scale are scrubbed to the sheet's progress and are desktop-only
 * and motion-sensitive; the sticking itself survives reduced motion, because
 * it is layout rather than decoration.
 */
export default function CaseStudyHero({
  slug,
  title,
  meta,
  preview,
}: {
  slug: string;
  title: string;
  meta: string;
  preview?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const state = takeFlip(`work-${slug}`);

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
      const sheet = document.querySelector('[data-case-sheet]');
      if (!sheet || !frameRef.current) return;

      gsap.to(frameRef.current, {
        opacity: 0.4,
        scale: 0.965,
        ease: 'none',
        scrollTrigger: {
          trigger: sheet,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    });

    return () => mm.revert();
  });

  return (
    <header className="sticky top-[calc(var(--nav-height)-62.5vw+4.75rem)] z-0 md:top-(--nav-height)">
      <div
        ref={frameRef}
        data-flip-id={`work-${slug}`}
        className="relative aspect-[16/10] w-full origin-top overflow-hidden bg-raised md:aspect-[21/9]"
      >
        {preview ? (
          <Image
            src={preview}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/55 to-transparent" />

        {/* The band: whatever else scrolls away, this is what remains. */}
        <div
          ref={headingRef}
          className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 md:p-10"
        >
          <Link
            href="/work"
            className="shrink-0 pb-1 text-2xs text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden="true">&larr;</span> Work
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg text-ink md:text-2xl md:whitespace-normal">
              {title}
            </h1>
            <p className="mt-1 text-2xs text-muted md:mt-3">{meta}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
