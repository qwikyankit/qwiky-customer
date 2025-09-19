import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Check if we're using placeholder values
const isPlaceholder = supabaseUrl === 'https://placeholder.supabase.co' || 
                     supabaseUrl === 'your_supabase_url' ||
                     supabaseAnonKey === 'your_supabase_anon_key' ||
                     supabaseAnonKey === 'placeholder-anon-key';

if (isPlaceholder) {
  console.warn('⚠️ Using placeholder Supabase credentials. Please connect to Supabase to enable database features.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);