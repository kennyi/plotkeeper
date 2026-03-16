import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "ci-test@plotkeeper.dev";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "PlotKeeperCI2026!";
const AUTH_FILE = "e2e/.auth/user.json";

// Mirrors @supabase/ssr's createChunks — splits on encodeURIComponent length
const MAX_CHUNK_SIZE = 3180;

function buildAuthCookies(projectRef: string, sessionJson: string) {
  const key = `sb-${projectRef}-auth-token`;
  const encoded = encodeURIComponent(sessionJson);

  if (encoded.length <= MAX_CHUNK_SIZE) {
    return [{ name: key, value: sessionJson }];
  }

  // Split the URL-encoded string at chunk boundaries, store decoded chunks
  const cookies: { name: string; value: string }[] = [];
  let remaining = encoded;
  let i = 0;

  while (remaining.length > 0) {
    let head = remaining.slice(0, MAX_CHUNK_SIZE);
    // Don't cut in the middle of a %XX escape
    const lastEscape = head.lastIndexOf("%");
    if (lastEscape > MAX_CHUNK_SIZE - 3) {
      head = head.slice(0, lastEscape);
    }
    cookies.push({ name: `${key}.${i}`, value: decodeURIComponent(head) });
    remaining = remaining.slice(head.length);
    i++;
  }

  return cookies;
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000";

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // ── Step 1: Sign in via Supabase REST (no browser, no form) ──────────────
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase sign-in failed (${res.status}): ${body}`);
  }

  const session = await res.json();
  const sessionJson = JSON.stringify(session);

  // ── Step 2: Build auth cookies the way @supabase/ssr expects ─────────────
  const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
  const cookieChunks = buildAuthCookies(projectRef, sessionJson);

  const cookies = cookieChunks.map(({ name, value }) => ({
    name,
    value,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  }));

  // ── Step 3: Open browser with those cookies and verify /dashboard loads ───
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForURL(`${baseURL}/dashboard`, { timeout: 15_000 });

  await context.storageState({ path: AUTH_FILE });
  await browser.close();
}
