import { createClient } from "@supabase/supabase-js"


// ========================================
// VARIÁVEIS PÚBLICAS
// ========================================

// URL pública do projeto Supabase.
//
// Tudo que começa com VITE_ é enviado
// para o navegador.
//
// Portanto, essa variável NÃO pode
// conter nenhum segredo.
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL


// Publishable Key.
//
// Essa chave foi criada para uso
// no frontend.
//
// Nunca coloque aqui:
//
// - sb_secret_...
// - service_role
// - TURNSTILE_SECRET_KEY
// - qualquer chave administrativa
const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY



// ========================================
// VALIDAÇÃO DA CONFIGURAÇÃO
// ========================================

// Impede que a aplicação seja iniciada
// sem as variáveis necessárias.
if (!supabaseUrl || !supabaseKey) {

    throw new Error(
        "As variáveis públicas do Supabase não foram configuradas."
    )
}



// ========================================
// VALIDAÇÃO DA URL
// ========================================

let parsedSupabaseUrl

try {

    parsedSupabaseUrl =
        new URL(supabaseUrl)

} catch {

    throw new Error(
        "A URL configurada para o Supabase é inválida."
    )

}


// O Supabase deve ser acessado por HTTPS.
//
// Localhost é permitido apenas para
// desenvolvimento, caso necessário.
const isLocalhost =
    parsedSupabaseUrl.hostname === "localhost" ||
    parsedSupabaseUrl.hostname === "127.0.0.1"


if (
    parsedSupabaseUrl.protocol !== "https:" &&
    !isLocalhost
) {

    throw new Error(
        "A conexão com o Supabase deve utilizar HTTPS."
    )

}



// ========================================
// PROTEÇÃO CONTRA CHAVE SECRET
// ========================================

// Uma chave sb_secret_ nunca deve estar
// presente no frontend.
//
// Caso alguém configure essa chave
// por engano, interrompemos a aplicação.
if (
    typeof supabaseKey === "string" &&
    supabaseKey.startsWith("sb_secret_")
) {

    throw new Error(
        "Uma chave secreta do Supabase não pode ser utilizada no frontend."
    )

}



// ========================================
// PROTEÇÃO CONTRA SERVICE_ROLE
// ========================================

// Projetos antigos do Supabase podem usar
// chaves JWT.
//
// Caso uma service_role seja colocada
// acidentalmente no VITE_, tentamos
// identificá-la antes de criar o cliente.
function hasServiceRole(key) {

    try {

        const parts = key.split(".")

        if (parts.length !== 3) {
            return false
        }


        const payload = parts[1]

            .replace(/-/g, "+")
            .replace(/_/g, "/")


        const normalizedPayload =
            payload.padEnd(
                payload.length +
                (4 - payload.length % 4) % 4,
                "="
            )


        const decodedPayload =
            JSON.parse(
                atob(normalizedPayload)
            )


        return (
            decodedPayload?.role ===
            "service_role"
        )

    } catch {

        return false

    }

}


if (hasServiceRole(supabaseKey)) {

    throw new Error(
        "A chave service_role não pode ser utilizada no frontend."
    )

}



// ========================================
// CLIENTE SUPABASE
// ========================================

// Cria uma única instância do Supabase
// para ser utilizada em todo o projeto.
export const supabase = createClient(

    supabaseUrl,

    supabaseKey,

    {

        auth: {

            // Mantém a sessão após atualizar
            // ou reabrir a aplicação.
            persistSession: true,


            // Renova automaticamente o
            // access token antes da expiração.
            autoRefreshToken: true,


            // Permite que o Supabase reconheça
            // links recebidos por e-mail,
            // incluindo:
            //
            // - confirmação de cadastro
            // - recuperação de senha
            detectSessionInUrl: true

        }

    }

)