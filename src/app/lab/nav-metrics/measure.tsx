'use client';

import { useEffect, useRef, useState } from 'react';

const items = ['Work', 'Writing', 'About', 'Contact', 'Resume'];

/* The exact class strings the navbar uses, kept here so a change to the
   active state has to be reflected in the test to pass it. */
const base =
  'underline decoration-2 underline-offset-[6px] transition-colors';
const activeClass = `${base} text-ink decoration-accent`;
const idleClass = `${base} text-muted decoration-transparent`;

type Row = { item: string; idle: string; active: string; same: boolean };

export default function NavMetrics() {
  const idleRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLUListElement>(null);
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !idleRef.current || !activeRef.current) return;

      const read = (list: HTMLUListElement) =>
        Array.from(list.querySelectorAll('a')).map((anchor) => {
          const rect = anchor.getBoundingClientRect();
          return `${rect.width.toFixed(2)}x${rect.height.toFixed(2)}@${(
            rect.left - list.getBoundingClientRect().left
          ).toFixed(2)}`;
        });

      const idle = read(idleRef.current);
      const active = read(activeRef.current);

      setRows(
        items.map((item, index) => ({
          item,
          idle: idle[index],
          active: active[index],
          same: idle[index] === active[index],
        })),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-10">
      <ul ref={idleRef} className="flex items-center gap-6 text-sm">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className={idleClass}>
              {item}
            </a>
          </li>
        ))}
      </ul>

      {/* Same list, every item active: if any metric differs, clicking a tab
          would reflow the row. */}
      <ul ref={activeRef} className="mt-4 flex items-center gap-6 text-sm">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className={activeClass}>
              {item}
            </a>
          </li>
        ))}
      </ul>

      <pre
        id="nav-metrics"
        className="mt-8 overflow-x-auto border border-line bg-raised p-4 font-mono text-2xs text-muted"
      >
        {rows
          ? JSON.stringify(
              { shiftFree: rows.every((row) => row.same), rows },
              null,
              2,
            )
          : 'measuring…'}
      </pre>
    </div>
  );
}
