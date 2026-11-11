'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { COUNT } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A figure that counts up from zero the first time it scrolls into view.
 *
 * The server renders the final value, so a reader without JavaScript, with
 * reduced motion, or with a screen reader gets the real number and never a
 * count in progress: the animated digits are aria-hidden and the value sits
 * beside them for assistive tech. The digits are tabular and the box is
 * sized to the final value in `ch`, so the count can never push the text
 * around it (no layout shift). It counts once; scrolling back does not
 * replay it.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = value.toLocaleString('en-GB');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = ref.current;
        if (!el) return;
        const counter = { n: 0 };
        const render = () => {
          el.textContent = Math.round(counter.n).toLocaleString('en-GB');
        };
        render();
        const tween = gsap.to(counter, {
          n: value,
          duration: COUNT.duration,
          ease: COUNT.ease,
          paused: true,
          onUpdate: render,
        });
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => tween.play(),
        });
        return () => {
          trigger.kill();
          tween.kill();
          el.textContent = final;
        };
      });
      return () => mm.revert();
    },
    { dependencies: [value] },
  );

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
