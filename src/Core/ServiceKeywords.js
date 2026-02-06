const { execSync, exec } = require('child_process');
const { logger } = require('../Utils/logger');

/**
 * ServiceKeywords - Generic class for managing Windows Services
 * Provides methods to start, stop, restart, and query service status
 */
class ServiceKeywords {
  /**
   * Get the status of a Windows service
   * @param {string} serviceName - Name of the service
   * @returns {Object} - Service status information
   */
  static getServiceStatus(serviceName) {
    try {
      logger.info(`🔍 Checking status of service: ${serviceName}`);
      const command = `Get-Service -Name "${serviceName}" | Select-Object Name, Status, DisplayName | ConvertTo-Json`;
      const output = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      const serviceInfo = JSON.parse(output);
      
      logger.success(`✅ Service "${serviceName}" status: ${serviceInfo.Status}`);
      logger.info(`   Display Name: ${serviceInfo.DisplayName}`);
      
      return {
        name: serviceInfo.Name,
        status: serviceInfo.Status,
        displayName: serviceInfo.DisplayName
      };
    } catch (error) {
      logger.error(`❌ Failed to get service status for "${serviceName}": ${error.message}`);
      throw new Error(`Service "${serviceName}" not found or access denied`);
    }
  }

  /**
   * Check if a service exists
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - True if service exists, false otherwise
   */
  static serviceExists(serviceName) {
    try {
      logger.info(`🔍 Checking if service exists: ${serviceName}`);
      const command = `Get-Service -Name "${serviceName}" -ErrorAction SilentlyContinue`;
      const output = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      const exists = output.trim().length > 0;
      
      if (exists) {
        logger.success(`✅ Service "${serviceName}" exists`);
      } else {
        logger.warning(`⚠️  Service "${serviceName}" does not exist`);
      }
      
      return exists;
    } catch (error) {
      logger.warning(`⚠️  Service "${serviceName}" does not exist`);
      return false;
    }
  }

  /**
   * Start a Windows service
   * @param {string} serviceName - Name of the service
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   * @returns {boolean} - True if service started successfully
   */
  static startService(serviceName, timeout = 30000) {
    try {
      logger.info(`▶️  Starting service: ${serviceName}`);
      
      // Check if service exists
      if (!this.serviceExists(serviceName)) {
        throw new Error(`Service "${serviceName}" not found`);
      }

      // Check current status
      const currentStatus = this.getServiceStatus(serviceName);
      if (currentStatus.status === 'Running') {
        logger.info(`ℹ️  Service "${serviceName}" is already running`);
        return true;
      }

      // Start the service
      const command = `Start-Service -Name "${serviceName}"`;
      execSync(`powershell -Command "${command}"`, { encoding: 'utf8', timeout });
      
      // Wait a moment for service to start
      this._waitForServiceStatus(serviceName, 'Running', timeout);
      
      logger.success(`✅ Service "${serviceName}" started successfully`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to start service "${serviceName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop a Windows service
   * @param {string} serviceName - Name of the service
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   * @returns {boolean} - True if service stopped successfully
   */
  static stopService(serviceName, timeout = 30000) {
    try {
      logger.info(`⏸️  Stopping service: ${serviceName}`);
      
      // Check if service exists
      if (!this.serviceExists(serviceName)) {
        throw new Error(`Service "${serviceName}" not found`);
      }

      // Check current status
      const currentStatus = this.getServiceStatus(serviceName);
      if (currentStatus.status === 'Stopped') {
        logger.info(`ℹ️  Service "${serviceName}" is already stopped`);
        return true;
      }

      // Stop the service
      const command = `Stop-Service -Name "${serviceName}" -Force`;
      execSync(`powershell -Command "${command}"`, { encoding: 'utf8', timeout });
      
      // Wait for service to stop
      this._waitForServiceStatus(serviceName, 'Stopped', timeout);
      
      logger.success(`✅ Service "${serviceName}" stopped successfully`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to stop service "${serviceName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Restart a Windows service
   * @param {string} serviceName - Name of the service
   * @param {number} timeout - Timeout in milliseconds (default: 60000)
   * @returns {boolean} - True if service restarted successfully
   */
  static restartService(serviceName, timeout = 60000) {
    try {
      logger.info(`🔄 Restarting service: ${serviceName}`);
      
      // Check if service exists
      if (!this.serviceExists(serviceName)) {
        throw new Error(`Service "${serviceName}" not found`);
      }

      // Restart the service
      const command = `Restart-Service -Name "${serviceName}" -Force`;
      execSync(`powershell -Command "${command}"`, { encoding: 'utf8', timeout });
      
      // Wait for service to be running
      this._waitForServiceStatus(serviceName, 'Running', timeout);
      
      logger.success(`✅ Service "${serviceName}" restarted successfully`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to restart service "${serviceName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all services matching a pattern
   * @param {string} pattern - Service name pattern (supports wildcards)
   * @returns {Array} - Array of service objects
   */
  static listServices(pattern = '*') {
    try {
      logger.info(`📋 Listing services matching pattern: ${pattern}`);
      const command = `Get-Service -Name "${pattern}" | Select-Object Name, Status, DisplayName | ConvertTo-Json`;
      const output = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      
      let services = JSON.parse(output);
      // Ensure it's always an array
      if (!Array.isArray(services)) {
        services = [services];
      }
      
      logger.success(`✅ Found ${services.length} service(s) matching "${pattern}"`);
      services.forEach(svc => {
        logger.info(`   - ${svc.Name} (${svc.Status}): ${svc.DisplayName}`);
      });
      
      return services;
    } catch (error) {
      logger.error(`❌ Failed to list services: ${error.message}`);
      return [];
    }
  }

  /**
   * Set service startup type
   * @param {string} serviceName - Name of the service
   * @param {string} startupType - Startup type: 'Automatic', 'Manual', 'Disabled'
   * @returns {boolean} - True if startup type set successfully
   */
  static setServiceStartupType(serviceName, startupType) {
    try {
      logger.info(`⚙️  Setting startup type for "${serviceName}" to: ${startupType}`);
      
      // Validate startup type
      const validTypes = ['Automatic', 'Manual', 'Disabled'];
      if (!validTypes.includes(startupType)) {
        throw new Error(`Invalid startup type. Must be one of: ${validTypes.join(', ')}`);
      }

      // Check if service exists
      if (!this.serviceExists(serviceName)) {
        throw new Error(`Service "${serviceName}" not found`);
      }

      // Set startup type
      const command = `Set-Service -Name "${serviceName}" -StartupType ${startupType}`;
      execSync(`powershell -Command "${command}"`, { encoding: 'utf8' });
      
      logger.success(`✅ Startup type for "${serviceName}" set to: ${startupType}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to set startup type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for service to reach a specific status
   * @param {string} serviceName - Name of the service
   * @param {string} expectedStatus - Expected status ('Running', 'Stopped', etc.)
   * @param {number} timeout - Timeout in milliseconds
   * @private
   */
  static _waitForServiceStatus(serviceName, expectedStatus, timeout = 30000) {
    const startTime = Date.now();
    const pollInterval = 500; // Check every 500ms
    
    while (Date.now() - startTime < timeout) {
      try {
        const status = this.getServiceStatus(serviceName);
        if (status.status === expectedStatus) {
          return true;
        }
        // Wait before next check
        execSync(`powershell -Command "Start-Sleep -Milliseconds ${pollInterval}"`);
      } catch (error) {
        // Continue polling
      }
    }
    
    throw new Error(`Timeout waiting for service "${serviceName}" to reach status: ${expectedStatus}`);
  }

  /**
   * Get service startup type
   * @param {string} serviceName - Name of the service
   * @returns {string} - Startup type
   */
  static getServiceStartupType(serviceName) {
    try {
      logger.info(`🔍 Getting startup type for service: ${serviceName}`);
      const command = `Get-Service -Name "${serviceName}" | Select-Object -ExpandProperty StartType`;
      const startupType = execSync(`powershell -Command "${command}"`, { encoding: 'utf8' }).trim();
      
      logger.success(`✅ Service "${serviceName}" startup type: ${startupType}`);
      return startupType;
    } catch (error) {
      logger.error(`❌ Failed to get startup type for "${serviceName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if service is running
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - True if service is running
   */
  static isServiceRunning(serviceName) {
    try {
      const status = this.getServiceStatus(serviceName);
      return status.status === 'Running';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if service is stopped
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - True if service is stopped
   */
  static isServiceStopped(serviceName) {
    try {
      const status = this.getServiceStatus(serviceName);
      return status.status === 'Stopped';
    } catch (error) {
      return false;
    }
  }
}

module.exports = ServiceKeywords;
