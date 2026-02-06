// Migrated from CoreKeywords.cs
const { logger } = require('../Utils/logger');
const fs = require('fs');
const path = require('path');

const csvParse = require('csv-parse/sync');
const xml2js = require('xml2js');
const { PDFParse } = require('pdf-parse');

class CoreKeywords {
  constructor(page, siteParser) {
    this._page = page;
    this._parser = siteParser;
  }

  /**
   * Ensure screenshot directories exist and return the final path
   * @param {'element'|'fullpage'} type - Type of screenshot
   * @param {string} fileName - Desired file name (with extension)
   * @returns {string} Absolute path where the screenshot will be saved
   */
  _prepareScreenshotPath(type, fileName) {
    const rootDir = path.resolve(process.cwd(), 'Screenshot');
    const subDir = type === 'element' ? 'Element-Screenshot' : 'Full-Page-Screenshot';
    const targetDir = path.join(rootDir, subDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      logger.info(`📁 Created screenshot directory: ${targetDir}`);
    }

    return path.join(targetDir, fileName);
  }

  async getElement(sitemap, pageKey, elementKey) {
    const loc = this._parser.getLocator(sitemap, pageKey, elementKey);
    
    switch (loc.type) {
      case 'role':
        // Handle role-based locators (getByRole)
        return this._page.getByRole(loc.value, loc.options);
      case 'css':
        return this._page.locator(loc.value);
      case 'xpath':
        return this._page.locator(`xpath=${loc.value}`);
      case 'name':
        return this._page.locator(`[name='${loc.value}']`);
      default:
        return this._page.locator(loc.value);
    }
  }

  /**
   * Get all matching elements as a Locator
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @returns {Locator} Locator for all matching elements
   */
  getElements(sitemap, pageKey, elementKey) {
    const loc = this._parser.getLocator(sitemap, pageKey, elementKey);
    switch (loc.type) {
      case 'role':
        return this._page.getByRole(loc.value, loc.options);
      case 'css':
        return this._page.locator(loc.value);
      case 'xpath':
        return this._page.locator(`xpath=${loc.value}`);
      case 'name':
        return this._page.locator(`[name='${loc.value}']`);
      default:
        return this._page.locator(loc.value);
    }
  }
  
  // ==================== NAVIGATION ====================

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @param {Object} options - Navigation options (waitUntil, timeout, etc.)
   * @returns {Promise<Response>}
   */
  async navigateTo(url, options = {}) {
    try {
      logger.info(`🌐 Navigating to: ${url}`);
      const defaultOptions = { waitUntil: 'domcontentloaded', timeout: 60000, ...options };
      const response = await this._page.goto(url, defaultOptions);
      logger.success(`✅ Successfully navigated to: ${url}`);
      logger.info(`   Response status: ${response?.status() || 'N/A'}`);
      return response;
    } catch (error) {
      logger.error(`❌ Failed to navigate to [${url}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navigate forward in browser history
   * @param {Object} options - Navigation options
   * @returns {Promise<Response|null>}
   */
  async goForward(options = {}) {
    try {
      logger.info(`⏩ Navigating forward in history...`);
      const defaultOptions = { waitUntil: 'domcontentloaded', timeout: 30000, ...options };
      const response = await this._page.goForward(defaultOptions);
      logger.success(`✅ Successfully navigated forward`);
      logger.info(`   Current URL: ${this._page.url()}`);
      return response;
    } catch (error) {
      logger.error(`❌ Failed to navigate forward: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navigate backward in browser history
   * @param {Object} options - Navigation options
   * @returns {Promise<Response|null>}
   */
  async goBackward(options = {}) {
    try {
      logger.info(`⏪ Navigating backward in history...`);
      const defaultOptions = { waitUntil: 'domcontentloaded', timeout: 30000, ...options };
      const response = await this._page.goBack(defaultOptions);
      logger.success(`✅ Successfully navigated backward`);
      logger.info(`   Current URL: ${this._page.url()}`);
      return response;
    } catch (error) {
      logger.error(`❌ Failed to navigate backward: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh/reload the current page
   * @param {Object} options - Reload options
   * @returns {Promise<Response|null>}
   */
  async refreshPage(options = {}) {
    try {
      logger.info(`🔄 Refreshing page: ${this._page.url()}`);
      const defaultOptions = { waitUntil: 'domcontentloaded', timeout: 30000, ...options };
      const response = await this._page.reload(defaultOptions);
      logger.success(`✅ Successfully refreshed page`);
      logger.info(`   Response status: ${response?.status() || 'N/A'}`);
      return response;
    } catch (error) {
      logger.error(`❌ Failed to refresh page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current page URL
   * @returns {string} - Current URL
   */
  getCurrentUrl() {
    try {
      const url = this._page.url();
      logger.info(`📍 Current URL: ${url}`);
      return url;
    } catch (error) {
      logger.error(`❌ Failed to get current URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current page title
   * @returns {Promise<string>} - Current page title
   */
  async getPageTitle() {
    try {
      const title = await this._page.title();
      logger.info(`📄 Page title: ${title}`);
      return title;
    } catch (error) {
      logger.error(`❌ Failed to get page title: ${error.message}`);
      throw error;
    }
  }

  // ==================== ELEMENT INTERACTION ====================

  /**
   * Generic function to click an element with enhanced error handling
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Click options (timeout, force, etc.)
   * @returns {Promise<void>}
   */
  async clickElement(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`🖱️  Clicking element: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      // Wait for element to be visible and enabled before clicking
      const defaultOptions = { timeout: 30000, state: 'visible', ...options };
      await element.waitFor({ state: defaultOptions.state, timeout: defaultOptions.timeout });
      await element.click(defaultOptions);
      logger.success(`✅ Successfully clicked: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to click element [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generic function to fill text in an input field
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} text - Text to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async fillText(sitemap, pageKey, elementKey, text, options = {}) {
    try {
      logger.info(`✍️  Filling text in: [${pageKey}.${elementKey}] with value: "${text}"`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      // Wait for element to be visible and editable before filling
      const defaultOptions = { timeout: 30000, state: 'visible', ...options };
      await element.waitFor({ state: defaultOptions.state, timeout: defaultOptions.timeout });
      await element.fill(text, defaultOptions);
      logger.success(`✅ Successfully filled: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to fill text in [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generic function to clear and fill text
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} text - Text to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async clearAndFill(sitemap, pageKey, elementKey, text, options = {}) {
    try {
      logger.info(`🧹 Clearing and filling: [${pageKey}.${elementKey}] with value: "${text}"`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      await element.clear(options);
      await element.fill(text, options);
      logger.success(`✅ Successfully cleared and filled: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to clear and fill [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== DROPDOWN/SELECT OPERATIONS ====================

  /**
   * Select option from dropdown by visible text
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} optionText - Visible text of option to select
   * @param {Object} options - Select options
   * @returns {Promise<void>}
   */
  async selectByText(sitemap, pageKey, elementKey, optionText, options = {}) {
    try {
      logger.info(`📋 Selecting option by text: [${pageKey}.${elementKey}] - "${optionText}"`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      // Wait for dropdown to be visible and enabled
      const defaultOptions = { timeout: 30000, state: 'visible', ...options };
      await element.waitFor({ state: defaultOptions.state, timeout: defaultOptions.timeout });
      await element.selectOption({ label: optionText }, options);
      logger.success(`✅ Successfully selected: "${optionText}" in [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to select option by text in [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Select option from dropdown by value
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} optionValue - Value of option to select
   * @param {Object} options - Select options
   * @returns {Promise<void>}
   */
  async selectByValue(sitemap, pageKey, elementKey, optionValue, options = {}) {
    try {
      logger.info(`📋 Selecting option by value: [${pageKey}.${elementKey}] - "${optionValue}"`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      // Wait for dropdown to be visible and enabled
      const defaultOptions = { timeout: 30000, state: 'visible', ...options };
      await element.waitFor({ state: defaultOptions.state, timeout: defaultOptions.timeout });
      await element.selectOption({ value: optionValue }, options);
      logger.success(`✅ Successfully selected value: "${optionValue}" in [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to select option by value in [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Select option from dropdown by index
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {number} index - Index of option to select (0-based)
   * @param {Object} options - Select options
   * @returns {Promise<void>}
   */
  async selectByIndex(sitemap, pageKey, elementKey, index, options = {}) {
    try {
      logger.info(`📋 Selecting option by index: [${pageKey}.${elementKey}] - index: ${index}`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      // Wait for dropdown to be visible and enabled
      const defaultOptions = { timeout: 30000, state: 'visible', ...options };
      await element.waitFor({ state: defaultOptions.state, timeout: defaultOptions.timeout });
      await element.selectOption({ index: index }, options);
      logger.success(`✅ Successfully selected index: ${index} in [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to select option by index in [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== TEXT OPERATIONS ====================

  /**
   * Get text content from an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options for getText
   * @returns {Promise<string>} Text content of the element
   */
  async getText(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📖 Getting text from: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      const text = await element.textContent(defaultOptions);
      logger.success(`✅ Text retrieved from [${pageKey}.${elementKey}]: "${text || ''}"`);
      return text || '';
    } catch (error) {
      logger.error(`❌ Failed to get text from [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get inner text from an element (excludes hidden elements)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options for getInnerText
   * @returns {Promise<string>} Inner text of the element
   */
  async getInnerText(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📖 Getting inner text from: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      const text = await element.innerText(defaultOptions);
      logger.success(`✅ Inner text retrieved from [${pageKey}.${elementKey}]: "${text || ''}"`);
      return text || '';
    } catch (error) {
      logger.error(`❌ Failed to get inner text from [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get text content from an element without waiting for visibility (for hidden elements)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<string>} Text content of the element
   */
  async getTextContent(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📖 Getting text content from: [${pageKey}.${elementKey}] (including hidden elements)`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'attached', timeout: defaultOptions.timeout });
      const text = await element.textContent(defaultOptions);
      logger.success(`✅ Text content retrieved from [${pageKey}.${elementKey}]: "${text || ''}"`);
      return text || '';
    } catch (error) {
      logger.error(`❌ Failed to get text content from [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get attribute value from an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} attributeName - Name of the attribute
   * @param {Object} options - Options
   * @returns {Promise<string|null>} Attribute value
   */
  async getAttribute(sitemap, pageKey, elementKey, attributeName, options = {}) {
    try {
      logger.info(`📋 Getting attribute "${attributeName}" from: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'attached', timeout: defaultOptions.timeout });
      const attributeValue = await element.getAttribute(attributeName);
      logger.success(`✅ Attribute "${attributeName}" value: "${attributeValue}" from [${pageKey}.${elementKey}]`);
      return attributeValue;
    } catch (error) {
      logger.error(`❌ Failed to get attribute "${attributeName}" from [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== ELEMENT STATE CHECKS ====================

  /**
   * Check if element is visible
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`👁️  Checking visibility: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 5000, ...options };
      const isVisible = await element.isVisible(defaultOptions);
      logger.info(`✅ Element [${pageKey}.${elementKey}] is ${isVisible ? 'visible' : 'not visible'}`);
      return isVisible;
    } catch (error) {
      logger.warning(`⚠️  Element [${pageKey}.${elementKey}] visibility check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if element is enabled
   */
  async isEnabled(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`🔓 Checking if enabled: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 5000, ...options };
      const isEnabled = await element.isEnabled(defaultOptions);
      logger.info(`✅ Element [${pageKey}.${elementKey}] is ${isEnabled ? 'enabled' : 'disabled'}`);
      return isEnabled;
    } catch (error) {
      logger.warning(`⚠️  Element [${pageKey}.${elementKey}] enabled check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if checkbox/radio is checked
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if element is checked
   */
  async isChecked(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`☑️  Checking if checked: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 5000, ...options };
      const isChecked = await element.isChecked(defaultOptions);
      logger.info(`✅ Element [${pageKey}.${elementKey}] is ${isChecked ? 'checked' : 'not checked'}`);
      return isChecked;
    } catch (error) {
      logger.warning(`⚠️  Element [${pageKey}.${elementKey}] checked state verification failed: ${error.message}`);
      return false;
    }
  }

  // ==================== WAIT OPERATIONS ====================

  /**
   * Wait for element to be visible
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForVisible(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`⏳ Waiting for element to be visible: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      logger.success(`✅ Element [${pageKey}.${elementKey}] is now visible`);
    } catch (error) {
      logger.error(`❌ Element [${pageKey}.${elementKey}] did not become visible: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForHidden(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`⏳ Waiting for element to be hidden: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.waitFor({ state: 'hidden', timeout: defaultOptions.timeout });
      logger.success(`✅ Element [${pageKey}.${elementKey}] is now hidden`);
    } catch (error) {
      logger.error(`❌ Element [${pageKey}.${elementKey}] did not become hidden: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for element to contain specific text
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} expectedText - Text to wait for
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForText(sitemap, pageKey, elementKey, expectedText, options = {}) {
    try {
      logger.info(`⏳ Waiting for text "${expectedText}" in: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await expect(element).toContainText(expectedText, defaultOptions);
      logger.success(`✅ Text "${expectedText}" found in [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Text "${expectedText}" not found in [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADVANCED OPERATIONS ====================

  /**
   * Double click an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Double click options
   * @returns {Promise<void>}
   */
  async doubleClick(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`🖱️🖱️  Double clicking element: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.dblclick(defaultOptions);
      logger.success(`✅ Successfully double clicked: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to double click [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Right click an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Right click options
   * @returns {Promise<void>}
   */
  async rightClick(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`🖱️  Right clicking element: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.click({ button: 'right', ...defaultOptions });
      logger.success(`✅ Successfully right clicked: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to right click [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hover over an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Hover options
   * @returns {Promise<void>}
   */
  async hoverElement(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`🎯 Hovering over element: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.hover(defaultOptions);
      logger.success(`✅ Successfully hovered: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to hover over [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scroll element into view
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Scroll options
   * @returns {Promise<void>}
   */
  async scrollIntoView(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📜 Scrolling element into view: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      await element.scrollIntoViewIfNeeded(options);
      logger.success(`✅ Element scrolled into view: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to scroll element into view [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Take a screenshot of a specific element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} fileName - Screenshot file name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeElementScreenshot(sitemap, pageKey, elementKey, fileName, options = {}) {
    try {
      const targetPath = this._prepareScreenshotPath('element', fileName);
      logger.info(`📸 Taking screenshot of: [${pageKey}.${elementKey}] - Saving to: ${targetPath}`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const screenshot = await element.screenshot({ path: targetPath, ...options });
      logger.success(`✅ Screenshot saved: ${targetPath}`);
      return screenshot;
    } catch (error) {
      logger.error(`❌ Failed to take screenshot of [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Take a full page screenshot
   * @param {string} fileName - File path to save the screenshot
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeFullPageScreenshot(fileName, options = {}) {
    try {
      const targetPath = this._prepareScreenshotPath('fullpage', fileName);
      const screenshotOptions = { path: targetPath, fullPage: true, ...options };
      logger.info(`📸 Taking full page screenshot: ${targetPath}`);
      const screenshot = await this._page.screenshot(screenshotOptions);
      logger.success(`✅ Full page screenshot saved: ${targetPath}`);
      return screenshot;
    } catch (error) {
      logger.error(`❌ Failed to take full page screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get element count
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @returns {Promise<number>} Number of matching elements
   */
  async getElementCount(sitemap, pageKey, elementKey) {
    try {
      logger.info(`🔢 Getting element count: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const count = await element.count();
      logger.success(`✅ Element count for [${pageKey}.${elementKey}]: ${count}`);
      return count;
    } catch (error) {
      logger.error(`❌ Failed to get element count for [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Press key on an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} key - Key to press (e.g., 'Enter', 'Tab', 'Escape')
   * @param {Object} options - Press options
   * @returns {Promise<void>}
   */
  async pressKey(sitemap, pageKey, elementKey, key, options = {}) {
    try {
      logger.info(`⌨️  Pressing key "${key}" on: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      await element.press(key, options);
      logger.success(`✅ Successfully pressed "${key}" on [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to press key "${key}" on [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  // ==================== CHECKBOX & RADIO OPERATIONS ====================

  /**
   * Check a checkbox or radio button
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Check options
   * @returns {Promise<void>}
   */
  async check(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`☑️  Checking checkbox/radio: [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };
      await element.check(defaultOptions);
      logger.success(`✅ Successfully checked: [${pageKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to check [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Uncheck a checkbox
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Uncheck options
   * @returns {Promise<void>}
   */
  async uncheck(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`☐ Unchecking checkbox: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.uncheck(defaultOptions);
    logger.success(`✅ Successfully unchecked: [${pageKey}.${elementKey}]`);
  }

  /**
   * Set a switch/toggle element to the desired state based on aria-checked
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {boolean} state - Desired state
   * @returns {Promise<void>}
   */
  async setSwitch(sitemap, pageKey, elementKey, state) {
    try {
      logger.info(`🎚️ Setting switch [${pageKey}.${elementKey}] to: ${state}`);
      const element = await this.getElement(sitemap, pageKey, elementKey);

      const disabledAttr = await element.getAttribute('disabled');
      if (disabledAttr === 'disabled' || disabledAttr === 'true') {
        logger.warning(`⚠️ Switch [${pageKey}.${elementKey}] is disabled; skipping.`);
        return;
      }

      const ariaChecked = await element.getAttribute('aria-checked');
      const desired = state ? 'true' : 'false';

      if (ariaChecked !== desired) {
        await element.click();
        logger.success(`✅ Switch [${pageKey}.${elementKey}] set to: ${desired}`);
      } 
      else {
        logger.info(`ℹ️ Switch [${pageKey}.${elementKey}] already at desired state: ${desired}`);
      }
    } 
    catch (error) {
      logger.error(`❌ Failed to set switch [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get switch/toggle properties (enabled state, value, text color hints)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @returns {Promise<Object>} Map of switch properties
   */
  async getSwitch(sitemap, pageKey, elementKey) {
    const result = {
      Enabled: false,
      Value: false,
    };
    try {
      logger.info(`🔎 Reading switch [${pageKey}.${elementKey}]`);
      const element = await this.getElement(sitemap, pageKey, elementKey);

      const ariaDisabled = await element.getAttribute('aria-disabled');
      result.Enabled = ariaDisabled === 'true' ? false : true;

      const ariaChecked = await element.getAttribute('aria-checked');
      if (ariaChecked === 'true') {
        result.Value = true;
      } 
      else if (ariaChecked === 'false') {
        result.Value = false;
      } 
      else {
        logger.info(`ℹ️ Invalid aria-checked value: ${ariaChecked}`);
      }
      logger.info(
        `✅ Switch [${pageKey}.${elementKey}] -> enabled: ${result.Enabled}, value: ${result.Value}`
      );
    } 
    catch (error) {
      logger.error(`❌ Failed to read switch [${pageKey}.${elementKey}]: ${error.message}`);
      throw error;
    }
    return result;
  }

  // ==================== DRAG AND DROP OPERATIONS ====================

  /**
   * Drag and drop an element to another element
   * @param {string} sourceSitemap - Source sitemap name
   * @param {string} sourcePageKey - Source page key
   * @param {string} sourceElementKey - Source element key
   * @param {string} targetSitemap - Target sitemap name
   * @param {string} targetPageKey - Target page key
   * @param {string} targetElementKey - Target element key
   * @param {Object} options - Drag options
   * @returns {Promise<void>}
   */
  async dragAndDrop(sourceSitemap, sourcePageKey, sourceElementKey, targetSitemap, targetPageKey, targetElementKey, options = {}) {
    logger.info(`🎯 Dragging [${sourcePageKey}.${sourceElementKey}] to [${targetPageKey}.${targetElementKey}]`);
    const sourceElement = await this.getElement(sourceSitemap, sourcePageKey, sourceElementKey);
    const targetElement = await this.getElement(targetSitemap, targetPageKey, targetElementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await sourceElement.dragTo(targetElement, defaultOptions);
    logger.success(`✅ Successfully dragged [${sourcePageKey}.${sourceElementKey}] to [${targetPageKey}.${targetElementKey}]`);
  }

  // ==================== DIALOG OPERATIONS ====================

  /**
   * Handle dialog (alert/confirm/prompt) with accept action
   * @param {Function} action - Function that triggers the dialog (e.g., clicking submit button)
   * @param {Object} options - Dialog options
   * @returns {Promise<string>} - Dialog message
   */
  async handleDialogAccept(action, options = {}) {
    try {
      logger.info(`🔔 Setting up dialog handler to ACCEPT`);
      
      return await new Promise((resolve, reject) => {
        let dialogMessage = '';
        
        // Setup one-time dialog listener
        this._page.once('dialog', async dialog => {
          try {
            dialogMessage = dialog.message();
            logger.info(`📢 Dialog appeared with message: "${dialogMessage}"`);
            await dialog.accept();
            logger.success(`✅ Dialog ACCEPTED`);
            resolve(dialogMessage);
          } catch (error) {
            logger.error(`❌ Failed to accept dialog: ${error.message}`);
            reject(error);
          }
        });
        
        // Execute the action that triggers the dialog
        action().catch(reject);
      });
    } catch (error) {
      logger.error(`❌ Dialog handling failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle dialog (alert/confirm/prompt) with dismiss action
   * @param {Function} action - Function that triggers the dialog (e.g., clicking a button)
   * @param {Object} options - Dialog options
   * @returns {Promise<string>} - Dialog message
   */
  async handleDialogDismiss(action, options = {}) {
    try {
      logger.info(`🔔 Setting up dialog handler to DISMISS`);
      
      return await new Promise((resolve, reject) => {
        let dialogMessage = '';
        
        // Setup one-time dialog listener
        this._page.once('dialog', async dialog => {
          try {
            dialogMessage = dialog.message();
            logger.info(`📢 Dialog appeared with message: "${dialogMessage}"`);
            await dialog.dismiss();
            logger.success(`✅ Dialog DISMISSED`);
            resolve(dialogMessage);
          } catch (error) {
            logger.error(`❌ Failed to dismiss dialog: ${error.message}`);
            reject(error);
          }
        });
        
        // Execute the action that triggers the dialog
        action().catch(reject);
      });
    } catch (error) {
      logger.error(`❌ Dialog handling failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup persistent dialog handler (for multiple dialogs)
   * @param {string} actionType - 'accept' or 'dismiss'
   * @returns {void}
   */
  setupDialogHandler(actionType = 'accept') {
    logger.info(`🔔 Setting up persistent dialog handler: ${actionType.toUpperCase()}`);
    
    this._page.on('dialog', async dialog => {
      const message = dialog.message();
      logger.info(`📢 Dialog appeared with message: "${message}"`);
      
      if (actionType === 'accept') {
        await dialog.accept();
        logger.success(`✅ Dialog ACCEPTED: "${message}"`);
      } else {
        await dialog.dismiss();
        logger.success(`✅ Dialog DISMISSED: "${message}"`);
      }
    });
  }

  /**
   * Handle prompt dialog with custom input text
   * @param {Function} action - Function that triggers the prompt dialog
   * @param {string} promptText - Text to enter in the prompt (default: empty string)
   * @param {Object} options - Dialog options
   * @returns {Promise<Object>} - Object containing dialog message and default value
   */
  async handleDialogPrompt(action, promptText = '', options = {}) {
    try {
      logger.info(`🔔 Setting up prompt dialog handler with input: "${promptText}"`);
      
      return await new Promise((resolve, reject) => {
        let dialogInfo = { message: '', defaultValue: '', type: '' };
        
        // Setup one-time dialog listener
        this._page.once('dialog', async dialog => {
          try {
            dialogInfo.message = dialog.message();
            dialogInfo.type = dialog.type();
            dialogInfo.defaultValue = dialog.defaultValue();
            
            logger.info(`📢 ${dialogInfo.type.toUpperCase()} dialog appeared`);
            logger.info(`   Message: "${dialogInfo.message}"`);
            if (dialogInfo.defaultValue) {
              logger.info(`   Default value: "${dialogInfo.defaultValue}"`);
            }
            
            await dialog.accept(promptText);
            logger.success(`✅ Prompt ACCEPTED with input: "${promptText}"`);
            resolve(dialogInfo);
          } catch (error) {
            logger.error(`❌ Failed to handle prompt dialog: ${error.message}`);
            reject(error);
          }
        });
        
        // Execute the action that triggers the dialog
        action().catch(reject);
      });
    } catch (error) {
      logger.error(`❌ Prompt dialog handling failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get dialog information without accepting/dismissing (for inspection)
   * @param {Function} action - Function that triggers the dialog
   * @param {Object} options - Dialog options
   * @returns {Promise<Object>} - Dialog info {type, message, defaultValue}
   */
  async getDialogInfo(action, options = {}) {
    try {
      logger.info(`🔔 Setting up dialog listener to capture information...`);
      
      return await new Promise((resolve, reject) => {
        let dialogInfo = { type: '', message: '', defaultValue: '' };
        
        // Setup one-time dialog listener
        this._page.once('dialog', async dialog => {
          try {
            dialogInfo.type = dialog.type();
            dialogInfo.message = dialog.message();
            dialogInfo.defaultValue = dialog.defaultValue();
            
            logger.info(`📢 Dialog captured - Type: ${dialogInfo.type}`);
            logger.info(`   Message: "${dialogInfo.message}"`);
            if (dialogInfo.defaultValue) {
              logger.info(`   Default value: "${dialogInfo.defaultValue}"`);
            }
            
            // Auto-accept to not block the test
            await dialog.accept();
            logger.success(`✅ Dialog info captured and auto-accepted`);
            resolve(dialogInfo);
          } catch (error) {
            logger.error(`❌ Failed to capture dialog info: ${error.message}`);
            reject(error);
          }
        });
        
        // Execute the action that triggers the dialog
        action().catch(reject);
      });
    } catch (error) {
      logger.error(`❌ Dialog info retrieval failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup persistent prompt handler with default text for all prompts
   * @param {string} promptText - Default text to enter in all prompts
   * @returns {void}
   */
  setupPromptHandler(promptText = '') {
    logger.info(`🔔 Setting up persistent prompt handler with default input: "${promptText}"`);
    
    this._page.on('dialog', async dialog => {
      const type = dialog.type();
      const message = dialog.message();
      logger.info(`📢 ${type.toUpperCase()} dialog appeared with message: "${message}"`);
      
      if (type === 'prompt') {
        const defaultValue = dialog.defaultValue();
        if (defaultValue) {
          logger.info(`   Default value: "${defaultValue}"`);
        }
        await dialog.accept(promptText);
        logger.success(`✅ Prompt ACCEPTED with input: "${promptText}"`);
      } else {
        await dialog.accept();
        logger.success(`✅ Dialog ACCEPTED`);
      }
    });
  }

  /**
   * Handle beforeunload dialog (page navigation confirmation)
   * @param {Function} action - Function that triggers the beforeunload dialog
   * @param {boolean} shouldAccept - Whether to accept (true) or dismiss (false) the dialog
   * @param {Object} options - Dialog options
   * @returns {Promise<string>} - Dialog message
   */
  async handleBeforeUnload(action, shouldAccept = true, options = {}) {
    try {
      const actionText = shouldAccept ? 'ACCEPT' : 'DISMISS';
      logger.info(`🔔 Setting up beforeunload dialog handler to ${actionText}`);
      
      return await new Promise((resolve, reject) => {
        let dialogMessage = '';
        
        // Setup one-time dialog listener
        this._page.once('dialog', async dialog => {
          try {
            const dialogType = dialog.type();
            dialogMessage = dialog.message();
            
            logger.info(`📢 ${dialogType.toUpperCase()} dialog appeared`);
            logger.info(`   Message: "${dialogMessage}"`);
            
            if (dialogType === 'beforeunload') {
              if (shouldAccept) {
                await dialog.accept();
                logger.success(`✅ BeforeUnload dialog ACCEPTED - Navigation allowed`);
              } else {
                await dialog.dismiss();
                logger.success(`✅ BeforeUnload dialog DISMISSED - Navigation cancelled`);
              }
            } else {
              await dialog.accept();
              logger.warning(`⚠️  Expected beforeunload but got ${dialogType} - Auto-accepted`);
            }
            
            resolve(dialogMessage);
          } catch (error) {
            logger.error(`❌ Failed to handle beforeunload dialog: ${error.message}`);
            reject(error);
          }
        });
        
        // Execute the action that triggers the dialog
        action().catch(reject);
      });
    } catch (error) {
      logger.error(`❌ BeforeUnload dialog handling failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for dialog to appear and get its details
   * @param {number} timeout - Timeout in ms (default: 5000)
   * @returns {Promise<Object>} - Dialog info {type, message, defaultValue}
   */
  async waitForDialog(timeout = 5000) {
    try {
      logger.info(`⏳ Waiting for dialog to appear (timeout: ${timeout}ms)...`);
      
      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Dialog did not appear within ${timeout}ms`));
        }, timeout);
        
        this._page.once('dialog', async dialog => {
          try {
            clearTimeout(timeoutId);
            
            const dialogInfo = {
              type: dialog.type(),
              message: dialog.message(),
              defaultValue: dialog.defaultValue()
            };
            
            logger.success(`✅ Dialog appeared - Type: ${dialogInfo.type}`);
            logger.info(`   Message: "${dialogInfo.message}"`);
            
            // Auto-accept to not block
            await dialog.accept();
            resolve(dialogInfo);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      });
    } catch (error) {
      logger.error(`❌ Failed to wait for dialog: ${error.message}`);
      throw error;
    }
  }

  // ==================== FOCUS OPERATIONS ====================

  /**
   * Focus on an element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Focus options
   * @returns {Promise<void>}
   */
  async focus(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`🎯 Focusing on element: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.focus(defaultOptions);
    logger.success(`✅ Successfully focused on: [${pageKey}.${elementKey}]`);
  }

  /**
   * Blur an element (remove focus)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Blur options
   * @returns {Promise<void>}
   */
  async blur(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`🌫️  Blurring element (removing focus): [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.blur(defaultOptions);
    logger.success(`✅ Successfully blurred: [${pageKey}.${elementKey}]`);
  }

  // ==================== INPUT OPERATIONS ====================

  /**
   * Type text into element (with delay between keystrokes)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} text - Text to type
   * @param {Object} options - Type options (delay in ms)
   * @returns {Promise<void>}
   */
  async typeText(sitemap, pageKey, elementKey, text, options = {}) {
    logger.info(`⌨️  Typing text in: [${pageKey}.${elementKey}] with value: "${text}"`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { delay: 100, timeout: 30000, ...options };
    await element.type(text, defaultOptions);
    logger.success(`✅ Successfully typed text in: [${pageKey}.${elementKey}]`);
  }

  /**
   * Clear input field
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Clear options
   * @returns {Promise<void>}
   */
  async clearInput(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`🧹 Clearing input field: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.clear(defaultOptions);
    logger.success(`✅ Successfully cleared input: [${pageKey}.${elementKey}]`);
  }

  /**
   * Get input value
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<string>} Input value
   */
  async getInputValue(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`📋 Getting input value from: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    const value = await element.inputValue(defaultOptions);
    logger.success(`✅ Input value retrieved from [${pageKey}.${elementKey}]: "${value || ''}"`);
    return value || '';
  }

  // ==================== BOUNDING BOX & POSITION ====================

  /**
   * Get element's bounding box
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<Object|null>} Bounding box {x, y, width, height}
   */
  async getBoundingBox(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`📏 Getting bounding box for: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
    const boundingBox = await element.boundingBox();
    logger.success(`✅ Bounding box retrieved: ${JSON.stringify(boundingBox)}`);
    return boundingBox;
  }

  // ==================== DISPATCH EVENTS ====================

  /**
   * Dispatch custom event on element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} eventType - Event type (e.g., 'click', 'input', 'change')
   * @param {Object} eventInit - Event initialization object
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async dispatchEvent(sitemap, pageKey, elementKey, eventType, eventInit = {}, options = {}) {
    logger.info(`⚡ Dispatching "${eventType}" event on: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.dispatchEvent(eventType, eventInit, defaultOptions);
    logger.success(`✅ Successfully dispatched "${eventType}" event on [${pageKey}.${elementKey}]`);
  }

  // ==================== FILTERING OPERATIONS ====================

  /**
   * Filter elements by text
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} text - Text to filter by
   * @param {Object} options - Filter options
   * @returns {Promise<Locator>} Filtered locator
   */
  async filterByText(sitemap, pageKey, elementKey, text, options = {}) {
    logger.info(`🔍 Filtering elements by text "${text}": [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const filtered = element.filter({ hasText: text, ...options });
    logger.success(`✅ Filtered elements for text "${text}"`);
    return filtered;
  }

  /**
   * Get nth element from locator
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {number} index - Index of element (0-based)
   * @returns {Promise<Locator>} Nth element locator
   */
  async getNthElement(sitemap, pageKey, elementKey, index) {
    logger.info(`🔢 Getting element at index ${index}: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const nthElement = element.nth(index);
    logger.success(`✅ Retrieved element at index ${index}`);
    return nthElement;
  }

  /**
   * Get first element from locator
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @returns {Promise<Locator>} First element locator
   */
  async getFirstElement(sitemap, pageKey, elementKey) {
    logger.info(`1️⃣  Getting first element: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const firstElement = element.first();
    logger.success(`✅ Retrieved first element`);
    return firstElement;
  }

  /**
   * Get last element from locator
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @returns {Promise<Locator>} Last element locator
   */
  async getLastElement(sitemap, pageKey, elementKey) {
    logger.info(`🔚 Getting last element: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const lastElement = element.last();
    logger.success(`✅ Retrieved last element`);
    return lastElement;
  }

  // ==================== HIGHLIGHTED ELEMENT OPERATIONS ====================

  /**
   * Highlight element (for debugging/visual verification)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string} color - Highlight color (default: 'red')
   * @param {number} duration - Duration in ms (default: 1000)
   * @returns {Promise<void>}
   */
  async highlightElement(sitemap, pageKey, elementKey, color = 'red', duration = 1000) {
    logger.info(`💡 Highlighting element: [${pageKey}.${elementKey}] with color "${color}" for ${duration}ms`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    await element.evaluate(({ color: highlightColor, duration: highlightDuration }) => {
      const originalOutline = el.style.outline;
      el.style.outline = `3px solid ${highlightColor}`;
      setTimeout(() => {
        el.style.outline = originalOutline;
      }, highlightDuration);
    }, { color, duration });
    logger.success(`✅ Successfully highlighted: [${pageKey}.${elementKey}]`);
  }

  // ==================== ALL TEXT CONTENTS ====================

  /**
   * Get all text contents from multiple elements
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<string[]>} Array of text contents
   */
  async getAllTextContents(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`📚 Getting all text contents from: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.first().waitFor({ state: 'visible', timeout: defaultOptions.timeout });
    const textContents = await element.allTextContents();
    logger.success(`✅ Retrieved ${textContents.length} text contents from [${pageKey}.${elementKey}]`);
    return textContents;
  }

  /**
   * Get all inner texts from multiple elements
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<string[]>} Array of inner texts
   */
  async getAllInnerTexts(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`📚 Getting all inner texts from: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.first().waitFor({ state: 'visible', timeout: defaultOptions.timeout });
    const innerTexts = await element.allInnerTexts();
    logger.success(`✅ Retrieved ${innerTexts.length} inner texts from [${pageKey}.${elementKey}]`);
    return innerTexts;
  }

  // ==================== TAP OPERATIONS (Mobile/Touch) ====================

  /**
   * Tap on an element (mobile/touch)
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Tap options
   * @returns {Promise<void>}
   */
  async tap(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`👆 Tapping on element: [${pageKey}.${elementKey}]`);
    const element = await this.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.tap(defaultOptions);
    logger.success(`✅ Successfully tapped: [${pageKey}.${elementKey}]`);
  }

  // ==================== WINDOW/TAB HANDLING OPERATIONS ====================

  /**
   * Wait for new popup/window and return the new page
   * @param {Function} action - Function that triggers the popup (e.g., clicking a link)
   * @param {Object} options - Options
   * @returns {Promise<Page>} - New page object
   */
  async handlePopup(action, options = {}) {
    try {
      logger.info(`🪟 Waiting for popup window to open...`);
      const defaultOptions = { timeout: 30000, ...options };
      
      const [newPage] = await Promise.all([
        this._page.context().waitForEvent('page', { timeout: defaultOptions.timeout }),
        action()
      ]);
      
      await newPage.waitForLoadState('domcontentloaded');
      logger.success(`✅ Popup window opened successfully`);
      logger.info(`   New window URL: ${newPage.url()}`);
      
      return newPage;
    } catch (error) {
      logger.error(`❌ Failed to handle popup: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to a specific window/tab by index
   * @param {number} index - Window index (0 = first window, 1 = second, etc.)
   * @returns {Promise<Page>} - Page object of the switched window
   */
  async switchToWindow(index) {
    try {
      logger.info(`🔄 Switching to window at index: ${index}`);
      const pages = this._page.context().pages();
      
      if (index < 0 || index >= pages.length) {
        throw new Error(`Invalid window index: ${index}. Available windows: ${pages.length}`);
      }
      
      const targetPage = pages[index];
      await targetPage.bringToFront();
      logger.success(`✅ Switched to window ${index}`);
      logger.info(`   Current URL: ${targetPage.url()}`);
      
      return targetPage;
    } catch (error) {
      logger.error(`❌ Failed to switch window: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to window by URL pattern
   * @param {string|RegExp} urlPattern - URL or pattern to match
   * @param {Object} options - Options
   * @returns {Promise<Page>} - Page object of the matched window
   */
  async switchToWindowByUrl(urlPattern, options = {}) {
    try {
      logger.info(`🔍 Searching for window with URL pattern: ${urlPattern}`);
      const pages = this._page.context().pages();
      
      const matchedPage = pages.find(page => {
        const url = page.url();
        if (urlPattern instanceof RegExp) {
          return urlPattern.test(url);
        }
        return url.includes(urlPattern);
      });
      
      if (!matchedPage) {
        throw new Error(`No window found matching URL pattern: ${urlPattern}`);
      }
      
      await matchedPage.bringToFront();
      logger.success(`✅ Switched to window with URL: ${matchedPage.url()}`);
      
      return matchedPage;
    } catch (error) {
      logger.error(`❌ Failed to switch window by URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to window by title
   * @param {string|RegExp} titlePattern - Title or pattern to match
   * @param {Object} options - Options
   * @returns {Promise<Page>} - Page object of the matched window
   */
  async switchToWindowByTitle(titlePattern, options = {}) {
    try {
      logger.info(`🔍 Searching for window with title pattern: ${titlePattern}`);
      const pages = this._page.context().pages();
      
      const matchedPage = await Promise.race(
        pages.map(async page => {
          const title = await page.title();
          if (titlePattern instanceof RegExp) {
            return titlePattern.test(title) ? page : null;
          }
          return title.includes(titlePattern) ? page : null;
        })
      );
      
      if (!matchedPage) {
        throw new Error(`No window found matching title pattern: ${titlePattern}`);
      }
      
      await matchedPage.bringToFront();
      const title = await matchedPage.title();
      logger.success(`✅ Switched to window with title: "${title}"`);
      
      return matchedPage;
    } catch (error) {
      logger.error(`❌ Failed to switch window by title: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all open windows/pages
   * @returns {Promise<Page[]>} - Array of all page objects
   */
  async getAllWindows() {
    try {
      const pages = this._page.context().pages();
      logger.info(`📊 Total open windows: ${pages.length}`);
      
      for (let i = 0; i < pages.length; i++) {
        const title = await pages[i].title();
        logger.info(`   Window ${i}: "${title}" - ${pages[i].url()}`);
      }
      
      return pages;
    } catch (error) {
      logger.error(`❌ Failed to get all windows: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get count of open windows
   * @returns {number} - Number of open windows
   */
  getWindowCount() {
    const count = this._page.context().pages().length;
    logger.info(`📊 Total open windows: ${count}`);
    return count;
  }

  /**
   * Close current window
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async closeCurrentWindow(options = {}) {
    try {
      const url = this._page.url();
      logger.info(`🚫 Closing current window: ${url}`);
      await this._page.close();
      logger.success(`✅ Window closed successfully`);
    } catch (error) {
      logger.error(`❌ Failed to close window: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close window by index
   * @param {number} index - Window index to close
   * @returns {Promise<void>}
   */
  async closeWindow(index) {
    try {
      logger.info(`🚫 Closing window at index: ${index}`);
      const pages = this._page.context().pages();
      
      if (index < 0 || index >= pages.length) {
        throw new Error(`Invalid window index: ${index}. Available windows: ${pages.length}`);
      }
      
      const targetPage = pages[index];
      const url = targetPage.url();
      await targetPage.close();
      logger.success(`✅ Window ${index} closed: ${url}`);
    } catch (error) {
      logger.error(`❌ Failed to close window: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close all windows except the main window (index 0)
   * @returns {Promise<void>}
   */
  async closeOtherWindows() {
    try {
      const pages = this._page.context().pages();
      const closedCount = pages.length - 1;
      
      logger.info(`🚫 Closing ${closedCount} other window(s)...`);
      
      for (let i = pages.length - 1; i > 0; i--) {
        await pages[i].close();
        logger.info(`   Closed window ${i}`);
      }
      
      logger.success(`✅ Closed ${closedCount} window(s), kept main window`);
    } catch (error) {
      logger.error(`❌ Failed to close other windows: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch back to main window (first window)
   * @returns {Promise<Page>} - Main page object
   */
  async switchToMainWindow() {
    try {
      logger.info(`🏠 Switching to main window...`);
      const pages = this._page.context().pages();
      const mainPage = pages[0];
      await mainPage.bringToFront();
      logger.success(`✅ Switched to main window`);
      logger.info(`   Main window URL: ${mainPage.url()}`);
      return mainPage;
    } catch (error) {
      logger.error(`❌ Failed to switch to main window: ${error.message}`);
      throw error;
    }
  }

  /**
   * Open new tab with URL
   * @param {string} url - URL to open in new tab
   * @param {Object} options - Options
   * @returns {Promise<Page>} - New page object
   */
  async openNewTab(url, options = {}) {
    try {
      logger.info(`🆕 Opening new tab with URL: ${url}`);
      const newPage = await this._page.context().newPage();
      await newPage.goto(url, { waitUntil: 'domcontentloaded', ...options });
      logger.success(`✅ New tab opened successfully`);
      logger.info(`   New tab URL: ${newPage.url()}`);
      return newPage;
    } catch (error) {
      logger.error(`❌ Failed to open new tab: ${error.message}`);
      throw error;
    }
  }

  // ==================== FRAME HANDLING ====================

  /**
   * Switch to frame by frame locator selector
   * @param {string} frameSelector - CSS or XPath selector for the frame
   * @returns {Promise<Frame>} - Frame object
   */
  async switchToFrame(frameSelector) {
    try {
      logger.info(`🖼️  Switching to frame: ${frameSelector}`);
      const frameElement = this._page.frameLocator(frameSelector);
      logger.success(`✅ Switched to frame: ${frameSelector}`);
      return frameElement;
    } catch (error) {
      logger.error(`❌ Failed to switch to frame [${frameSelector}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to frame by name or ID
   * @param {string} nameOrId - Name or ID attribute of the frame
   * @returns {Promise<Frame>} - Frame object
   */
  async switchToFrameByName(nameOrId) {
    try {
      logger.info(`🖼️  Switching to frame by name/id: ${nameOrId}`);
      const frame = this._page.frame({ name: nameOrId }) || this._page.frame({ url: new RegExp(nameOrId) });
      if (!frame) {
        throw new Error(`Frame with name/id "${nameOrId}" not found`);
      }
      logger.success(`✅ Switched to frame: ${nameOrId}`);
      logger.info(`   Frame URL: ${frame.url()}`);
      return frame;
    } catch (error) {
      logger.error(`❌ Failed to switch to frame by name [${nameOrId}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to frame by URL pattern
   * @param {string|RegExp} urlPattern - URL pattern to match frame
   * @returns {Promise<Frame>} - Frame object
   */
  async switchToFrameByUrl(urlPattern) {
    try {
      logger.info(`🖼️  Switching to frame by URL: ${urlPattern}`);
      const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
      const frame = this._page.frame({ url: pattern });
      if (!frame) {
        throw new Error(`Frame with URL pattern "${urlPattern}" not found`);
      }
      logger.success(`✅ Switched to frame with URL: ${frame.url()}`);
      return frame;
    } catch (error) {
      logger.error(`❌ Failed to switch to frame by URL [${urlPattern}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get frame element from sitemap for interaction
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} frameKey - Frame element key in sitemap
   * @returns {Promise<FrameLocator>} - Frame locator object
   */
  async getFrameElement(sitemap, pageKey, frameKey) {
    try {
      logger.info(`🖼️  Getting frame element: [${pageKey}.${frameKey}]`);
      const loc = this._parser.getLocator(sitemap, pageKey, frameKey);
      const frameLocator = this._page.frameLocator(loc.value);
      logger.success(`✅ Frame element retrieved: [${pageKey}.${frameKey}]`);
      return frameLocator;
    } catch (error) {
      logger.error(`❌ Failed to get frame element [${pageKey}.${frameKey}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get element inside a frame using sitemap
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} frameKey - Frame element key in sitemap
   * @param {string} elementKey - Element key inside frame
   * @returns {Promise<Locator>} - Element locator inside frame
   */
  async getElementInFrame(sitemap, pageKey, frameKey, elementKey) {
    try {
      logger.info(`🎯 Getting element [${elementKey}] in frame [${frameKey}]`);
      const frameLoc = await this.getFrameElement(sitemap, pageKey, frameKey);
      const elementLoc = this._parser.getLocator(sitemap, pageKey, elementKey);
      
      let element;
      switch (elementLoc.type) {
        case 'role':
          element = frameLoc.getByRole(elementLoc.value, elementLoc.options);
          break;
        case 'css':
          element = frameLoc.locator(elementLoc.value);
          break;
        case 'xpath':
          element = frameLoc.locator(`xpath=${elementLoc.value}`);
          break;
        case 'name':
          element = frameLoc.locator(`[name='${elementLoc.value}']`);
          break;
        default:
          element = frameLoc.locator(elementLoc.value);
      }
      
      logger.success(`✅ Element in frame retrieved: [${pageKey}.${frameKey}.${elementKey}]`);
      return element;
    } catch (error) {
      logger.error(`❌ Failed to get element in frame: ${error.message}`);
      throw error;
    }
  }

  /**
   * Click element inside a frame
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} frameKey - Frame element key in sitemap
   * @param {string} elementKey - Element key inside frame
   * @param {Object} options - Click options
   * @returns {Promise<void>}
   */
  async clickElementInFrame(sitemap, pageKey, frameKey, elementKey, options = {}) {
    try {
      logger.info(`🖱️  Clicking element [${elementKey}] in frame [${frameKey}]`);
      const element = await this.getElementInFrame(sitemap, pageKey, frameKey, elementKey);
      await element.click(options);
      logger.success(`✅ Successfully clicked element in frame: [${frameKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to click element in frame: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fill text in element inside a frame
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} frameKey - Frame element key in sitemap
   * @param {string} elementKey - Element key inside frame
   * @param {string} text - Text to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async fillTextInFrame(sitemap, pageKey, frameKey, elementKey, text, options = {}) {
    try {
      logger.info(`✍️  Filling text in frame element [${frameKey}.${elementKey}] with: "${text}"`);
      const element = await this.getElementInFrame(sitemap, pageKey, frameKey, elementKey);
      await element.fill(text, options);
      logger.success(`✅ Successfully filled text in frame: [${frameKey}.${elementKey}]`);
    } catch (error) {
      logger.error(`❌ Failed to fill text in frame: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all frames on the page with their details
   * @returns {Array<Object>} - Array of frame info objects {index, name, url}
   */
  async getAllFrames() {
    try {
      logger.info(`📋 Getting all frames on the page...`);
      const frames = this._page.frames();
      const frameInfoList = frames.map((frame, index) => ({
        index: index,
        name: frame.name() || 'unnamed',
        url: frame.url()
      }));
      logger.success(`✅ Found ${frameInfoList.length} frame(s)`);
      frameInfoList.forEach((frameInfo) => {
        logger.info(`   [${frameInfo.index}] ${frameInfo.name} - ${frameInfo.url}`);
      });
      return frameInfoList;
    } catch (error) {
      logger.error(`❌ Failed to get all frames: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get frame count on the page
   * @returns {number} - Number of frames
   */
  async getFrameCount() {
    try {
      const frames = this._page.frames();
      const count = frames.length;
      logger.info(`📊 Frame count: ${count}`);
      return count;
    } catch (error) {
      logger.error(`❌ Failed to get frame count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if frame exists by name
   * @param {string} frameName - Name of the frame
   * @returns {boolean} - True if frame exists
   */
  async isFramePresent(frameName) {
    try {
      const frame = this._page.frame({ name: frameName });
      const exists = frame !== null;
      logger.info(`🔍 Frame "${frameName}" ${exists ? 'exists' : 'does not exist'}`);
      return exists;
    } catch (error) {
      logger.error(`❌ Failed to check frame presence: ${error.message}`);
      return false;
    }
  }

  // ==================== TABLE OPERATIONS ====================

  /**
   * Get text from a specific table cell by row index and column header
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {number} rowIndex - Zero-based row index
   * @param {string} columnHeader - Column header name
   * @param {Object} options - Optional parameters (timeout, etc.)
   * @returns {Promise<string>} Cell text content
   */
  async getTableCellText(sitemap, pageKey, elementKey, rowIndex, columnHeader, options = {}) {
    try {
      logger.info(`📋 Getting table cell text: Row ${rowIndex}, Column "${columnHeader}"`);
      
      const tableElement = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };

      // Get column index by header name
      const headers = await tableElement.locator('.ag-header-container .ag-header-cell').allTextContents();
      const columnIndex = headers.indexOf(columnHeader);
      
      if (columnIndex === -1) {
        throw new Error(`Column "${columnHeader}" not found in table headers: ${headers.join(', ')}`);
      }

      logger.info(`   Column "${columnHeader}" found at index: ${columnIndex}`);

      // Get cell text
      const cellLocator = tableElement
        .locator('.ag-center-cols-viewport .ag-row')
        .nth(rowIndex)
        .locator('.ag-cell')
        .nth(columnIndex);

      await cellLocator.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      const cellText = await cellLocator.textContent();

      logger.success(`✅ Cell text retrieved: "${cellText}"`);
      logger.info(`   Location: Row ${rowIndex}, Column "${columnHeader}" (index ${columnIndex})`);
      
      return cellText?.trim() || '';
    } catch (error) {
      logger.error(`❌ Failed to get table cell text [Row: ${rowIndex}, Column: ${columnHeader}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait until table cell contains expected text with optional refresh
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {number} rowIndex - Zero-based row index
   * @param {string} columnHeader - Column header name
   * @param {string} expectedText - Expected cell text (supports partial match)
   * @param {string} refreshElementKey - Element key for refresh button (optional)
   * @param {Object} options - Optional parameters
   * @returns {Promise<string>} Actual cell text when condition is met
   */
  async waitTillStatusInTable(sitemap, pageKey, elementKey, rowIndex, columnHeader, expectedText, refreshElementKey = null, options = {}) {
    const defaultOptions = { 
      timeout: 60000, 
      pollingInterval: 2000, 
      partialMatch: true,
      ...options 
    };

    logger.info(`⏳ Waiting for table cell status...`);
    logger.info(`   Row: ${rowIndex}, Column: "${columnHeader}"`);
    logger.info(`   Expected: "${expectedText}"`);
    logger.info(`   Timeout: ${defaultOptions.timeout}ms`);
    logger.info(`   Partial match: ${defaultOptions.partialMatch}`);

    const startTime = Date.now();
    let lastCellText = '';

    try {
      while (Date.now() - startTime < defaultOptions.timeout) {
        try {
          // Get current cell text
          const cellText = await this.getTableCellText(sitemap, pageKey, elementKey, rowIndex, columnHeader, { 
            timeout: 5000 
          });
          lastCellText = cellText;

          // Check for exact match
          if (cellText === expectedText) {
            const elapsedTime = Date.now() - startTime;
            logger.success(`✅ Table cell status matched! (${elapsedTime}ms)`);
            logger.info(`   Cell text: "${cellText}"`);
            return cellText;
          }

          // Check for partial match if enabled
          if (defaultOptions.partialMatch && cellText.includes(expectedText)) {
            const elapsedTime = Date.now() - startTime;
            logger.success(`✅ Table cell status matched (partial)! (${elapsedTime}ms)`);
            logger.info(`   Cell text: "${cellText}"`);
            logger.info(`   Matched substring: "${expectedText}"`);
            return cellText;
          }

          logger.info(`   Current status: "${cellText}" (not matched yet)`);

          // Click refresh button if provided
          if (refreshElementKey) {
            logger.info(`   🔄 Clicking refresh button...`);
            await this.clickElement(sitemap, pageKey, refreshElementKey, { timeout: 5000 });
            await this._page.waitForTimeout(1000); // Brief wait after refresh
          }

          // Wait before next poll
          await this._page.waitForTimeout(defaultOptions.pollingInterval);

        } catch (innerError) {
          logger.warn(`   ⚠️ Error during polling: ${innerError.message}`);
          
          // Click refresh and continue
          if (refreshElementKey) {
            try {
              await this.clickElement(sitemap, pageKey, refreshElementKey, { timeout: 5000 });
            } catch (refreshError) {
              logger.warn(`   ⚠️ Refresh failed: ${refreshError.message}`);
            }
          }
          
          await this._page.waitForTimeout(defaultOptions.pollingInterval);
        }
      }

      // Timeout reached
      const elapsedTime = Date.now() - startTime;
      const timeoutMessage = `Timeout waiting for table cell status after ${elapsedTime}ms.\n` +
        `Expected: "${expectedText}"\n` +
        `Last value: "${lastCellText}"\n` +
        `Row: ${rowIndex}, Column: "${columnHeader}"`;
      
      logger.error(`❌ ${timeoutMessage}`);
      throw new Error(timeoutMessage);

    } catch (error) {
      logger.error(`❌ Failed to wait for table status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all cell texts from a specific row
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {number} rowIndex - Zero-based row index
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array<string>>} Array of cell texts
   */
  async getTableRowData(sitemap, pageKey, elementKey, rowIndex, options = {}) {
    try {
      logger.info(`📋 Getting table row data: Row ${rowIndex}`);
      
      const tableElement = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };

      const rowLocator = tableElement
        .locator('.ag-center-cols-viewport .ag-row')
        .nth(rowIndex);

      await rowLocator.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      
      const cells = rowLocator.locator('.ag-cell');
      const cellTexts = await cells.allTextContents();
      
      logger.success(`✅ Row data retrieved: ${cellTexts.length} cells`);
      logger.info(`   Data: [${cellTexts.map(t => `"${t.trim()}"`).join(', ')}]`);
      
      return cellTexts.map(text => text.trim());
    } catch (error) {
      logger.error(`❌ Failed to get table row data [Row: ${rowIndex}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all column headers from table
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array<string>>} Array of column header names
   */
  async getTableHeaders(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📋 Getting table headers`);
      
      const tableElement = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };

      await tableElement.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      
      const headers = await tableElement.locator('.ag-header-container .ag-header-cell').allTextContents();
      
      logger.success(`✅ Headers retrieved: ${headers.length} columns`);
      logger.info(`   Headers: [${headers.map(h => `"${h.trim()}"`).join(', ')}]`);
      
      return headers.map(text => text.trim());
    } catch (error) {
      logger.error(`❌ Failed to get table headers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get total number of rows in table
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {Object} options - Optional parameters
   * @returns {Promise<number>} Number of rows
   */
  async getTableRowCount(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📋 Getting table row count`);
      
      const tableElement = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };

      await tableElement.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      
      const rowCount = await tableElement.locator('.ag-center-cols-viewport .ag-row').count();
      
      logger.success(`✅ Row count: ${rowCount}`);
      
      return rowCount;
    } catch (error) {
      logger.error(`❌ Failed to get table row count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get entire table data as array of objects
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array<Object>>} Array of row objects with column headers as keys
   */
  async getTableData(sitemap, pageKey, elementKey, options = {}) {
    try {
      logger.info(`📋 Getting complete table data`);
      
      const headers = await this.getTableHeaders(sitemap, pageKey, elementKey, options);
      const rowCount = await this.getTableRowCount(sitemap, pageKey, elementKey, options);
      
      const tableData = [];
      
      for (let i = 0; i < rowCount; i++) {
        const rowData = await this.getTableRowData(sitemap, pageKey, elementKey, i, options);
        const rowObject = {};
        
        headers.forEach((header, index) => {
          rowObject[header] = rowData[index] || '';
        });
        
        tableData.push(rowObject);
      }
      
      logger.success(`✅ Complete table data retrieved: ${rowCount} rows, ${headers.length} columns`);
      
      return tableData;
    } catch (error) {
      logger.error(`❌ Failed to get table data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Click on a specific cell in the table
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Table element key in sitemap
   * @param {number} rowIndex - Zero-based row index
   * @param {string} columnHeader - Column header name
   * @param {Object} options - Optional parameters
   * @returns {Promise<void>}
   */
  async clickTableCell(sitemap, pageKey, elementKey, rowIndex, columnHeader, options = {}) {
    try {
      logger.info(`🖱️  Clicking table cell: Row ${rowIndex}, Column "${columnHeader}"`);
      
      const tableElement = await this.getElement(sitemap, pageKey, elementKey);
      const defaultOptions = { timeout: 30000, ...options };

      // Get column index
      const headers = await tableElement.locator('.ag-header-container .ag-header-cell').allTextContents();
      const columnIndex = headers.indexOf(columnHeader);
      
      if (columnIndex === -1) {
        throw new Error(`Column "${columnHeader}" not found in table headers`);
      }

      // Click cell
      const cellLocator = tableElement
        .locator('.ag-center-cols-viewport .ag-row')
        .nth(rowIndex)
        .locator('.ag-cell')
        .nth(columnIndex);

      await cellLocator.waitFor({ state: 'visible', timeout: defaultOptions.timeout });
      await cellLocator.click(options);

      logger.success(`✅ Successfully clicked table cell`);
      logger.info(`   Location: Row ${rowIndex}, Column "${columnHeader}"`);
    } catch (error) {
      logger.error(`❌ Failed to click table cell [Row: ${rowIndex}, Column: ${columnHeader}]: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CoreKeywords;
