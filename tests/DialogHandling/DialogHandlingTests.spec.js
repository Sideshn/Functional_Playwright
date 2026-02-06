const { test, expect } = require('../../src/fixtures/baseFixtures');

test.describe('Dialog Handling Methods Tests', () => {

  test('TC001 - Verify handleDialogAccept method', async ({ core, page }) => {
    // Navigate to page with JavaScript alerts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Click button that triggers alert and handle it with accept
    const dialogMessage = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsAlert()"]');
    });
    
    // Verify dialog message was captured
    expect(dialogMessage).toBe('I am a JS Alert');
    
    // Verify result text shows accepted
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You successfully clicked an alert');
  });

  test('TC002 - Verify handleDialogDismiss method', async ({ core, page }) => {
    // Navigate to page with JavaScript confirms
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Click button that triggers confirm and handle it with dismiss
    const dialogMessage = await core.handleDialogDismiss(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    
    // Verify dialog message was captured
    expect(dialogMessage).toBe('I am a JS Confirm');
    
    // Verify result text shows cancelled
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You clicked: Cancel');
  });

  test('TC003 - Verify handleDialogAccept on confirm dialog', async ({ core, page }) => {
    // Navigate to page with JavaScript confirms
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Click button that triggers confirm and handle it with accept
    const dialogMessage = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    
    // Verify dialog message was captured
    expect(dialogMessage).toBe('I am a JS Confirm');
    
    // Verify result text shows OK was clicked
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You clicked: Ok');
  });

  test('TC004 - Verify handleDialogPrompt method with custom text', async ({ core, page }) => {
    // Navigate to page with JavaScript prompts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    const customText = 'Test Automation';
    
    // Click button that triggers prompt and handle it with custom text
    const dialogInfo = await core.handleDialogPrompt(
      async () => {
        await page.click('button[onclick="jsPrompt()"]');
      },
      customText
    );
    
    // Verify dialog info was captured
    expect(dialogInfo.message).toBe('I am a JS prompt');
    expect(dialogInfo.type).toBe('prompt');
    
    // Verify result text shows the custom input
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain(`You entered: ${customText}`);
  });

  test('TC005 - Verify handleDialogPrompt with empty text', async ({ core, page }) => {
    // Navigate to page with JavaScript prompts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Click button that triggers prompt and handle it with empty text
    const dialogInfo = await core.handleDialogPrompt(
      async () => {
        await page.click('button[onclick="jsPrompt()"]');
      },
      ''
    );
    
    // Verify dialog info
    expect(dialogInfo.message).toBe('I am a JS prompt');
    expect(dialogInfo.type).toBe('prompt');
    
    // Verify result shows empty input was accepted
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toBeDefined();
  });

  test('TC006 - Verify getDialogInfo method', async ({ core, page }) => {
    // Navigate to page with JavaScript alerts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Get dialog info without manual accept/dismiss
    const dialogInfo = await core.getDialogInfo(async () => {
      await page.click('button[onclick="jsAlert()"]');
    });
    
    // Verify dialog info was captured
    expect(dialogInfo.type).toBe('alert');
    expect(dialogInfo.message).toBe('I am a JS Alert');
    expect(dialogInfo.defaultValue).toBe('');
    
    // Verify it was auto-accepted (result should show success)
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You successfully clicked an alert');
  });

  test('TC007 - Verify getDialogInfo on prompt dialog', async ({ core, page }) => {
    // Navigate to page with JavaScript prompts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Get dialog info from prompt
    const dialogInfo = await core.getDialogInfo(async () => {
      await page.click('button[onclick="jsPrompt()"]');
    });
    
    // Verify dialog info
    expect(dialogInfo.type).toBe('prompt');
    expect(dialogInfo.message).toBe('I am a JS prompt');
    expect(dialogInfo.defaultValue).toBe('');
  });

  test('TC008 - Verify setupDialogHandler with accept action', async ({ core, page }) => {
    // Navigate to page with JavaScript alerts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Setup persistent dialog handler for accept
    core.setupDialogHandler('accept');
    
    // Trigger alert - should be auto-accepted
    await page.click('button[onclick="jsAlert()"]');
    
    // Verify result shows accepted
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You successfully clicked an alert');
  });

  test('TC009 - Verify setupDialogHandler with dismiss action', async ({ core, page }) => {
    // Navigate to page with JavaScript confirms
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Setup persistent dialog handler for dismiss
    core.setupDialogHandler('dismiss');
    
    // Trigger confirm - should be auto-dismissed
    await page.click('button[onclick="jsConfirm()"]');
    
    // Verify result shows cancelled
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You clicked: Cancel');
  });

  test('TC010 - Verify setupPromptHandler with default text', async ({ core, page }) => {
    // Navigate to page with JavaScript prompts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    const defaultPromptText = 'Automated Test Response';
    
    // Setup persistent prompt handler
    core.setupPromptHandler(defaultPromptText);
    
    // Trigger prompt - should be auto-handled with default text
    await page.click('button[onclick="jsPrompt()"]');
    
    // Verify result shows the default prompt text
    const resultText = await page.locator('#result').textContent();
    expect(resultText).toContain(`You entered: ${defaultPromptText}`);
  });

  test('TC011 - Verify multiple dialog handling with persistent handler', async ({ core, page }) => {
    // Navigate to page
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Setup persistent accept handler
    core.setupDialogHandler('accept');
    
    // Handle multiple alerts in sequence
    await page.click('button[onclick="jsAlert()"]');
    let resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You successfully clicked an alert');
    
    await page.click('button[onclick="jsConfirm()"]');
    resultText = await page.locator('#result').textContent();
    expect(resultText).toContain('You clicked: Ok');
  });

  test('TC012 - Verify dialog message content validation', async ({ core, page }) => {
    // Navigate to page with JavaScript alerts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Test alert message
    const alertMessage = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsAlert()"]');
    });
    expect(alertMessage).toBe('I am a JS Alert');
    expect(typeof alertMessage).toBe('string');
    expect(alertMessage.length).toBeGreaterThan(0);
    
    // Test confirm message
    const confirmMessage = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    expect(confirmMessage).toBe('I am a JS Confirm');
    
    // Test prompt message
    const promptInfo = await core.handleDialogPrompt(
      async () => {
        await page.click('button[onclick="jsPrompt()"]');
      },
      'Test'
    );
    expect(promptInfo.message).toBe('I am a JS prompt');
  });

  test('TC013 - Verify dialog type detection', async ({ core, page }) => {
    // Navigate to page with JavaScript prompts
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Verify alert type
    const alertInfo = await core.getDialogInfo(async () => {
      await page.click('button[onclick="jsAlert()"]');
    });
    expect(alertInfo.type).toBe('alert');
    
    // Navigate back to clear state
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Verify confirm type
    const confirmInfo = await core.getDialogInfo(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    expect(confirmInfo.type).toBe('confirm');
    
    // Navigate back to clear state
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Verify prompt type
    const promptInfo = await core.getDialogInfo(async () => {
      await page.click('button[onclick="jsPrompt()"]');
    });
    expect(promptInfo.type).toBe('prompt');
  });

  test('TC014 - Verify handleDialogPrompt default value capture', async ({ core, page }) => {
    // Create a custom test page with prompt dialog that has default value
    await page.goto('data:text/html,<button onclick="prompt(\'Enter name:\', \'Default Name\')">Show Prompt</button>');
    
    // Handle prompt and capture default value
    const promptInfo = await core.handleDialogPrompt(
      async () => {
        await page.click('button');
      },
      'New Name'
    );
    
    // Verify default value was captured
    expect(promptInfo.type).toBe('prompt');
    expect(promptInfo.message).toBe('Enter name:');
    expect(promptInfo.defaultValue).toBe('Default Name');
  });

  test('TC015 - Verify dialog handling with different return values', async ({ core, page }) => {
    // Navigate to page
    await core.navigateTo('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Handle alert - returns message string
    const alertMessage = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsAlert()"]');
    });
    expect(typeof alertMessage).toBe('string');
    
    // Handle confirm with accept - returns message
    const confirmAccept = await core.handleDialogAccept(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    expect(typeof confirmAccept).toBe('string');
    
    // Handle confirm with dismiss - returns message
    const confirmDismiss = await core.handleDialogDismiss(async () => {
      await page.click('button[onclick="jsConfirm()"]');
    });
    expect(typeof confirmDismiss).toBe('string');
    
    // Handle prompt - returns object with message, type, defaultValue
    const promptInfo = await core.handleDialogPrompt(
      async () => {
        await page.click('button[onclick="jsPrompt()"]');
      },
      'Response'
    );
    expect(typeof promptInfo).toBe('object');
    expect(promptInfo).toHaveProperty('message');
    expect(promptInfo).toHaveProperty('type');
    expect(promptInfo).toHaveProperty('defaultValue');
  });
});
