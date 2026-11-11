import { defineConfig, devices } from "@playwright/test";

/* Smoke tests against the production build (`next start`), never the dev
   server: they check what ships. `pnpm build` must run first; CI does that
   before this, and locally `pnpm test:e2e` reuses a server already running
   on the port. CHROMIUM_PATH points Playwright at a system Chromium when the
   bundled one is not installed. */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    reducedMotion: "reduce",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `pnpm exec next start -p ${PORT} -H 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
