import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const fixtureDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'e2e', 'fixtures')

export default defineConfig({
  testDir: './e2e',
  testMatch: /provider-lifecycle\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:5187',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'npx tsx e2e/fixture-server.ts',
      url: 'http://127.0.0.1:8899/api/health',
      reuseExistingServer: false,
      env: {
        ...process.env,
        CLAUDE_BIN: path.join(fixtureDir, 'fake-claude.mjs'),
        CODEX_BIN: path.join(fixtureDir, 'fake-codex.mjs'),
        ENGINE_CODEX_ENABLED: '1',
        ENGINE_ACTIVITY_LOG_DISABLED: '1',
      },
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 5187',
      url: 'http://127.0.0.1:5187/e2e/lifecycle.html',
      reuseExistingServer: false,
      env: { ...process.env, VITE_API_TARGET: 'http://127.0.0.1:8899' },
    },
  ],
})
