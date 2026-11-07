'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DURATION, EASE } from '@/lib/motion';

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
        /* The whole view is being translated, and that view is mostly text.
           A 2D transform at fractional pixels re-rasterises every glyph on
           every frame — measured as a shake on the hero headline when
           navigating back to /. The z nudge forces a 3D context so the
           compositor moves one finished layer instead, and will-change lets
           the browser prepare it rather than discovering it mid-tween. Both
           are dropped once the view has landed, because a permanent layer
           costs memory for nothing. */
        gsap.set(scope.current, { z: 0.01, willChange: 'transform' });

        gsap.from(scope.current, {
          opacity: 0,
          y: 12,
          duration: DURATION.base,
          ease: EASE.out,
          onComplete: () => {
            gsap.set(scope.current, { willChange: 'auto', clearProps: 'z' });
          },
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
