import { createContext, useContext, useEffect, useState } from "react"

import { supabase } from "../services/supabaseClient"


// Cria o contexto de autenticação.
// Ele permitirá compartilhar os dados do usuário entre várias páginas.
const AuthContext = createContext(null)


function AuthProvider({ children }) {

    // Guarda o usuário atualmente autenticado.
    const [user, setUser] = useState(null)

    // Guarda a sessão atual do Supabase.
    const [session, setSession] = useState(null)

    // Controla o carregamento inicial da autenticação.
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        // Função responsável por verificar
        // se já existe uma sessão salva no navegador.
        async function loadSession() {

            const { data, error } = await supabase.auth.getSession()

            // Caso ocorra algum erro ao buscar a sessão.
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

            // Salva o usuário da sessão.
            // Caso não exista sessão, ficará null.
            setUser(data.session?.user ?? null)

            // Finaliza o carregamento.
            setLoading(false)
        }


        // Executa a verificação da sessão
        // quando o AuthProvider é iniciado.
        loadSession()


        // Escuta mudanças na autenticação.
        //
        // Por exemplo:
        // login
        // logout
        // recuperação de senha
        // atualização da sessão
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {

                // Atualiza a sessão.
                setSession(newSession)

                // Atualiza o usuário.
                setUser(newSession?.user ?? null)

                // Garante que o carregamento terminou.
                setLoading(false)
            }
        )


        // Remove o listener quando o componente
        // não estiver mais sendo utilizado.
        return () => {

            subscription.unsubscribe()

        }

    }, [])


    // Função para sair da conta.
    async function logout() {

        const { error } = await supabase.auth.signOut()

        if (error) {

            console.error(
                "Erro ao sair da conta:",
                error.message
            )

            return
        }

        // Limpa os dados locais.
        setUser(null)
        setSession(null)
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


function useAuth() {

    // Permite acessar facilmente os dados
    // do AuthContext em qualquer componente.
    const context = useContext(AuthContext)


    // Impede o uso do useAuth fora do AuthProvider.
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