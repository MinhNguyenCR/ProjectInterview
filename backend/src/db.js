const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Please configure it in your .env file.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase in many environments
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
