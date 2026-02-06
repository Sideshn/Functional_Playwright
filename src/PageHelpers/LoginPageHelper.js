/**
 * Login/Signup Page Helper
 * 
 * Purpose: Semantic wrapper methods for authentication operations
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class LoginPageHelper {
  constructor(core, sitemaps, page, config, loc) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
    this.config = config;
    this.loc = loc;
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to login/signup page
   */
  async navigateToLoginPage() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'SignupOrLoginLinkOption');
    await this.page.waitForURL('**/login', { timeout: 10000 });
  }

  // ==================== Signup Methods ====================

  /**
   * Fill signup form (name and email)
   * @param {string} name - User name
   * @param {string} email - Email address
   */
  async fillSignupForm(name, email) {
    await this.core.fillText(this.sitemaps.login, 'Login', 'NewUserSignupNameInputBox', name);
    await this.core.takeElementScreenshot(this.sitemaps.login, 'Login', 'NewUserSignupNameInputBox','NewUserSignupNameInputBox.png');
    await this.core.fillText(this.sitemaps.login, 'Login', 'NewUserSignupEmailInputBox', email);
    await this.core.takeElementScreenshot(this.sitemaps.login, 'Login', 'NewUserSignupEmailInputBox','NewUserSignupEmailInputBox.png');
  }

  /**
   * Click signup button
   */
  async clickSignup() {
    await this.core.clickElement(this.sitemaps.login, 'Login', 'SignupButton');
  }

  /**
   * Complete signup flow (name + email + click)
   * @param {string} name - User name
   * @param {string} email - Email address
   */
  async signup(name, email) {
    await this.fillSignupForm(name, email);
    await this.clickSignup();
  }

  /**
   * Fill complete account information form
   * @param {Object} userData - User data object
   */
  async fillAccountInformation(userData) {
    // Title selection
    const titleElement = userData.title === 'Mr' ? 'MrRadioButton' : 'MrsRadioButton';
    await this.core.clickElement(this.sitemaps.login, 'Login', titleElement);

    // Password
    await this.core.fillText(this.sitemaps.login, 'Login', 'PassowrdTextBox', userData.password);

    // Date of Birth
    await this.core.selectByValue(this.sitemaps.login, 'Login', 'DaysDropdown', userData.dateOfBirth?.day || userData.DOB_Day);
    await this.core.selectByValue(this.sitemaps.login, 'Login', 'MonthsDropdown', userData.dateOfBirth?.month || userData.DOB_Month);
    await this.core.selectByValue(this.sitemaps.login, 'Login', 'YearsDropdown', userData.dateOfBirth?.year || userData.DOB_Year);

    // Newsletter and offers (optional)
    if (userData.subscriptions?.newsletter || userData.Newsletter === 'Yes') {
      await this.core.check(this.sitemaps.login, 'Login', 'NewsletterCheckbox');
    }
    if (userData.subscriptions?.offers || userData.Offers === 'Yes') {
      await this.core.check(this.sitemaps.login, 'Login', 'OffersCheckbox');
    }
  }

  /**
   * Fill address information
   * @param {Object} addressData - Address data object
   */
  async fillAddressInformation(addressData) {
    await this.core.fillText(this.sitemaps.login, 'Login', 'FirstNameTextBox', addressData.firstName || addressData.FirstName);
    await this.core.fillText(this.sitemaps.login, 'Login', 'LastNameTextBox', addressData.lastName || addressData.LastName);
    await this.core.fillText(this.sitemaps.login, 'Login', 'CompanyTextBox', addressData.company || addressData.Company || '');
    await this.core.fillText(this.sitemaps.login, 'Login', 'AddressTextBox', addressData.address1 || addressData.Address1);
    await this.core.fillText(this.sitemaps.login, 'Login', 'Address2TextBox', addressData.address2 || addressData.Address2 || '');
    await this.core.selectByText(this.sitemaps.login, 'Login', 'CountryDropdown', addressData.country || addressData.Country);
    await this.core.fillText(this.sitemaps.login, 'Login', 'StateTextBox', addressData.state || addressData.State);
    await this.core.fillText(this.sitemaps.login, 'Login', 'CityTextBox', addressData.city || addressData.City);
    await this.core.fillText(this.sitemaps.login, 'Login', 'ZipcodeTextBox', addressData.zipcode || addressData.Zipcode);
    await this.core.fillText(this.sitemaps.login, 'Login', 'MobileNumberTextBox', addressData.mobile || addressData.Mobile);
  }

  /**
   * Click create account button
   */
  async createAccount() {
    await this.core.clickElement(this.sitemaps.login, 'Login', 'CreateAccountButton');
  }

  /**
   * Complete registration with user data
   * @param {Object} userData - Complete user data
   */
  async completeRegistration(userData) {
    await this.fillAccountInformation(userData);
    await this.fillAddressInformation(userData.address || userData);
    await this.createAccount();
  }

  // ==================== Login Methods ====================

  /**
   * Fill login credentials
   * @param {string} email - Email address
   * @param {string} password - Password
   */
  async fillLoginCredentials(email, password) {
    await this.core.fillText(this.sitemaps.login, 'Login', 'LoginToYourAccountEmailAddressInputBox', email);
    await this.core.fillText(this.sitemaps.login, 'Login', 'LoginToYourAccountPasswordInputBox', password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.core.clickElement(this.sitemaps.login, 'Login', 'LoginButton');
  }

  /**
   * Complete login flow
   * @param {string} email - Email address
   * @param {string} password - Password
   */
  async login(email, password) {
    await this.fillLoginCredentials(email, password);
    await this.clickLogin();
  }

  // ==================== Verification Methods ====================

  /**
   * Verify signup section is visible
   * @returns {boolean} True if signup visible
   */
  async isSignupSectionVisible() {
    try {
      const signupHeader = await this.core.getElement(this.sitemaps.login, 'Login', 'NewUserSignupTextField');
      return await signupHeader.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify login section is visible
   * @returns {boolean} True if login visible
   */
  async isLoginSectionVisible() {
    try {
      const loginHeader = await this.core.getElement(this.sitemaps.login, 'Login', 'LoginToYourAccountTextField');
      return await loginHeader.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify account created message
   * @returns {boolean} True if account created
   */
  async isAccountCreated() {
    try {
      const accountCreated = await this.core.getElement(this.sitemaps.login, 'Login', 'AccountCreatedTextField');
      return await accountCreated.isVisible({ timeout: 10000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify account deleted message
   * @returns {boolean} True if account deleted
   */
  async isAccountDeleted() {
    try {
      const accountDeleted = await this.core.getElement(this.sitemaps.login, 'Login', 'AccountDeletedTextField');
      return await accountDeleted.isVisible({ timeout: 10000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify error message for existing email
   * @returns {boolean} True if error visible
   */
  async isExistingEmailError() {
    try {
      const errorMsg = await this.core.getText(this.sitemaps.login, 'Login', 'SignupErrorMessage');
      const expectedError = this.loc.getValue('ConstraintStrings', 'Signup.EmailAlreadyExists');
      return errorMsg.includes(expectedError);
    } catch {
      return false;
    }
  }

  /**
   * Verify invalid login error
   * @returns {boolean} True if error visible
   */
  async isInvalidLoginError() {
    try {
      const errorMsg = await this.core.getText(this.sitemaps.login, 'Login', 'LoginErrorMessage');
      const expectedError = this.loc.getValue('ConstraintStrings', 'Login.InvalidCredentials');
      return errorMsg.includes(expectedError);
    } catch {
      return false;
    }
  }

  /**
   * Click continue after account creation/deletion
   */
  async clickContinue() {
    await this.core.clickElement(this.sitemaps.login, 'Login', 'ContinueButton');
  }

  // ==================== Workflow Methods ====================

  /**
   * Complete workflow: Navigate and signup
   * @param {string} name - User name
   * @param {string} email - Email address
   */
  async navigateAndSignup(name, email) {
    await this.navigateToLoginPage();
    await this.signup(name, email);
  }

  /**
   * Complete workflow: Navigate and login
   * @param {string} email - Email address
   * @param {string} password - Password
   */
  async navigateAndLogin(email, password) {
    await this.navigateToLoginPage();
    await this.login(email, password);
  }

  /**
   * Complete workflow: Full user registration from config
   */
  async registerUserFromConfig() {
    const userData = this.config.users.administrator;
    await this.navigateToLoginPage();
    await this.signup(userData.username, userData.emailAddress);
    await this.completeRegistration(userData);
  }

  /**
   * Complete workflow: Full user registration with custom data
   * @param {string} name - User name
   * @param {string} email - Email address
   * @param {Object} userData - Complete user data
   */
  async registerUser(name, email, userData) {
    await this.navigateToLoginPage();
    await this.signup(name, email);
    await this.completeRegistration(userData);
  }
}

module.exports = LoginPageHelper;
