const { defineConfig, devices } = require('@playwright/test');
const config = require('./config');

module.exports = defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true, // tests are independent, so they can run in parallel and in any order
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: config.BASE_URL,
    testIdAttribute: 'data-test', // the site marks elements with data-test
    screenshot: 'only-on-failure', // saved in test-results/ and attached to the HTML report
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
