import { defineConfig, devices } from '@playwright/test'

// Minimal Playwright setup — the FIRST browser-test infra in this repo (per the Screener Globe plan).
// Points at the pre-installed Chromium in this environment rather than triggering a browser download
// (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers and PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD are already set for
// this session; executablePath below is belt-and-suspenders so the config is explicit either way).
//
// The Screener Globe view needs the REAL Fastify control plane running (not just the Vite dev server):
// api.ts's ensureMode() probes /api/health and falls back to a read-only STATIC snapshot mode when no
// backend answers — screenerGlobe() short-circuits to an empty snapshot in that mode, which would make
// every globe e2e test pass trivially against no data. `webServer` below boots BOTH the Fastify server
// (8787) and the Vite dev server (5173, proxying /api -> 8787) so the app resolves to live mode for real.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // both webServer processes are shared/stateful — keep spec files sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: '/opt/pw-browsers/chromium' },
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../server',
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      cwd: '.',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
