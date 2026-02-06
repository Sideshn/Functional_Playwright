/**
 * Create Sample Excel Test Data File
 * Run this script once to generate TestData.xlsx
 */

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Sample test data with multiple test cases
const testData = [
  {
    TestCase: 'TC001',
    Title: 'Mr',
    Username: 'Leo Das',
    Name: 'Leo Das',
    Email: 'leodas@automation.com',
    Password: 'Test@123456',
    DOB_Day: 15,
    DOB_Month: 6,
    DOB_Year: 1990,
    FirstName: 'Leo',
    LastName: 'Das',
    Company: 'Automation Corp',
    Address1: '123 Test Street',
    Address2: 'Suite 100',
    Country: 'India',
    State: 'Karnataka',
    City: 'Bangalore',
    Zipcode: 560001,
    Mobile: 9876543210,
    Newsletter: 'Yes',
    Offers: 'Yes'
  },
  {
    TestCase: 'TC002',
    Title: 'Mrs',
    Username: 'Jane Smith',
    Name: 'Jane Smith',
    Email: 'jane.smith@automation.com',
    Password: 'Jane@123456',
    DOB_Day: 20,
    DOB_Month: 3,
    DOB_Year: 1995,
    FirstName: 'Jane',
    LastName: 'Smith',
    Company: 'Test Industries',
    Address1: '456 Demo Avenue',
    Address2: 'Apt 200',
    Country: 'India',
    State: 'Maharashtra',
    City: 'Mumbai',
    Zipcode: 400001,
    Mobile: 9123456789,
    Newsletter: 'No',
    Offers: 'Yes'
  },
  {
    TestCase: 'TC003',
    Title: 'Mr',
    Username: 'John Doe',
    Name: 'John Doe',
    Email: 'john.doe@automation.com',
    Password: 'John@123456',
    DOB_Day: 10,
    DOB_Month: 12,
    DOB_Year: 1988,
    FirstName: 'John',
    LastName: 'Doe',
    Company: 'QA Solutions',
    Address1: '789 Quality Road',
    Address2: 'Building C',
    Country: 'India',
    State: 'Tamil Nadu',
    City: 'Chennai',
    Zipcode: 600001,
    Mobile: 9988776655,
    Newsletter: 'Yes',
    Offers: 'No'
  }
];

// Create TestData directory if it doesn't exist
const testDataDir = path.join(__dirname, '..', 'TestData');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
  console.log(`✅ Created directory: ${testDataDir}`);
}

// Create workbook and worksheet
const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(testData);

// Set column widths for better readability
const wscols = [
  { wch: 10 },  // TestCase
  { wch: 8 },   // Title
  { wch: 15 },  // Username
  { wch: 15 },  // Name
  { wch: 25 },  // Email
  { wch: 15 },  // Password
  { wch: 10 },  // DOB_Day
  { wch: 12 },  // DOB_Month
  { wch: 10 },  // DOB_Year
  { wch: 12 },  // FirstName
  { wch: 12 },  // LastName
  { wch: 20 },  // Company
  { wch: 20 },  // Address1
  { wch: 15 },  // Address2
  { wch: 15 },  // Country
  { wch: 15 },  // State
  { wch: 15 },  // City
  { wch: 10 },  // Zipcode
  { wch: 12 },  // Mobile
  { wch: 12 },  // Newsletter
  { wch: 10 }   // Offers
];
worksheet['!cols'] = wscols;

// Add worksheet to workbook
xlsx.utils.book_append_sheet(workbook, worksheet, 'UserData');

// Write to file
const filePath = path.join(testDataDir, 'TestData.xlsx');
xlsx.writeFile(workbook, filePath);

console.log('===========================================');
console.log('✅ Sample Excel file created successfully!');
console.log('===========================================');
console.log(`📁 Location: ${filePath}`);
console.log(`📊 Sheet: UserData`);
console.log(`📝 Test Cases: ${testData.length} rows`);
console.log('');
console.log('Test Cases:');
testData.forEach((tc, index) => {
  console.log(`  ${index + 1}. ${tc.TestCase} - ${tc.Username} (${tc.Email})`);
});
console.log('');
console.log('Usage in test file:');
console.log('  const testData = baseTest.loadTestDataFromExcel(');
console.log('    \'TestData/TestData.xlsx\',');
console.log('    \'UserData\',');
console.log('    \'TC001\'  // or TC002, TC003');
console.log('  );');
console.log('===========================================');
