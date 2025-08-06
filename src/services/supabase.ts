import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/index.js';
import { getSupabaseConfig } from './config.js';

const { url: supabaseUrl, anonKey: supabaseKey } = getSupabaseConfig();

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}; 