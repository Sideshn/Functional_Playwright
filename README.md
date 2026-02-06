# 🚀 Playwright JavaScript Automation Framework

**Version:** 3.0  
**Last Updated:** December 14, 2025  
**Framework:** Playwright v1.42+  
**Runtime:** Node.js v16+

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Overview & Features](#overview--features)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [Running Tests](#running-tests)
7. [Writing Tests](#writing-tests)
8. [Fixtures Guide](#fixtures-guide)
9. [CoreKeywords Reference](#corekeywords-reference)
10. [Page Helpers Guide](#page-helpers-guide)
11. [Test Data Management](#test-data-management)
12. [Locators & Sitemaps](#locators--sitemaps)
13. [Reporting](#reporting)
14. [How to Enhance for Future Scenarios](#how-to-enhance-for-future-scenarios)
15. [Best Practices](#best-practices)
16. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Installation

```bash
# 1. Clone repository (if needed)
git clone https://github.com/chenchubabusankar/playwrightfunctionalautomation.git
cd PlaywrightJavaScriptAutomation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install
```

### Run Your First Test

```bash
# Run example test
npx playwright test tests/examples/fixturesExample.spec.js

# Run all tests
npm test

# Run with UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed
```

### Create Your First Test in 30 Seconds

```bash
# 1. Copy template
cp templates/spec-template.js tests/MyFeature/MyTest.spec.js

# 2. Edit the file and replace placeholders

# 3. Run it
npx playwright test tests/MyFeature/MyTest.spec.js
```

---

## Overview & Features

A comprehensive, scalable, and maintainable test automation framework built with Playwright and JavaScript, featuring the modern fixtures pattern, Page Object Model (POM), and extensive keyword-driven testing capabilities.

### Key Highlights
- 🎯 **100+ Reusable Keywords** - Comprehensive automation methods library
- 🔧 **Modern Fixtures Pattern** - Dependency injection with automatic setup/teardown
- 📍 **JSON-based Sitemaps** - Maintainable locator management
- 📊 **Data-Driven Testing** - Excel integration for parameterized tests
- 🌐 **Multi-Browser Support** - Chromium, Firefox, WebKit/Safari
- 📈 **Comprehensive Reporting** - Extent Reports with detailed execution logs
- 🔄 **Cross-Platform Scripts** - 27 npm scripts for various execution needs

### Core Features
- **Modern Fixtures Pattern**: Leverages Playwright's native fixtures for dependency injection
- **Page Object Model (POM)**: Organized with JSON sitemap parsers for maintainable locators
- **Keyword-Driven Testing**: Extensive CoreKeywords library with 100+ reusable methods
- **Data-Driven Testing**: Excel integration with ExcelReader utility
- **Page Helpers**: Semantic wrapper classes combining JSON locators with OOP methods

### Advanced Features
- **Dialog Handling**: Alert, confirm, prompt, beforeunload dialogs
- **Frame/Window Management**: iFrame and multiple window/tab handling
- **File Operations**: Upload, download, and parse (TXT, CSV, XML, PDF)
- **Database Testing**: SQLite, MySQL, PostgreSQL support with CRUD operations
- **Service Management**: Windows service start/stop/restart operations

---

## 📁 Project Structure

```
PlaywrightJavaScriptAutomation/
│
├── 📁 src/                              # Framework source code
│   ├── 📁 fixtures/                     # Dependency injection (AUTO SETUP/TEARDOWN)
│   │   ├── baseFixtures.js             # Core: page, core, config, file
│   │   ├── pageFixtures.js             # + Helpers & sitemaps
│   │   └── dataFixtures.js             # + Excel & random data
│   │
│   ├── 📁 Base/
│   │   └── BaseTest.js                 # Browser lifecycle management
│   │
│   ├── 📁 Core/                         # Keyword libraries
│   │   ├── CoreKeywords.js             # 100+ automation methods (MOST USED)
│   │   ├── FileKeywords.js             # CSV, PDF, XML, TXT reading
│   │   ├── DBKeywords.js               # MySQL database operations
│   │   └── ServiceKeywords.js          # Windows service operations
│   │
│   ├── 📁 PageHelpers/                  # Page Object helpers (BUSINESS LOGIC)
│   │   ├── LoginPageHelper.js          # Login/signup operations
│   │   ├── ProductPageHelper.js        # Product browsing & cart
│   │   ├── CartPageHelper.js           # Cart operations
│   │   ├── HomePageHelper.js           # Home page navigation
│   │   ├── ContactUsPageHelper.js      # Contact form
│   │   ├── TestCasesPageHelper.js      # Test cases page
│   │   └── README.md                   # Helper documentation
│   │
│   ├── 📁 Config/
│   │   └── config.json                 # Test data & configuration
│   │
│   ├── 📁 Parsers/
│   │   ├── JsonLocalizationParser.js   # Localized strings
│   │   └── JsonSitemapParser.js        # Locator management
│   │
│   └── 📁 Utils/
│       ├── logger.js                   # Logging utility
│       └── ExcelReader.js              # Excel file reader
│
├── 📁 Resources/                        # External resources
│   ├── 📁 Sitemaps/                     # JSON locator files (IMPORTANT!)
│   │   ├── LoginSiteMaps.json          # Login page locators
│   │   ├── HomeScreenSiteMaps.json     # Home page locators
│   │   ├── ProductsSiteMaps.json       # Products page locators
│   │   ├── CartSiteMaps.json           # Cart page locators
│   │   ├── ContactUsSiteMaps.json      # Contact page locators
│   │   └── TestCasesSiteMaps.json      # Test cases page locators
│   │
│   └── 📁 Localization/                 # Localized strings
│       ├── ResourcesStrings.json       # UI strings
│       └── ConstraintStrings.json      # Validation strings
│
├── 📁 tests/                            # YOUR TEST FILES GO HERE
│   ├── 📁 SignupLogin/                  # Feature-based organization
│   ├── 📁 Product/
│   ├── 📁 Cart/
│   ├── 📁 ContactUs/
│   ├── 📁 HomePage/
│   ├── 📁 TestCases/
│   ├── 📁 Navigation/
│   ├── 📁 DialogHandling/
│   ├── 📁 FrameHandling/
│   ├── 📁 WindowHandling/
│   ├── 📁 FileReading/
│   ├── 📁 Database/
│   ├── 📁 Services/
│   ├── 📁 Smoke/
│   └── 📁 examples/                     # Example implementations
│
├── 📁 TestData/                         # Test data files
│   ├── sample.csv
│   ├── sample.xml
│   ├── sample.txt
│   └── TestData.xlsx                   # Excel data for data-driven tests
│
├── 📁 templates/                        # Code templates
│   ├── spec-template.js                # Test file template
│   └── PageHelperTemplate.js           # Helper class template
│
├── 📁 TestReports/                      # HTML test reports
│   └── playwright-report-*/
│
├── 📁 scripts/                          # Utility scripts
│   ├── createSampleDatabase.js
│   ├── createSampleExcel.js
│   └── inspectContactUsPage.js
│
├── 📄 playwright.config.js              # Playwright configuration
├── 📄 package.json                      # Dependencies & npm scripts
├── 📄 run-sample-tests.bat              # Sequential test runner
├── 📄 run-multiple-tests.bat            # Multiple sequential tests
├── 📄 run-parallel-tests.bat            # Parallel test runner
└── 📄 README.md                         # This comprehensive guide
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v16 or higher
- **npm**: v7 or higher (comes with Node.js)
- **Git**: For cloning the repository (optional)

### Installation Steps

```bash
# 1. Clone the repository (if needed)
git clone https://github.com/chenchubabusankar/playwrightfunctionalautomation.git
cd PlaywrightJavaScriptAutomation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Verify installation
npm test -- --help
```

### Verify Setup

```bash
# Run example tests to verify setup
npm run test:examples

# Run a specific test
npm test -- tests/SignupLogin/SignupAndLoginCreationVerificationUpdated.spec.js

# Run tests in headed mode (see browser)
npm run test:headed
```

---

## Configuration

### Main Configuration File: `src/Config/config.json`

```json
{
  "app": {
    "baseUrl": "https://automationexercise.com/",
    "timeout": 60000,
    "waitUntil": "networkidle"
  },
  "browser": {
    "name": "chromium",
    "headless": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  },
  "users": {
    "administrator": {
      "title": "Mr",
      "username": "Leo Das",
      "password": "Test@123456",
      "emailAddress": "leodas@automation.com",
      "dateOfBirth": {
        "day": "15",
        "month": "6",
        "year": "1990"
      },
      "address": {
        "firstName": "Leo",
        "lastName": "Das",
        "company": "Test Automation Company",
        "address1": "123 Main Street",
        "address2": "Building A, Floor 2",
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "zipcode": "560001",
        "mobile": "9876543210"
      }
    }
  },
  "contactUs": {
    "testUser": {
      "name": "Test User",
      "email": "testuser@automationexercise.com",
      "subject": "Test Automation Query",
      "message": "This is a test message."
    }
  },
  "products": {
    "searchKeyword": "Blue Top"
  },
  "subscription": {
    "email": "testsubscriber@automation.com"
  }
}
```

### Playwright Configuration: `playwright.config.js`

```javascript
const { defineConfig } = require('@playwright/test');
const appConfig = require('./src/Config/config.json');

const config = defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
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
      name: appConfig.browser?.name || 'chromium',
      use: {
        browserName: appConfig.browser?.name || 'chromium',
        headless: appConfig.browser?.headless ?? false,
      },
    },
  ],
});

module.exports = config;
```

---

## Running Tests

### Using npm Scripts (Recommended)

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific test suites
npm run test:smoke          # Smoke tests
npm run test:signup         # Signup/Login tests
npm run test:products       # Product tests
npm run test:cart           # Cart tests
npm run test:contact        # Contact Us tests
npm run test:homepage       # Homepage tests
npm run test:examples       # Example tests

# Run tests sequentially (one at a time)
npm run test:sequential

# Run tests in parallel (4 workers)
npm run test:parallel

# Run tests on specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# View test reports
npm run report
```

### Using Playwright CLI

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/SignupLogin/SignupAndLoginCreationVerificationUpdated.spec.js

# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run tests in headed mode with specific browser
npx playwright test --headed --project=chromium

# Run tests with specific workers (parallel execution)
npx playwright test --workers=4

# Run specific test by title
npx playwright test -g "TC001"

# Show test report
npx playwright show-report
```

### Using Batch Files (Windows)

```bash
# Sequential with separate reports per spec
run-sample-tests.bat

# Sequential with separate reports (multiple specs)
run-multiple-tests.bat

# Parallel with one consolidated report
run-parallel-tests.bat
```

---

## Writing Tests

### Test Structure with Fixtures (Recommended)

#### Basic Test with Page Fixtures

```javascript
const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

pageTest.describe('Login Tests', () => {
  
  pageTest('TC001: Login with valid credentials', async ({ 
    homeHelper,
    loginHelper,
    config 
  }) => {
    // ============ ARRANGE ============
    // Setup: Prepare test data
    const user = config.users.administrator;
    
    // ============ ACT ============
    // Action: Perform operations
    await homeHelper.navigateToSignupLogin();
    await loginHelper.fillLoginForm(user.username, user.password);
    await loginHelper.clickLogin();
    
    // ============ ASSERT ============
    // Verification: Check results
    const isLoggedIn = await homeHelper.isUserLoggedIn(user.username);
    expect(isLoggedIn).toBe(true);
    expect(page.url()).toContain('/');
    
    console.log('✅ Test completed successfully');
  });
});
```

#### Data-Driven Test with Excel

```javascript
const { test: dataTest, expect } = require('../../src/fixtures/dataFixtures');

dataTest.describe('Data-Driven Signup Tests', () => {
  let testUsers;
  
  dataTest.beforeAll(async ({ excelData }) => {
    testUsers = await excelData('Login'); // Get data from 'Login' sheet
  });
  
  testUsers.forEach((user, index) => {
    dataTest(`TC${index}: Test ${user.username}`, async ({ loginHelper }) => {
      await loginHelper.signup(user.username, user.emailAddress);
      await loginHelper.fillAccountInformation(user);
      await loginHelper.createAccount();
      
      expect(await loginHelper.isAccountCreated()).toBe(true);
    });
  });
});
```

#### Using Random User Data

```javascript
const { test: dataTest } = require('../../src/fixtures/dataFixtures');

dataTest('Create account with random user', async ({ randomUser, loginHelper }) => {
  // randomUser has unique timestamp-based values
  // username: 'TestUser_1701619200000'
  // emailAddress: 'testuser_1701619200000@automation.com'
  
  await loginHelper.signup(randomUser.username, randomUser.emailAddress);
});
```

### Available Fixtures in Tests

**From pageFixtures (MOST COMMON):**

| Fixture | Type | Description | Usage Example |
|---------|------|-------------|---------------|
| `page` | Object | Playwright page | `await page.goto(url)` |
| `core` | Object | 100+ automation methods | `await core.clickElement(...)` |
| `file` | Object | File operations | `file.readCsvFile(path)` |
| `config` | Object | Configuration | `config.users.administrator` |
| `loc` | Object | Localization strings | `loc.getValue('ResourcesStrings', 'key')` |
| `sitemaps` | Object | Sitemap constants | `sitemaps.login, sitemaps.products` |
| `homeHelper` | Object | Home page helper | `await homeHelper.isHomePageVisible()` |
| `loginHelper` | Object | Login helper | `await loginHelper.signup(name, email)` |
| `productHelper` | Object | Product helper | `await productHelper.searchProduct(keyword)` |
| `cartHelper` | Object | Cart helper | `await cartHelper.verifyCartItemCount(2)` |
| `contactHelper` | Object | Contact helper | `await contactHelper.fillContactForm(data)` |
| `testCasesHelper` | Object | Test cases helper | `await testCasesHelper.navigateToTestCasesPage()` |

**From dataFixtures (for data-driven tests):**

| Fixture | Type | Description |
|---------|------|-------------|
| All pageFixtures | - | Inherits everything above |
| `excelReader` | Object | ExcelReader instance |
| `excelData` | Function | Get Excel row data by sheet name |
| `randomUser` | Object | Auto-generated unique user |

---

## Fixtures Guide

### Overview

Fixtures provide dependency injection, automatic setup/teardown, and reusable test context. The fixtures pattern eliminates boilerplate code and ensures consistent test initialization.

### Fixture Architecture

```
@playwright/test (base)
    ↓
baseFixtures.js (browser, page, core, config)
    ↓
pageFixtures.js (helpers, sitemaps, localization)
    ↓
dataFixtures.js (excel, random data)
```

### Choosing the Right Fixture

```javascript
// Option A: pageTest - For UI tests with helpers (USE THIS 90% OF THE TIME)
const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

// Option B: dataTest - For Excel-driven tests
const { test: dataTest, expect } = require('../../src/fixtures/dataFixtures');

// Option C: test - For basic tests without helpers
const { test, expect } = require('../../src/fixtures/baseFixtures');
```

### Using baseFixtures

**When:** Basic tests without page helpers

```javascript
const { test, expect } = require('../../src/fixtures/baseFixtures');

test('Basic test', async ({ 
  page,      // Playwright page
  core,      // CoreKeywords (100+ methods)
  file,      // FileKeywords
  config,    // config.json
  loc,       // Localization parser
  site       // Sitemap parser
}) => {
  // Your test
});
```

### Using pageFixtures (MOST COMMON)

**When:** UI tests with page helpers and sitemaps

```javascript
const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

pageTest('UI test', async ({ 
  // All baseFixtures PLUS:
  sitemaps,        // Sitemap constants
  homeHelper,      // Home page helper
  loginHelper,     // Login helper
  productHelper,   // Product helper
  cartHelper,      // Cart helper
  contactHelper,   // Contact helper
  testCasesHelper  // Test cases helper
}) => {
  // Your test
});
```

### Using dataFixtures

**When:** Data-driven tests with Excel or random data

```javascript
const { test: dataTest, expect } = require('../../src/fixtures/dataFixtures');

dataTest.describe('Excel tests', () => {
  let users;
  
  dataTest.beforeAll(async ({ excelData }) => {
    users = await excelData('Login'); // Get data from 'Login' sheet
  });
  
  users.forEach((user, index) => {
    dataTest(`TC${index}: Test ${user.username}`, async ({ loginHelper }) => {
      await loginHelper.signup(user.username, user.emailAddress);
    });
  });
});
```

---

## CoreKeywords Reference

CoreKeywords provides 100+ reusable automation methods organized by functionality.

### Navigation Keywords

```javascript
await core.navigateTo(url, options);
await core.goForward(options);
await core.goBackward(options);
await core.refreshPage(options);
const url = core.getCurrentUrl();
```

### Click Actions

```javascript
await core.clickElement(sitemap, pageKey, elementKey, options);
await core.doubleClick(sitemap, pageKey, elementKey, options);
await core.rightClick(sitemap, pageKey, elementKey, options);
```

### Input Operations

```javascript
await core.fillText(sitemap, pageKey, elementKey, text, options);
await core.typeText(sitemap, pageKey, elementKey, text, options);
await core.clearInput(sitemap, pageKey, elementKey, options);
await core.clearAndFill(sitemap, pageKey, elementKey, text, options);
const value = await core.getInputValue(sitemap, pageKey, elementKey, options);
```

### Dropdown/Select Operations

```javascript
await core.selectByText(sitemap, pageKey, elementKey, optionText, options);
await core.selectByValue(sitemap, pageKey, elementKey, optionValue, options);
await core.selectByIndex(sitemap, pageKey, elementKey, index, options);
```

### Text Operations

```javascript
const text = await core.getText(sitemap, pageKey, elementKey, options);
const innerText = await core.getInnerText(sitemap, pageKey, elementKey, options);
const textContent = await core.getTextContent(sitemap, pageKey, elementKey, options);
const attr = await core.getAttribute(sitemap, pageKey, elementKey, attributeName, options);
```

### Element State Checks

```javascript
const isVisible = await core.isVisible(sitemap, pageKey, elementKey, options);
const isEnabled = await core.isEnabled(sitemap, pageKey, elementKey, options);
const isChecked = await core.isChecked(sitemap, pageKey, elementKey, options);
```

### Wait Operations

```javascript
await core.waitForVisible(sitemap, pageKey, elementKey, options);
await core.waitForHidden(sitemap, pageKey, elementKey, options);
await core.waitForText(sitemap, pageKey, elementKey, expectedText, options);
```

### Advanced Operations

```javascript
await core.hoverElement(sitemap, pageKey, elementKey, options);
await core.scrollIntoView(sitemap, pageKey, elementKey, options);
await core.dragAndDrop(sourceSitemap, sourcePageKey, sourceElementKey, 
                       targetSitemap, targetPageKey, targetElementKey, options);
```

### Checkbox/Radio Operations

```javascript
await core.check(sitemap, pageKey, elementKey, options);
await core.uncheck(sitemap, pageKey, elementKey, options);
```

### Dialog Handling

```javascript
const message = await core.handleDialogAccept(action, options);
const message = await core.handleDialogDismiss(action, options);
const dialogInfo = await core.handleDialogPrompt(action, promptText, options);
core.setupDialogHandler('accept'); // or 'dismiss'
```

### Window/Tab Management

```javascript
const newPage = await core.handlePopup(action, options);
const page = await core.switchToWindow(index);
const pages = await core.getAllWindows();
const count = core.getWindowCount();
await core.closeWindow(index);
await core.openNewTab(url);
```

### Frame Handling

```javascript
const frame = await core.switchToFrame(frameSelector);
const element = await core.getElementInFrame(sitemap, pageKey, frameKey, elementKey);
```

### File Operations (FileKeywords)

```javascript
// Read files
const csvData = file.readCsvFile(filePath);
const pdfText = await file.readPdfFile(filePath);
const xmlData = await file.readXmlFile(filePath);
const text = file.readTxtFile(filePath);

// Upload file
await file.uploadFile(sitemap, pageKey, elementKey, filePath);
```

---

## Page Helpers Guide

Page Helpers are semantic wrapper classes that combine JSON-based locators with OOP methods for better readability and maintainability.

### Architecture

```
JSON Sitemaps → CoreKeywords → Page Helpers → Tests
     ↓              ↓              ↓            ↓
Centralized    100+ Methods   Business     Readable
Locators      Automation      Logic        Test Code
```

### Available Helpers

#### 1. HomePageHelper

**Purpose:** Homepage navigation and common actions

```javascript
// Navigation
await homeHelper.navigateToHome();
await homeHelper.navigateToProducts();
await homeHelper.navigateToCart();
await homeHelper.navigateToSignupLogin();

// Verification
const isVisible = await homeHelper.isHomePageVisible();
const isLoggedIn = await homeHelper.isUserLoggedIn('Leo Das');

// Subscription
await homeHelper.subscribeToNewsletter('test@email.com');

// Account
await homeHelper.logout();
```

#### 2. LoginPageHelper

**Purpose:** Authentication workflows

```javascript
// Signup
await loginHelper.fillSignupForm(name, email);
await loginHelper.signup(name, email);
await loginHelper.fillAccountInformation(userData);

// Login
await loginHelper.fillLoginForm(email, password);
await loginHelper.login(email, password);

// Verification
const isCreated = await loginHelper.isAccountCreated();
const isLoggedIn = await loginHelper.isUserLoggedIn();

// Cleanup
await loginHelper.deleteAccount();
```

#### 3. ProductPageHelper

**Purpose:** Product browsing, search, and cart operations

```javascript
// Navigation
await productHelper.navigateToProducts();
await productHelper.viewFirstProduct();

// Search
await productHelper.searchProduct('Blue Top');
const results = await productHelper.getSearchResults();

// Cart Operations
await productHelper.addFirstProductToCart();
await productHelper.addToCartFromDetailPage('4');
await productHelper.continueShopping();
await productHelper.viewCart();

// Verification
const isVisible = await productHelper.isProductsPageVisible();
const details = await productHelper.getProductDetails();
const names = await productHelper.getAllProductNames();
```

#### 4. CartPageHelper

**Purpose:** Cart verification and management

```javascript
// Cart Information
const count = await cartHelper.getCartItemCount();
const product = await cartHelper.getProductDetails(1);
const allProducts = await cartHelper.getAllProductDetails();

// Verification
const hasTwo = await cartHelper.verifyCartItemCount(2);
const priceMatch = await cartHelper.verifyPriceEqualsTotal(1);

// Cart Actions
await cartHelper.proceedToCheckout();
await cartHelper.removeProductFromCart(1);
```

#### 5. ContactUsPageHelper

**Purpose:** Contact form submission

```javascript
// Navigation
await contactHelper.navigateToContactUs();

// Form Operations
await contactHelper.fillContactForm(formData);
await contactHelper.uploadFile(filePath);
await contactHelper.submitForm();

// Verification
const isSuccess = await contactHelper.isSuccessMessageVisible();
```

#### 6. TestCasesPageHelper

**Purpose:** Test cases page navigation

```javascript
await testCasesHelper.navigateToTestCasesPage();
const isVisible = await testCasesHelper.isTestCasesPageVisible();
```

### Usage Example: Before vs After

**Before (Direct CoreKeywords):**
```javascript
await core.clickElement(sitemaps.home, 'HomeScreen', 'ProductsLinkOption');
await page.waitForURL('**/products');
const firstProduct = await core.getFirstElement(sitemaps.products, 'Products', 'ProductImageWrapper');
await firstProduct.hover();
await core.clickElement(sitemaps.products, 'Products', 'FirstProductAddToCartButton');
```

**After (With Page Helpers):**
```javascript
await homeHelper.navigateToProducts();
await productHelper.addFirstProductToCart();
```

---

## Test Data Management

### 1. Config File (Static Data)

**File:** `src/Config/config.json`

**Usage:**
```javascript
pageTest('Test', async ({ config }) => {
  const url = config.app.baseUrl;
  const user = config.users.administrator;
  const keyword = config.products.searchKeyword;
});
```

### 2. Excel Files (Data-Driven)

**File:** `TestData/TestData.xlsx`

**Usage:**
```javascript
const { test: dataTest } = require('../../src/fixtures/dataFixtures');

dataTest.describe('Excel tests', () => {
  let testData;
  
  dataTest.beforeAll(async ({ excelData }) => {
    testData = await excelData('Login');
  });
  
  testData.forEach((row, index) => {
    dataTest(`TC${index}: Login ${row.username}`, async ({ loginHelper }) => {
      await loginHelper.signup(row.username, row.emailAddress);
    });
  });
});
```

### 3. CSV Files

```javascript
const path = require('path');

test('Read CSV', async ({ file }) => {
  const csvPath = path.join(process.cwd(), 'TestData', 'sample.csv');
  const csvData = file.readCsvFile(csvPath);
  
  csvData.forEach(row => {
    console.log(row.name, row.email);
  });
});
```

### 4. Random Data

```javascript
const { test: dataTest } = require('../../src/fixtures/dataFixtures');

dataTest('Create unique user', async ({ randomUser }) => {
  // randomUser has unique username/email with timestamp
  console.log(randomUser.username);  // TestUser_1702562400000
  console.log(randomUser.emailAddress);  // testuser_1702562400000@automation.com
});
```

---

## Locators & Sitemaps

### What are Sitemaps?

Sitemaps are JSON files that store all element locators for a page. This keeps locators centralized and maintainable.

### Creating a Sitemap JSON File

**Location:** `Resources/Sitemaps/MyPageSiteMaps.json`

```json
{
  "MyPage": {
    "PageHeading": {
      "LocatorType": "css",
      "LocatorValue": "h1.page-title"
    },
    "EmailInput": {
      "LocatorType": "css",
      "LocatorValue": "input[name='email']"
    },
    "PasswordInput": {
      "LocatorType": "css",
      "LocatorValue": "input[type='password']"
    },
    "SubmitButton": {
      "LocatorType": "css",
      "LocatorValue": "button[type='submit']"
    },
    "ErrorMessage": {
      "LocatorType": "xpath",
      "LocatorValue": "//div[@class='alert alert-danger']"
    },
    "SuccessMessage": {
      "LocatorType": "text",
      "LocatorValue": "Success! Your details have been submitted."
    }
  }
}
```

### Supported Locator Types

| LocatorType | Example LocatorValue |
|-------------|---------------------|
| `css` | `.className`, `#id`, `button[type='submit']` |
| `xpath` | `//div[@class='content']`, `//button[text()='Click']` |
| `text` | `'Login'`, `'Sign Up'` |
| `placeholder` | `'Enter your email'` |
| `role` | `'button'`, `'link'` |

### Registering a New Sitemap

**Open:** `src/fixtures/pageFixtures.js`

```javascript
const test = base.extend({
  sitemaps: async ({ baseTest }, use) => {
    const sitemaps = {
      login: 'LoginSiteMaps',
      home: 'HomeScreenSiteMaps',
      products: 'ProductsSiteMaps',
      cart: 'CartSiteMaps',
      contactUs: 'ContactUsSiteMaps',
      testCases: 'TestCasesSiteMaps',
      myPage: 'MyPageSiteMaps'  // ADD YOUR SITEMAP HERE
    };
    await use(sitemaps);
  }
});
```

### Using in Tests

```javascript
// In tests
await core.clickElement(sitemaps.myPage, 'MyPage', 'SubmitButton');
const text = await core.getText(sitemaps.myPage, 'MyPage', 'PageHeading');
```

### Locator Best Practices

1. ✅ **Prefer CSS selectors** - Better performance
2. ✅ **Use meaningful names** - `LoginButton` not `Button1`
3. ✅ **Group by section** - Organize related elements
4. ✅ **Avoid brittle locators** - Don't use generated IDs
5. ✅ **Test before commit** - Verify locators work

---

## Reporting

### Extent Reports

Extent Reports are automatically generated in the `TestReports/` directory after test execution.

**Report Naming:** `[TestFileName]_[Timestamp].html` and matching `.txt` log files

Example: 
- HTML: `SignupAndLoginCreationVerificationUpdated.spec_2025-12-14T11-06-28.html`
- TXT: `SignupAndLoginCreationVerificationUpdated.spec_2025-12-14T11-06-28.txt`

### Playwright HTML Report

Playwright generates its native HTML report in the `playwright-report/` directory.

**View Report:**
```bash
npm run report
# or
npx playwright show-report
```

### Report Features

- **Test execution summary**
- **Pass/Fail status with screenshots**
- **Execution timeline**
- **Error stack traces**
- **Test duration metrics**
- **Browser and environment information**

---

## How to Enhance for Future Scenarios

### 1. Adding New Page Tests

**Steps:**

1. **Create Sitemap JSON** (`Resources/Sitemaps/NewPageSiteMaps.json`)
2. **Create PageHelper** (`src/PageHelpers/NewPageHelper.js`)
3. **Register in pageFixtures.js**
4. **Add Sitemap Constant**
5. **Create Test File**

**Example PageHelper:**

```javascript
class NewPageHelper {
  constructor(core, sitemaps, page, config) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
    this.config = config;
  }

  async navigateToNewPage() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'NewPageLink');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillForm(data) {
    await this.core.fillText(this.sitemaps.newPage, 'NewPage', 'InputField', data);
    await this.core.clickElement(this.sitemaps.newPage, 'NewPage', 'SubmitButton');
  }

  async isHeaderVisible() {
    return await this.core.isVisible(this.sitemaps.newPage, 'NewPage', 'HeaderText');
  }

  async completeNewPageWorkflow(data) {
    await this.navigateToNewPage();
    await this.fillForm(data);
    return await this.isHeaderVisible();
  }
}

module.exports = NewPageHelper;
```

### 2. Adding API Testing Support

**Create APIKeywords:** (`src/Core/APIKeywords.js`)

```javascript
const axios = require('axios');

class APIKeywords {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = { 'Content-Type': 'application/json' };
  }

  async get(endpoint, params = {}) {
    const response = await axios.get(`${this.baseURL}${endpoint}`, {
      params,
      headers: this.headers
    });
    return response;
  }

  async post(endpoint, data) {
    const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
      headers: this.headers
    });
    return response;
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
}

module.exports = APIKeywords;
```

### 3. Adding Multi-Environment Support

**Create Environment Configs:**
- `src/Config/config.dev.json`
- `src/Config/config.qa.json`
- `src/Config/config.staging.json`
- `src/Config/config.prod.json`

**Create Config Loader:**

```javascript
class ConfigLoader {
  static loadConfig() {
    const env = process.env.TEST_ENV || 'dev';
    const configPath = path.join(__dirname, `config.${env}.json`);
    
    if (!fs.existsSync(configPath)) {
      return require('./config.json');
    }
    
    return require(configPath);
  }
}
```

**Run with Environment:**
```bash
# PowerShell
$env:TEST_ENV="qa"; npm test

# Or add to package.json
"test:qa": "cross-env TEST_ENV=qa playwright test"
```

### 4. Adding Visual Regression Testing

**Install Dependencies:**
```bash
npm install pixelmatch --save-dev
```

**Create Visual Keywords:**

```javascript
class VisualKeywords {
  async compareScreenshot(name, threshold = 0.1) {
    // Take screenshot and compare with baseline
    // Return match result
  }
}
```

### 5. Adding Performance Testing

**Create Performance Keywords:**

```javascript
class PerformanceKeywords {
  async measurePageLoad(url) {
    const startTime = Date.now();
    await this.page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    const metrics = await this.page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        loadComplete: perfData.loadEventEnd - perfData.navigationStart,
        ttfb: perfData.responseStart - perfData.requestStart
      };
    });
    
    return { totalLoadTime: loadTime, ...metrics };
  }
}
```

### 6. Adding Mobile Testing

**Update playwright.config.js:**

```javascript
const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { ...devices['iPad Pro'] } }
  ]
};
```

**Run Mobile Tests:**
```bash
npx playwright test --project=mobile-chrome
```

---

## Best Practices

### 1. Test Structure (AAA Pattern)

```javascript
pageTest('TC001: Test name', async ({ fixtures }) => {
  // ARRANGE - Setup
  const testData = { };
  
  // ACT - Perform action
  await helper.doSomething(testData);
  
  // ASSERT - Verify result
  expect(result).toBe(expected);
});
```

### 2. Naming Conventions

**Test Files:**
- ✅ `FeatureNameTests.spec.js`
- ✅ `ProductTests.spec.js`
- ❌ `test1.spec.js`

**Test Cases:**
- ✅ `TC001: Verify user can login with valid credentials`
- ❌ `test login`

**Helpers:**
- ✅ `ProductPageHelper`
- ✅ `async addToCart()`
- ❌ `Helper`, `doStuff()`

### 3. Locators (CRITICAL)

```javascript
// ✅ ALWAYS use JSON sitemaps
await core.clickElement(sitemaps.products, 'Products', 'AddToCartButton');

// ❌ NEVER hardcode selectors
await page.click('.add-to-cart'); // DON'T DO THIS
```

### 4. Waits

```javascript
// ✅ GOOD: Use built-in waits
await core.waitForVisible(sitemaps.products, 'Products', 'ProductList');
await page.waitForURL('**/products');

// ⚠️ OK for hover effects only
await page.waitForTimeout(500);

// ❌ BAD: Fixed waits everywhere
await page.waitForTimeout(5000);
```

### 5. Assertions

```javascript
// ✅ GOOD: Descriptive with timeout
await expect(element).toBeVisible({ timeout: 10000 });
expect(productName).toBe('Blue Top');

// ❌ BAD: No context
expect(x).toBe(y);
```

### 6. Test Isolation

```javascript
// ✅ GOOD: Independent tests
pageTest.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
});

// ❌ BAD: Dependent tests
let sharedData; // Don't share state between tests
```

### 7. Helpers vs CoreKeywords

```javascript
// ✅ Use helpers for business logic
await loginHelper.signup('John', 'john@example.com');
await productHelper.addFirstProductToCart();

// ✅ Use CoreKeywords for generic actions
await core.clickElement(sitemaps.home, 'HomeScreen', 'Link');
await core.getText(sitemaps.products, 'Products', 'Heading');

// ❌ Don't mix responsibilities
await page.click('button'); // Use helpers or core, not raw Playwright
```

### 8. Data Management

```javascript
// ✅ Use config for static data
const user = config.users.administrator;

// ✅ Use Excel for data-driven
const users = await excelData('Login');

// ✅ Use randomUser for unique data
await loginHelper.signup(randomUser.username, randomUser.emailAddress);

// ❌ Hardcoded data
await loginHelper.signup('test@test.com', 'pass123');
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Element Not Found

**Error:** `Element not found: [selector]`

**Solutions:**
```javascript
// Add explicit wait
await core.waitForVisible(sitemaps.products, 'Products', 'Element');

// Increase timeout
await expect(element).toBeVisible({ timeout: 20000 });

// Check locator in JSON file
// Verify LocatorValue is correct
```

#### 2. Test Timeout

**Error:** `Test timeout of 30000ms exceeded`

**Solutions:**
```javascript
// Increase timeout for specific test
pageTest('Slow test', async ({ }) => {
  test.setTimeout(60000);
  // ...
});

// Or globally in playwright.config.js
timeout: 60000
```

#### 3. Flaky Tests

**Symptoms:** Test passes sometimes, fails sometimes

**Solutions:**
```javascript
// Remove fixed waits
// ❌ await page.waitForTimeout(5000);

// ✅ Use proper waits
await page.waitForLoadState('networkidle');
await core.waitForVisible(sitemaps.page, 'Section', 'Element');

// Add retries in playwright.config.js
retries: 2
```

#### 4. Fixture Not Available

**Error:** `Fixture "myHelper" not found`

**Solutions:**
```javascript
// Check you're using the right fixture file
// ✅ pageFixtures has all helpers
const { test: pageTest } = require('../../src/fixtures/pageFixtures');

// ❌ baseFixtures doesn't have helpers
const { test } = require('../../src/fixtures/baseFixtures');
```

#### 5. Excel Data Not Loading

**Error:** `Cannot read Excel file`

**Solutions:**
```javascript
// Use dataFixtures, not pageFixtures
const { test: dataTest } = require('../../src/fixtures/dataFixtures');

// Check Excel file exists in TestData folder
// Check sheet name matches exactly
```

#### 6. Locator Issues

**Problem:** Locator not working

**Solutions:**
```javascript
// Check JSON file exists in Resources/Sitemaps/
// Check LocatorType and LocatorValue are correct
// Check sitemap is registered in pageFixtures.js

// Test locator in browser console:
// CSS: document.querySelector('.selector')
// XPath: $x('//xpath')
```

### Debug Mode

```bash
# Run with Playwright Inspector
npx playwright test --debug

# Add breakpoint in code
await page.pause();

# Run specific test in debug
npx playwright test tests/Product/ProductTests.spec.js --debug
```

### Logging

```javascript
// Console logging
console.log('Current URL:', page.url());
console.log('Element text:', await element.textContent());

// Framework logger
const { logger } = require('../../src/Utils/logger');
logger.info('Test started');
logger.error('Test failed');
```

---

## 🎯 Quick Reference

### Most Used CoreKeywords Methods

```javascript
// Click
await core.clickElement(sitemaps.X, 'Y', 'Z');

// Fill text
await core.fillText(sitemaps.X, 'Y', 'Z', 'text');

// Get text
const text = await core.getText(sitemaps.X, 'Y', 'Z');

// Get element
const element = await core.getElement(sitemaps.X, 'Y', 'Z');

// Wait
await core.waitForVisible(sitemaps.X, 'Y', 'Z');

// Select dropdown
await core.selectByValue(sitemaps.X, 'Y', 'Z', 'value');
await core.selectByText(sitemaps.X, 'Y', 'Z', 'text');

// Checkbox
await core.check(sitemaps.X, 'Y', 'Z');
await core.uncheck(sitemaps.X, 'Y', 'Z');
```

### Most Used File Operations

```javascript
// Read CSV
const csvData = file.readCsvFile(filePath);

// Read PDF
const pdfText = await file.readPdfFile(filePath);

// Read XML
const xmlData = await file.readXmlFile(filePath);

// Upload file
await file.uploadFile(sitemaps.X, 'Y', 'Z', filePath);
```

### Most Used Assertions

```javascript
// Playwright assertions (preferred)
expect(value).toBe(expected);
expect(value).toContain(substring);
expect(value).toBeGreaterThan(0);
await expect(element).toBeVisible();
await expect(element).toHaveCount(5);
await expect(element).toHaveText('Expected');
await expect(page).toHaveURL(/.*products/);
```

---

## 📝 Cheatsheet

### Create New Test
```bash
cp templates/spec-template.js tests/MyFeature/MyTest.spec.js
# Edit file, replace placeholders, run:
npx playwright test tests/MyFeature/MyTest.spec.js
```

### Create New Helper
```bash
cp templates/PageHelperTemplate.js src/PageHelpers/MyPageHelper.js
# Edit file, register in pageFixtures.js
```

### Create New Locators
```bash
# Create Resources/Sitemaps/MyPageSiteMaps.json
# Add locators in JSON format
# Register in pageFixtures.js sitemaps constant
```

### Run Tests
```bash
npx playwright test                    # All tests
npx playwright test --ui               # UI mode
npx playwright test --headed           # See browser
npx playwright test -g "TC001"         # Specific test
npx playwright test --workers=1        # Sequential
```

---

## 🎓 Learning Path

**Week 1 - Beginner:**
1. ✅ Read Quick Start and Project Structure
2. ✅ Run existing tests
3. ✅ Copy template and create simple test
4. ✅ Use pageTest fixture
5. ✅ Use helpers in tests

**Week 2 - Intermediate:**
1. ✅ Create test from scratch
2. ✅ Add locators to JSON sitemaps
3. ✅ Use CoreKeywords methods
4. ✅ Work with config.json
5. ✅ Create data-driven test

**Week 3-4 - Advanced:**
1. ✅ Create new page helper
2. ✅ Register helper in fixtures
3. ✅ Use Excel data
4. ✅ Create complex workflows
5. ✅ Add custom fixtures

---

## 📚 Additional Resources

### Playwright Documentation
- Official Docs: https://playwright.dev
- API Reference: https://playwright.dev/docs/api/class-playwright
- Best Practices: https://playwright.dev/docs/best-practices

### Project Resources
- Test Examples: `tests/examples/`
- Fixture Examples: `src/fixtures/`
- Sample Data: `TestData/`
- Code Templates: `templates/`

---

## Contributing

When adding new features or tests:
1. Follow existing code structure
2. Use fixtures pattern
3. Add comments and documentation
4. Update this documentation if needed
5. Test locally before committing

---

## License

ISC

---

## Authors

**Automation Team**

---

**🎉 You're now ready to use the framework!**

For questions or issues, please refer to the [Troubleshooting](#troubleshooting) section.

*Last Updated: December 14, 2025*
