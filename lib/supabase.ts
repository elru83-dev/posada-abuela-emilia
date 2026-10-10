import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true cuando faltan las credenciales: el sitio usa los datos de ejemplo. */
export const MODO_DEMO = !url || !key;

/**
 * Cliente único y sin sesión: el sitio público solo lee el catálogo e inserta leads,
 * así que no hace falta persistir auth ni refrescar tokens (menos trabajo por request).
 */
export const supabase: SupabaseClient | null = MODO_DEMO
  ? null
  : createClient(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

export { urlImagen } from "./urls";
