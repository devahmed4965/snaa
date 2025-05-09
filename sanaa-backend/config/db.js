// config/db.js - Handles the PostgreSQL database connection using pg pool

// Import the Pool class from the 'pg' library
const { Pool } = require('pg');
// Import dotenv to load environment variables from .env file
require('dotenv').config(); // Ensure environment variables are loaded

// Create a new Pool instance.
// The Pool manages multiple client connections automatically.
// It reads connection details from environment variables by default:
// PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
// Or, it can use a single connection string (DATABASE_URL), which is common for services like Neon.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Read the connection string from .env file
  // Optional: Add SSL configuration if required by Neon (often needed for external connections)
  // ssl: {
  //   rejectUnauthorized: process.env.NODE_ENV === 'production' // Enforce SSL in production
  // }
});

// Optional: Test the connection (can be removed or enhanced)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for DB connection test:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing DB connection test query:', err.stack);
    }
    console.log('Successfully connected to PostgreSQL database at:', result.rows[0].now);
  });
});

// Export the pool object so it can be used in other parts of the application (e.g., controllers)
module.exports = pool;

