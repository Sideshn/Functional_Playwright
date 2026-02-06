const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create TestData directory if it doesn't exist
const testDataDir = path.join(__dirname, '../../TestData');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Create sample SQLite database
const dbPath = path.join(testDataDir, 'sample.db');

// Remove existing database if exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

console.log('Creating sample database...');

// Create Users table
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Products table
db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT,
    price REAL,
    stock INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Orders table
db.exec(`
  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    order_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Insert sample data into Users
const insertUser = db.prepare(`
  INSERT INTO users (name, email, age, city) VALUES (?, ?, ?, ?)
`);

const users = [
  ['John Doe', 'john.doe@example.com', 30, 'New York'],
  ['Jane Smith', 'jane.smith@example.com', 25, 'Los Angeles'],
  ['Bob Johnson', 'bob.johnson@example.com', 35, 'Chicago'],
  ['Alice Williams', 'alice.williams@example.com', 28, 'Houston'],
  ['Charlie Brown', 'charlie.brown@example.com', 32, 'Phoenix']
];

users.forEach(user => insertUser.run(...user));

// Insert sample data into Products
const insertProduct = db.prepare(`
  INSERT INTO products (product_name, category, price, stock) VALUES (?, ?, ?, ?)
`);

const products = [
  ['Laptop', 'Electronics', 999.99, 50],
  ['Mouse', 'Electronics', 29.99, 200],
  ['Keyboard', 'Electronics', 79.99, 150],
  ['Monitor', 'Electronics', 299.99, 75],
  ['Desk Chair', 'Furniture', 199.99, 30],
  ['Desk', 'Furniture', 399.99, 20],
  ['Notebook', 'Stationery', 5.99, 500],
  ['Pen Set', 'Stationery', 12.99, 300]
];

products.forEach(product => insertProduct.run(...product));

// Insert sample data into Orders
const insertOrder = db.prepare(`
  INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)
`);

const orders = [
  [1, 1, 1, 999.99],
  [1, 2, 2, 59.98],
  [2, 3, 1, 79.99],
  [3, 4, 2, 599.98],
  [4, 5, 1, 199.99],
  [5, 6, 1, 399.99],
  [2, 7, 10, 59.90],
  [3, 8, 5, 64.95]
];

orders.forEach(order => insertOrder.run(...order));

console.log('✅ Sample database created successfully!');
console.log(`📁 Database location: ${dbPath}`);
console.log(`📊 Tables created: users, products, orders`);
console.log(`👥 Users: ${users.length} records`);
console.log(`📦 Products: ${products.length} records`);
console.log(`🛒 Orders: ${orders.length} records`);

db.close();
