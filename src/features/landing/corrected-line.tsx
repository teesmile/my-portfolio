'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { settle } from '@/lib/motion-lease';

gsap.registerPlugin(useGSAP);

/**
 * The home headline, which corrects itself once and then rests:
 *
 *   "…what AI gets right"  →  "right" struck through in red  →  "wrong" typed in amber
 *
 * It is the page's <h1>, so two things matter beyond the animation.
 *
 * Its text is the sentence and nothing else. The struck word is CSS
 * generated content (`content: attr(data-word)`) inside an aria-hidden span,
 * so it is drawn on screen but is not part of the heading's text for screen
 * readers or search engines. The earlier version kept a screen-reader copy
 * of the sentence plus a visual copy with "right" in it; as a headline that
 * would have read "…gets wrong. …gets right wrong."
 *
 * Only the correction moves. The sentence up to "gets" is plain
 * server-rendered text, so the page's largest text paints at once and never
 * blinks off to be retyped; the timeline only hides "wrong." and the strike,
 * then reveals them in order (about a second), inside gsap.matchMedia so
 * reduced motion never runs it. The rendered markup is the resting state, so
 * reduced motion, no JavaScript and the end of the animation look the same.
 */
export default function CorrectedHeadline({
  lead,
  wrong,
  right,
  after,
  className,
}: {
  lead: string;
  wrong: string;
  right: string;
  after: string;
  className?: string;
}) {
  const scope = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(scope);
        const typed = [...q('[data-right] [data-c]'), ...q('[data-after]')];

        gsap.set(typed, { opacity: 0 });
        gsap.set(q('[data-strike]'), { scaleX: 0 });
        gsap.set(q('[data-wrong]'), { color: 'var(--ink)' });

        gsap
          .timeline({ delay: 0.6, onComplete: settle })
          .to(q('[data-wrong]'), { color: 'var(--ill-error)', duration: 0.12 })
          .to(q('[data-strike]'), { scaleX: 1, duration: 0.22, ease: 'power2.out' }, '<')
          .to(typed, { opacity: 1, duration: 0.01, stagger: 0.05, ease: 'none' }, '+=0.15');
      });
      /* Reduced motion: nothing animates, so the deck may start now. */
      mm.add('(prefers-reduced-motion: reduce)', () => settle());
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <h1 ref={scope} className={className}>
      {lead}
      <span
        data-wrong=""
        data-word={wrong}
        aria-hidden="true"
        className="relative mr-[0.26em] inline-block whitespace-nowrap text-ill-error before:content-[attr(data-word)]"
      >
        <span data-strike="" className="absolute inset-x-0 top-[55%] h-[0.07em] origin-left bg-ill-error" />
      </span>
      <span data-right="" className="whitespace-nowrap text-ill-accent">
        {[...right].map((ch, i) => (
          <span key={i} data-c="">
            {ch}
          </span>
        ))}
      </span>
      <span data-after="">{after}</span>
    </h1>
  );
}
