// Migrated from BaseTest.cs
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const { logger } = require('../Utils/logger');

class BaseTest {

  constructor() {
    // Load configuration at construction time (similar to Java TestBase)
    this.config = this.loadConfig();
    
    // Browser instances
    this.playwright = null;
    this.browser = null;
    this.context = null;
    this.page = null;
    this._isValidAppUrl = false;
  }

  // Similar to Java's prop.getProperty("key")
  getProperty(key, defaultValue = '') {
    return this.config[key] || defaultValue;
  }

  async globalSetup(testInfo = null) {
    logger.separator();
    logger.header('🚀 GLOBAL SETUP - INITIALIZING TEST ENVIRONMENT');
    logger.separator();
    
    // Get base URL from config.app.baseUrl (new structure) or config.url (legacy)
    const baseUrl = this.config.app?.baseUrl || this.getProperty('url');
    logger.info(`🌐 Base URL: ${baseUrl || '<not configured>'}`);
    
    if (baseUrl && /^https?:\/\//i.test(baseUrl)) {
      this._isValidAppUrl = !baseUrl.toLowerCase().includes('example.com');
      logger.success(`✅ Valid application URL detected: ${this._isValidAppUrl}`);
    } else {
      logger.warning('⚠️  No valid base URL configured');
    }

    // Determine browser to launch (config wins, then project.use)
    const requested = (this.config.browser?.name || 'chromium').toLowerCase();

    let browserName = 'chromium';
    let channel;
    const launchArgs = ['--disable-notifications'];

    if (requested === 'edge') {
      browserName = 'chromium';
      channel = 'msedge';
      launchArgs.push('--start-maximized', '--disable-blink-features=AutomationControlled');
    } 
    else if (requested === 'chrome' || requested === 'chromium') {
      browserName = 'chromium';
      channel = requested === 'chrome' ? 'chrome' : undefined;
      launchArgs.push('--start-maximized', '--disable-blink-features=AutomationControlled');
    } 
    else if (requested === 'firefox') {
      browserName = 'firefox';
    } 
    else if (requested === 'webkit' || requested === 'safari') {
      browserName = 'webkit';
    } // else defaults to chromium

    this.browser = await playwright[browserName].launch({
      headless: this.config.browser?.headless ?? false,
      channel,
      args: launchArgs,
    });

    // Maximize behavior: Chromium uses real maximize; others use an explicit large viewport
    const viewportForContext =
      this.config.browser?.viewport ??
      (browserName === 'chromium' ? null : undefined);

    this.context = await this.browser.newContext({
      viewport: viewportForContext,
      ignoreHTTPSErrors: this.config.environment?.ignoreHTTPSErrors !== false,
    });

    this.page = await this.context.newPage();

    if (viewportForContext) {
      await this.page.setViewportSize(viewportForContext);
    } 
    else if (browserName !== 'chromium') {
      const screenSize = await this.page.evaluate(() => ({
        width: window.screen?.availWidth || window.innerWidth,
        height: window.screen?.availHeight || window.innerHeight,
      }));
      await this.page.setViewportSize(screenSize);
    }
    // Launch URL if valid base URL exists
    if (baseUrl) {
      logger.info(`\n🚀 Navigating to application: ${baseUrl}`);
      logger.info('   Wait Until: domcontentloaded');
      logger.info('   Timeout: 60000ms');
      
      const startTime = Date.now();
      await this.page.goto(baseUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      const loadTime = Date.now() - startTime;
      
      logger.success(`✅ Application loaded successfully in ${loadTime}ms`);
      logger.info(`   Current URL: ${this.page.url()}`);
    }
    
    logger.separator();
    logger.header('✅ GLOBAL SETUP COMPLETED SUCCESSFULLY');
    logger.separator();
  }

  loadConfig() {
    try {
      const baseDir = process.cwd();
      const candidates = [
        path.join(baseDir, 'config.json'),
        path.join(baseDir, 'src', 'Config', 'config.json'),
        path.join(baseDir, '..', '..', '..', 'src', 'Config', 'config.json'),
        path.join(baseDir, '..', '..', '..', 'config.json')
      ];

      let configFile = null;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          configFile = candidate;
          logger.info(`Config loaded from: ${configFile}`);
          break;
        }
      }

      if (!configFile) {
        logger.warning('config.json not found in expected locations. Tests may be marked Inconclusive.');
        return {};
      }

      const configContent = fs.readFileSync(configFile, 'utf-8');
      const config = JSON.parse(configContent);
      
      return config;
    } catch (error) {
      logger.error(`Error loading config.json: ${error.message}`);
      return {};
    }
  }

  // Helper method to get any config property (similar to prop.getProperty() in Java)
  getConfigProperty(key, defaultValue = '') {
    return this.config[key] || defaultValue;
  }

  async navigateIfNeeded(testInfo) {
    logger.separator();
    logger.header('🔍 NAVIGATE IF NEEDED - TEST PREPARATION');
    logger.separator();
    
    const testName = testInfo.title;
    const testFile = testInfo.file ? path.basename(testInfo.file) : 'Unknown';
    const testProject = testInfo.project?.name || 'default';
    const description = testInfo.annotations.find(a => a.type === 'description')?.description || '';
    
    logger.info('📝 Test Details:');
    logger.info(`   Test Name: ${testName}`);
    logger.info(`   Test File: ${testFile}`);
    logger.info(`   Project: ${testProject}`);
    logger.info(`   Description: ${description || 'No description'}`);
    logger.info(`   Retry Count: ${testInfo.retry}`);

    // Get base URL from config.app.baseUrl (new structure) or config.url (legacy)
    const baseUrl = this.config.app?.baseUrl || this.getProperty('url');
    const currentUrl = this.page.url();
    
    logger.info('\n🌐 URL Check:');
    logger.info(`   Base URL: ${baseUrl}`);
    logger.info(`   Current URL: ${currentUrl}`);

    if (!this._isValidAppUrl) {
      const message = `Test skipped: Provide a real application URL in config.json (current: '${baseUrl || '<empty>'}').`;
      logger.warning(`⚠️  ${message}`);
      testInfo.skip();
      return;
    }

    if (baseUrl) {
      if (currentUrl === 'about:blank' || !currentUrl.toLowerCase().startsWith(baseUrl.toLowerCase())) {
        logger.info(`🔄 Navigation needed (current: ${currentUrl})`);
        logger.info(`   Navigating to: ${baseUrl}`);
        
        const startTime = Date.now();
        await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - startTime;
        
        logger.success(`✅ Navigation completed in ${loadTime}ms`);
        logger.info(`   New URL: ${this.page.url()}`);
      } else {
        logger.success('✅ Already on correct page - navigation skipped');
      }
    }
    
    logger.separator();
    logger.header('✅ TEST PREPARATION COMPLETED');
    logger.separator();
  }

  testTeardown(testInfo) {
    logger.separator();
    logger.header('🧹 TEST TEARDOWN - CLEANUP & REPORTING');
    logger.separator();
    
    const testName = testInfo.title;
    const testFile = testInfo.file ? path.basename(testInfo.file) : 'Unknown';
    const status = testInfo.status;
    const duration = testInfo.duration;
    const errors = testInfo.errors;
    
    logger.info('📝 Test Summary:');
    logger.info(`   Test Name: ${testName}`);
    logger.info(`   Test File: ${testFile}`);
    logger.info(`   Status: ${status.toUpperCase()}`);
    logger.info(`   Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    logger.info(`   Retry Count: ${testInfo.retry}`);
    
    if (errors && errors.length > 0) {
      logger.error(`\n❌ Errors (${errors.length}):`);
      errors.forEach((error, index) => {
        logger.error(`   ${index + 1}. ${error.message}`);
        if (error.stack) {
          const stackLines = error.stack.split('\n').slice(0, 3);
          stackLines.forEach(line => logger.error(`      ${line}`));
        }
      });
    }
    
    logger.separator();
    logger.header(`✅ TEST TEARDOWN COMPLETED - ${status.toUpperCase()}`);
    logger.separator();
  }

  async globalTeardown(testInfo = null) {
    logger.separator();
    logger.header('🧹 GLOBAL TEARDOWN - CLEANUP RESOURCES');
    logger.separator();
    
    let contextClosed = false;
    let browserClosed = false;
    
    // Close Browser Context
    logger.info('\n🔧 Closing browser context...');
    try {
      if (this.context) {
        await this.context.close();
        contextClosed = true;
        logger.success('✅ Browser context closed successfully');
      } else {
        logger.info('ℹ️  No browser context to close');
      }
    } catch (e) {
      logger.warning(`⚠️  Error closing context: ${e.message}`);
    }
    
    // Close Browser
    logger.info('\n🌐 Closing browser...');
    try {
      if (this.browser) {
        await this.browser.close();
        browserClosed = true;
        logger.success('✅ Browser closed successfully');
      } else {
        logger.info('ℹ️  No browser instance to close');
      }
    } catch (e) {
      logger.warning(`⚠️  Error closing browser: ${e.message}`);
    }
    
    logger.info('\n📈 Cleanup Summary:');
    logger.info(`   Context Closed: ${contextClosed ? '✅' : '❌'}`);
    logger.info(`   Browser Closed: ${browserClosed ? '✅' : '❌'}`);
    
    logger.separator();
    logger.header('✅ GLOBAL TEARDOWN COMPLETED');
    logger.separator();
  }

  /**
   * Load test data from Excel file
   * @param {string} excelFilePath - Path to Excel file (relative to project root)
   * @param {string} sheetName - Sheet name to read from
   * @param {string|number} identifier - Test case name or row index
   * @returns {Object} Test data object matching config structure
   */
  loadTestDataFromExcel(excelFilePath = 'TestData/TestData.xlsx', sheetName = 'UserData', identifier = 'TC002') {
    try {
      const ExcelReader = require('../Utils/ExcelReader');
      
      logger.info(`📊 Loading test data from Excel...`);
      logger.info(`   File: ${excelFilePath}`);
      logger.info(`   Sheet: ${sheetName}`);
      logger.info(`   Identifier: ${identifier}`);
      
      const reader = new ExcelReader(excelFilePath);
      
      let testData;
      
      // If identifier is a number, get by index, otherwise search by TestCase column
      if (typeof identifier === 'number') {
        testData = reader.getRowByIndex(sheetName, identifier);
      } else {
        testData = reader.getRowByColumnValue(sheetName, 'TestCase', identifier);
      }
      
      if (!testData) {
        logger.warning(`⚠️  No test data found for: ${identifier}. Using config.json instead.`);
        return this.config.users.administrator;
      }
      
      // Transform Excel row to match config structure
      const transformedData = {
        title: testData.Title || 'Mr',
        username: testData.Username || testData.Name,
        emailAddress: testData.Email,
        password: testData.Password,
        dateOfBirth: {
          day: String(testData.DOB_Day || testData.Day),
          month: String(testData.DOB_Month || testData.Month),
          year: String(testData.DOB_Year || testData.Year)
        },
        address: {
          firstName: testData.FirstName,
          lastName: testData.LastName,
          company: testData.Company,
          address1: testData.Address1,
          address2: testData.Address2,
          country: testData.Country,
          state: testData.State,
          city: testData.City,
          zipcode: String(testData.Zipcode),
          mobile: String(testData.Mobile)
        },
        subscriptions: {
          newsletter: testData.Newsletter === 'Yes' || testData.Newsletter === true || testData.Newsletter === 'TRUE',
          offers: testData.Offers === 'Yes' || testData.Offers === true || testData.Offers === 'TRUE'
        }
      };
      
      logger.success(`✅ Test data loaded from Excel for: ${identifier}`);
      logger.info(`   Username: ${transformedData.username}`);
      logger.info(`   Email: ${transformedData.emailAddress}`);
      
      return transformedData;
      
    } catch (error) {
      logger.error(`❌ Failed to load test data from Excel: ${error.message}`);
      logger.info(`ℹ️  Falling back to config.json`);
      return this.config.users.administrator;
    }
  }
}

module.exports = BaseTest;