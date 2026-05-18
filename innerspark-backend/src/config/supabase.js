import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";

// Polyfill WebSocket for Node.js 20
if (!global.WebSocket) global.WebSocket = WebSocket;

const url  = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY missing in .env");
}

export const supabase = createClient(url, anon, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Admin client — falls back to anon if service key not a valid JWT
const adminKey = svcKey?.startsWith("eyJ") ? svcKey : anon;
export const supabaseAdmin = createClient(url, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
