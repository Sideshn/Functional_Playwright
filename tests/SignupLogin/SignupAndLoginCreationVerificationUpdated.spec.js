/**
 * Test Suite: User Registration and Login Flow
 * 
 * Purpose: End-to-end testing of user registration, login, and account management
 * Framework: Playwright with JavaScript - Using Existing Framework
 * Pattern: Page Object Model with JSON Parsers
 * 
 * Test Coverage:
 * - TC001: Complete user registration flow with validation
 * - TC002: Login with valid credentials
 * - TC003: Login validation with invalid credentials
 * - TC004: Register user with existing email validation
 * - TC005: Account deletion flow
 * 
 * @author Automation Team
 * @version 5.0 - Added existing email validation test
 * @updated November 11, 2025
 */

const { test: pageTest } = require('../../src/fixtures/pageFixtures');
const { expect } = require('@playwright/test');

pageTest.describe('User Registration and Login Flow', () => {

  /**
   * TC001: Complete User Registration Flow
   * Steps:
   * 1. Navigate to signup page
   * 2. Enter signup details (name and email)
   * 3. Fill registration form with all details
   * 4. Submit and verify account creation
   */
    pageTest('TC001: Register New User and Verify Account Creation', async ({ homeHelper, loginHelper, loc, page, config, core }) => {
    // Verify home page loaded
    await homeHelper.isHomePageVisible();
    
    // Navigate to signup/login page
    await homeHelper.navigateToSignupLogin();

    // Take screenshot of signup/login page
    await core.takeFullPageScreenshot('SignupOrLogin-full.png');

    // Complete signup flow with verification
    await loginHelper.signup(
      config.users.administrator.username,
      config.users.administrator.emailAddress
    );
    
    // Fill and submit registration form
    await loginHelper.fillAccountInformation(config.users.administrator);
    
    await loginHelper.fillAddressInformation(config.users.administrator.address);
    
    await loginHelper.createAccount();
    
    // Verify account creation success
    const isAccountCreated = await loginHelper.isAccountCreated();
    expect(isAccountCreated).toBe(true);
    
    await loginHelper.clickContinue();
    
    // Verify user is logged in
    const isLoggedIn = await homeHelper.isUserLoggedIn(config.users.administrator.username);
    expect(isLoggedIn).toBe(true);
    
    await homeHelper.logout();
    
    // Verify redirected to login page - wait for page load then check URL
    await page.waitForLoadState('load', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  /**
   * TC002: Login with Valid Credentials
   * Steps:
   * 1. Logout from current session
   * 2. Navigate to login page
   * 3. Enter valid credentials
   * 4. Verify successful login
   */
  pageTest('TC002: Login with valid credentials', async ({ homeHelper, loginHelper, page, config }) => {
    // Check if already on login page from previous test
    let pageUrl = page.url();
    if (!pageUrl.includes('/login')) {
      await homeHelper.navigateToSignupLogin();
    }
    
    // Verify login section is visible
    await loginHelper.isLoginSectionVisible();
    
    // Login with valid credentials
    await loginHelper.login(
      config.users.administrator.emailAddress,
      config.users.administrator.password
    );
    
    // Verify user is logged in
    const isLoggedIn = await homeHelper.isUserLoggedIn(config.users.administrator.username);
    expect(isLoggedIn).toBe(true);
    
    await homeHelper.logout();
    await page.waitForLoadState('load', { timeout: 10000 });
    
    // Verify logout successful
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  /**
   * TC003: Login with Invalid Credentials
   * Steps:
   * 1. Logout from current session
   * 2. Navigate to login page
   * 3. Enter invalid credentials
   * 4. Verify error message
   */
  pageTest('TC003: Login validation with invalid credentials', async ({ loginHelper, homeHelper, loc, page, config }) => {
    // Check if already on login page from previous test
    let pageUrl2 = page.url();
    if (!pageUrl2.includes('/login')) {
      await homeHelper.navigateToSignupLogin();
    }
    
    // Verify login section is visible
    await loginHelper.isLoginSectionVisible();
    
    const invalidEmail = 'invalid_' + config.users.administrator.emailAddress;
    const invalidPassword = 'WrongPassword123';
    
    // Attempt login with invalid credentials
    await loginHelper.login(invalidEmail, invalidPassword);
    
    // Wait for error message to appear and verify
    const expectedError = loc.getValue('ConstraintStrings', 'Login.InvalidCredentials');
    const errorMessage = await page.locator('p').filter({ hasText: expectedError }).first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify still on login page (no need for additional checks)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  /**
   * TC004: Register User with Existing Email
   * Steps:
   * 1. Navigate to signup/login page
   * 2. Verify 'New User Signup!' is visible
   * 3. Enter name and already registered email address
   * 4. Click 'Signup' button
   * 5. Verify error 'Email Address already exist!' is visible
   */
  pageTest('TC004: Register user with existing email', async ({ homeHelper, loginHelper, loc, page, config }) => {
    // Check if already on login page from previous test
    let pageUrl3 = page.url();
    if (!pageUrl3.includes('/login')) {
      await homeHelper.navigateToSignupLogin();
    }
    
    // Verify signup section is visible
    await loginHelper.isSignupSectionVisible();
    
    // Attempt signup with existing email
    await loginHelper.fillSignupForm(
      config.users.administrator.username,
      config.users.administrator.emailAddress
    );
    
    await loginHelper.clickSignup();
    
    // Wait for error message to appear
    const errorMessage = await page.locator('p').filter({ hasText: 'Email Address already exist!' }).first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify error message text
    const errorText = await errorMessage.textContent();
    const expectedError = loc.getValue('ConstraintStrings', 'Signup.EmailAlreadyExists');
    expect(errorText.trim()).toBe(expectedError);

    // Verify still on signup page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signup');
  });

  /**
   * TC005: Account Deletion Flow
   * Steps:
   * 1. Login with valid credentials
   * 2. Navigate to delete account
   * 3. Verify account deletion confirmation
   */
  pageTest('TC005: Delete account successfully', async ({ homeHelper, loginHelper, loc, page, config }) => {
    // Check if already on login page from previous test
    let pageUrl4 = page.url();
    if (!pageUrl4.includes('/login')) {
      await homeHelper.navigateToSignupLogin();
    }
    
    // Login with valid credentials
    await loginHelper.login(
      config.users.administrator.emailAddress,
      config.users.administrator.password
    );
    
    // Wait for login to complete
    await homeHelper.isUserLoggedIn(config.users.administrator.username);
    
    // Delete account
    await homeHelper.deleteAccount();
    
    // Verify deletion success and continue
    const isAccountDeleted = await loginHelper.isAccountDeleted();
    expect(isAccountDeleted).toBe(true);
    
    await loginHelper.clickContinue();
    
    // Verify back on homepage (account no longer exists)
    await homeHelper.isHomePageVisible();
  });
});



