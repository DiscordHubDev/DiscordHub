import { createClient } from '@supabase/supabase-js';

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseKey) throw new Error('❌ supabaseKey not found in server env');

  return createClient(supabaseUrl, supabaseKey);
};
