'use client';

import { useEffect, useRef, useState } from 'react';
import type { Route } from 'next';
import BackPill from '@/components/ui/back-pill';

/**
 * The back pill, pinned just under the navigation.
 *
 * A strip in the page's own flow at the top of its content: a full-width
 * row on the solid surface, so at rest it sits above the content rather
 * than over it, and when it sticks the content scrolls beneath it as it
 * does beneath the nav. It pins 1px below --nav-height, which excludes the
 * nav's bottom border, and sits at z-20 under the nav's z-50, so it never
 * covers the nav.
 *
 *   mode "always"   the strip is the page's back control (the trap pages).
 *   mode "covered"  pages with a sticky hero already show the pill in the
 *                   hero's band; this one appears only once the content
 *                   sheet has covered the hero, i.e. its top edge has
 *                   reached the nav. Place it first in the sheet, which
 *                   must be position: relative.
 */
export default function PinnedBack({
  href,
  label,
  mode = 'always',
}: {
  href: Route;
  label: string;
  mode?: 'always' | 'covered';
}) {
  const sentinel = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(mode === 'always');

  useEffect(() => {
    if (mode !== 'covered' || !sentinel.current) return;
    const nav = document.querySelector('nav')?.getBoundingClientRect().height ?? 64;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const above = entry.boundingClientRect.top < (entry.rootBounds?.top ?? nav);
        setPinned(!entry.isIntersecting && above);
      },
      { rootMargin: `-${Math.round(nav)}px 0px 0px 0px` },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [mode]);

  const hidden = mode === 'covered' && !pinned;

  return (
    <>
      {mode === 'covered' ? <span ref={sentinel} aria-hidden="true" className="absolute inset-x-0 top-0 h-px" /> : null}
      <div
        aria-hidden={hidden || undefined}
        inert={hidden}
        className={`sticky top-[calc(var(--nav-height)+1px)] z-20 -mx-4 flex h-11 items-center bg-surface/95 px-4 transition-opacity duration-(--duration-fast) sm:-mx-6 sm:px-6 ${
          mode === 'covered' ? '-mt-16 mb-5 md:-mt-20' : 'mb-8'
        } ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <div className="mx-auto w-full max-w-(--container-view)">
          <BackPill href={href} label={label} />
        </div>
      </div>
    </>
  );
}
