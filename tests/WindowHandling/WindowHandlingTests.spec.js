const { test, expect } = require('../../src/fixtures/baseFixtures');

test.describe('Window Handling Tests', () => {

  test('TC001 - Verify handlePopup method', async ({ core, page }) => {
    // Navigate to a page with popup
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Click link that opens popup and capture new page
    const newPage = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Verify new window opened
    expect(newPage).toBeDefined();
    expect(newPage.url()).toContain('/windows/new');
    
    // Verify content in new window
    const heading = await newPage.locator('h3').textContent();
    expect(heading).toBe('New Window');
    
    // Close the popup
    await newPage.close();
  });

  test('TC002 - Verify getWindowCount method', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Initially should have 1 window
    let count = core.getWindowCount();
    expect(count).toBe(1);
    
    // Open a new window
    await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Should now have 2 windows
    count = core.getWindowCount();
    expect(count).toBe(2);
  });

  test('TC003 - Verify switchToWindow by index', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open new window
    const newPage = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Switch to second window (index 1)
    const switchedPage = await core.switchToWindow(1);
    expect(switchedPage.url()).toContain('/windows/new');
    
    // Switch back to first window (index 0)
    const mainPage = await core.switchToWindow(0);
    expect(mainPage.url()).toContain('/windows');
    expect(mainPage.url()).not.toContain('/windows/new');
    
    // Cleanup
    await newPage.close();
  });

  test('TC004 - Verify switchToWindowByUrl method', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open new window
    const newPage = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Switch to window by URL pattern
    const switchedPage = await core.switchToWindowByUrl('/windows/new');
    expect(switchedPage.url()).toContain('/windows/new');
    
    // Switch back using URL pattern
    const mainPage = await core.switchToWindowByUrl('the-internet.herokuapp.com/windows');
    expect(mainPage.url()).toMatch(/\/windows$/);
    
    // Cleanup
    await newPage.close();
  });

  // test('TC005 - Verify getAllWindows method', async ({ core, page }) => {
  //   // Navigate to test page
  //   await page.goto('https://the-internet.herokuapp.com/windows');
    
  //   // Get all windows initially
  //   let allWindows = await core.getAllWindows();
  //   expect(allWindows.length).toBe(1);
    
  //   // Open 2 new windows
  //   const newPage1 = await core.handlePopup(async () => {
  //     await page.click('a[href="/windows/new"]');
  //   });
    
  //   await page.waitForTimeout(500);
    
  //   const newPage2 = await core.handlePopup(async () => {
  //     await page.click('a[href="/windows/new"]');
  //   });
    
  //   // Get all windows now
  //   allWindows = await core.getAllWindows();
  //   expect(allWindows.length).toBe(3);
    
  //   // Cleanup
  //   await newPage1.close();
  //   await newPage2.close();
  // });

  test('TC005 - Verify closeWindow method', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open new window
    await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Verify 2 windows open
    expect(core.getWindowCount()).toBe(2);
    
    // Close window at index 1
    await core.closeWindow(1);
    
    // Verify only 1 window remains
    await page.waitForTimeout(300);
    expect(core.getWindowCount()).toBe(1);
  });

  test('TC006 - Verify closeOtherWindows method', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open 2 new windows
    await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    await page.waitForTimeout(500);
    
    await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Verify 3 windows open
    expect(core.getWindowCount()).toBe(3);
    
    // Close all except main window
    await core.closeOtherWindows();
    
    // Verify only main window remains
    await page.waitForTimeout(300);
    expect(core.getWindowCount()).toBe(1);
  });

  test('TC007 - Verify switchToMainWindow method', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open new window
    const newPage = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Switch to new window
    await core.switchToWindow(1);
    
    // Switch back to main window
    const mainPage = await core.switchToMainWindow();
    expect(mainPage.url()).toContain('/windows');
    expect(mainPage.url()).not.toContain('/windows/new');
    
    // Cleanup
    await newPage.close();
  });

  test('TC008 - Verify openNewTab method', async ({ core, page }) => {
    // Navigate to initial page
    await page.goto('https://the-internet.herokuapp.com/');
    
    // Initially should have 1 window
    expect(core.getWindowCount()).toBe(1);
    
    // Open new tab with specific URL
    const newTabPage = await core.openNewTab('https://the-internet.herokuapp.com/windows');
    
    // Verify new tab opened
    expect(core.getWindowCount()).toBe(2);
    expect(newTabPage.url()).toContain('/windows');
    
    // Verify original page still accessible
    const mainPage = await core.switchToWindow(0);
    expect(mainPage.url()).toBe('https://the-internet.herokuapp.com/');
    
    // Cleanup
    await newTabPage.close();
  });

  test('TC009 - Verify multiple window operations', async ({ core, page }) => {
    // Navigate to test page
    await page.goto('https://the-internet.herokuapp.com/windows');
    
    // Open 2 windows
    const popup1 = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    await page.waitForTimeout(500);
    
    const popup2 = await core.handlePopup(async () => {
      await page.click('a[href="/windows/new"]');
    });
    
    // Verify 3 windows total
    expect(core.getWindowCount()).toBe(3);
    
    // Switch between windows
    await core.switchToWindow(0); // Main window
    expect((await core.switchToWindow(0)).url()).toMatch(/\/windows$/);
    
    await core.switchToWindow(1); // First popup
    expect((await core.switchToWindow(1)).url()).toContain('/windows/new');
    
    await core.switchToWindow(2); // Second popup
    expect((await core.switchToWindow(2)).url()).toContain('/windows/new');
    
    // Close all popups
    await core.closeOtherWindows();
    
    // Verify only main window remains
    await page.waitForTimeout(300);
    expect(core.getWindowCount()).toBe(1);
  });
});
