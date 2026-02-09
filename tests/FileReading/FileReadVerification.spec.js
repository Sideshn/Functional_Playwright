const { test, expect } = require('../../src/fixtures/baseFixtures');
const path = require('path');

test.describe('FileKeywords File Reading', () => {
  let csvPath;
  let xmlPath;
  let pdfPath;
  let txtPath;

  test.beforeAll(() => {
    csvPath = path.resolve(__dirname, '../../TestData/sample.csv');
    xmlPath = path.resolve(__dirname, '../../TestData/sample.xml');
    pdfPath = path.resolve(__dirname, '../../TestData/sample.pdf');
    txtPath = path.resolve(__dirname, '../../TestData/sample.txt');
  });

  test('should read TXT file', ({ file }) => {
    const txt = file.readTxtFile(txtPath);
    expect(txt).toContain('sample text file');
  });

  test('should read CSV file', ({ file }) => {
    const csv = file.readCsvFile(csvPath);
    expect(Array.isArray(csv)).toBe(true);
    expect(csv.length).toBeGreaterThan(0);
    expect(csv[0]).toHaveProperty('name');
  });

  test('should read XML file', async ({ file }) => {
    const xml = await file.readXmlFile(xmlPath);
    expect(xml).toHaveProperty('users');
    expect(xml.users).toHaveProperty('user');
  });

  test('should read PDF file', async ({ file }) => {
    const pdfText = await file.readPdfFile(pdfPath);
    expect(pdfText).toContain('sample PDF file');
  });
});
