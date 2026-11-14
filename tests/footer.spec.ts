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
 * The oversized wordmark fills the content column: its font size is the
 * column's width divided by the word's width in ems, so with Syne loaded
 * its box meets both edges of the frame. Checked on phones and a laptop.
 * Before Syne arrives (display: swap) the fallback face runs narrower, so
 * the word is also centred in the frame: with the font blocked, the space
 * on each side is the same.
 */
const WORDMARK_WIDTHS = [
  { width: 320, mobile: true },
  { width: 360, mobile: true },
  { width: 414, mobile: true },
  { width: 1280, mobile: false },
];

async function wordmarkGaps(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const frame = document.querySelector(".footer-wordmark-frame")!.getBoundingClientRect();
    const mark = document.querySelector(".footer-wordmark")!.getBoundingClientRect();
    return { left: mark.left - frame.left, right: frame.right - mark.right, frame: frame.width };
  });
}

for (const { width, mobile } of WORDMARK_WIDTHS) {
  test(`the wordmark spans the column edge to edge at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 740 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const gaps = await wordmarkGaps(page);
    expect(gaps.frame).toBeGreaterThan(200);
    /* Each edge within 2.5px of the frame's: the word's width in ems is
       measured once and rounds a little at each size; past the edge it is
       clipped, so only the gap on each side can show. */
    expect.soft(gaps.left, `left gap ${gaps.left.toFixed(1)}px at ${width}px`).toBeLessThanOrEqual(2.5);
    expect.soft(gaps.right, `right gap ${gaps.right.toFixed(1)}px at ${width}px`).toBeLessThanOrEqual(2.5);
    await context.close();
  });
}

test("the wordmark sits centred while the display font is still loading", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await context.route(/\.woff2?(\?|$)/, (route) => route.abort());
  const page = await context.newPage();
  await page.goto("/");
  const gaps = await wordmarkGaps(page);
  expect(Math.abs(gaps.left - gaps.right), `gaps ${gaps.left.toFixed(1)}px and ${gaps.right.toFixed(1)}px`).toBeLessThanOrEqual(1);
  await context.close();
});
