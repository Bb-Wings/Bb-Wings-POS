/**
 * @fileoverview Supabase Browser Client — BB Wings Management System
 * @description Cliente de Supabase para uso en componentes del lado del cliente
 * (Client Components). Implementa singleton pattern para evitar múltiples
 * instancias durante el desarrollo con HMR.
 * @version 1.0.0
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// ─── Validation ────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[BB Wings] NEXT_PUBLIC_SUPABASE_URL no está definida. " +
    "Crea un archivo .env.local con tus credenciales de Supabase."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "[BB Wings] NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida. " +
    "Crea un archivo .env.local con tus credenciales de Supabase."
  );
}

// ─── Singleton Browser Client ──────────────────────────────────────────────

/**
 * Crea (o reutiliza) el cliente de Supabase para el navegador.
 * Se utiliza en Client Components únicamente.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data } = await supabase.from('productos').select('*')
 * ```
 */
export function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!) as any;
}
