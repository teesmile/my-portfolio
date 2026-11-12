import { test, expect, type Page } from "@playwright/test";

/**
 * The scroll reveals can hide text and must never leave it hidden.
 *
 * Motion is ON here, on a phone with touch, because that is where the
 * reveals run and where the bug lived: paragraphs that stayed invisible
 * after moving from one page to the next. The walk clicks between pages
 * the way a reader does (never page.goto after the first), and on every
 * page checks twice: what is on the first screen is visible soon after
 * arriving, and after scrolling to the bottom nothing is hidden anywhere.
 */
test.use({
  reducedMotion: "no-preference",
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

/* Every piece of text a reader expects to see. Things hidden on purpose
   (the deck's back cards, the marquee's duplicate run, sr-only labels) are
   aria-hidden or inert, and are skipped. */
const TEXT = "main :is(p, li, h1, h2, h3, dt, dd, figcaption)";

async function hiddenText(page: Page, onlyOnScreen: boolean) {
  return page.evaluate(
    ({ selector, onlyOnScreen }) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(selector)) {
        if (!el.textContent?.trim()) continue;
        if (el.closest('[aria-hidden="true"], [inert]')) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (onlyOnScreen && (box.top >= window.innerHeight || box.bottom <= 0)) continue;
        let node: HTMLElement | null = el;
        let reason: string | null = null;
        while (node && node !== document.body) {
          const style = getComputedStyle(node);
          if (Number(style.opacity) < 0.99) {
            reason = `opacity ${style.opacity} on <${node.tagName.toLowerCase()}${node.hasAttribute("data-reveal") ? " data-reveal" : ""}>`;
            break;
          }
          if (style.visibility === "hidden") {
            reason = "visibility hidden";
            break;
          }
          node = node.parentElement;
        }
        if (reason) out.push(`<${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 48)}" ${reason}, top ${Math.round(box.top)}`);
      }
      return out;
    },
    { selector: TEXT, onlyOnScreen },
  );
}

/** Scroll to the bottom in reader-sized steps, then settle. */
async function readThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    const height = () => document.documentElement.scrollHeight;
    for (let y = 0; y < height(); y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }
    window.scrollTo(0, height());
  });
  await page.waitForTimeout(1200);
}

async function checkPage(page: Page, name: string) {
  await test.step(name, async () => {
    await expect(page.locator("h1")).toHaveCount(1);
    await page.waitForTimeout(1800);
    expect.soft(await hiddenText(page, true), `${name}: hidden on the first screen`).toEqual([]);
    await readThrough(page);
    expect.soft(await hiddenText(page, false), `${name}: hidden after reading through`).toEqual([]);
    expect.soft(await page.locator('[data-reveal="wait"]').count(), `${name}: still waiting to reveal`).toBe(0);

    /* The reveals replay: back at the top, what has dropped below the
       screen is waiting again, and the first screen is still all there.
       Reading down a second time must leave nothing hidden either. */
    const tall = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight * 2);
    if (tall) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      expect.soft(await hiddenText(page, true), `${name}: hidden on the first screen after scrolling back up`).toEqual([]);
      expect.soft(await page.locator('[data-reveal="wait"]').count(), `${name}: nothing re-armed for a replay`).toBeGreaterThan(0);
      await readThrough(page);
      expect.soft(await hiddenText(page, false), `${name}: hidden after reading through a second time`).toEqual([]);
    }
  });
}

/* The phone menu: links to the other pages live behind the menu button. */
async function viaMenu(page: Page, name: string) {
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name, exact: true }).click();
}

test("clicking between pages never leaves a paragraph hidden", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/");
  await checkPage(page, "/ (first load)");

  await viaMenu(page, "Work");
  await expect(page).toHaveURL(/\/work$/);
  await checkPage(page, "/work");

  await page.getByRole("link", { name: "Case study" }).first().click();
  await expect(page).toHaveURL(/\/work\/[a-z-]+$/);
  await checkPage(page, "a case study");

  await page.getByRole("link", { name: "All work" }).first().click();
  await expect(page).toHaveURL(/\/work$/);
  await checkPage(page, "/work (back)");

  await viaMenu(page, "Writing");
  await expect(page).toHaveURL(/\/writing$/);
  await checkPage(page, "/writing");

  await page.locator('main a[href^="/writing/"]').first().click();
  await expect(page).toHaveURL(/\/writing\/[a-z-]+$/);
  await checkPage(page, "a writing piece");

  await viaMenu(page, "About");
  await expect(page).toHaveURL(/\/about$/);
  await checkPage(page, "/about");

  await viaMenu(page, "Contact");
  await expect(page).toHaveURL(/\/contact$/);
  await checkPage(page, "/contact");

  await page.getByRole("link", { name: /go to the home page/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await checkPage(page, "/ (back)");

  await page.getByRole("link", { name: "See my work" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await checkPage(page, "/work (from the hero)");

  await page.getByRole("link", { name: "See the traps and the evidence" }).click();
  await expect(page).toHaveURL(/\/work\/renal-dosing-task$/);
  await checkPage(page, "/work/renal-dosing-task");
});
