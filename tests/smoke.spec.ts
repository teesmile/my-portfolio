import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Smoke tests: every page the sitemap lists loads, says what it is, fits a
 * small phone and has a share card that loads; the contact links, the feed
 * and the CV download work.
 *
 * Reduced motion is on for every test (playwright.config.ts). Every
 * animation on the site has a reduced-motion path, so pages render in their
 * resting state and nothing is measured mid-entrance.
 */

const SITE = "https://anthonyugwuja.dev";

/* A share card is a static file made at build time, light, and quick to
   answer: the limits a crawler's fetch has to meet, with margin. The home
   card is about 80 KB; a card rendered on request takes most of a second. */
const CARD_BYTES = 100 * 1024;
const CARD_MS = 400;

/** The routes `next build` prerendered: a card not in this list is built on request. */
function prerenderedRoutes() {
  const manifest = JSON.parse(readFileSync(path.join(process.cwd(), ".next", "prerender-manifest.json"), "utf8"));
  return new Set(Object.keys(manifest.routes));
}

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
  await expect(whatsapp).toHaveAccessibleName(/^Send a DM on WhatsApp/);
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

test("every page has a share card: a static 1200x630 PNG or JPEG, light and quick", async ({ page }) => {
  /* A broken card is invisible from the site itself: the page still renders,
     and only someone sharing a link finds out. So every page in the sitemap
     is checked the way a crawler reads it: the tags, then the image those
     tags point at, fetched and its header parsed. A card that is heavy,
     slow, served without its length or built on request fails here. */
  const prerendered = prerenderedRoutes();
  for (const path of await sitemapPaths(page)) {
    await test.step(path, async () => {
      await page.goto(path);
      const tag = (selector: string) => page.locator(selector).first().getAttribute("content");
      const image = await tag('meta[property="og:image"]');
      expect.soft(image, `${path} has no og:image`).toMatch(/^https:\/\//);
      expect.soft(await tag('meta[name="twitter:card"]'), path).toBe("summary_large_image");
      expect.soft(await tag('meta[name="twitter:site"]'), path).toBe("@Tonysmile_1");
      expect.soft(await tag('meta[name="twitter:creator"]'), path).toBe("@Tonysmile_1");
      expect.soft(await tag('meta[property="og:image:width"]'), path).toBe("1200");
      expect.soft(await tag('meta[property="og:image:height"]'), path).toBe("630");
      if (!image) return;

      const started = Date.now();
      const response = await page.request.get(image.replace(SITE, ""));
      const bytes = await response.body();
      const took = Date.now() - started;
      expect.soft(response.status(), `${path} share image`).toBe(200);
      const type = response.headers()["content-type"] ?? "";
      expect.soft(type, `${path} share image type`).toMatch(/^image\/(png|jpeg)/);
      expect.soft(bytes.length, `${path} share image is empty`).toBeGreaterThan(1000);
      const size = imageSize(bytes);
      expect.soft(size, `${path} share image size`).toEqual({ width: 1200, height: 630 });
      /* `next start` streams a prerendered body in chunks and sends no
         length; Vercel serves the same file with one. Wherever a length is
         declared it has to be the file's. */
      const declared = response.headers()["content-length"];
      if (declared !== undefined) expect.soft(Number(declared), `${path} share image content-length`).toBe(bytes.length);
      expect.soft(bytes.length, `${path} share image weighs ${Math.round(bytes.length / 1024)} KB`).toBeLessThanOrEqual(CARD_BYTES);
      expect.soft(took, `${path} share image took ${took} ms`).toBeLessThan(CARD_MS);
      const route = new URL(image).pathname;
      expect.soft(prerendered.has(route), `${path} share image ${route} is built on request`).toBe(true);
    });
  }
});

/** Width and height from a PNG's IHDR or a JPEG's first SOF marker. */
function imageSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let at = 2;
    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) return null;
      const marker = bytes[at + 1];
      const length = bytes.readUInt16BE(at + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: bytes.readUInt16BE(at + 5), width: bytes.readUInt16BE(at + 7) };
      }
      at += 2 + length;
    }
  }
  return null;
}

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
