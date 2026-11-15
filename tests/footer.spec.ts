import { test, expect, type Page } from "@playwright/test";

/**
 * On a phone the footer stacks its short items in one column, each centred:
 * the row of profile marks and the copyright line (and any button that is
 * ever added to that column). Each is measured against the centre of the
 * viewport, not only of its container, so a container nudged off centre
 * would fail too. Half a pixel of slack covers subpixel layout.
 *
 * The case this holds: the marks row once carried a negative right margin
 * meant for the sm-and-up layout, where the last glyph lines up with the
 * container's edge; on a phone it moved the row 6px right of centre.
 */
const PHONE_WIDTHS = [320, 360, 414];

for (const width of PHONE_WIDTHS) {
  test(`footer items are centred on a ${width}px phone`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const items = await page.evaluate(() => {
      const column = document.querySelector("footer > div");
      if (!column) return [];
      const centre = document.documentElement.clientWidth / 2;
      return [...column.children, ...column.querySelectorAll("button, a:not(li a)")].map((el) => {
        const box = el.getBoundingClientRect();
        return { what: `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}"`, off: box.left + box.width / 2 - centre };
      });
    });
    expect(items.length).toBeGreaterThanOrEqual(2);
    for (const item of items) {
      expect.soft(Math.abs(item.off), `${item.what} is ${item.off.toFixed(1)}px off centre at ${width}px`).toBeLessThanOrEqual(0.5);
    }
    await context.close();
  });
}

/**
 * The oversized wordmark fills the content column edge to edge: it is the
 * word's outlines in an SVG that scales to the column, so nothing about
 * fonts can change its width. Checked on four phone widths and a laptop,
 * with the display font loaded and with every font file blocked, and the
 * space on each side of it must be the page's own side margin: 16px on a
 * phone. On the laptop the column is centred in the page and a desktop
 * browser reserves a scrollbar gutter, so there the word is held to the
 * column's own edges.
 */
const WORDMARK_CASES = [
  { width: 320, mobile: true, margin: 16 },
  { width: 360, mobile: true, margin: 16 },
  { width: 390, mobile: true, margin: 16 },
  { width: 414, mobile: true, margin: 16 },
  { width: 1280, mobile: false, margin: null },
];

async function wordmarkEdges(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const frame = document.querySelector(".footer-wordmark-frame")!.getBoundingClientRect();
    const mark = document.querySelector(".footer-wordmark")!.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    return { left: mark.left, right: viewport - mark.right, frameLeft: frame.left, frameRight: viewport - frame.right, height: mark.height };
  });
}

for (const { width, mobile, margin } of WORDMARK_CASES) {
  for (const fonts of ["loaded", "blocked"] as const) {
    test(`the wordmark spans the column edge to edge at ${width}px with fonts ${fonts}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 740 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
      if (fonts === "blocked") await context.route(/\.woff2?(\?|$)/, (route) => route.abort());
      const page = await context.newPage();
      await page.goto("/");
      const edges = await wordmarkEdges(page);
      expect(edges.height).toBeGreaterThan(30);
      if (margin !== null) {
        expect.soft(Math.abs(edges.left - margin), `left gap ${edges.left.toFixed(1)}px, margin ${margin}px`).toBeLessThanOrEqual(0.5);
        expect.soft(Math.abs(edges.right - margin), `right gap ${edges.right.toFixed(1)}px, margin ${margin}px`).toBeLessThanOrEqual(0.5);
      }
      expect.soft(Math.abs(edges.left - edges.frameLeft), "the word starts where the column starts").toBeLessThanOrEqual(0.5);
      expect.soft(Math.abs(edges.right - edges.frameRight), "the word ends where the column ends").toBeLessThanOrEqual(0.5);
      await context.close();
    });
  }
}
