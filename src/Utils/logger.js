/**
 * Logger Utility for Playwright Framework
 * Provides structured logging with multiple levels and color coding
 * 
 * @module Utils/logger
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true';
    this.logFilePath = path.join(__dirname, '..', '..', 'logs', `test-${new Date().toISOString().split('T')[0]}.log`);
    
    // Create logs directory if file logging is enabled
    if (this.enableFileLogging) {
      const logsDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    }
    
    this.levels = {
      debug: 0,
      info: 1,
      success: 2,
      warning: 3,
      error: 4
    };
  }

  /**
   * Get current timestamp
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').split('.')[0];
  }

  /**
   * Check if log level should be printed
   * @param {string} level - Log level
   * @returns {boolean}
   */
  shouldLog(level) {
    const currentLevel = this.levels[this.logLevel] || 1;
    const messageLevel = this.levels[level] || 1;
    return messageLevel >= currentLevel;
  }

  /**
   * Write log to file if enabled
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  writeToFile(level, message) {
    if (!this.enableFileLogging) return;
    
    try {
      const timestamp = this.getTimestamp();
      const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
      fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
    } catch (error) {
      console.error(`Failed to write log to file: ${error.message}`);
    }
  }

  /**
   * Format and print log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {string} color - ANSI color code
   */
  log(level, message, color) {
    if (!this.shouldLog(level)) return;
    
    const timestamp = this.getTimestamp();
    const coloredMessage = `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.reset}`;
    
    console.log(coloredMessage);
    this.writeToFile(level, message);

    // Push log entry into Extent report (if active) without breaking on errors
    try {
      const ExtentReportHelper = require('./ExtentReportHelper');
      const levelMap = {
        debug: 'DEBUG',
        info: 'INFO',
        success: 'PASS',
        warning: 'WARNING',
        error: 'FAIL'
      };
      const extentLevel = levelMap[level] || 'INFO';
      if (ExtentReportHelper?.addLog) {
        ExtentReportHelper.addLog(extentLevel, `[${timestamp}] ${message}`);
      }
    } catch (e) {
      // Ignore logging to extent errors to avoid interfering with test flow
    }
  }

  /**
   * Debug level logging (lowest priority)
   * @param {string} message - Debug message
   */
  debug(message) {
    this.log('debug', message, colors.dim + colors.white);
  }

  /**
   * Info level logging (informational messages)
   * @param {string} message - Info message
   */
  info(message) {
    this.log('info', message, colors.cyan);
  }

  /**
   * Success level logging (successful operations)
   * @param {string} message - Success message
   */
  success(message) {
    this.log('success', message, colors.green);
  }

  /**
   * Warning level logging (warnings)
   * @param {string} message - Warning message
   */
  warning(message) {
    this.log('warning', message, colors.yellow);
  }

  /**
   * Error level logging (errors and failures)
   * @param {string} message - Error message
   */
  error(message) {
    this.log('error', message, colors.bright + colors.red);
  }

  /**
   * Log without timestamp or level (raw output)
   * @param {string} message - Raw message
   */
  raw(message) {
    console.log(message);
    if (this.enableFileLogging) {
      this.writeToFile('raw', message);
    }
  }

  /**
   * Log a separator line
   * @param {string} char - Character to repeat (default: '─')
   * @param {number} length - Length of separator (default: 80)
   */
  separator(char = '─', length = 80) {
    this.raw(char.repeat(length));
  }

  /**
   * Log a header with borders
   * @param {string} message - Header message
   */
  header(message) {
    this.separator('=');
    this.info(message);
    this.separator('=');
  }

  /**
   * Create a grouped log section
   * @param {string} title - Section title
   * @param {Function} callback - Callback function to execute within the group
   */
  group(title, callback) {
    this.separator('─');
    this.info(title);
    this.separator('─');
    if (callback) callback();
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = { logger, Logger };
