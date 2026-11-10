
/* ==========================================
   UNIVERSIDADE SYNTER
   CLIENTE COMPARTILHADO DE TÉCNICOS
========================================== */

import { supabase } from "../services/supabaseClient";

// Utiliza a mesma sessão autenticada
// do restante da aplicação.
//
// Mantém:
// - JWT do usuário autenticado
// - Renovação automática da sessão
// - Compatibilidade com RLS
// - Permissões existentes

export const tecnicosClient = supabase;
