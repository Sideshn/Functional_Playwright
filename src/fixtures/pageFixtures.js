/**
 * Page Object Fixtures
 * 
 * Purpose: Provide reusable page object instances
 * Pattern: Page Object Model with Fixtures
 * 
 * Benefits:
 * - Centralized page object management
 * - Automatic initialization
 * - Cleaner test code
 * 
 * @author Automation Team
 * @version 1.0
 * @created November 19, 2025
 */

const { test: base } = require('./baseFixtures');
const { expect } = require('@playwright/test');
const ProductPageHelper = require('../PageHelpers/ProductPageHelper');
const HomePageHelper = require('../PageHelpers/HomePageHelper');
const CartPageHelper = require('../PageHelpers/CartPageHelper');
const LoginPageHelper = require('../PageHelpers/LoginPageHelper');
const ContactUsPageHelper = require('../PageHelpers/ContactUsPageHelper');
const TestCasesPageHelper = require('../PageHelpers/TestCasesPageHelper');

const test = base.extend({
  /**
   * Sitemap constants fixture
   */
  sitemaps: async ({ baseTest }, use) => {
    const sitemaps = {
      login: 'LoginSiteMaps',
      contactUs: 'ContactUsSiteMaps',
      home: 'HomeScreenSiteMaps',
      testCases: 'TestCasesSiteMaps',
      products: 'ProductsSiteMaps',
      cart: 'CartSiteMaps'
    };
    await use(sitemaps);
  },

  localization: async ({ baseTest }, use) => {
    const localization = {
      constraint: 'ConstraintStrings',
      resource: 'ResourceStrings'
    };
    await use(localization);
  },

  /**
   * Product Page Helper fixture
   * Provides semantic methods for product-related operations
   */
  productHelper: async ({ core, sitemaps, page, loc }, use) => {
    const helper = new ProductPageHelper(core, sitemaps, page, loc);
    await use(helper);
  },

  /**
   * Home Page Helper fixture
   * Provides semantic methods for home page navigation
   */
  homeHelper: async ({ core, sitemaps, page, config }, use) => {
    const helper = new HomePageHelper(core, sitemaps, page, config);
    await use(helper);
  },

  /**
   * Cart Page Helper fixture
   * Provides semantic methods for cart operations
   */
  cartHelper: async ({ core, sitemaps, page }, use) => {
    const helper = new CartPageHelper(core, sitemaps, page);
    await use(helper);
  },

  /**
   * Login Page Helper fixture
   * Provides semantic methods for authentication operations
   */
  loginHelper: async ({ core, sitemaps, page, config }, use) => {
    const helper = new LoginPageHelper(core, sitemaps, page, config);
    await use(helper);
  },

  /**
   * Contact Us Page Helper fixture
   * Provides semantic methods for contact form operations
   */
  contactHelper: async ({ core, sitemaps, page, config }, use) => {
    const helper = new ContactUsPageHelper(core, sitemaps, page, config);
    await use(helper);
  },

  /**
   * Test Cases Page Helper fixture
   * Provides semantic methods for test cases page operations
   */
  testCasesHelper: async ({ core, sitemaps, page }, use) => {
    const helper = new TestCasesPageHelper(core, sitemaps, page);
    await use(helper);
  }
});

module.exports = { test, expect };
