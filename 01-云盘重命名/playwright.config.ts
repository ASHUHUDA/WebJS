import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  testIgnore: ['**/dist-smoke.spec.ts'],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3333',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-1024', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
  ],
  webServer: {
    command: 'corepack.cmd pnpm exec vite --host 127.0.0.1 --port 3333',
    url: 'http://127.0.0.1:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
