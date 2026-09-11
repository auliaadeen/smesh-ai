import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only. Never import this file from a client component — the key it
// reads (SUPABASE_ANON_KEY) has no NEXT_PUBLIC_ prefix on purpose, and the
// client is created lazily so importing this module without Supabase
// configured (e.g. local dev on MockBusinessRepository) doesn't crash.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

let client: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) throw new Error("Missing SUPABASE_ANON_KEY");

  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return client;
}
