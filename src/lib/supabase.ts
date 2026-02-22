import { createClient } from '@supabase/supabase-js';

// This tells Vite to look for these variables in Vercel or your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const sendBorrowEmail = (owner: string, itemName: string) => {
  console.log(`Email notification triggered for ${owner} regarding ${itemName}`);
};
