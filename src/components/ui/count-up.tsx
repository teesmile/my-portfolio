'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { COUNT, prefersReducedMotion } from '@/lib/motion';

/**
 * A figure that counts up to its value the first time it scrolls into view.
 *
 * The server renders the final value, and that is what stays on screen
 * until the count starts: a reader without JavaScript, with reduced
 * motion, or with a screen reader gets the real number and never a count
 * in progress (the animated digits are aria-hidden and the value sits
 * beside them for assistive tech). The digits are tabular and the box is
 * sized to the final value in `ch`, so the count can never push the text
 * around it (no layout shift). It counts once; scrolling back does not
 * replay it.
 *
 * An IntersectionObserver starts it, for the same reason the scroll
 * reveals use one: it reports what is on screen now, on any kind of
 * scroll. Zero is only ever written once the count has started, and the
 * tween ends on the final value, so the figure can never be left at 0.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = value.toLocaleString('en-GB');

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let tween: gsap.core.Tween | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const counter = { n: 0 };
        const render = () => {
          el.textContent = Math.round(counter.n).toLocaleString('en-GB');
        };
        tween = gsap.to(counter, {
          n: value,
          duration: COUNT.duration,
          ease: COUNT.ease,
          onUpdate: render,
          onComplete: () => {
            el.textContent = final;
          },
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      tween?.kill();
      el.textContent = final;
    };
  }, [value, final]);

  return (
    <span className={className}>
      <span
        ref={ref}
        aria-hidden="true"
        className="inline-block text-right tabular-nums"
        style={{ minWidth: `${final.length}ch` }}
      >
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
