'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, useGSAP);

/* Once per page load, not once per mount: returning to / from another route
   should not replay the entrance, because the reader has already seen it. */
let hasPlayed = false;

/**
 * A masked line reveal: each line is wrapped in its own clipping box and
 * rises out of it. Deliberately not a typewriter — a typewriter spells the
 * sentence out one character at a time, which reads as a gimmick at this
 * size and delays the one thing the page exists to say.
 *
 * The split waits for document.fonts.ready because line breaks depend on the
 * loaded face; splitting against the fallback would wrap in the wrong places
 * and then re-wrap when Syne arrives.
 */
export default function Statement({ text, className }: { text: string; className?: string }) {
  const scope = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (hasPlayed) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let split: SplitText | null = null;

        document.fonts.ready.then(() => {
          if (!scope.current) return;
          hasPlayed = true;

          split = SplitText.create(scope.current, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
          });

          gsap.from(split.lines, {
            yPercent: 115,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.1,
          });
        });

        return () => split?.revert();
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <h1 ref={scope} className={className}>
      {text}
    </h1>
  );
}
