'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Reveals anything marked `data-reveal` as it comes into view, once.
 *
 * ScrollTrigger.batch rather than one trigger per element: a case study has
 * dozens of marked nodes, and batching gives them one shared trigger and one
 * tween per group instead of dozens of each. `once: true` kills the trigger
 * after it fires, so scrolling back up costs nothing and the reader never
 * watches the same paragraph arrive twice.
 *
 * The hidden state is set in JavaScript, never in CSS — if the script fails
 * to run, the page is simply readable rather than invisible. The reduced
 * motion case is handled by omission: no branch matches, so nothing is
 * hidden and nothing animates.
 */
export default function Reveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const desktop = context.conditions?.desktop ?? false;
        const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]');

        if (targets.length === 0) return;

        gsap.set(targets, { opacity: 0, y: desktop ? 14 : 8 });

        ScrollTrigger.batch(targets, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: desktop ? 0.5 : 0.35,
              ease: 'power2.out',
              stagger: 0.06,
              overwrite: true,
            }),
        });
      },
    );

    return () => mm.revert();
  });

  return null;
}
