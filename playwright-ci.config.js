// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * CI-optimized Playwright configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'basic-validation.spec.js', // Only run basic validation tests in CI
  fullyParallel: false, // Disable parallel execution for simpler CI logs
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced retries for faster CI
  workers: 1, // Single worker for simpler CI execution
  reporter: process.env.CI ? 'github' : 'html',
  
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Only test in Chromium for CI speed
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});