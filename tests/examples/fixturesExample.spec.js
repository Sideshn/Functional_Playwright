/**
 * Example Test Using Fixtures
 * 
 * Purpose: Demonstrate how to use reusable fixtures in tests
 * Framework: Playwright with JavaScript - Using Fixtures Pattern
 * 
 * Benefits of Using Fixtures:
 * - Cleaner, more readable test code
 * - Automatic setup and teardown
 * - Dependency injection
 * - Better resource management
 * - Easy data parameterization
 * 
 * @author Automation Team
 * @version 1.0
 * @created November 19, 2025
 */

const { test: pageTest } = require('../../src/fixtures/pageFixtures');
const { expect } = require('@playwright/test');

pageTest.describe('Example: Login Tests with Fixtures', () => {
  
  /**
   * Example 1: Basic test using core fixtures
   * Notice: No beforeAll, beforeEach, afterEach, afterAll hooks needed!
   * Fixtures handle everything automatically
   */
  pageTest('Example 1: Login with valid credentials using fixtures', async ({ core, config, sitemaps }) => {
    // Navigate to login page
    await core.clickElement(sitemaps.home, 'HomeScreen', 'SignupOrLoginLinkOption');
    
    // Verify login section is visible
    const loginHeader = await core.getElement(sitemaps.login, 'Login', 'LoginToYourAccountTextField');
    await expect(loginHeader).toBeVisible({ timeout: 5000 });
    
    // Fill credentials using config.users.administrator
    await core.fillText(sitemaps.login, 'Login', 'LoginToYourAccountEmailAddressInputBox', config.users.administrator.emailAddress);
    await core.fillText(sitemaps.login, 'Login', 'LoginToYourAccountPasswordInputBox', config.users.administrator.password);
    
    // Submit login
    await core.clickElement(sitemaps.login, 'Login', 'LoginButton');
    
    // Verify login success
    const loggedInText = await core.getElement(sitemaps.home, 'HomeScreen', 'LoggedInAsLinkOption');
    await expect(loggedInText).toBeVisible({ timeout: 10000 });
    
    const loggedInMessage = await core.getText(sitemaps.home, 'HomeScreen', 'LoggedInAsLinkOption');
    expect(loggedInMessage).toContain(config.users.administrator.username);
  });

  /**
   * Example 2: Test using config fixture
   */
  pageTest('Example 2: Verify base URL from config', async ({ config, page }) => {
    const baseUrl = config.app.baseUrl;
    expect(baseUrl).toBe('https://automationexercise.com/');
    expect(page.url()).toContain(baseUrl);
  });

  /**
   * Example 3: Test using localization fixture
   */
  pageTest('Example 3: Verify localized strings', async ({ core, sitemaps }) => {
    await core.clickElement(sitemaps.home, 'HomeScreen', 'SignupOrLoginLinkOption');
    
    const loginHeading = await core.getText(sitemaps.login, 'Login', 'LoginToYourAccountTextField');
    expect(loginHeading.trim()).toBe('Login to your account');
  });

  /**
   * Example 4: Access config data directly
   */
  pageTest('Example 4: Use config data directly', async ({ config }) => {
    expect(config.contactUs.testUser.name).toBe('Test User');
    expect(config.contactUs.testUser.email).toBe('testuser@automationexercise.com');
    expect(config.contactUs.testUser.subject).toBe('Test Automation Query');
  });
});

/**
 * Example: Using Multiple Fixtures Together
 */
pageTest.describe('Example: Advanced Fixture Usage', () => {
  
  pageTest('Example 5: Combine multiple fixtures in one test', async ({ 
    core, 
    file, 
    config, 
    loc,
    page,
    sitemaps
  }) => {
    // All fixtures are automatically injected and ready to use
    // No manual initialization needed!
    
    // Use core keywords with sitemaps fixture
    await core.clickElement(sitemaps.home, 'HomeScreen', 'SignupOrLoginLinkOption');
    
    // Use test data from config
    console.log('Testing with user:', config.users.administrator.emailAddress);
    
    // Use localization
    const heading = loc.getValue('ResourcesStrings', 'ContactUs.GetInTouchHeading');
    console.log('Localized heading:', heading);
    
    // Use config
    console.log('Base URL:', config.app.baseUrl);
    
    // Use page directly
    console.log('Current URL:', page.url());
    
    // All cleanup is automatic - no need for teardown!
  });
});
