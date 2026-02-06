/**
 * Test Cases Page Helper
 * 
 * Purpose: Semantic wrapper methods for test cases page operations
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class TestCasesPageHelper {
  constructor(core, sitemaps, page) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to Test Cases page
   */
  async navigateToTestCases() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'TestCasesLinkOption');
    await this.page.waitForURL('**/test_cases', { timeout: 10000 });
  }

  // ==================== Verification Methods ====================

  /**
   * Verify Test Cases page is loaded
   * @returns {boolean} True if page loaded
   */
  async isTestCasesPageVisible() {
    try {
      const heading = await this.core.getElement(this.sitemaps.testCases, 'TestCases', 'TestCasesHeading');
      return await heading.isVisible({ timeout: 10000 });
    } catch {
      return false;
    }
  }

  /**
   * Get test cases page heading text
   * @returns {string} Heading text
   */
  async getHeadingText() {
    return await this.core.getText(this.sitemaps.testCases, 'TestCases', 'TestCasesHeading');
  }

  // ==================== Workflow Methods ====================

  /**
   * Complete workflow: Navigate and verify test cases page
   * @returns {boolean} True if navigation successful
   */
  async navigateAndVerify() {
    await this.navigateToTestCases();
    return await this.isTestCasesPageVisible();
  }
}

module.exports = TestCasesPageHelper;
