'use client';

import { useEffect, useRef } from 'react';
import { subscribe, want, yieldLease } from '@/lib/motion-lease';

/**
 * Holds a CSS marquee still unless it owns the motion lease.
 *
 * It starts held, so without JavaScript, or before hydration, the row sits
 * still rather than moving alongside the deck. Visibility is what it asks
 * the lease for: off screen it gives the lease back, so the deck never
 * waits on a row nobody can see.
 */
export default function LeaseGate({
  id,
  className,
  coveredBy,
  yieldAfterMs,
  cycleMs,
  children,
}: {
  id: string;
  /**
   * Take turns: after owning the lease this long, pass it on if another
   * claimant is waiting; if none is, offer again every `cycleMs`. Choose a
   * moment when the held (resting) frame matches the playing one, so the
   * hand-over is seamless.
   */
  yieldAfterMs?: number;
  cycleMs?: number;
  /**
   * For a gate inside a sticky hero, which never leaves the viewport: the
   * selector of a 1px marker at the top edge of the sheet that slides over
   * it. The gate wants the lease while that edge is below 40% of the
   * viewport, i.e. while the hero is still mostly showing.
   */
  coveredBy?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const marker = coveredBy ? document.querySelector(coveredBy) : null;
    const observer = marker
      ? new IntersectionObserver(([entry]) => want(id, entry.isIntersecting), {
          /* Top 40% excluded; bottom extended a full screen, so a marker
             still below the fold (a tall hero) counts as "not covered". */
          rootMargin: '-40% 0px 100% 0px',
        })
      : new IntersectionObserver(([entry]) => want(id, entry.isIntersecting));
    observer.observe(marker ?? element);
    let timer: number | undefined;
    const offer = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!yieldLease(id) && cycleMs) offer(cycleMs);
      }, delay);
    };
    const unsubscribe = subscribe((owner) => {
      const owns = owner === id;
      element.toggleAttribute('data-held', !owns);
      window.clearTimeout(timer);
      if (owns && yieldAfterMs) offer(yieldAfterMs);
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      unsubscribe();
      want(id, false);
    };
  }, [id, coveredBy, yieldAfterMs, cycleMs]);

  return (
    <div ref={ref} data-held="" className={className}>
      {children}
    </div>
  );
}
