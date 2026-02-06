const { test, expect } = require('@playwright/test');
const ServiceKeywords = require('../../src/Core/ServiceKeywords');

/**
 * Service Management Tests
 * 
 * IMPORTANT: These tests require administrator privileges to run
 * Run PowerShell or VS Code as Administrator
 * 
 * Common Windows services for testing:
 * - 'Spooler' (Print Spooler) - Safe to stop/start
 * - 'W32Time' (Windows Time) - Safe to stop/start
 * - 'WSearch' (Windows Search) - Safe to stop/start
 * - 'BITS' (Background Intelligent Transfer Service) - Safe to stop/start
 * 
 * To run these tests, update the SERVICE_NAME constant below with a service
 * that exists on your system and is safe to manipulate.
 */

// CONFIGURE THIS: Change to a service name on your system
const SERVICE_NAME = 'Spooler'; // Print Spooler - commonly available and safe to test

test.describe('Service Management Operations', () => {
  
  test.describe('Service Existence Checks', () => {
    test('should verify if a service exists', () => {
      const exists = ServiceKeywords.serviceExists(SERVICE_NAME);
      expect(exists).toBe(true);
    });

    test('should return false for non-existent service', () => {
      const exists = ServiceKeywords.serviceExists('NonExistentService123456');
      expect(exists).toBe(false);
    });
  });

  test.describe('Service Status Operations', () => {
    test('should get service status', () => {
      const status = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('displayName');
      expect(status.name).toBe(SERVICE_NAME);
      expect(['Running', 'Stopped', 'Paused']).toContain(status.status);
    });

    test('should check if service is running', () => {
      const isRunning = ServiceKeywords.isServiceRunning(SERVICE_NAME);
      expect(typeof isRunning).toBe('boolean');
    });

    test('should check if service is stopped', () => {
      const isStopped = ServiceKeywords.isServiceStopped(SERVICE_NAME);
      expect(typeof isStopped).toBe('boolean');
    });
  });

  test.describe('Service Listing', () => {
    test('should list all services', () => {
      const services = ServiceKeywords.listServices('*');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      
      // Verify service structure
      const firstService = services[0];
      expect(firstService).toHaveProperty('Name');
      expect(firstService).toHaveProperty('Status');
      expect(firstService).toHaveProperty('DisplayName');
    });

    test('should list services matching a pattern', () => {
      // List all services starting with 'W'
      const services = ServiceKeywords.listServices('W*');
      expect(Array.isArray(services)).toBe(true);
      
      if (services.length > 0) {
        services.forEach(svc => {
          expect(svc.Name.startsWith('W') || svc.Name.startsWith('w')).toBe(true);
        });
      }
    });

    test('should find specific service in list', () => {
      const services = ServiceKeywords.listServices(SERVICE_NAME);
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services[0].Name).toBe(SERVICE_NAME);
    });
  });

  test.describe('Service Startup Type', () => {
    test('should get service startup type', () => {
      const startupType = ServiceKeywords.getServiceStartupType(SERVICE_NAME);
      expect(typeof startupType).toBe('string');
      expect(['Automatic', 'Manual', 'Disabled']).toContain(startupType);
    });

    // UNCOMMENT TO TEST CHANGING STARTUP TYPE (requires admin privileges)
    // test('should set service startup type to Manual', () => {
    //   const originalStartupType = ServiceKeywords.getServiceStartupType(SERVICE_NAME);
    //   
    //   ServiceKeywords.setServiceStartupType(SERVICE_NAME, 'Manual');
    //   const newStartupType = ServiceKeywords.getServiceStartupType(SERVICE_NAME);
    //   expect(newStartupType).toBe('Manual');
    //   
    //   // Restore original startup type
    //   ServiceKeywords.setServiceStartupType(SERVICE_NAME, originalStartupType);
    // });
  });

  test.describe('Service Control Operations', () => {
    test.skip('should stop a running service', async () => {
      // Ensure service is running first
      const initialStatus = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      if (initialStatus.status !== 'Running') {
        ServiceKeywords.startService(SERVICE_NAME);
      }

      // Stop the service
      const result = ServiceKeywords.stopService(SERVICE_NAME);
      expect(result).toBe(true);

      // Verify service is stopped
      const status = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      expect(status.status).toBe('Stopped');
    });

    test.skip('should start a stopped service', async () => {
      // Ensure service is stopped first
      const initialStatus = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      if (initialStatus.status === 'Running') {
        ServiceKeywords.stopService(SERVICE_NAME);
      }

      // Start the service
      const result = ServiceKeywords.startService(SERVICE_NAME);
      expect(result).toBe(true);

      // Verify service is running
      const status = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      expect(status.status).toBe('Running');
    });

    test.skip('should restart a service', async () => {
      // Ensure service is running first
      const initialStatus = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      if (initialStatus.status !== 'Running') {
        ServiceKeywords.startService(SERVICE_NAME);
      }

      // Restart the service
      const result = ServiceKeywords.restartService(SERVICE_NAME);
      expect(result).toBe(true);

      // Verify service is running after restart
      const status = ServiceKeywords.getServiceStatus(SERVICE_NAME);
      expect(status.status).toBe('Running');
    });

    test.skip('should handle already running service gracefully when starting', () => {
      // Ensure service is running
      ServiceKeywords.startService(SERVICE_NAME);

      // Try to start again - should return true without error
      const result = ServiceKeywords.startService(SERVICE_NAME);
      expect(result).toBe(true);
    });

    test.skip('should handle already stopped service gracefully when stopping', () => {
      // Ensure service is stopped
      ServiceKeywords.stopService(SERVICE_NAME);

      // Try to stop again - should return true without error
      const result = ServiceKeywords.stopService(SERVICE_NAME);
      expect(result).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should throw error for non-existent service when getting status', () => {
      expect(() => {
        ServiceKeywords.getServiceStatus('NonExistentService123456');
      }).toThrow();
    });

    test.skip('should throw error when trying to start non-existent service', () => {
      expect(() => {
        ServiceKeywords.startService('NonExistentService123456');
      }).toThrow();
    });

    test.skip('should throw error when trying to stop non-existent service', () => {
      expect(() => {
        ServiceKeywords.stopService('NonExistentService123456');
      }).toThrow();
    });
  });
});

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic service status check:
 *    const status = ServiceKeywords.getServiceStatus('Spooler');
 *    console.log(status.status); // 'Running' or 'Stopped'
 * 
 * 2. Start a service:
 *    ServiceKeywords.startService('Spooler');
 * 
 * 3. Stop a service:
 *    ServiceKeywords.stopService('Spooler');
 * 
 * 4. Restart a service:
 *    ServiceKeywords.restartService('Spooler');
 * 
 * 5. Check if service exists:
 *    const exists = ServiceKeywords.serviceExists('Spooler');
 * 
 * 6. List all services:
 *    const allServices = ServiceKeywords.listServices('*');
 * 
 * 7. Find services by pattern:
 *    const windowsServices = ServiceKeywords.listServices('W*');
 * 
 * 8. Change startup type:
 *    ServiceKeywords.setServiceStartupType('Spooler', 'Manual');
 */
