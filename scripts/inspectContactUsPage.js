const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://automationexercise.com/contact_us');
  await page.waitForLoadState('networkidle');
  
  // Extract all form elements with their attributes
  const elements = await page.evaluate(() => {
    const results = {};
    
    // Get all headings
    document.querySelectorAll('h2, h3').forEach((el, index) => {
      const text = el.textContent.trim();
      if (text) {
        results[`Heading_${index}`] = {
          tag: el.tagName,
          text: text,
          class: el.className,
          id: el.id
        };
      }
    });
    
    // Get all inputs
    document.querySelectorAll('input').forEach((el, index) => {
      const name = el.name || el.placeholder || el.id || `Input_${index}`;
      results[name] = {
        tag: 'INPUT',
        type: el.type,
        name: el.name,
        id: el.id,
        class: el.className,
        placeholder: el.placeholder,
        'data-qa': el.getAttribute('data-qa')
      };
    });
    
    // Get all textareas
    document.querySelectorAll('textarea').forEach((el, index) => {
      const name = el.name || el.id || `Textarea_${index}`;
      results[name] = {
        tag: 'TEXTAREA',
        name: el.name,
        id: el.id,
        class: el.className,
        placeholder: el.placeholder,
        'data-qa': el.getAttribute('data-qa')
      };
    });
    
    // Get all buttons
    document.querySelectorAll('button, input[type="submit"]').forEach((el, index) => {
      const text = el.textContent.trim() || el.value || `Button_${index}`;
      results[text] = {
        tag: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        class: el.className,
        'data-qa': el.getAttribute('data-qa'),
        text: el.textContent.trim()
      };
    });
    
    // Get labels
    document.querySelectorAll('label').forEach((el, index) => {
      const text = el.textContent.trim();
      if (text) {
        results[`Label_${text.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
          tag: 'LABEL',
          text: text,
          for: el.htmlFor,
          class: el.className
        };
      }
    });
    
    return results;
  });
  
  console.log(JSON.stringify(elements, null, 2));
  
  await browser.close();
})();
