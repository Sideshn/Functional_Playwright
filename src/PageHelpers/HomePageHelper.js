/**
 * Home Page Helper
 * 
 * Purpose: Semantic wrapper methods for home page actions
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * Benefits:
 *  - Readable test code (homeHelper.navigateToProducts())
 *  - Maintainable locators (JSON-based)
 *  - Common navigation actions encapsulated
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class HomePageHelper {
  /**
   * Constructor
   * @param {Object} core - CoreKeywords instance
   * @param {Object} sitemaps - Sitemap constants
   * @param {Object} page - Playwright page object
   * @param {Object} config - Test configuration
   */
  constructor(core, sitemaps, page, config) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
    this.config = config;
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to home page by clicking logo
   */
  async navigateToHome() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'logoImage');
    await this.page.waitForURL(this.config.app.baseUrl, { timeout: 10000 });
  }

  /**
   * Navigate to Products page
   */
  async navigateToProducts() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'ProductsLinkOption');
    await this.page.waitForURL('**/products', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Cart page
   */
  async navigateToCart() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'CartLinkOption');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Signup/Login page
   */
  async navigateToSignupLogin() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'SignupOrLoginLinkOption');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Contact Us page
   */
  async navigateToContactUs() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'ContactUsLink');
    await this.page.waitForURL('**/contact_us', { timeout: 10000 });
  }

  /**
   * Navigate to Test Cases page
   */
  async navigateToTestCases() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'TestCasesLink');
    await this.page.waitForURL('**/test_cases', { timeout: 10000 });
  }

  // ==================== Verification Methods ====================

  /**
   * Verify home page is loaded
   * @returns {boolean} True if home page visible
   */
  async isHomePageVisible() {
    const logoLocator = await this.core.getElement(this.sitemaps.home, 'HomeScreen', 'logoImage');
    return await logoLocator.isVisible({ timeout: 10000 });
  }

  /**
   * Verify user is logged in
   * @param {string} expectedUsername - Expected username to verify
   * @returns {boolean} True if logged in message contains username
   */
  async isUserLoggedIn(expectedUsername = null) {
    try {
      const loggedInText = await this.core.getText(this.sitemaps.home, 'HomeScreen', 'LoggedInAsLinkOption');
      if (expectedUsername) {
        return loggedInText.includes(expectedUsername);
      }
      return loggedInText.includes('Logged in as');
    } catch {
      return false;
    }
  }

  /**
   * Get current logged-in username
   * @returns {string|null} Username or null if not logged in
   */
  async getLoggedInUsername() {
    try {
      const loggedInText = await this.core.getText(this.sitemaps.home, 'HomeScreen', 'LoggedInAsLinkOption');
      // Extract username from "Logged in as USERNAME"
      const match = loggedInText.match(/Logged in as (.+)/);
      return match ? match[1].trim() : null;
    } catch {
      return null;
    }
  }

  // ==================== Subscription Methods ====================

  /**
   * Subscribe to newsletter from home page footer
   * @param {string} email - Email address to subscribe
   */
  async subscribeToNewsletter(email) {
    await this.core.fillText(this.sitemaps.home, 'HomeScreen', 'SubscriptionEmailInput', email);
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'SubscribeButton');
  }

  /**
   * Verify subscription success message
   * @returns {boolean} True if success message visible
   */
  async isSubscriptionSuccessVisible() {
    try {
      const successMessage = await this.core.getElement(this.sitemaps.home, 'HomeScreen', 'SubscriptionSuccessMessage');
      return await successMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  // ==================== Account Management ====================

  /**
   * Logout from application
   */
  async logout() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'LogoutButtonLinkOption');
    await this.page.waitForURL('**/login', { timeout: 10000 });
  }

  /**
   * Delete account
   */
  async deleteAccount() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'DeleteAccountLinkOption');
    await this.page.waitForURL('**/delete_account', { timeout: 10000 });
  }

  // ==================== Workflow Methods ====================

  /**
   * Complete workflow: Navigate to home and verify
   * @returns {boolean} True if navigation successful
   */
  async navigateAndVerifyHome() {
    await this.navigateToHome();
    return await this.isHomePageVisible();
  }

  /**
   * Complete workflow: Subscribe and verify
   * @param {string} email - Email address
   * @returns {boolean} True if subscription successful
   */
  async subscribeAndVerify(email) {
    await this.subscribeToNewsletter(email);
    return await this.isSubscriptionSuccessVisible();
  }
}

module.exports = HomePageHelper;
