// Shared Supabase connection for the /api functions.
// Secrets come from Vercel environment variables - never from the code.

const { createClient } = require("@supabase/supabase-js");

let publicClient;

/**
 * Read-only client for PUBLIC data (products, categories).
 * It uses the publishable key, so the database's Row Level Security rules
 * apply: it can only see what any visitor could see.
 * (SUPABASE_ANON_KEY is accepted as an older name for the same key.)
 */
function getPublicClient() {
  if (publicClient) return publicClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variable");
  }

  publicClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return publicClient;
}

module.exports = { getPublicClient };
