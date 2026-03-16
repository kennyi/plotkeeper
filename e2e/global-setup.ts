import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "ci-test@plotkeeper.dev";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "PlotKeeperCI2026!";
const AUTH_FILE = "e2e/.auth/user.json";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000";

  // Ensure the .auth directory exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/auth/login`);
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard after successful login
  await page.waitForURL(`${baseURL}/dashboard`, { timeout: 15_000 });

  // Save the authenticated session for all tests that use storageState
  await page.context().storageState({ path: AUTH_FILE });

  await browser.close();
}
