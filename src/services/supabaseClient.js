import { createClient } from '@supabase/supabase-js'

// URL do seu projeto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Chave pública do Supabase usada no frontend
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Cria a conexão com o Supabase
export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)