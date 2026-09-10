import { createClient } from "@supabase/supabase-js"


// URL pública do projeto Supabase.
//
// Tudo que começa com VITE_ é enviado para o navegador.
// Portanto, essa variável NÃO pode conter segredos.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL


// Publishable Key.
//
// Essa chave foi criada justamente para uso no frontend.
// Ela não é uma chave administrativa.
//
// Nunca coloque aqui:
// - sb_secret_...
// - service_role
// - TURNSTILE_SECRET_KEY
const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY


// Verifica se as variáveis públicas necessárias existem.
//
// Isso evita que o projeto seja iniciado com uma
// configuração incompleta.
if (!supabaseUrl || !supabaseKey) {

    throw new Error(
        "As variáveis públicas do Supabase não foram configuradas."
    )

}


// Cria uma única instância do Supabase
// para ser utilizada em todo o projeto.
export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {

            // Mantém a sessão depois que o usuário
            // atualizar ou fechar/abrir a página.
            persistSession: true,

            // Renova automaticamente o access token
            // antes que ele expire.
            autoRefreshToken: true,

            // Permite que o Supabase reconheça
            // links de autenticação e recuperação
            // recebidos por e-mail.
            detectSessionInUrl: true

        }
    }
)