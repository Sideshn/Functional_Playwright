const { test, expect } = require('../../src/fixtures/baseFixtures');

test.describe('Navigation Methods Tests', () => {

  test('TC001 - Verify navigateTo method', async ({ core }) => {
    // Navigate to a test URL
    const response = await core.navigateTo('https://the-internet.herokuapp.com/');
    
    // Verify navigation was successful
    expect(response).toBeDefined();
    expect(response.status()).toBe(200);
    
    // Verify we're on the correct page
    const currentUrl = core.getCurrentUrl();
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/');
  });

  test('TC002 - Verify getCurrentUrl method', async ({ core }) => {
    // Navigate to a known URL
    await core.navigateTo('https://the-internet.herokuapp.com/login');
    
    // Get current URL
    const currentUrl = core.getCurrentUrl();
    
    // Verify URL is correct
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/login');
    expect(typeof currentUrl).toBe('string');
  });

  test('TC003 - Verify getPageTitle method', async ({ core }) => {
    // Navigate to a page with known title
    await core.navigateTo('https://the-internet.herokuapp.com/');
    
    // Get page title
    const title = await core.getPageTitle();
    
    // Verify title
    expect(title).toBe('The Internet');
    expect(typeof title).toBe('string');
  });

  test('TC004 - Verify goForward and goBackward methods', async ({ core }) => {
    // Navigate to first page
    await core.navigateTo('https://the-internet.herokuapp.com/');
    const firstUrl = core.getCurrentUrl();
    expect(firstUrl).toBe('https://the-internet.herokuapp.com/');
    
    // Navigate to second page
    await core.navigateTo('https://the-internet.herokuapp.com/login');
    const secondUrl = core.getCurrentUrl();
    expect(secondUrl).toBe('https://the-internet.herokuapp.com/login');
    
    // Go backward to first page
    await core.goBackward();
    const backUrl = core.getCurrentUrl();
    expect(backUrl).toBe('https://the-internet.herokuapp.com/');
    
    // Go forward to second page
    await core.goForward();
    const forwardUrl = core.getCurrentUrl();
    expect(forwardUrl).toBe('https://the-internet.herokuapp.com/login');
  });

  test('TC005 - Verify refreshPage method', async ({ core }) => {
    // Navigate to a page
    await core.navigateTo('https://the-internet.herokuapp.com/dynamic_loading/1');
    
    // Get initial URL
    const urlBeforeRefresh = core.getCurrentUrl();
    
    // Refresh the page
    const response = await core.refreshPage();
    
    // Verify page was refreshed (URL remains same)
    const urlAfterRefresh = core.getCurrentUrl();
    expect(urlAfterRefresh).toBe(urlBeforeRefresh);
    expect(response).toBeDefined();
    expect(response.status()).toBe(200);
  });

  test('TC006 - Verify navigateTo with custom options', async ({ core }) => {
    // Navigate with custom wait option
    const response = await core.navigateTo('https://the-internet.herokuapp.com/redirector', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Verify navigation completed
    expect(response).toBeDefined();
    const currentUrl = core.getCurrentUrl();
    expect(currentUrl).toContain('herokuapp.com');
  });

  test('TC007 - Verify multiple navigation sequence', async ({ core }) => {
    // Navigate to page 1
    await core.navigateTo('https://the-internet.herokuapp.com/');
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/');
    
    // Navigate to page 2
    await core.navigateTo('https://the-internet.herokuapp.com/login');
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/login');
    
    // Navigate to page 3
    await core.navigateTo('https://the-internet.herokuapp.com/dropdown');
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/dropdown');
    
    // Go back twice
    await core.goBackward();
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/login');
    
    await core.goBackward();
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/');
    
    // Go forward twice
    await core.goForward();
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/login');
    
    await core.goForward();
    expect(core.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/dropdown');
  });

  test('TC008 - Verify getPageTitle on different pages', async ({ core }) => {
    // Page 1
    await core.navigateTo('https://the-internet.herokuapp.com/');
    let title = await core.getPageTitle();
    expect(title).toBe('The Internet');
    
    // Page 2
    await core.navigateTo('https://the-internet.herokuapp.com/login');
    title = await core.getPageTitle();
    expect(title).toBe('The Internet');
    
    // Verify title is always a string
    expect(typeof title).toBe('string');
  });

  test('TC009 - Verify refreshPage maintains URL', async ({ core }) => {
    // Navigate to a specific page
    await core.navigateTo('https://the-internet.herokuapp.com/checkboxes');
    const originalUrl = core.getCurrentUrl();
    
    // Refresh multiple times
    await core.refreshPage();
    expect(core.getCurrentUrl()).toBe(originalUrl);
    
    await core.refreshPage();
    expect(core.getCurrentUrl()).toBe(originalUrl);
    
    await core.refreshPage();
    expect(core.getCurrentUrl()).toBe(originalUrl);
  });

  test('TC010 - Verify navigation response status codes', async ({ core }) => {
    // Navigate to valid page
    const response1 = await core.navigateTo('https://the-internet.herokuapp.com/status_codes/200');
    expect(response1.status()).toBe(200);
    
    // Navigate to another page
    const response2 = await core.navigateTo('https://the-internet.herokuapp.com/');
    expect(response2.status()).toBe(200);
    
    // Refresh and check response
    const response3 = await core.refreshPage();
    expect(response3.status()).toBe(200);
  });

  test('TC011 - Verify getCurrentUrl returns correct format', async ({ core }) => {
    // Navigate to various pages and verify URL format
    await core.navigateTo('https://the-internet.herokuapp.com/abtest');
    let url = core.getCurrentUrl();
    expect(url).toContain('https://');
    expect(url).toContain('the-internet.herokuapp.com');
    
    await core.navigateTo('https://the-internet.herokuapp.com/add_remove_elements/');
    url = core.getCurrentUrl();
    expect(url).toBe('https://the-internet.herokuapp.com/add_remove_elements/');
  });

  test('TC012 - Verify browser history navigation limits', async ({ core }) => {
    // Navigate to a page (we already have automationexercise.com in history from beforeEach)
    await core.navigateTo('https://the-internet.herokuapp.com/');
    const urlAfterNavigation = core.getCurrentUrl();
    
    // Try to go backward - should go to previous page in history
    await core.goBackward();
    
    // Should go back to the previous page in history (automationexercise.com)
    const urlAfterBackward = core.getCurrentUrl();
    expect(urlAfterBackward).toBe('https://automationexercise.com/');
    
    // Navigate forward again
    await core.goForward();
    const urlAfterForward = core.getCurrentUrl();
    expect(urlAfterForward).toBe(urlAfterNavigation);
  });
});
