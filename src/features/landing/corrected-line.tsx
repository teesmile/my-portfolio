'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { settle } from '@/lib/motion-lease';

gsap.registerPlugin(useGSAP);

/**
 * Preview C's supporting line: it types out, gets one word wrong, and fixes
 * it, once, then rests.
 *
 *   "…what AI gets right"  →  "right" struck through in red  →  "wrong" in amber
 *
 * The rendered markup *is* the resting state (struck "right", amber
 * "wrong"), so reduced motion, no JavaScript and the end of the animation
 * all look the same. The timeline only hides things first and reveals them
 * in order (about 1.4 s), inside gsap.matchMedia so reduced motion never
 * runs it. Screen readers get the sentence once, plainly: the visual copy
 * is aria-hidden.
 */
export default function CorrectedLine({ before, wrong, right, after }: { before: string; wrong: string; right: string; after: string }) {
  const scope = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(scope);
        const chars = (sel: string) => q(`${sel} [data-c]`);

        gsap.set([...chars('[data-before]'), ...chars('[data-wrong]'), ...chars('[data-right]'), ...chars('[data-after]')], { opacity: 0 });
        gsap.set(q('[data-strike]'), { scaleX: 0 });
        gsap.set(q('[data-wrong]'), { color: 'var(--ink)' });

        gsap
          .timeline({ delay: 0.25, onComplete: settle })
          .to(chars('[data-before]'), { opacity: 1, duration: 0.01, stagger: 0.011, ease: 'none' })
          .to(chars('[data-wrong]'), { opacity: 1, duration: 0.01, stagger: 0.04, ease: 'none' })
          .to(q('[data-wrong]'), { color: 'var(--ill-error)', duration: 0.12 }, '+=0.25')
          .to(q('[data-strike]'), { scaleX: 1, duration: 0.22, ease: 'power2.out' }, '<')
          .to(chars('[data-right]'), { opacity: 1, duration: 0.01, stagger: 0.04, ease: 'none' }, '+=0.12')
          .to(chars('[data-after]'), { opacity: 1, duration: 0.01, ease: 'none' });
      });
      /* Reduced motion: nothing animates, so the deck may start now. */
      mm.add('(prefers-reduced-motion: reduce)', () => settle());
      return () => mm.revert();
    },
    { scope },
  );

  const split = (text: string) =>
    [...text].map((ch, i) => (
      <span key={i} data-c="">
        {ch}
      </span>
    ));

  return (
    <p ref={scope} className="mt-6 font-mono-brand text-mono-sm text-muted lg:text-mono">
      <span className="sr-only">{`${before}${right}${after}`}</span>
      <span aria-hidden="true">
        <span data-before="">{split(before)}</span>
        <span data-wrong="" className="relative inline-block whitespace-nowrap text-ill-error">
          {split(wrong)}
          <span data-strike="" className="absolute inset-x-0 top-1/2 h-0.5 origin-left bg-ill-error" />
        </span>{' '}
        <span data-right="" className="whitespace-nowrap text-ill-accent">{split(right)}</span>
        <span data-after="">{split(after)}</span>
      </span>
    </p>
  );
}
