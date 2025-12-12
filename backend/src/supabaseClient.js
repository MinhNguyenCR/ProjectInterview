const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Please configure them in your .env file.');
}

// Service role key is intended for backend only (never expose to frontend)
const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

module.exports = {
  supabase,
};
