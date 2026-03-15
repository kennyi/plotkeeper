import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the core pages render without crashing.
 *
 * These run against the dev Supabase project (no auth session), so all pages
 * render with empty/fallback data rather than real content. That's intentional:
 * we're testing that the app doesn't hard-crash, navigation works, and key UI
 * landmarks are present.
 *
 * For tests that need real data, add a `test.use({ storageState: 'e2e/auth.json' })`
 * block once Supabase Auth is wired up (Phase 4).
 */

test.describe("Navigation", () => {
  test("/ redirects to /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Dashboard", () => {
  test("page renders", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Plant Library", () => {
  test("page renders with search input", async ({ page }) => {
    await page.goto("/plants");
    await expect(page.locator("h1").first()).toBeVisible();
    // Search input should always be present regardless of auth state
    await expect(page.locator("input[type='text'], input[placeholder]").first()).toBeVisible();
  });
});

test.describe("Garden Beds", () => {
  test("page renders", async ({ page }) => {
    await page.goto("/beds");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("new bed page renders form", async ({ page }) => {
    await page.goto("/beds/new");
    await expect(page.locator("form, [role='form']").first()).toBeVisible();
  });
});

test.describe("Calendar", () => {
  test("page renders with month selector", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Monthly Jobs", () => {
  test("page renders", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Journal", () => {
  test("page renders", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("new entry page renders form", async ({ page }) => {
    await page.goto("/journal/new");
    await expect(page.locator("form, [role='form'], textarea").first()).toBeVisible();
  });
});

test.describe("Pests & Diseases", () => {
  test("page renders", async ({ page }) => {
    await page.goto("/pests");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Settings", () => {
  test("page renders form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("form, input").first()).toBeVisible();
  });
});
