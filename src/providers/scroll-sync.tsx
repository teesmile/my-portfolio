'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * The browser scrolls; nothing interpolates it.
 *
 * This used to create a Lenis instance driven from GSAP's ticker, which
 * eased every wheel and trackpad scroll over 0.9s. With the scroll reveals
 * it made the home page lurch: the content glided while a 48px rise
 * landed on top of the glide, and every change in the document's height
 * moved Lenis's limit under the reader. Native scrolling has none of that,
 * costs nothing per frame, and is what a reader expects of a wheel.
 *
 * ScrollTrigger reads native scroll on its own. What remains here is the
 * one thing a navigation needs: a re-measure, because the new page's
 * layout is nothing like the old one's and a trigger measured against the
 * old page would fire in the wrong place.
 */
export default function ScrollSync({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return children;
}
