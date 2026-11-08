'use client';

import { useEffect, useRef } from 'react';
import { subscribe, want } from '@/lib/motion-lease';

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
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => want(id, entry.isIntersecting));
    observer.observe(element);
    const unsubscribe = subscribe((owner) => element.toggleAttribute('data-held', owner !== id));

    return () => {
      observer.disconnect();
      unsubscribe();
      want(id, false);
    };
  }, [id]);

  return (
    <div ref={ref} data-held="" className={className}>
      {children}
    </div>
  );
}
