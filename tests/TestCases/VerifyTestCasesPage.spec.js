/**
 * Test Suite: Verify Test Cases Page
 * 
 * Purpose: Verify navigation and visibility of Test Cases page
 * Framework: Playwright with JavaScript - Using Existing Framework
 * Pattern: Page Object Model with JSON Parsers
 * 
 * Test Coverage:
 * - TC007: Verify Test Cases Page Navigation
 * 
 * Test Steps (Based on Test Case 7):
 * 1. Launch browser
 * 2. Navigate to url 'http://automationexercise.com'
 * 3. Verify that home page is visible successfully
 * 4. Click on 'Test Cases' button
 * 5. Verify user is navigated to test cases page successfully
 * 
 * @author Automation Team
 * @version 1.0
 * @updated November 13, 2025
 */

const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

pageTest.describe('Verify Test Cases Page', () => {

  /**
   * TC007: Verify Test Cases Page Navigation
   * 
   * Steps:
   * 1. Launch browser and navigate to home page
   * 2. Verify home page is visible
   * 3. Click on 'Test Cases' button
   * 4. Verify user is navigated to test cases page successfully
   */
  pageTest('TC007: Verify Test Cases Page', async ({ homeHelper, testCasesHelper, loc, page }) => {
    // Step 1 & 2: Launch browser and navigate to url 'http://automationexercise.com'
    // Already done in beforeAll and beforeEach hooks
    
    // Step 3: Verify that home page is visible successfully
    await homeHelper.isHomePageVisible();
    
    // Step 4 & 5: Click on 'Test Cases' button and verify navigation
    await testCasesHelper.navigateAndVerify();
    
    // Verify heading text
    const headingText = await testCasesHelper.getHeadingText();
    const expectedHeading = loc.getValue('ResourcesStrings', 'TestCases.PageHeading');
    expect(headingText.trim()).toBe(expectedHeading);
    
    // Verify URL contains test_cases
    const currentUrl = page.url();
    expect(currentUrl).toContain('/test_cases');
  });
});
