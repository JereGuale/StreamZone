import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error(
    "[StreamZone] Variables de entorno faltantes. " +
    "Crea .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY y reinicia."
  );
}

export const supabase = createClient(url ?? "", anon ?? "");

