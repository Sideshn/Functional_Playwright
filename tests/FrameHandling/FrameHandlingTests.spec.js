const { test, expect } = require('../../src/fixtures/baseFixtures');

test.describe('Frame Handling Tests', () => {

  test('TC001 - Verify switchToFrame by CSS selector', async ({ core, page }) => {
    // Navigate to a page with frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Switch to top frame
    const topFrame = await core.switchToFrame('frame[name="frame-top"]');
    expect(topFrame).toBeDefined();
    
    // Verify we can access frame content
    const frameContent = await topFrame.locator('frameset').count();
    expect(frameContent).toBeGreaterThan(0);
  });

  test('TC002 - Verify switchToFrameByName method', async ({ core, page }) => {
    // Navigate to page with named frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Switch to frame by name
    const bottomFrame = await core.switchToFrameByName('frame-bottom');
    expect(bottomFrame).toBeDefined();
    
    // Verify frame content
    const bodyText = await bottomFrame.locator('body').textContent();
    expect(bodyText).toContain('BOTTOM');
  });

  test('TC003 - Verify switchToFrameByUrl method', async ({ core, page }) => {
    // Navigate to page with frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Switch to frame by URL pattern
    const frame = await core.switchToFrameByUrl('frame_bottom');
    expect(frame).toBeDefined();
    
    // Verify we're in correct frame
    const content = await frame.locator('body').textContent();
    expect(content).toContain('BOTTOM');
  });

  test('TC004 - Verify getAllFrames method', async ({ core, page }) => {
    // Navigate to page with multiple frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Get all frames
    const allFrames = await core.getAllFrames();
    
    // Verify frame information
    expect(allFrames).toBeDefined();
    expect(allFrames.length).toBeGreaterThan(0);
    
    // Check frame details contain required properties
    allFrames.forEach((frameInfo, index) => {
      expect(frameInfo).toHaveProperty('index');
      expect(frameInfo).toHaveProperty('name');
      expect(frameInfo).toHaveProperty('url');
      expect(frameInfo.index).toBe(index);
    });
  });

  test('TC005 - Verify getFrameCount method', async ({ core, page }) => {
    // Navigate to page with frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Get frame count
    const frameCount = await core.getFrameCount();
    
    // Verify count is correct (nested_frames page has multiple frames)
    expect(frameCount).toBeGreaterThan(0);
    expect(typeof frameCount).toBe('number');
  });

  test('TC006 - Verify isFramePresent method', async ({ core, page }) => {
    // Navigate to page with frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Check if specific frames are present
    const bottomFramePresent = await core.isFramePresent('frame-bottom');
    expect(bottomFramePresent).toBe(true);
    
    const topFramePresent = await core.isFramePresent('frame-top');
    expect(topFramePresent).toBe(true);
    
    // Check for non-existent frame
    const fakeFramePresent = await core.isFramePresent('non-existent-frame');
    expect(fakeFramePresent).toBe(false);
  });

  test('TC007 - Verify working with nested frames', async ({ core, page }) => {
    // Navigate to nested frames page
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // First switch to top frame
    const topFrame = await core.switchToFrameByName('frame-top');
    expect(topFrame).toBeDefined();
    
    // Then access nested frame (left frame inside top frame)
    const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
    const leftContent = await leftFrame.locator('body').textContent();
    expect(leftContent).toContain('LEFT');
    
    // Access middle frame
    const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
    const middleContent = await middleFrame.locator('body').textContent();
    expect(middleContent).toContain('MIDDLE');
    
    // Access right frame
    const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');
    const rightContent = await rightFrame.locator('body').textContent();
    expect(rightContent).toContain('RIGHT');
  });

  test('TC008 - Verify frame information details', async ({ core, page }) => {
    // Navigate to page with frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Get all frames with details
    const frames = await core.getAllFrames();
    
    // Verify each frame has complete information
    expect(frames.length).toBeGreaterThan(0);
    
    frames.forEach(frame => {
      expect(frame.index).toBeGreaterThanOrEqual(0);
      expect(frame.name).toBeDefined();
      expect(frame.url).toBeDefined();
      expect(typeof frame.url).toBe('string');
    });
  });

  test('TC009 - Verify iframe handling', async ({ core, page }) => {
    // Navigate to iframe page
    await page.goto('https://the-internet.herokuapp.com/iframe');
    
    // Switch to iframe by CSS selector
    const iframe = await core.switchToFrame('#mce_0_ifr');
    expect(iframe).toBeDefined();
    
    // Verify we can interact with iframe content
    const iframeBody = iframe.locator('body#tinymce');
    const bodyExists = await iframeBody.count();
    expect(bodyExists).toBe(1);
  });

  test('TC010 - Verify multiple frame operations', async ({ core, page }) => {
    // Navigate to nested frames page
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Get initial frame count
    const initialCount = await core.getFrameCount();
    expect(initialCount).toBeGreaterThan(0);
    
    // Get all frames
    const allFrames = await core.getAllFrames();
    expect(allFrames.length).toBe(initialCount);
    
    // Switch to bottom frame
    const bottomFrame = await core.switchToFrameByName('frame-bottom');
    const bottomText = await bottomFrame.locator('body').textContent();
    expect(bottomText).toContain('BOTTOM');
    
    // Switch to top frame
    const topFrame = await core.switchToFrameByName('frame-top');
    expect(topFrame).toBeDefined();
    
    // Verify frame presence
    expect(await core.isFramePresent('frame-bottom')).toBe(true);
    expect(await core.isFramePresent('frame-top')).toBe(true);
  });

  test('TC011 - Verify frame switching by different selectors', async ({ core, page }) => {
    // Navigate to iframe page
    await page.goto('https://the-internet.herokuapp.com/iframe');
    
    // Get frame count
    const count = await core.getFrameCount();
    expect(count).toBeGreaterThan(0);
    
    // Switch using CSS selector (ID)
    const frameById = await core.switchToFrame('#mce_0_ifr');
    expect(frameById).toBeDefined();
    
    // Switch using CSS selector (tag with ID)
    const frameByTag = await core.switchToFrame('iframe#mce_0_ifr');
    expect(frameByTag).toBeDefined();
  });

  test('TC012 - Verify frame URL matching', async ({ core, page }) => {
    // Navigate to nested frames
    await page.goto('https://the-internet.herokuapp.com/nested_frames');
    
    // Get all frames to see their URLs
    const frames = await core.getAllFrames();
    
    // Find frames by URL pattern
    const bottomFrame = frames.find(f => f.url.includes('frame_bottom'));
    expect(bottomFrame).toBeDefined();
    expect(bottomFrame.name).toBe('frame-bottom');
    
    const topFrame = frames.find(f => f.url.includes('frame_top'));
    expect(topFrame).toBeDefined();
    expect(topFrame.name).toBe('frame-top');
  });
});
