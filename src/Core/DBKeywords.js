const { logger } = require('../Utils/logger');
const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

/**
 * DBKeywords - Database utility class for connecting and querying databases
 * Supports: SQLite, MySQL, PostgreSQL
 */
class DBKeywords {
  constructor() {
    this.connection = null;
    this.dbType = null;
  }

  // ==================== SQLITE OPERATIONS ====================

  /**
   * Connect to SQLite database
   * @param {string} dbPath - Path to SQLite database file
   * @param {Object} options - Connection options
   * @returns {void}
   */
  connectSQLite(dbPath, options = {}) {
    try {
      logger.info(`🔌 Connecting to SQLite database: ${dbPath}`);
      this.connection = new Database(dbPath, options);
      this.dbType = 'sqlite';
      logger.success(`✅ Successfully connected to SQLite database`);
    } catch (error) {
      logger.error(`❌ Failed to connect to SQLite: ${error.message}`);
      throw error;
    }
  }

  // ==================== MYSQL OPERATIONS ====================

  /**
   * Connect to MySQL database
   * @param {Object} config - MySQL connection config {host, user, password, database, port}
   * @returns {Promise<void>}
   */
  async connectMySQL(config) {
    try {
      logger.info(`🔌 Connecting to MySQL database: ${config.database}@${config.host}`);
      this.connection = await mysql.createConnection(config);
      this.dbType = 'mysql';
      logger.success(`✅ Successfully connected to MySQL database`);
    } catch (error) {
      logger.error(`❌ Failed to connect to MySQL: ${error.message}`);
      throw error;
    }
  }

  // ==================== POSTGRESQL OPERATIONS ====================

  /**
   * Connect to PostgreSQL database
   * @param {Object} config - PostgreSQL connection config {host, user, password, database, port}
   * @returns {Promise<void>}
   */
  async connectPostgreSQL(config) {
    try {
      logger.info(`🔌 Connecting to PostgreSQL database: ${config.database}@${config.host}`);
      this.connection = new Pool(config);
      this.dbType = 'postgresql';
      
      // Test connection
      const client = await this.connection.connect();
      client.release();
      
      logger.success(`✅ Successfully connected to PostgreSQL database`);
    } catch (error) {
      logger.error(`❌ Failed to connect to PostgreSQL: ${error.message}`);
      throw error;
    }
  }

  // ==================== GENERIC QUERY OPERATIONS ====================

  /**
   * Execute a SELECT query and return all rows
   * @param {string} query - SQL SELECT query
   * @param {Array} params - Query parameters (optional)
   * @returns {Promise<Array>} Array of rows
   */
  async executeQuery(query, params = []) {
    try {
      logger.info(`📊 Executing query: ${query}`);
      
      if (!this.connection) {
        throw new Error('No database connection. Please connect to a database first.');
      }

      let rows;

      switch (this.dbType) {
        case 'sqlite':
          const stmt = this.connection.prepare(query);
          rows = params.length > 0 ? stmt.all(...params) : stmt.all();
          break;

        case 'mysql':
          const [mysqlRows] = await this.connection.execute(query, params);
          rows = mysqlRows;
          break;

        case 'postgresql':
          const pgResult = await this.connection.query(query, params);
          rows = pgResult.rows;
          break;

        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      logger.success(`✅ Query executed successfully. Rows returned: ${rows.length}`);
      return rows;
    } catch (error) {
      logger.error(`❌ Query execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute INSERT, UPDATE, DELETE queries
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters (optional)
   * @returns {Promise<Object>} Result with affected rows count
   */
  async executeNonQuery(query, params = []) {
    try {
      logger.info(`✏️  Executing non-query: ${query}`);
      
      if (!this.connection) {
        throw new Error('No database connection. Please connect to a database first.');
      }

      let result;

      switch (this.dbType) {
        case 'sqlite':
          const stmt = this.connection.prepare(query);
          result = params.length > 0 ? stmt.run(...params) : stmt.run();
          logger.success(`✅ Query executed. Rows affected: ${result.changes}`);
          return { affectedRows: result.changes, lastInsertId: result.lastInsertRowid };

        case 'mysql':
          const [mysqlResult] = await this.connection.execute(query, params);
          logger.success(`✅ Query executed. Rows affected: ${mysqlResult.affectedRows}`);
          return { affectedRows: mysqlResult.affectedRows, lastInsertId: mysqlResult.insertId };

        case 'postgresql':
          const pgResult = await this.connection.query(query, params);
          logger.success(`✅ Query executed. Rows affected: ${pgResult.rowCount}`);
          return { affectedRows: pgResult.rowCount, lastInsertId: null };

        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }
    } catch (error) {
      logger.error(`❌ Non-query execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read entire table and return all records
   * @param {string} tableName - Name of the table
   * @param {string} columns - Columns to select (default: *)
   * @param {string} whereClause - WHERE clause (optional)
   * @param {Array} params - Parameters for WHERE clause
   * @returns {Promise<Array>} Array of all table records
   */
  async readTable(tableName, columns = '*', whereClause = '', params = []) {
    try {
      logger.info(`📖 Reading table: ${tableName}`);
      
      let query = `SELECT ${columns} FROM ${tableName}`;
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }

      const rows = await this.executeQuery(query, params);
      logger.success(`✅ Table read successfully. Total records: ${rows.length}`);
      return rows;
    } catch (error) {
      logger.error(`❌ Failed to read table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get table schema/structure
   * @param {string} tableName - Name of the table
   * @returns {Promise<Array>} Table schema information
   */
  async getTableSchema(tableName) {
    try {
      logger.info(`🔍 Getting schema for table: ${tableName}`);
      
      let query;
      let rows;

      switch (this.dbType) {
        case 'sqlite':
          query = `PRAGMA table_info(${tableName})`;
          rows = await this.executeQuery(query);
          break;

        case 'mysql':
          query = `DESCRIBE ${tableName}`;
          rows = await this.executeQuery(query);
          break;

        case 'postgresql':
          query = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
          `;
          rows = await this.executeQuery(query, [tableName]);
          break;

        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      logger.success(`✅ Schema retrieved for table: ${tableName}`);
      return rows;
    } catch (error) {
      logger.error(`❌ Failed to get schema for ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get single row by condition
   * @param {string} tableName - Name of the table
   * @param {string} whereClause - WHERE clause
   * @param {Array} params - Parameters for WHERE clause
   * @returns {Promise<Object|null>} Single row or null
   */
  async getRow(tableName, whereClause, params = []) {
    try {
      logger.info(`📖 Getting row from table: ${tableName}`);
      
      const query = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT 1`;
      const rows = await this.executeQuery(query, params);
      
      if (rows.length > 0) {
        logger.success(`✅ Row retrieved from ${tableName}`);
        return rows[0];
      } else {
        logger.info(`ℹ️  No row found in ${tableName} matching condition`);
        return null;
      }
    } catch (error) {
      logger.error(`❌ Failed to get row from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Insert a new row into table
   * @param {string} tableName - Name of the table
   * @param {Object} data - Key-value pairs for columns and values
   * @returns {Promise<Object>} Result with lastInsertId
   */
  async insertRow(tableName, data) {
    try {
      logger.info(`➕ Inserting row into table: ${tableName}`);
      
      const columns = Object.keys(data).join(', ');
      const placeholders = this.dbType === 'postgresql' 
        ? Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
        : Object.keys(data).map(() => '?').join(', ');
      
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      const result = await this.executeNonQuery(query, Object.values(data));
      
      logger.success(`✅ Row inserted into ${tableName}. ID: ${result.lastInsertId}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to insert row into ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update rows in table
   * @param {string} tableName - Name of the table
   * @param {Object} data - Key-value pairs for columns to update
   * @param {string} whereClause - WHERE clause
   * @param {Array} whereParams - Parameters for WHERE clause
   * @returns {Promise<Object>} Result with affected rows count
   */
  async updateRows(tableName, data, whereClause, whereParams = []) {
    try {
      logger.info(`✏️  Updating rows in table: ${tableName}`);
      
      const setClause = Object.keys(data).map((key, i) => {
        return this.dbType === 'postgresql' ? `${key} = $${i + 1}` : `${key} = ?`;
      }).join(', ');
      
      const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
      const params = [...Object.values(data), ...whereParams];
      
      const result = await this.executeNonQuery(query, params);
      logger.success(`✅ Rows updated in ${tableName}. Affected: ${result.affectedRows}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to update rows in ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete rows from table
   * @param {string} tableName - Name of the table
   * @param {string} whereClause - WHERE clause
   * @param {Array} params - Parameters for WHERE clause
   * @returns {Promise<Object>} Result with affected rows count
   */
  async deleteRows(tableName, whereClause, params = []) {
    try {
      logger.info(`🗑️  Deleting rows from table: ${tableName}`);
      
      const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
      const result = await this.executeNonQuery(query, params);
      
      logger.success(`✅ Rows deleted from ${tableName}. Affected: ${result.affectedRows}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to delete rows from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get row count from table
   * @param {string} tableName - Name of the table
   * @param {string} whereClause - WHERE clause (optional)
   * @param {Array} params - Parameters for WHERE clause
   * @returns {Promise<number>} Total row count
   */
  async getRowCount(tableName, whereClause = '', params = []) {
    try {
      logger.info(`🔢 Getting row count from table: ${tableName}`);
      
      let query = `SELECT COUNT(*) as count FROM ${tableName}`;
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }

      const rows = await this.executeQuery(query, params);
      const count = rows[0].count || rows[0].COUNT;
      
      logger.success(`✅ Row count retrieved: ${count}`);
      return count;
    } catch (error) {
      logger.error(`❌ Failed to get row count from ${tableName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a transaction (multiple queries)
   * @param {Function} callback - Async function containing queries
   * @returns {Promise<any>} Result from callback
   */
  async executeTransaction(callback) {
    try {
      logger.info(`🔄 Starting transaction...`);
      
      if (!this.connection) {
        throw new Error('No database connection. Please connect to a database first.');
      }

      let result;

      switch (this.dbType) {
        case 'sqlite':
          this.connection.prepare('BEGIN TRANSACTION').run();
          try {
            result = await callback(this);
            this.connection.prepare('COMMIT').run();
          } catch (error) {
            this.connection.prepare('ROLLBACK').run();
            throw error;
          }
          break;

        case 'mysql':
          await this.connection.beginTransaction();
          try {
            result = await callback(this);
            await this.connection.commit();
          } catch (error) {
            await this.connection.rollback();
            throw error;
          }
          break;

        case 'postgresql':
          const client = await this.connection.connect();
          try {
            await client.query('BEGIN');
            result = await callback(this);
            await client.query('COMMIT');
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          } finally {
            client.release();
          }
          break;

        default:
          throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      logger.success(`✅ Transaction completed successfully`);
      return result;
    } catch (error) {
      logger.error(`❌ Transaction failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (!this.connection) {
        logger.warning(`⚠️  No active connection to close`);
        return;
      }

      logger.info(`🔌 Closing database connection...`);

      switch (this.dbType) {
        case 'sqlite':
          this.connection.close();
          break;

        case 'mysql':
          await this.connection.end();
          break;

        case 'postgresql':
          await this.connection.end();
          break;
      }

      this.connection = null;
      this.dbType = null;
      
      logger.success(`✅ Database connection closed successfully`);
    } catch (error) {
      logger.error(`❌ Failed to close connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if connection is active
   * @returns {boolean} True if connected
   */
  isConnected() {
    return this.connection !== null;
  }

  /**
   * Get current database type
   * @returns {string|null} Database type or null
   */
  getDatabaseType() {
    return this.dbType;
  }
}

module.exports = DBKeywords;
