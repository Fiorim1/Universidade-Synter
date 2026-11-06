
import { createClient } from "@supabase/supabase-js";

// ==========================================
// CONFIGURAÇÃO DE ACESSO
// ==========================================

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Nunca utilizar service_role no navegador.

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Configuração de acesso aos técnicos não encontrada."
  );
}

export const tecnicosClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder"
);
