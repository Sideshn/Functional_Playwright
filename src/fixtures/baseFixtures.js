/**
 * Base Fixtures for Playwright Tests
 * 
 * Purpose: Provide reusable test fixtures for browser, context, page setup
 * Pattern: Playwright Fixtures Pattern
 * 
 * Benefits:
 * - Automatic setup and teardown
 * - Dependency injection
 * - Cleaner test code
 * - Better resource management
 * - Shared state between tests
 * 
 * @author Automation Team
 * @version 1.0
 * @created November 19, 2025
 */

const { test: base, expect } = require('@playwright/test');
const BaseTest = require('../Base/BaseTest');
const CoreKeywords = require('../Core/CoreKeywords');
const FileKeywords = require('../Core/FileKeywords');
const JsonLocalizationParser = require('../Parsers/JsonLocalizationParser');
const JsonSitemapParser = require('../Parsers/JsonSitemapParser');

/**
 * Extended test fixtures
 */
const test = base.extend({
  /**
   * BaseTest fixture - provides configured BaseTest instance (shared per worker)
   * Calls globalSetup once at start, globalTeardown once at end
   * Browser and context persist across all tests in the file
   * Scope: worker - browser launched once, closed after all tests
   */
  baseTest: [async ({ browser }, use, workerInfo) => {
    const baseTest = new BaseTest();
    
    // Call globalSetup with worker info
    await baseTest.globalSetup(workerInfo);
    
    await use(baseTest);
    
    // Call globalTeardown - runs only after ALL tests complete
    await baseTest.globalTeardown(workerInfo);
  }, { scope: 'worker' }],

  /**
   * Test-level fixture - calls navigateIfNeeded and testTeardown per test
   * This runs for each test to handle test-specific setup/teardown
   */
  testContext: async ({ baseTest }, use, testInfo) => {
    await baseTest.navigateIfNeeded(testInfo);
    await use(baseTest);
    baseTest.testTeardown(testInfo);
  },

  /**
   * Page fixture - provides Playwright page from BaseTest
   * Depends on testContext to ensure per-test setup runs
   */
  page: async ({ testContext }, use) => {
    await use(testContext.page);
  },

  /**
   * CoreKeywords fixture - provides core automation keywords
   * Depends on testContext to ensure per-test setup runs
   */
  core: async ({ testContext, site }, use) => {
    const core = new CoreKeywords(testContext.page, site);
    await use(core);
  },

  /**
   * FileKeywords fixture - provides file handling keywords
   * Depends on testContext to ensure per-test setup runs
   */
  file: async ({ core }, use) => {
    const file = new FileKeywords(core);
    await use(file);
  },

  /**
   * Localization fixture - provides localization parser
   */
  loc: async ({ }, use) => {
    const loc = new JsonLocalizationParser();
    await use(loc);
  },

  site: async ({ }, use) => {
    const site = new JsonSitemapParser();
    await use(site);
  },

  /**
   * Config fixture - provides test configuration
   * Depends on testContext to ensure per-test setup runs
   */
  config: async ({ testContext }, use) => {
    await use(testContext.config);
  }
});

module.exports = { test, expect };
