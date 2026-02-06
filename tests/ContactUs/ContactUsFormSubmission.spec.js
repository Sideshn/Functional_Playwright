/**
 * Test Suite: Contact Us Form Submission
 * 
 * Purpose: End-to-end testing of Contact Us form functionality
 * Framework: Playwright with JavaScript - Using Existing Framework
 * Pattern: Page Object Model with JSON Parsers
 * 
 * Test Coverage:
 * - TC006: Contact Us Form - Complete form submission with file upload
 * 
 * Test Steps (Based on Test Case 6):
 * 1. Launch browser and navigate to home page
 * 2. Verify home page is visible
 * 3. Click on 'Contact Us' button
 * 4. Verify 'GET IN TOUCH' heading is visible
 * 5. Enter name, email, subject and message
 * 6. Upload file
 * 7. Click 'Submit' button
 * 8. Click OK button on alert
 * 9. Verify success message 'Success! Your details have been submitted successfully.'
 * 10. Click 'Home' button and verify landed on home page successfully
 * 
 * @author Automation Team
 * @version 1.0
 * @updated November 13, 2025
 */

const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');
const path = require('path');

pageTest.describe('Contact Us Form Submission', () => {

  /**
   * TC006: Contact Us Form - Submit contact form with file upload
   * 
   * Steps:
   * 1. Verify home page is visible
   * 2. Click on 'Contact Us' button
   * 3. Verify 'GET IN TOUCH' is visible
   * 4. Enter contact details (name, email, subject, message)
   * 5. Upload a test file
   * 6. Click Submit button
   * 7. Handle alert (Click OK)
   * 8. Verify success message
   * 9. Click Home button
   * 10. Verify returned to home page
   */
  pageTest('TC006: Contact Us Form - Submit form with file upload', async ({ homeHelper, contactHelper, core, file, loc, config, page, sitemaps }) => {
    // Step 1-2: Verify home page and navigate to Contact Us
    expect(await homeHelper.isHomePageVisible()).toBe(true);
    await contactHelper.navigateToContactUs();
    
    // Step 3-4: Verify 'GET IN TOUCH' heading and fill form
    expect(await contactHelper.isGetInTouchVisible()).toBe(true);
    
    const headingText = await core.getText(sitemaps.contactUs, 'ContactUS', 'GetInTouchHeading');
    const expectedHeading = loc.getValue('ResourcesStrings', 'ContactUs.GetInTouchHeading');
    expect(headingText.trim()).toBe(expectedHeading);
    
    // Step 5: Fill contact form with data from config
    const testData = config.contactUs.testUser;
    await contactHelper.fillContactForm(
      testData.name,
      testData.email,
      testData.subject,
      testData.message
    );
    
    // Verify data entered correctly
    const enteredName = await core.getInputValue(sitemaps.contactUs, 'ContactUS', 'NameInputBox');
    const enteredEmail = await core.getInputValue(sitemaps.contactUs, 'ContactUS', 'EmailInputBox');
    const enteredSubject = await core.getInputValue(sitemaps.contactUs, 'ContactUS', 'SubjectInputBox');
    
    expect(enteredName).toBe(testData.name);
    expect(enteredEmail).toBe(testData.email);
    expect(enteredSubject).toBe(testData.subject);
    
    // Step 6: Upload file
    const testFilePath = path.join(process.cwd(), 'testfiles', 'File1.png');
    await file.uploadFile(sitemaps.contactUs, 'ContactUS', 'UploadFileInput', testFilePath);
    
    // Step 7-8: Submit form and handle alert
    core.setupDialogHandler('accept');
    await contactHelper.submitForm();
    
    // Step 9: Verify success message
    expect(await contactHelper.isSuccessMessageVisible()).toBe(true);
    const successMessage = await contactHelper.getSuccessMessage();
    const expectedSuccessMessage = loc.getValue('ResourcesStrings', 'ContactUs.SuccessMessage');
    expect(successMessage.trim()).toContain(expectedSuccessMessage);
    
    // Step 10-11: Click 'Home' button and verify home page
    await core.clickElement(sitemaps.contactUs, 'ContactUS', 'HomeButton');
    await page.waitForURL('https://automationexercise.com/', { timeout: 10000 });
    expect(await homeHelper.isHomePageVisible()).toBe(true);
  });
});
