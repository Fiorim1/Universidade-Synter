import { createContext, useContext, useEffect, useState } from "react"

import { supabase } from "../services/supabaseClient"


// Cria o contexto responsável pela autenticação.
// Ele permite compartilhar usuário, sessão e logout
// entre diferentes componentes do projeto.
const AuthContext = createContext(null)


function AuthProvider({ children }) {

    // Guarda o usuário atualmente autenticado.
    const [user, setUser] = useState(null)

    // Guarda a sessão atual do Supabase.
    const [session, setSession] = useState(null)

    // Informa se o Supabase ainda está verificando
    // se existe uma sessão salva.
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        // Verifica se o usuário já possui uma
        // sessão salva no navegador.
        async function loadSession() {

            const { data, error } =
                await supabase.auth.getSession()


            // Caso aconteça algum erro ao verificar a sessão.
            if (error) {

                console.error(
                    "Erro ao verificar sessão:",
                    error.message
                )

                setLoading(false)

                return
            }


            // Salva a sessão encontrada.
            setSession(data.session)

            // Se existir sessão, salva o usuário.
            // Caso contrário, mantém null.
            setUser(
                data.session?.user ?? null
            )

            // Finaliza a verificação inicial.
            setLoading(false)

        }


        // Executa assim que o sistema inicia.
        loadSession()


        // Fica observando alterações na autenticação:
        //
        // Login
        // Logout
        // Atualização da sessão
        // Recuperação de senha
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {

                // Atualiza a sessão.
                setSession(newSession)

                // Atualiza o usuário.
                setUser(
                    newSession?.user ?? null
                )

                setLoading(false)

            }
        )


        // Remove o observador quando o AuthProvider
        // deixar de existir.
        return () => {

            subscription.unsubscribe()

        }

    }, [])



    // Função utilizada para sair da conta.
    async function logout() {

        const { error } =
            await supabase.auth.signOut()


        if (error) {

            console.error(
                "Erro ao sair da conta:",
                error.message
            )

            return
        }

        // Não precisamos limpar user e session
        // manualmente aqui.
        //
        // O onAuthStateChange detectará o logout
        // e atualizará automaticamente os estados.

    }



    return (

        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    )

}



// Hook personalizado para acessar
// facilmente o AuthContext.
function useAuth() {

    const context = useContext(AuthContext)


    // Evita utilizar useAuth fora do AuthProvider.
    if (!context) {

        throw new Error(
            "useAuth deve ser utilizado dentro de AuthProvider"
        )

    }


    return context

}


export {
    AuthProvider,
    useAuth
}