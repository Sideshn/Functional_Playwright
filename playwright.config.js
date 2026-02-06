const { defineConfig } = require('@playwright/test');
const appConfig = require('./src/Config/config.json');

const browserName = (() => {
  const requested = (appConfig.browser?.name || 'chromium').toLowerCase();
  if (requested === 'firefox') return 'firefox';
  if (requested === 'webkit' || requested === 'safari') return 'webkit';
  return 'chromium'; // default/edge/chrome/chromium all map here
})();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    headless: false,
    slowMo: 100,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: browserName,
      use: {
        browserName,
        headless: appConfig.browser?.headless ?? false,
      },
    },
  ],
});

module.exports = config;
