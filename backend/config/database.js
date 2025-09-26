const path = require('path');
const Database = require('better-sqlite3');

// Path to the database file, adjusting for the new location
const dbPath = path.resolve(__dirname, '..', '..', 'data', 'dms_tool.db');

// Initialize the database connection
const db = new Database(dbPath);

// Ensure foreign keys are enabled for every connection, which is a good practice
db.pragma('foreign_keys = ON');

console.log('Database connection successfully established.');

// Export the single database instance
module.exports = db;
