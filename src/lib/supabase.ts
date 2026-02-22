import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpvahkpklchmmtrnetyc.supabase.co';
const supabaseAnonKey = 'sb_publishable_KZt8Amt_e3ljKvDP-3Fyhg_ZhZ-Qk0p';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const sendBorrowEmail = (owner: string, itemName: string) => {
  console.log(`Email notification triggered for ${owner} regarding ${itemName}`);
};
