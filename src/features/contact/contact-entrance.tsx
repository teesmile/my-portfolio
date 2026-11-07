'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(useGSAP);

/**
 * The two columns arrive from the sides they occupy, slightly staggered, so
 * the view assembles rather than appearing. Only x and opacity move: both are
 * compositor properties, and a contact page that costs layout to open would
 * be an odd thing to ship.
 */
export default function ContactEntrance() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap
      .timeline()
      .from('[data-contact-left]', {
        x: -24,
        opacity: 0,
        duration: DURATION.base,
        ease: EASE.out,
      })
      .from(
        '[data-contact-right]',
        { x: 24, opacity: 0, duration: DURATION.base, ease: EASE.out },
        0.12,
      );
  });

  return null;
}
