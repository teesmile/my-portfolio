'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;

/** The live Lenis instance, or null under reduced motion where none exists. */
export const getLenis = () => instance;

/**
 * Smooth scrolling, driven from GSAP's ticker rather than its own rAF loop.
 *
 * Why one loop: Lenis and GSAP each want a requestAnimationFrame callback. Run
 * both and they interleave unpredictably — Lenis writes a scroll position,
 * then ScrollTrigger reads it a frame later, and pinned or scrubbed elements
 * lag the content by exactly that frame. Driving Lenis from `gsap.ticker` puts
 * the scroll update and every tween on the same tick, in a known order.
 *
 * Why lagSmoothing(0): after a long frame GSAP normally "catches up" by
 * jumping playheads forward. That is right for a timeline and wrong for a
 * scroll position, which would teleport past content the reader never saw.
 *
 * Under reduced motion no instance is created at all: the browser's own
 * scrolling is the accessible path, and an interpolated one is exactly what
 * the setting asks us not to do.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({ duration: 0.9, smoothWheel: true });
    instance = lenis;

    /* ScrollTrigger reads native scroll; Lenis is the one moving it, so every
       Lenis frame has to tell ScrollTrigger to re-measure. */
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  /* A new route starts at the top, with no interpolation: animating a scroll
     reset would show the reader the old page's content scrolling away. */
  useEffect(() => {
    instance?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return children;
}
