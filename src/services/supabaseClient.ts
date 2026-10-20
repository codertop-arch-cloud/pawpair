import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseAvailable = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('http')
);

// Only initialize Supabase client if valid credentials are provided
export const supabase = isLiveSupabaseAvailable
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
