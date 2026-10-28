import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to clean trailing /rest/v1 or trailing slashes
const sanitizeUrl = (raw: string): string => {
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

// Retrieve from environment variables or custom local storage override
const envUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL || '');
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

const localUrl = typeof window !== 'undefined' ? sanitizeUrl(localStorage.getItem('fleetops_custom_supabase_url') || '') : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('fleetops_custom_supabase_anon_key') || '' : '';

export const supabaseUrl = localUrl || envUrl;
export const supabaseAnonKey = localKey || envKey;

// Validation helper: checks if the provided credentials are valid Supabase shapes
export const isValidSupabaseConfig = (url: string, key: string): boolean => {
  if (!url || !key) return false;
  if (url.includes('your-project-id') || url.includes('your-anon-public-key')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && key.length > 20;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey);

// Create Supabase client instance (or a mock/stub if not configured)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const saveCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fleetops_custom_supabase_url', url.trim());
    localStorage.setItem('fleetops_custom_supabase_anon_key', key.trim());
    window.location.reload();
  }
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fleetops_custom_supabase_url');
    localStorage.removeItem('fleetops_custom_supabase_anon_key');
    window.location.reload();
  }
};
