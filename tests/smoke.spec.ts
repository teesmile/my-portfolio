import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke tests: every page the sitemap lists loads, says what it is, and fits
 * a small phone; the contact links, the feed and the CV download work.
 *
 * Reduced motion is on for every test (playwright.config.ts). Every
 * animation on the site has a reduced-motion path, so pages render in their
 * resting state and nothing is measured mid-entrance.
 */

const SITE = "https://anthonyugwuja.dev";

async function sitemapPaths(page: Page) {
  const response = await page.request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(10);
  return locs.map((loc) => loc.replace(SITE, "") || "/");
}

test("every sitemap page loads with one h1, a canonical and no script errors", async ({ page }) => {
  const paths = await sitemapPaths(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));

  for (const path of paths) {
    await test.step(path, async () => {
      const response = await page.goto(path);
      expect.soft(response?.status(), path).toBe(200);
      await expect.soft(page.locator("h1"), path).toHaveCount(1);
      await expect
        .soft(page.locator('link[rel="canonical"]'), path)
        .toHaveAttribute("href", `${SITE}${path === "/" ? "" : path}`);
      await expect
        .soft(page.locator('link[rel="alternate"][type="application/rss+xml"]'), path)
        .toHaveAttribute("href", /\/writing\/feed\.xml$/);
    });
  }
  expect(errors).toEqual([]);
});

test("no page scrolls sideways on a 360px phone", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const path of await sitemapPaths(page)) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect.soft(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  }
  await context.close();
});

test("contact: email, and one WhatsApp button with the greeting typed", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);

  const whatsapp = page.locator('a[href^="https://wa.me/"]');
  await expect(whatsapp).toHaveCount(1);
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAccessibleName("Message me on WhatsApp");
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  const url = new URL((await whatsapp.getAttribute("href"))!);
  expect(url.pathname).toMatch(/^\/\d+$/);
  expect(url.searchParams.get("text")).toBe("Hi Anthony, I found you through your portfolio.");

  /* WhatsApp's own glyph, the white file on the dark theme and the black one
     on the light theme, and it has actually loaded. */
  for (const [theme, file] of [["dark", "White"], ["light", "Black"]] as const) {
    await page.evaluate((t) => document.documentElement.classList.toggle("light", t === "light"), theme);
    const glyph = whatsapp.locator("img:visible");
    await expect(glyph, theme).toHaveCount(1);
    await expect(glyph, theme).toHaveAttribute("src", `/brand/whatsapp/Digital_Glyph_${file}_RGB_2026.svg`);
    expect(await glyph.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), theme).toBe(true);
  }
});

test("the writing feed is RSS and every item links to a live piece", async ({ page }) => {
  const response = await page.request.get("/writing/feed.xml");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain('<rss version="2.0"');
  const links = [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]);
  expect(links.length).toBeGreaterThan(0);

  await page.goto("/writing");
  const listed = await page.locator('main a[href^="/writing/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((a) => a.getAttribute("href")))],
  );
  expect(links.map((link) => link.replace(SITE, "")).sort()).toEqual(listed.sort());
  for (const link of links) {
    expect((await page.request.get(link.replace(SITE, ""))).status(), link).toBe(200);
  }
});

test("the resume renders and its PDF downloads", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.locator("h1")).toHaveText("Anthony Ugwuja");
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/\+234|903 ?257/);
  const pdf = await page.locator("a[download]").getAttribute("href");
  const response = await page.request.get(pdf!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test("an unknown address answers 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
});
