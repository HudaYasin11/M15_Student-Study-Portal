
// backend/db.js
// Connects to your LOCAL PostgreSQL install using the pg package.

require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL in .env — see .env.example for the format."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // No ssl option needed — this is a local database, not hosted.
});

pool.on("connect", () => {
  console.log("Connected to local PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
