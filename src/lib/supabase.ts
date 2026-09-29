import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Jika credentials belum diisi, buat dummy client agar app tidak crash
// (akan masuk mode offline/localStorage fallback)
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder-key';
