import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwqmrdehuuljkatnrygx.supabase.co';
// Kunci anon ini aman untuk digunakan di sisi klien karena keamanan diatur oleh
// kebijakan Keamanan Tingkat Baris (RLS) di dasbor Supabase Anda.
// Pastikan RLS diaktifkan untuk melindungi data Anda.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cW1yZGVodXVsamthdG5yeWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzE1NTYsImV4cCI6MjA3ODUwNzU1Nn0.sEgcTaLDgW4bFaoV4mcqaZR-pljc08QSrYApmN2AnaA';

// Buat dan ekspor klien Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
