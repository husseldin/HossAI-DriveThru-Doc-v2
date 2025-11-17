import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for E2E Tests
 * Tests the complete user journey across all applications
 */
export default defineConfig({
  testDir: './e2e',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list']
  ],

  // Shared settings
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:46002',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshots
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev servers before tests
  webServer: [
    {
      command: 'cd demo-ui && npm run dev',
      url: 'http://localhost:46002',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
})
