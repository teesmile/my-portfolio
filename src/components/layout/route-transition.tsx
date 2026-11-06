'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * The one orchestrated moment on every navigation.
 *
 * It animates in only — nothing intercepts the click, so navigation is never
 * delayed waiting for an exit tween to finish. A `template.tsx` re-mounts on
 * every navigation, which gives this component a mount hook that `layout.tsx`
 * deliberately refuses to provide, and that covers Back and deep links for
 * free because both are ordinary mounts.
 *
 * `gsap.from` inside `useGSAP` matters: useGSAP runs in a layout effect, so
 * the start values are written before the browser paints. The alternative —
 * an inline opacity: 0 in the markup — would leave the page invisible if the
 * JavaScript never arrives.
 */
export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(scope.current, {
          opacity: 0,
          y: 10,
          duration: 0.34,
          ease: 'power2.out',
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
