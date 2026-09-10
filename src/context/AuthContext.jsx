import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react"

import { supabase } from "../services/supabaseClient"


const AuthContext = createContext(null)


function AuthProvider({ children }) {

    // Usuário atualmente autenticado.
    const [user, setUser] = useState(null)

    // Sessão atual do Supabase.
    const [session, setSession] = useState(null)

    // Enquanto true, ainda estamos verificando
    // se existe uma sessão válida.
    const [loading, setLoading] = useState(true)

    // Informa se a sessão atual foi criada
    // através de um link de recuperação de senha.
    //
    // Isso impede que uma sessão comum seja usada
    // diretamente na tela /update-password.
    const [
        isPasswordRecovery,
        setIsPasswordRecovery
    ] = useState(false)



    useEffect(() => {

        let mounted = true


        async function loadSession() {

            // Primeiro verifica se existe alguma
            // sessão armazenada no navegador.
            const {
                data: { session: currentSession },
                error: sessionError
            } = await supabase.auth.getSession()


            if (!mounted) {
                return
            }


            // Se ocorrer erro ao carregar a sessão,
            // não liberamos usuário nenhum.
            if (sessionError) {

                setUser(null)
                setSession(null)
                setLoading(false)

                return
            }


            // Não existe sessão.
            if (!currentSession) {

                setUser(null)
                setSession(null)
                setLoading(false)

                return
            }


            // getUser consulta o Auth server e obtém
            // os dados confiáveis do usuário.
            //
            // Isso é mais adequado do que confiar
            // somente nos dados presentes no storage.
            const {
                data: { user: verifiedUser },
                error: userError
            } = await supabase.auth.getUser()


            if (!mounted) {
                return
            }


            if (userError) {

                setUser(null)
                setSession(null)

            } else {

                setSession(currentSession)
                setUser(verifiedUser)

            }


            setLoading(false)

        }


        loadSession()



        // Escuta alterações da autenticação:
        //
        // SIGNED_IN
        // SIGNED_OUT
        // PASSWORD_RECOVERY
        // TOKEN_REFRESHED
        // USER_UPDATED
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (event, newSession) => {

                if (!mounted) {
                    return
                }


                setSession(newSession)

                setUser(
                    newSession?.user ?? null
                )


                // Marca que a sessão veio de um
                // link válido de recuperação.
                if (
                    event === "PASSWORD_RECOVERY"
                ) {

                    setIsPasswordRecovery(true)

                }


                // Ao sair da conta, também limpamos
                // qualquer fluxo de recuperação.
                if (
                    event === "SIGNED_OUT"
                ) {

                    setIsPasswordRecovery(false)

                }


                setLoading(false)

            }
        )


        // Remove o listener quando o Provider
        // não estiver mais sendo utilizado.
        return () => {

            mounted = false

            subscription.unsubscribe()

        }

    }, [])



    // Encerra somente a sessão deste navegador.
    async function logout() {

        const { error } =
            await supabase.auth.signOut({
                scope: "local"
            })


        if (
            error &&
            import.meta.env.DEV
        ) {

            console.error(
                "Erro ao sair:",
                error.message
            )

        }


        return { error }

    }



    // Usada depois que a redefinição de senha
    // for concluída.
    function clearPasswordRecovery() {

        setIsPasswordRecovery(false)

    }



    return (

        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                logout,
                isPasswordRecovery,
                clearPasswordRecovery
            }}
        >

            {children}

        </AuthContext.Provider>

    )

}



function useAuth() {

    const context =
        useContext(AuthContext)


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