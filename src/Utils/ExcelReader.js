/**
 * ExcelReader - Utility to read test data from Excel files
 * 
 * Purpose: Provides methods to read and parse Excel test data
 * Supports: .xlsx, .xls formats
 * Features: Read by sheet, row, column, search capabilities
 * 
 * @author Automation Team
 * @version 1.0
 * @created November 11, 2025
 */

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

function getExcelCache() {
  if (!global.__EXCEL_CACHE__) {
    global.__EXCEL_CACHE__ = {};
  }
  return global.__EXCEL_CACHE__;
}

class ExcelReader {
  constructor(filePath) {
    this.filePath = filePath;
    this.workbook = null;
    this.loadWorkbook();
  }

  // Load Excel workbook with caching
  loadWorkbook() {
    try {
      const fullPath = path.resolve(this.filePath);
      const cache = getExcelCache();
      if (!fs.existsSync(fullPath)) {
        if (logger) logger.error(`❌ Excel file not found: ${fullPath}`);
        throw new Error(`Excel file not found: ${fullPath}`);
      }
      if (!cache[fullPath]) {
        const workbook = xlsx.readFile(fullPath);
        cache[fullPath] = workbook;
      }
      this.workbook = cache[fullPath];
      if (logger) {
        logger.success(`✅ Excel file loaded: ${path.basename(fullPath)}`);
        logger.info(`📊 Available sheets: ${this.workbook.SheetNames.join(', ')}`);
      }
    } catch (error) {
      if (logger) logger.error(`❌ Failed to load Excel file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sheet data as JSON
   * @param {string} sheetName - Name of the sheet
   * @returns {Array<Object>} Array of row objects
   */
  getSheetDataAsJson(sheetName) {
    const sheet = this.workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { defval: '' });
  }

  /**
   * Get a cell value by row index and column name (zero-based row index)
   * @param {string} sheetName
   * @param {number} rowIndex
   * @param {string} columnName
   * @returns {any|null}
   */
  getCellValue(sheetName, rowIndex, columnName) {
    const data = this.getSheetDataAsJson(sheetName);
    if (data[rowIndex] && columnName in data[rowIndex]) {
      return data[rowIndex][columnName];
    }
    return null;
  }

  /**
   * Get a row object by matching a column value
   * @param {string} sheetName
   * @param {string} columnName
   * @param {any} value
   * @returns {object|null}
   */
  getRowByColumnValue(sheetName, columnName, value) {
    const data = this.getSheetDataAsJson(sheetName);
    return data.find(row => row[columnName] === value) || null;
  }

  // Helper to get row index for a given value in a column
  getRowIndex(sheetName, columnName, value) {
    const data = this.getSheetDataAsJson(sheetName);
    return data.findIndex(row => row[columnName] === value);
  }
}

module.exports = ExcelReader;
