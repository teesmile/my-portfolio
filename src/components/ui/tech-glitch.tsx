'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A 200ms RGB split on each tool logo: once as it scrolls into view, and
 * again on hover.
 *
 * The split is two tinted copies of the same path sliding apart and back.
 * Only x and opacity are touched — a filter would be the obvious way to do
 * this and would cost a repaint of the whole element every frame. Nothing
 * loops: a logo that glitches forever stops being a glitch and becomes a
 * distraction.
 */
export default function TechGlitch() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const marks = gsap.utils.toArray<HTMLElement>('[data-tech-mark]');
    if (marks.length === 0) return;

    const glitch = (mark: HTMLElement) => {
      const red = mark.querySelector('[data-ghost="r"]');
      const cyan = mark.querySelector('[data-ghost="c"]');
      if (!red || !cyan) return;

      gsap
        .timeline()
        .set([red, cyan], { opacity: 0.85 })
        .to(red, { x: -1.5, duration: DURATION.step, ease: 'steps(2)' }, 0)
        .to(cyan, { x: 1.5, duration: DURATION.step, ease: 'steps(2)' }, 0)
        .to(red, { x: 1, duration: DURATION.step, ease: 'steps(2)' }, 0.07)
        .to(cyan, { x: -1, duration: DURATION.step, ease: 'steps(2)' }, 0.07)
        .to([red, cyan], { x: 0, opacity: 0, duration: DURATION.step, ease: EASE.out }, 0.14);
    };

    const enter = (event: Event) => glitch(event.currentTarget as HTMLElement);
    marks.forEach((mark) => mark.addEventListener('pointerenter', enter));

    /**
     * Ambient life: every four to seven seconds one visible logo glitches,
     * never two at once. The randomness is the point — a fixed rotation would
     * read as a carousel, and simultaneous glitches would read as a fault.
     *
     * It runs only while at least one logo is on screen and the tab is
     * visible, because an animation nobody can see is a battery cost with no
     * upside.
     */
    const visible = new Set<HTMLElement>();
    let busy = false;
    let timer: gsap.core.Tween | null = null;

    const schedule = () => {
      timer?.kill();
      timer = gsap.delayedCall(4 + Math.random() * 3, run) as unknown as gsap.core.Tween;
    };

    const run = () => {
      if (document.hidden || visible.size === 0 || busy) {
        schedule();
        return;
      }

      const pool = [...visible];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      busy = true;
      glitch(pick);
      gsap.delayedCall(0.25, () => {
        busy = false;
      });
      schedule();
    };

    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const mark = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(mark);
        else visible.delete(mark);
      });
    });
    marks.forEach((mark) => watcher.observe(mark));

    const onVisibility = () => {
      if (document.hidden) timer?.kill();
      else schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);
    schedule();

    /* Batched for the same reason the reveals are: a logo list can be twenty
       elements, and twenty scroll triggers is twenty times the bookkeeping on
       every scroll frame for an effect that lasts 200ms. */
    const triggers = ScrollTrigger.batch(marks, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        (batch as HTMLElement[]).forEach((mark, index) =>
          gsap.delayedCall(index * 0.06, () => glitch(mark)),
        ),
    });

    return () => {
      marks.forEach((mark) => mark.removeEventListener('pointerenter', enter));
      triggers.forEach((trigger) => trigger.kill());
      document.removeEventListener('visibilitychange', onVisibility);
      watcher.disconnect();
      timer?.kill();
    };
  });

  return null;
}
