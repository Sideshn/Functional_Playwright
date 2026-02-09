const { test, expect } = require('@playwright/test');
const DBKeywords = require('../../src/Core/DBKeywords');
const path = require('path');

test.describe.configure({ mode: 'serial' });

test.describe('DBKeywords - Database Operations', () => {
  let db;
  const dbPath = path.resolve(__dirname, '../../TestData/sample.db');

  test.beforeAll(() => {
    db = new DBKeywords();
    db.connectSQLite(dbPath);
  });

  test.afterAll(async () => {
    if (db.isConnected()) {
      await db.close();
    }
  });

  test('should be connected to SQLite database', () => {
    expect(db.isConnected()).toBe(true);
    expect(db.getDatabaseType()).toBe('sqlite');
  });

  test('should read entire users table', async () => {
    const users = await db.readTable('users');
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
    console.log('Users:', users);
  });

  test('should read table with specific columns', async () => {
    const users = await db.readTable('users', 'name, email, city');
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('city');
    expect(users[0]).not.toHaveProperty('age');
  });

  test('should read table with WHERE clause', async () => {
    const users = await db.readTable('users', '*', 'age > ?', [28]);
    expect(users.length).toBeGreaterThan(0);
    users.forEach(user => {
      expect(user.age).toBeGreaterThan(28);
    });
    console.log('Users with age > 28:', users);
  });

  test('should execute SELECT query', async () => {
    const query = 'SELECT * FROM users WHERE city = ?';
    const rows = await db.executeQuery(query, ['New York']);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].city).toBe('New York');
  });

  test('should get table schema', async () => {
    const schema = await db.getTableSchema('users');
    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);
    console.log('Users table schema:', schema);
  });

  test('should get single row by condition', async () => {
    const user = await db.getRow('users', 'email = ?', ['john.doe@example.com']);
    expect(user).not.toBeNull();
    expect(user.email).toBe('john.doe@example.com');
    expect(user.name).toBe('John Doe');
  });

  test('should get row count', async () => {
    const totalCount = await db.getRowCount('users');
    expect(totalCount).toBeGreaterThan(0);

    const filteredCount = await db.getRowCount('users', 'age >= ?', [30]);
    expect(filteredCount).toBeGreaterThanOrEqual(0);
    expect(filteredCount).toBeLessThanOrEqual(totalCount);
    console.log(`Total users: ${totalCount}, Users aged 30+: ${filteredCount}`);
  });

  test('should insert a new row', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test.user@example.com',
      age: 27,
      city: 'Boston'
    };

    const result = await db.insertRow('users', newUser);
    expect(result.affectedRows).toBe(1);
    expect(result.lastInsertId).toBeGreaterThan(0);

    // Verify insertion
    const insertedUser = await db.getRow('users', 'email = ?', ['test.user@example.com']);
    expect(insertedUser).not.toBeNull();
    expect(insertedUser.name).toBe('Test User');
  });

  test('should update rows', async () => {
    const updateData = { city: 'San Francisco' };
    const result = await db.updateRows('users', updateData, 'email = ?', ['test.user@example.com']);
    expect(result.affectedRows).toBeGreaterThan(0);

    // Verify update
    const updatedUser = await db.getRow('users', 'email = ?', ['test.user@example.com']);
    expect(updatedUser.city).toBe('San Francisco');
  });

  test('should delete rows', async () => {
    const result = await db.deleteRows('users', 'email = ?', ['test.user@example.com']);
    expect(result.affectedRows).toBeGreaterThan(0);

    // Verify deletion
    const deletedUser = await db.getRow('users', 'email = ?', ['test.user@example.com']);
    expect(deletedUser).toBeNull();
  });

  test('should read products table', async () => {
    const products = await db.readTable('products');
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('product_name');
    expect(products[0]).toHaveProperty('price');
    console.log('Products:', products);
  });

  test('should execute complex JOIN query', async () => {
    const query = `
      SELECT 
        u.name as user_name,
        p.product_name,
        o.quantity,
        o.total_price
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN products p ON o.product_id = p.id
      WHERE u.name = ?
    `;
    const orders = await db.executeQuery(query, ['John Doe']);
    expect(Array.isArray(orders)).toBe(true);
    if (orders.length > 0) {
      expect(orders[0]).toHaveProperty('user_name');
      expect(orders[0]).toHaveProperty('product_name');
      console.log('John Doe orders:', orders);
    }
  });

  test('should execute transaction', async () => {
    const result = await db.executeTransaction(async (dbInstance) => {
      // Insert a new product
      const productResult = await dbInstance.insertRow('products', {
        product_name: 'Test Product',
        category: 'Test',
        price: 99.99,
        stock: 10
      });

      // Insert a new user
      const userResult = await dbInstance.insertRow('users', {
        name: 'Transaction User',
        email: 'transaction@example.com',
        age: 30,
        city: 'Seattle'
      });

      return { productId: productResult.lastInsertId, userId: userResult.lastInsertId };
    });

    expect(result.productId).toBeGreaterThan(0);
    expect(result.userId).toBeGreaterThan(0);

    // Cleanup
    await db.deleteRows('products', 'product_name = ?', ['Test Product']);
    await db.deleteRows('users', 'email = ?', ['transaction@example.com']);
  });

  test('should handle aggregate functions', async () => {
    const query = `
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        MAX(price) as max_price,
        MIN(price) as min_price
      FROM products
      GROUP BY category
    `;
    const stats = await db.executeQuery(query);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty('category');
    expect(stats[0]).toHaveProperty('product_count');
    console.log('Product statistics by category:', stats);
  });
});
