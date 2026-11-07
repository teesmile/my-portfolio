/**
 * One timing scale for the whole site.
 *
 * Durations and eases live here rather than inline so "everything reads too
 * fast" is one edit, not thirty. The numbers are chosen so a view's entrance
 * lands between 0.6s and 1s in total: a 0.5s tween with a 0.09s stagger over
 * five items finishes at 0.86s, which is long enough to read as deliberate
 * and short enough that nobody waits for it.
 *
 * Nothing here blocks navigation — these are entrance timings, played after
 * the route has already changed.
 */
export const DURATION = {
  /** A single step inside a compound effect — a glitch frame, a caret blink. */
  step: 0.06,
  /** Cursor-following motion, which must feel attached rather than animated. */
  track: 0.4,
  /** Hover states, carets, anything that should feel instant. */
  fast: 0.18,
  /** The default for a single element arriving. */
  base: 0.5,
  /** A whole view settling, or a morph across routes. */
  slow: 0.7,
  /** Reserved for the one orchestrated moment per page. */
  hero: 0.85,
} as const;

export const STAGGER = {
  /** Per character, for the typed line. Fast enough to read as typing. */
  type: 0.008,
  tight: 0.06,
  base: 0.09,
  loose: 0.12,
} as const;

export const EASE = {
  /** Arrivals: fast at first, settling at the end. */
  out: 'power3.out',
  /** Things that move between two known places. */
  inOut: 'power2.inOut',
  /** Exits, which should accelerate away. */
  in: 'power2.in',
} as const;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
