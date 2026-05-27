import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.esm.js';

// Replace these placeholder values with your actual Supabase project settings.
export const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
