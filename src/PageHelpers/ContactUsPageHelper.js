/**
 * Contact Us Page Helper
 * 
 * Purpose: Semantic wrapper methods for contact form operations
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class ContactUsPageHelper {
  constructor(core, sitemaps, page, config) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
    this.config = config;
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to Contact Us page
   */
  async navigateToContactUs() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'ContactUSLinkOption');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ==================== Form Methods ====================

  /**
   * Fill contact form
   * @param {string} name - User name
   * @param {string} email - Email address
   * @param {string} subject - Subject line
   * @param {string} message - Message content
   */
  async fillContactForm(name, email, subject, message) {
    await this.core.fillText(this.sitemaps.contactUs, 'ContactUS', 'NameInputBox', name);
    await this.core.fillText(this.sitemaps.contactUs, 'ContactUS', 'EmailInputBox', email);
    await this.core.fillText(this.sitemaps.contactUs, 'ContactUS', 'SubjectInputBox', subject);
    await this.core.fillText(this.sitemaps.contactUs, 'ContactUS', 'MessageTextArea', message);
  }

  /**
   * Upload file to contact form
   * @param {string} filePath - Absolute file path
   */
  async uploadFile(filePath) {
    await this.core.uploadFile(this.sitemaps.contactUs, 'ContactUS', 'UploadFileInput', filePath);
  }

  /**
   * Submit contact form
   */
  async submitForm() {
    await this.core.clickElement(this.sitemaps.contactUs, 'ContactUS', 'SubmitButton');
  }

  // ==================== Verification Methods ====================

  /**
   * Verify "Get In Touch" heading is visible
   * @returns {boolean} True if heading visible
   */
  async isGetInTouchVisible() {
    try {
      const heading = await this.core.getElement(this.sitemaps.contactUs, 'ContactUS', 'GetInTouchHeading');
      return await heading.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify success message after submission
   * @returns {boolean} True if success message visible
   */
  async isSuccessMessageVisible() {
    try {
      const successMsg = await this.core.getElement(this.sitemaps.contactUs, 'ContactUS', 'SuccessMessage');
      return await successMsg.isVisible({ timeout: 10000 });
    } catch {
      return false;
    }
  }

  /**
   * Get success message text
   * @returns {string} Success message text
   */
  async getSuccessMessage() {
    return await this.core.getText(this.sitemaps.contactUs, 'ContactUS', 'SuccessMessage');
  }

  /**
   * Click Home button after form submission
   */
  async clickHomeButton() {
    await this.core.clickElement(this.sitemaps.contactUs, 'ContactUS', 'HomeButton');
    await this.page.waitForURL('**/');
  }

  // ==================== Workflow Methods ====================

  /**
   * Complete workflow: Navigate and fill form from config
   */
  async submitContactFormFromConfig() {
    const contactData = this.config.contactUs.testUser;
    await this.navigateToContactUs();
    await this.fillContactForm(
      contactData.name,
      contactData.email,
      contactData.subject,
      contactData.message
    );
    await this.submitForm();
  }

  /**
   * Complete workflow: Submit form with custom data
   * @param {string} name - User name
   * @param {string} email - Email address
   * @param {string} subject - Subject line
   * @param {string} message - Message content
   * @param {string} filePath - Optional file to upload
   */
  async submitContactForm(name, email, subject, message, filePath = null) {
    await this.navigateToContactUs();
    await this.fillContactForm(name, email, subject, message);
    if (filePath) {
      await this.uploadFile(filePath);
    }
    await this.submitForm();
  }
}

module.exports = ContactUsPageHelper;
