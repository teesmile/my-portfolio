'use client';

import { useEffect, useRef, useState } from 'react';
import TechGlitch from '@/components/ui/tech-glitch';

/**
 * Mounts the logo glitch only once the tools row is about to be seen.
 *
 * TechGlitch measures every logo when it sets up (a ScrollTrigger batch).
 * Mounted with the page, that measuring forced layout of the tools row, a
 * content-visibility: auto section the browser was otherwise skipping, in
 * the middle of the hero entrance, and cost ~80 ms of Total Blocking Time on
 * a 4x-throttled load. Mounted when the row comes within 300px, the row is
 * being laid out anyway and the effect behaves exactly as on /about.
 */
export default function GlitchWhenNear() {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="block h-px" />
      {near ? <TechGlitch /> : null}
    </>
  );
}
