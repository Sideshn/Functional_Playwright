/**
 * Data Fixtures
 * 
 * Purpose: Provide reusable test data fixtures
 * Pattern: Data-driven testing with fixtures
 * 
 * Benefits:
 * - Centralized test data management
 * - Easy data parameterization
 * - Cleaner test code
 * 
 * @author Automation Team
 * @version 2.0
 * @updated December 3, 2025
 */

const { test: base, expect } = require('./pageFixtures');
const ExcelReader = require('../Utils/ExcelReader');
const path = require('path');

const test = base.extend({
  /**
   * Excel reader instance - reusable across test methods
   */
  excelReader: async ({}, use) => {
    const excelFilePath = path.join(process.cwd(), 'TestData', 'TestData.xlsx');
    const reader = new ExcelReader(excelFilePath);
    await use(reader);
  },

  /**
   * Excel data fixture - provides a function to get row data by column value
   * Usage: test('my test', async ({ excelData }) => { const data = excelData(sheetName, columnName, value); })
   */
  excelData: async ({ excelReader }, use) => {
    await use((sheetName, columnName, value) => {
      if (!sheetName || !columnName || !value) return null;
      
      const data = excelReader.getRowByColumnValue(sheetName, columnName, value);
      if (!data) return null;
      
      // Transform data into standardized format
      return {
        title: data.Title,
        username: data.Username || data.Name,
        emailAddress: data.Email,
        password: data.Password,
        dateOfBirth: {
          day: String(data.DOB_Day || data.Day),
          month: String(data.DOB_Month || data.Month),
          year: String(data.DOB_Year || data.Year)
        },
        address: {
          firstName: data.FirstName,
          lastName: data.LastName,
          company: data.Company,
          address1: data.Address1,
          address2: data.Address2,
          country: data.Country,
          state: data.State,
          city: data.City,
          zipcode: String(data.Zipcode),
          mobile: String(data.Mobile)
        },
        subscriptions: {
          newsletter: data.Newsletter === 'Yes' || data.Newsletter === true,
          offers: data.Offers === 'Yes' || data.Offers === true
        }
      };
    });
  },

  /**
   * Random user data fixture - generates random test user based on config template
   */
  randomUser: async ({ config }, use) => {
    const timestamp = Date.now();
    const template = config.users.administrator;
    const randomUser = {
      title: template.title,
      username: `TestUser_${timestamp}`,
      emailAddress: `testuser_${timestamp}@automation.com`,
      password: template.password,
      dateOfBirth: template.dateOfBirth,
      address: {
        ...template.address,
        firstName: 'Test',
        lastName: 'User'
      },
      subscriptions: template.subscriptions
    };
    await use(randomUser);
  }
});

module.exports = { test, expect };
