// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Full test configuration including comprehensive link validation
 * Use this for thorough testing of all templates and links
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configure projects for different browsers
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
  ],
  
  // Global timeout settings for link validation
  timeout: 60000, // 1 minute per test
  expect: {
    timeout: 10000, // 10 seconds for individual assertions
  },
});