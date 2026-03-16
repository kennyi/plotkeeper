import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the core pages render without crashing.
 *
 * Unauthenticated tests confirm auth redirect behaviour.
 * Authenticated tests use the session saved by global-setup.ts.
 */

// ── Unauthenticated behaviour ─────────────────────────────────────────────────

test.describe("Unauthenticated", () => {
  // Explicitly no storageState — test the redirect itself
  test.use({ storageState: { cookies: [], origins: [] } });

  test("/ redirects to /auth/login when not logged in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("protected routes redirect to /auth/login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

// ── Authenticated — core pages ────────────────────────────────────────────────

test.describe("Dashboard", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Plant Library", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders with search input", async ({ page }) => {
    await page.goto("/plants");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("input[type='text'], input[placeholder]").first()).toBeVisible();
  });
});

test.describe("Garden Beds", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/beds");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("new bed page renders form", async ({ page }) => {
    await page.goto("/beds/new");
    await expect(page.locator("form").first()).toBeVisible();
  });
});

test.describe("Calendar", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Monthly Jobs", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Journal", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("new entry page renders form", async ({ page }) => {
    await page.goto("/journal/new");
    await expect(page.locator("form, textarea").first()).toBeVisible();
  });
});

test.describe("Pests & Diseases", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders", async ({ page }) => {
    await page.goto("/pests");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

test.describe("Settings", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("page renders form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("form, input").first()).toBeVisible();
  });
});
