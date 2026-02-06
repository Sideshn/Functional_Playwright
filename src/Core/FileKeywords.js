const { logger } = require('../Utils/logger');
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/sync');
const xml2js = require('xml2js');
const { PDFParse } = require('pdf-parse');

/**
 * File Keywords - File upload and file parsing operations
 * Designed to work with CoreKeywords for element interaction
 */
class FileKeywords {
  constructor(core) {
    this._core = core;
  }
  // ==================== FILE Handling OPERATIONS ====================

  /**
   * Upload file(s) to input element
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {string|string[]} filePath - Path to file(s) to upload
   * @param {Object} options - Upload options
   * @returns {Promise<void>}
   */
  async uploadFile(sitemap, pageKey, elementKey, filePath, options = {}) {
    const filePathDisplay = Array.isArray(filePath) ? filePath.join(', ') : filePath;
    logger.info(`📎 Uploading file to: [${pageKey}.${elementKey}] - File(s): ${filePathDisplay}`);
    const element = await this._core.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.setInputFiles(filePath, defaultOptions);
    logger.success(`✅ Successfully uploaded file(s) to: [${pageKey}.${elementKey}]`);
  }

  /**
   * Check if a file with the given base name (ignoring extension/timestamp) exists in a folder.
   * @param {string} folderPath - Path to the folder
   * @param {string} baseFileName - Base file name to search for (e.g., 'report')
   * @returns {boolean} - True if a matching file exists, false otherwise
   */
  verifyFileExists(folderPath, baseFileName) {
    try {
      const resolvedFolder = path.resolve(folderPath);
      const files = fs.readdirSync(resolvedFolder);

      // Check if any file contains the base name (case-insensitive)
      const found = files.some(f => f.toLowerCase().includes(baseFileName.toLowerCase()));

      if (found) {
        logger.success(`✅ File containing "${baseFileName}" exists in: ${resolvedFolder}`);
      } else {
        logger.error(`❌ File containing "${baseFileName}" does NOT exist in: ${resolvedFolder}`);
      }
      return found;
    } catch (error) {
      logger.error(`❌ Error checking file existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear file input
   * @param {string} sitemap - Sitemap name
   * @param {string} pageKey - Page key in sitemap
   * @param {string} elementKey - Element key in sitemap
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async clearFileInput(sitemap, pageKey, elementKey, options = {}) {
    logger.info(`🧹 Clearing file input: [${pageKey}.${elementKey}]`);
    const element = await this._core.getElement(sitemap, pageKey, elementKey);
    const defaultOptions = { timeout: 30000, ...options };
    await element.setInputFiles([], defaultOptions);
    logger.success(`✅ Successfully cleared file input: [${pageKey}.${elementKey}]`);
  }

  /**
   * Read a .txt file and return its contents as a string
   * @param {string} filePath
   * @returns {string}
   */
  readTxtFile(filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      const data = fs.readFileSync(resolvedPath, 'utf8');
      logger.success(`✅ Successfully read TXT file: ${resolvedPath}`);
      return data;
    } catch (error) {
      logger.error(`❌ Failed to read TXT file: ${error.message}`);
      return '';
    }
  }

  /**
   * Read a .csv file and return its contents as an array of objects
   * @param {string} filePath
   * @returns {Array<Object>}
   */
  readCsvFile(filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      const data = fs.readFileSync(resolvedPath, 'utf8');
      const records = csvParse.parse(data, { columns: true, skip_empty_lines: true });
      logger.success(`✅ Successfully read CSV file: ${resolvedPath}`);
      return records;
    } catch (error) {
      logger.error(`❌ Failed to read CSV file: ${error.message}`);
      return [];
    }
  }

  /**
   * Read a .xml file and return its contents as a JS object
   * @param {string} filePath
   * @returns {Promise<Object>}
   */
  async readXmlFile(filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      const data = fs.readFileSync(resolvedPath, 'utf8');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(data);
      logger.success(`✅ Successfully read XML file: ${resolvedPath}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to read XML file: ${error.message}`);
      return {};
    }
  }

  /**
   * Read a .pdf file and return its text content
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async readPdfFile(filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      const buffer = fs.readFileSync(resolvedPath);
      // Convert Buffer to Uint8Array as required by pdf-parse v2.x
      const uint8Array = new Uint8Array(buffer);
      const pdf = new PDFParse(uint8Array);
      await pdf.load();
      const result = await pdf.getText();
      logger.success(`✅ Successfully read PDF file: ${resolvedPath}`);
      return result.text;
    } catch (error) {
      logger.error(`❌ Failed to read PDF file: ${error.message}`);
      return '';
    }
  }
}

module.exports = FileKeywords;
