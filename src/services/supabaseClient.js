
import { createClient } from "@supabase/supabase-js";

/* ==========================================
   UNIVERSIDADE SYNTER
   CLIENTE PRINCIPAL DO SUPABASE
   AUTENTICAÇÃO CENTRALIZADA
========================================== */

// Apenas variáveis públicas podem ser
// utilizadas no frontend.

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ==========================================
// VALIDAR CONFIGURAÇÃO
// ==========================================

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "As variáveis públicas do Supabase não foram configuradas."
  );
}

// ==========================================
// VALIDAR ENDEREÇO DO SUPABASE
// ==========================================

let parsedSupabaseUrl;

try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  throw new Error(
    "A URL configurada para o Supabase é inválida."
  );
}

const isLocalhost =
  parsedSupabaseUrl.hostname === "localhost" ||
  parsedSupabaseUrl.hostname === "127.0.0.1";

if (
  parsedSupabaseUrl.protocol !== "https:" &&
  !isLocalhost
) {
  throw new Error(
    "A conexão com o Supabase deve utilizar HTTPS."
  );
}

// ==========================================
// PROTEÇÃO CONTRA CHAVES SECRETAS
// ==========================================

if (
  typeof supabaseKey !== "string" ||
  supabaseKey.startsWith("sb_secret_")
) {
  throw new Error(
    "Uma chave secreta não pode ser utilizada no frontend."
  );
}

// ==========================================
// IDENTIFICAR SERVICE_ROLE LEGADA
// ==========================================

function hasServiceRole(key) {
  try {
    const parts = key.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const normalizedPayload = payload.padEnd(
      payload.length +
        ((4 - (payload.length % 4)) % 4),
      "="
    );

    const decodedPayload = JSON.parse(
      atob(normalizedPayload)
    );

    return decodedPayload?.role === "service_role";
  } catch {
    return false;
  }
}

if (hasServiceRole(supabaseKey)) {
  throw new Error(
    "A chave service_role não pode ser utilizada no frontend."
  );
}

// ==========================================
// CLIENTE ÚNICO
// ==========================================

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,

      // Processa links de autenticação
      // recebidos por e-mail.
      detectSessionInUrl: true,

      // Sem storageKey personalizada:
      // utiliza o armazenamento padrão
      // da biblioteca Supabase.
    },
  }
);
