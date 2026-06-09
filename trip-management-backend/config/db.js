const { Pool } = require("pg");
require("dotenv").config(); // This allows the file to read your .env

// Verify that DATABASE_URL is present before initializing the pool
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const pool = new Pool({
  // Use the single connection string provided by Neon or your environment
  connectionString: process.env.DATABASE_URL,
  
  // Required configuration for cloud database providers like Neon
  ssl: {
    rejectUnauthorized: false, // Prevents self-signed certificate errors in production
  },
  
  // Production pool optimizations
  max: 10,                      // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,     // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000 // Return an error if a connection takes longer than 5 seconds
});

// Optional connection listener for application logging and debugging
pool.on("connect", () => {
  console.log("Database connection pool initialized successfully.");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err.message);
});

module.exports = pool;