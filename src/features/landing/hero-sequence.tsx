'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE, STAGGER, prefersReducedMotion } from '@/lib/motion';
import { settle } from '@/lib/motion-lease';

gsap.registerPlugin(SplitText, useGSAP);

/* Once per page load. Coming back to / from another route should not replay
   an entrance the reader has already watched. */
let hasPlayed = false;

/**
 * The hero arrives in order: the nav, then the headline line by line, then
 * the typed line, then the deck. About a second end to end.
 *
 * Three details are load-bearing, and all three came from measuring a shake
 * on a real phone:
 *
 * 1. force3D. The rise was animating a 2D matrix at fractional pixels
 *    (matrix(1,0,0,1,0,40.4656)), which makes the browser re-rasterise the
 *    glyphs at a new sub-pixel position every frame. At DPR 3 that reads as
 *    the text vibrating as it moves. force3D promotes the line to its own
 *    layer so the compositor moves a finished bitmap instead.
 *
 * 2. The split waits for document.fonts.ready, because line breaks depend on
 *    the loaded face, and it is reverted when the entrance finishes so later
 *    resizes reflow ordinary text rather than stale line boxes.
 *
 * 3. autoSplit is off. It re-splits on font load and resize, and a re-split
 *    in the middle of the rise would replace the elements being tweened.
 */
export default function HeroSequence({
  headline,
  monoLine,
  flag,
}: {
  headline: string;
  monoLine: string;
  flag: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const flagIndex = monoLine.indexOf(flag);
  const before = flagIndex >= 0 ? monoLine.slice(0, flagIndex) : monoLine;
  const after = flagIndex >= 0 ? monoLine.slice(flagIndex + flag.length) : '';

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(caretRef.current, { autoAlpha: 0 });
        settle();
        return;
      }

      let blink: gsap.core.Tween | null = null;
      let observer: IntersectionObserver | null = null;

      /* A steady one-second rhythm, paused whenever the hero is not being
         looked at: an animation running against a hidden tab is work nobody
         sees, and on a phone it is battery. */
      const startBlink = () => {
        /* Queried, not read from the ref: reverting the typed line's split
           rebuilds its markup, so the node the ref was given is gone. */
        const caret = scope.current?.querySelector('[data-caret]');
        if (!caret) return;
        blink = gsap.to(caret, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'steps(1)',
        });

        const sync = () => {
          if (!blink) return;
          const visible =
            !document.hidden &&
            !!scope.current &&
            scope.current.getBoundingClientRect().bottom > 0 &&
            scope.current.getBoundingClientRect().top < window.innerHeight;
          if (visible) {
            blink.play();
          } else {
            blink.pause();
          }
        };

        document.addEventListener('visibilitychange', sync);
        observer = new IntersectionObserver(sync, { threshold: 0 });
        if (scope.current) observer.observe(scope.current);
        sync();

        return () => document.removeEventListener('visibilitychange', sync);
      };

      if (hasPlayed) {
        settle();
        startBlink();
        return () => {
          blink?.kill();
          observer?.disconnect();
        };
      }

      let split: SplitText | null = null;
      let monoSplit: SplitText | null = null;

      document.fonts.ready.then(() => {
        if (!headlineRef.current || !scope.current) return;
        hasPlayed = true;

        split = SplitText.create(headlineRef.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: false,
        });

        monoSplit = SplitText.create('[data-mono-line]', { type: 'chars' });

        /* Promote each line to its own layer before the rise starts. force3D
           alone did not do it — GSAP still wrote a 2D translate — so the z
           nudge makes the 3D context explicit, and will-change tells the
           browser to prepare the layer rather than discovering it mid-tween.
           Both are removed when the entrance finishes. */
        gsap.set(split.lines, { z: 0.01, willChange: 'transform' });

        gsap
          .timeline({
            onComplete: () => {
              /* Hand both lines back to the browser as ordinary text. The
                 typed line matters for more than resizes: while split, its
                 <p> carries SplitText's aria-label, which ARIA prohibits on a
                 paragraph, and its letters are separate boxes. */
              if (split) gsap.set(split.lines, { willChange: 'auto' });
              split?.revert();
              monoSplit?.revert();
              startBlink();
              settle();
            },
          })
          .from('nav', { yPercent: -100, duration: DURATION.base, ease: EASE.out, force3D: true }, 0)
          .from(
            split.lines,
            {
              yPercent: 115,
              duration: DURATION.hero,
              ease: EASE.out,
              stagger: STAGGER.base,
              force3D: true,
            },
            0.1,
          )
          .from(
            monoSplit.chars,
            { opacity: 0, duration: 0.01, stagger: STAGGER.type, ease: 'none' },
            0.55,
          )
          .from(
            '[data-squiggle] path',
            { strokeDashoffset: 1, duration: DURATION.base, ease: EASE.inOut },
            0.95,
          )
          .from(
            '[data-hero-deck]',
            { opacity: 0, y: 18, duration: DURATION.base, ease: EASE.out, force3D: true },
            0.7,
          );
      });

      return () => {
        blink?.kill();
        observer?.disconnect();
        split?.revert();
        monoSplit?.revert();
      };
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <h1 ref={headlineRef} className="text-headline-sm text-ink lg:text-headline">
        {headline}
      </h1>

      <p
        data-mono-line
        className="mt-6 font-mono-brand text-mono-sm text-muted lg:text-mono"
      >
        {before}
        {flagIndex >= 0 ? (
          <span className="relative whitespace-nowrap text-ink">
            {flag}
            <svg
              data-squiggle
              aria-hidden="true"
              viewBox="0 0 120 6"
              preserveAspectRatio="none"
              className="absolute inset-x-0 -bottom-1.5 h-1.5 w-full overflow-visible"
            >
              <path
                d="M0 4 Q 3 1, 6 4 T 12 4 T 18 4 T 24 4 T 30 4 T 36 4 T 42 4 T 48 4 T 54 4 T 60 4 T 66 4 T 72 4 T 78 4 T 84 4 T 90 4 T 96 4 T 102 4 T 108 4 T 114 4 T 120 4"
                fill="none"
                stroke="var(--warn)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
              />
            </svg>
          </span>
        ) : null}
        {after}
        {/* The caret is a drawn bar, not a "|" glyph: a character would be
            indexed, copied with the line and split by SplitText as if it
            were part of the sentence. */}
        <span
          ref={caretRef}
          data-caret
          aria-hidden="true"
          className="ml-1 inline-block h-[1em] w-0.5 bg-accent align-[-0.15em]"
        />
      </p>
    </div>
  );
}
