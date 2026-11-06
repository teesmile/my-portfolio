'use client';

import { useEffect, useState } from 'react';

type Result = {
  candidate: string;
  leading: string;
  width: string;
  theme: string;
  size: number;
  lines: number;
  maxLines: number;
  computedLeading: number;
  overflows: boolean;
  passes: boolean;
};

/* Counts rendered line boxes with a Range: each line of a wrapped text node
   produces its own client rect, so distinct rect tops are the line count. */
function measureAll(): Result[] {
  const results: Result[] = [];

  document.querySelectorAll<HTMLElement>('[data-specimen]').forEach((box) => {
    const text = box.querySelector<HTMLElement>('[data-text]');
    if (!text) return;

    const range = document.createRange();
    range.selectNodeContents(text);
    const tops = new Set(
      Array.from(range.getClientRects()).map((rect) => Math.round(rect.top)),
    );

    const styles = getComputedStyle(text);
    const computedLeading =
      parseFloat(styles.lineHeight) / parseFloat(styles.fontSize);
    /* With hyphens:none and overflow-wrap:normal a break can only land
       mid-word if a single word is wider than the box, which shows up as
       horizontal overflow. */
    const overflows = text.scrollWidth > text.clientWidth + 1;
    const maxLines = Number(box.dataset.maxLines);
    const lines = tops.size;

    results.push({
      candidate: box.dataset.candidate ?? '',
      leading: box.dataset.leading ?? '',
      width: box.dataset.width ?? '',
      theme: box.dataset.theme ?? '',
      size: Number(box.dataset.size),
      lines,
      maxLines,
      computedLeading: Number(computedLeading.toFixed(3)),
      overflows,
      passes:
        lines <= maxLines &&
        !overflows &&
        computedLeading >= 0.95 &&
        computedLeading <= 1.05,
    });
  });

  return results;
}

export default function TypeMeasure() {
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (!cancelled) setResults(measureAll());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!results) {
    return <p className="mt-8 text-2xs text-muted">Measuring…</p>;
  }

  /* A candidate+leading combination wins only if both widths have at least one
     passing size in both themes. The largest passing size is the one to ship. */
  const byCombo = new Map<string, Result[]>();
  results.forEach((result) => {
    const key = `${result.candidate}@${result.leading}`;
    byCombo.set(key, [...(byCombo.get(key) ?? []), result]);
  });

  const combos = Array.from(byCombo.entries()).map(([key, group]) => {
    const largestPassing = (width: string) => {
      const sizes = group
        .filter((item) => item.width === width && item.passes)
        .map((item) => item.size);
      const bothThemes = sizes.filter(
        (size) =>
          group.filter(
            (item) => item.width === width && item.size === size && item.passes,
          ).length === 2,
      );
      return bothThemes.length ? Math.max(...bothThemes) : null;
    };

    const wide = largestPassing('1280');
    const narrow = largestPassing('360');

    return {
      key,
      passes: wide !== null && narrow !== null,
      shipAt: { desktop: wide, mobile: narrow },
    };
  });

  const winner = combos.find((combo) => combo.passes);

  return (
    <div className="mt-8 border border-line bg-raised p-5">
      <p className="font-display text-sm text-ink">
        Verdict: {winner ? winner.key : 'no candidate passes'}
      </p>
      <pre
        id="type-results"
        className="mt-4 overflow-x-auto font-mono text-2xs text-muted"
      >
        {JSON.stringify({ winner: winner?.key ?? null, shipAt: winner?.shipAt ?? null, combos }, null, 2)}
      </pre>
    </div>
  );
}
