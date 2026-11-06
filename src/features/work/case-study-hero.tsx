'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { takeFlip } from '@/lib/flip-state';

gsap.registerPlugin(Flip, useGSAP);

/**
 * The card's image finishes its journey here as the page's hero.
 *
 * scale: true is mandatory. Flip's default animates width and height in
 * pixels, which forces layout on every frame; scale moves the work to the
 * compositor. The cost is that the image's contents scale too, which is fine
 * for a photograph and wrong for text — so the heading is never part of the
 * Flip. It cross-fades on its own tween, because scaled type goes soft and
 * its metrics lie on the way.
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

    if (!state || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    /* targets is required, not optional: Flip.from falls back to the
       elements recorded in the state, and those unmounted the moment the
       route changed. Passing the new element lets Flip pair them by their
       shared data-flip-id. */
    Flip.from(state, {
      targets: frameRef.current!,
      scale: true,
      absolute: true,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    gsap.from(headingRef.current, {
      opacity: 0,
      y: 8,
      duration: 0.45,
      delay: 0.12,
      ease: 'power2.out',
    });
  });

  return (
    <header className="relative">
      <Link
        href="/work"
        className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-surface/80 px-3 py-1.5 text-2xs text-ink backdrop-blur-sm transition-colors hover:text-accent"
      >
        <span aria-hidden="true">&larr;</span> Work
      </Link>

      <div
        ref={frameRef}
        data-flip-id={`work-${slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-raised md:aspect-[21/9]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />

        <div ref={headingRef} className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <h1 className="max-w-[20ch] text-xl text-ink md:text-2xl">{title}</h1>
          <p className="mt-3 text-2xs text-muted">{meta}</p>
        </div>
      </div>
    </header>
  );
}
