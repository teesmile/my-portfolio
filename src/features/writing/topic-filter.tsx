'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Topic, WritingEntry } from '@/config/writing';
import { readingTime } from '@/config/writing';

/**
 * Filtering happens in the client because the list is small and the whole set
 * is already in the payload — a round trip per filter would be slower and
 * would lose the scroll position. Only topics that actually have pieces get a
 * button: a filter that always returns nothing is worse than no filter.
 */
export default function TopicFilter({ entries }: { entries: WritingEntry[] }) {
  const topics = Array.from(new Set(entries.map((entry) => entry.topic)));
  const [active, setActive] = useState<Topic | 'All'>('All');
  const shown = active === 'All' ? entries : entries.filter((e) => e.topic === active);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-4 text-2xs">
        {(['All', ...topics] as const).map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setActive(topic)}
            aria-pressed={active === topic}
            className={
              active === topic
                ? 'underline decoration-accent decoration-2 underline-offset-[6px] text-ink'
                : 'underline decoration-transparent decoration-2 underline-offset-[6px] text-muted transition-colors hover:text-ink'
            }
          >
            {topic}
            <span className="ml-1.5 text-muted">
              {topic === 'All' ? entries.length : entries.filter((e) => e.topic === topic).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {shown.map((entry) => (
          <article key={entry.slug} data-reveal className="border-b border-line py-8">
            <p className="text-2xs text-muted tabular-nums">
              {entry.date} &middot; {readingTime(entry)} min read &middot; {entry.topic}
            </p>
            <h2 className="mt-2 text-lg text-ink">
              <Link
                href={`/writing/${entry.slug}`}
                className="transition-colors hover:text-accent"
              >
                {entry.title}
              </Link>
            </h2>
            <p className="mt-3 max-w-(--container-reading) text-sm text-muted">
              {entry.standfirst}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
