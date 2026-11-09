/**
 * The illustration palette, as values an SVG attribute can take.
 *
 * The colours themselves live in globals.css (--ill-*), with a dark and a
 * light value each, so a figure re-colours with the theme without
 * re-rendering. Every figure, banner, rail drawing and the renal loop draws
 * from these and nothing else:
 *
 *   text / detail     primary labels / secondary labels only
 *   accent            emphasis and the correct value
 *   accentSoft        fill of a highlighted shape
 *   accentFill        a solid amber shape (bright amber in both themes; give
 *                     it an `accent` outline where it carries meaning)
 *   panel / edge      filled boxes and their amber-tinted edges
 *   shape             neutral filled shapes (text lines, bars)
 *   error / errorSoft the wrong value, and the fill of a wrong shape
 *   shadow / glow     depth and warm light for the banner and share scenes
 *
 * Contrast was measured for every text-on-fill pairing in both themes before
 * the values were set: text at least 4.5:1, edges at least 3:1. One pairing
 * is deliberately not used: red text on accentSoft (red sits on errorSoft).
 */
export const ILL = {
  text: "var(--ill-text)",
  detail: "var(--ill-detail)",
  accent: "var(--ill-accent)",
  accentSoft: "var(--ill-accent-soft)",
  accentFill: "var(--ill-accent-fill)",
  panel: "var(--ill-panel)",
  edge: "var(--ill-edge)",
  shape: "var(--ill-shape)",
  error: "var(--ill-error)",
  errorSoft: "var(--ill-error-soft)",
  shadow: "var(--ill-shadow)",
  glow: "var(--ill-glow)",
  glowError: "var(--ill-glow-error)",
} as const;
