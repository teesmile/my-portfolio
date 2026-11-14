import { test, expect } from "@playwright/test";

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
