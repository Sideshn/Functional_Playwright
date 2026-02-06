// Migrated from SmokeTests.cs
const { test, expect } = require('@playwright/test');
const BaseTest = require('../../src/Base/BaseTest');
const CoreKeywords = require('../../src/Core/CoreKeywords');
// const LoginKeywords = require('../../src/Core/LoginKeywords');
const JsonLocalizationParser = require('../../src/Parsers/JsonLocalizationParser');
const Constants = require('../../src/Utils/Constants');

let baseTest;
let core;
// let login;
let loc;

test.describe('Smoke Tests', () => {
  test.beforeAll(async () => {
    baseTest = new BaseTest();
    await baseTest.globalSetup();
  });

  test.beforeEach(async ({ }, testInfo) => {
    core = new CoreKeywords(baseTest.page);
    login = new LoginKeywords(core);
    loc = new JsonLocalizationParser();
    
    await baseTest.navigateIfNeeded(testInfo);
  });

  test('Check all supported languages are listing in login page', async () => {
    test.setTimeout(60000);
    
    await core.clickAsync(Constants.Sitemaps.LoginSitemap, 'Login', 'languageDropDown');
    
    const langs = ['English', 'Deutsch', 'Français', '简体中文', 'Melayu', 'Espanol', '한국어'];
    
    for (const lang of langs) {
      const isVisible = await baseTest.page.locator(`xpath=//a[text()='${lang}']`).isVisible();
      expect(isVisible, `${lang} language is not present.`).toBe(true);
    }
    
    await baseTest.page.locator(`xpath=//a[text()='English']`).click();
  });

  test('Check the login is working without adding users into HPIPSC group', async () => {
    test.setTimeout(60000);
    
    await login.loginAsync(baseTest.getProperty('invalidUsername'), baseTest.getProperty('invalidPassword'));
    
    const alert = await core.getAlertMessageAsync(Constants.Sitemaps.LoginSitemap, 'HomeScreen', 'AccessDenied');
    const expected = loc.getValue('ResourcesStrings', 'AccessDeniedError');
    
    expect(alert.trim()).toBe(expected);
  });

  test('Verify Login to HPSM with valid user', async () => {
    test.setTimeout(60000);
    
    await login.loginAsync(baseTest.getProperty('username'), baseTest.getProperty('password'));
    
    const logoExists = await core.existsAsync(Constants.Sitemaps.LoginSitemap, 'HomeScreen', 'HPlogo');
    expect(logoExists).toBe(true);
  });

  test('Verify version details post installation', async () => {
    test.setTimeout(60000);
    
    await core.clickAsync(Constants.Sitemaps.LoginSitemap, 'HomeScreen', 'ApplicationSettingsMenu');
    await core.clickAsync(Constants.Sitemaps.LoginSitemap, 'HomeScreen', 'AboutHPSM');
    
    const hpText = await core.getTextAsync(Constants.Sitemaps.ApplicationSettingsSitemap, 'AboutHPSM', 'HpJetAdvText');
    const expectedHpText = loc.getValue('ResourcesStrings', 'StringHPJetAdvantageSecuritymanager');
    
    expect(hpText).toContain(expectedHpText);
    
    const softwareVersion = await core.getTextAsync(Constants.Sitemaps.ApplicationSettingsSitemap, 'AboutHPSM', 'Softwareversion');
    expect(softwareVersion).toBe(`Software Version ${baseTest.getProperty('hpsmApplicationVersion')}`);
    
    const aboutLogoExists = await core.existsAsync(Constants.Sitemaps.ApplicationSettingsSitemap, 'AboutHPSM', 'AboutLogo');
    expect(aboutLogoExists).toBe(true);
    
    await core.clickAsync(Constants.Sitemaps.ApplicationSettingsSitemap, 'AboutHPSM', 'Close');
  });

  test.afterEach(async ({ }, testInfo) => {
    baseTest.testTeardown(testInfo);
  });

  test.afterAll(async () => {
    await baseTest.globalTeardown();
  });
});

