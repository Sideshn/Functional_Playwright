/**
 * Test Suite: User Registration and Login Flow - Excel Cell Value Driven
 * 
 * Purpose: End-to-end testing of user registration, login, and account management
 * Framework: Playwright with JavaScript - Using Existing Framework
 * Pattern: Page Object Model with JSON Parsers
 * Data Source: Excel File (TestData/TestData.xlsx)
 * 
 * This version uses excelCellValue fixture for direct cell access.
 *
 * @author Automation Team
 * @version 6.0 - Cell value driven
 * @updated November 22, 2025
 */

const { test, expect } = require('../../src/fixtures/dataFixtures');
const path = require('path');

test.describe('User Registration and Login Flow - Excel Cell Value Driven', () => {
    const sheetName = 'UserData';
    const columnName = 'TestCase';
    const value = 'TC002';
    let rowIndex = null;

    test('TC001: Complete user registration with all details', async ({ homeHelper, loginHelper, loc, page, excelReader }) => {
        rowIndex = excelReader.getRowIndex(sheetName, columnName, value);
        // Fetch all needed fields directly
        const username = excelReader.getCellValue(sheetName, rowIndex, 'Username') || excelReader.getCellValue(sheetName, rowIndex, 'Name');
        const emailAddress = excelReader.getCellValue(sheetName, rowIndex, 'Email');
        const title = excelReader.getCellValue(sheetName, rowIndex, 'Title');
        const password = excelReader.getCellValue(sheetName, rowIndex, 'Password');
        const dobDay = String(excelReader.getCellValue(sheetName, rowIndex, 'DOB_Day') || excelReader.getCellValue(sheetName, rowIndex, 'Day'));
        const dobMonth = String(excelReader.getCellValue(sheetName, rowIndex, 'DOB_Month') || excelReader.getCellValue(sheetName, rowIndex, 'Month'));
        const dobYear = String(excelReader.getCellValue(sheetName, rowIndex, 'DOB_Year') || excelReader.getCellValue(sheetName, rowIndex, 'Year'));
        const firstName = excelReader.getCellValue(sheetName, rowIndex, 'FirstName');
        const lastName = excelReader.getCellValue(sheetName, rowIndex, 'LastName');
        const company = excelReader.getCellValue(sheetName, rowIndex, 'Company');
        const address1 = excelReader.getCellValue(sheetName, rowIndex, 'Address1');
        const address2 = excelReader.getCellValue(sheetName, rowIndex, 'Address2');
        const country = excelReader.getCellValue(sheetName, rowIndex, 'Country');
        const state = excelReader.getCellValue(sheetName, rowIndex, 'State');
        const city = excelReader.getCellValue(sheetName, rowIndex, 'City');
        const zipcode = String(excelReader.getCellValue(sheetName, rowIndex, 'Zipcode'));
        const mobile = String(excelReader.getCellValue(sheetName, rowIndex, 'Mobile'));
        const newsletter = excelReader.getCellValue(sheetName, rowIndex, 'Newsletter') === 'Yes';
        const offers = excelReader.getCellValue(sheetName, rowIndex, 'Offers') === 'Yes';

        // Verify home page visible
        await homeHelper.isHomePageVisible();
        
        // Navigate to signup/login page
        await homeHelper.navigateToSignupLogin();
        
        // Complete signup flow
        await loginHelper.signup(username, emailAddress);
        
        // Fill registration form
        const userData = {
            title, password,
            DOB_Day: dobDay,
            DOB_Month: dobMonth,
            DOB_Year: dobYear,
            Newsletter: newsletter ? 'Yes' : 'No',
            Offers: offers ? 'Yes' : 'No'
        };
        await loginHelper.fillAccountInformation(userData);
        
        const addressData = {
            FirstName: firstName,
            LastName: lastName,
            Company: company,
            Address1: address1,
            Address2: address2,
            Country: country,
            State: state,
            City: city,
            Zipcode: zipcode,
            Mobile: mobile
        };
        await loginHelper.fillAddressInformation(addressData);
        
        await loginHelper.createAccount();
        
        // Verify account creation success
        const isAccountCreated = await loginHelper.isAccountCreated();
        expect(isAccountCreated).toBe(true);
        
        await loginHelper.clickContinue();
        
        // Verify logged in
        const isLoggedIn = await homeHelper.isUserLoggedIn(username);
        expect(isLoggedIn).toBe(true);
        
        await homeHelper.logout();
        await page.waitForLoadState('load', { timeout: 10000 });
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
    });

    /**
     * TC002: Login with Valid Credentials
     */
    test('TC002: Login with valid credentials', async ({ homeHelper, loginHelper, page, excelReader }) => {
        const username = excelReader.getCellValue(sheetName, rowIndex, 'Username') || excelReader.getCellValue(sheetName, rowIndex, 'Name');
        const emailAddress = excelReader.getCellValue(sheetName, rowIndex, 'Email');
        const password = excelReader.getCellValue(sheetName, rowIndex, 'Password');

        let pageUrl = page.url();
        if (!pageUrl.includes('/login')) {
            await homeHelper.navigateToSignupLogin();
        }
        
        await loginHelper.isLoginSectionVisible();
        await loginHelper.login(emailAddress, password);
        
        const isLoggedIn = await homeHelper.isUserLoggedIn(username);
        expect(isLoggedIn).toBe(true);
        
        await homeHelper.logout();
        await page.waitForLoadState('load', { timeout: 10000 });
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
    });

    /**
     * TC003: Login with Invalid Credentials
     */
    test('TC003: Login validation with invalid credentials', async ({ homeHelper, loginHelper, loc, page, excelReader }) => {
        const emailAddress = excelReader.getCellValue(sheetName, rowIndex, 'Email');

        let pageUrl2 = page.url();
        if (!pageUrl2.includes('/login')) {
            await homeHelper.navigateToSignupLogin();
        }
        
        await loginHelper.isLoginSectionVisible();
        
        const invalidEmail = 'invalid_' + emailAddress;
        const invalidPassword = 'WrongPassword123';
        
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
     */
    test('TC004: Register user with existing email', async ({ homeHelper, loginHelper, loc, page, excelReader }) => {
        const username = excelReader.getCellValue(sheetName, rowIndex, 'Username') || excelReader.getCellValue(sheetName, rowIndex, 'Name');
        const emailAddress = excelReader.getCellValue(sheetName, rowIndex, 'Email');

        let pageUrl3 = page.url();
        if (!pageUrl3.includes('/login')) {
            await homeHelper.navigateToSignupLogin();
        }
        
        await loginHelper.isSignupSectionVisible();
        await loginHelper.fillSignupForm(username, emailAddress);
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
     */
    test('TC005: Delete account successfully', async ({ homeHelper, loginHelper, loc, page, excelReader }) => {
        const emailAddress = excelReader.getCellValue(sheetName, rowIndex, 'Email');
        const password = excelReader.getCellValue(sheetName, rowIndex, 'Password');
        const username = excelReader.getCellValue(sheetName, rowIndex, 'Username') || excelReader.getCellValue(sheetName, rowIndex, 'Name');

        let pageUrl4 = page.url();
        if (!pageUrl4.includes('/login')) {
            await homeHelper.navigateToSignupLogin();
        }
        
        await loginHelper.login(emailAddress, password);
        await homeHelper.isUserLoggedIn(username);
        
        await homeHelper.deleteAccount();
        
        // Verify deletion success and continue
        const isAccountDeleted = await loginHelper.isAccountDeleted();
        expect(isAccountDeleted).toBe(true);
        
        await loginHelper.clickContinue();
        
        // Verify back on homepage (account no longer exists)
        await homeHelper.isHomePageVisible();
    });
});
