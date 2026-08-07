import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ovmuiosxbfdprgxdjlfp.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXVpb3N4YmZkcHJneGRqbGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODA3ODYsImV4cCI6MjEwMDY1Njc4Nn0.fw22a_T5f5QyL-qIOxFxOMwPZhIv9U5ANZs3WCWtU4Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
