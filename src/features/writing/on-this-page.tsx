'use client';

import { useEffect, useState } from 'react';
import type { Section } from '@/config/writing';

/* The reading line sits a quarter of the way down the viewport. A line tucked
   just under the nav does not work: an anchored jump parks the new section
   around 160px while the previous section's last paragraph still covers the
   line, so the rail would always name the section you just left. */
const linePosition = () => Math.round(window.innerHeight / 4);

export default function OnThisPage({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) {
      return;
    }

    /* Pick the last section that has crossed the line rather than the topmost
       one still intersecting: a tall section you have scrolled past keeps
       touching any observation band, so "topmost intersecting" reports the
       section above the one you are reading. */
    const pick = () => {
      const line = linePosition();
      let current = nodes[0];

      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) {
          current = node;
        }
      }

      /* A short final section can never reach the line: the page runs out of
         scroll first. At the very bottom, hand it the highlight — but only
         once the section the line rule picked has itself scrolled above the
         line, otherwise an anchored jump that happens to land at the page end
         would skip ahead of what the reader is actually looking at. */
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom && current.getBoundingClientRect().bottom < line) {
        current = nodes[nodes.length - 1];
      }

      setActive(current.id);
    };

    let observer: IntersectionObserver | null = null;

    /* A one-pixel band at the reading line, in pixels taken from the viewport
       height, so every crossing fires a callback. Rebuilt on resize because
       the band depends on that height. */
    const build = () => {
      observer?.disconnect();
      const line = linePosition();
      const bottom = Math.max(0, window.innerHeight - line - 1);
      observer = new IntersectionObserver(pick, {
        rootMargin: `-${line}px 0px -${bottom}px 0px`,
      });
      nodes.forEach((node) => observer?.observe(node));
    };

    build();
    window.addEventListener('resize', build);

    return () => {
      window.removeEventListener('resize', build);
      observer?.disconnect();
    };
  }, [sections]);

  return (
    <>
      <h2 className="mt-8 text-2xs text-muted">On this page</h2>
      <ul className="mt-3 flex flex-col gap-2 text-2xs">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'location' : undefined}
              className={
                active === section.id
                  ? 'border-l-2 border-accent pl-3 text-ink'
                  : 'border-l-2 border-transparent pl-3 text-muted transition-colors hover:text-ink'
              }
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
