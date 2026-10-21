import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react"

import {
    supabase
} from "../services/supabaseClient"


const AuthContext =
    createContext(null)


// ========================================
// CHAVE DA RECUPERAÇÃO DE SENHA
// ========================================

const PASSWORD_RECOVERY_STORAGE_KEY =
    "synter_password_recovery"


// ========================================
// LER ESTADO DE RECUPERAÇÃO
// ========================================

function getStoredPasswordRecovery() {

    try {

        return (
            window.sessionStorage.getItem(
                PASSWORD_RECOVERY_STORAGE_KEY
            ) === "true"
        )

    }

    catch {

        return false

    }

}


function AuthProvider({
    children
}) {

    // ========================================
    // USUÁRIO
    // ========================================

    const [
        user,
        setUser
    ] = useState(null)


    // ========================================
    // SESSÃO
    // ========================================

    const [
        session,
        setSession
    ] = useState(null)


    // ========================================
    // CARREGAMENTO
    // ========================================

    const [
        loading,
        setLoading
    ] = useState(true)


    // ========================================
    // RECUPERAÇÃO DE SENHA
    // ========================================

    const [
        isPasswordRecovery,
        setIsPasswordRecovery
    ] = useState(
        () =>
            getStoredPasswordRecovery()
    )


    // ========================================
    // MARCAR RECUPERAÇÃO DE SENHA
    // ========================================

    function markPasswordRecovery() {

        setIsPasswordRecovery(true)


        try {

            window.sessionStorage.setItem(
                PASSWORD_RECOVERY_STORAGE_KEY,
                "true"
            )

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Não foi possível registrar o estado de recuperação:",
                    error
                )

            }

        }

    }


    // ========================================
    // LIMPAR RECUPERAÇÃO DE SENHA
    // ========================================

    function clearPasswordRecovery() {

        setIsPasswordRecovery(false)


        try {

            window.sessionStorage.removeItem(
                PASSWORD_RECOVERY_STORAGE_KEY
            )

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Não foi possível limpar o estado de recuperação:",
                    error
                )

            }

        }

    }


    // ========================================
    // INICIALIZAR AUTENTICAÇÃO
    // ========================================

    useEffect(() => {

        let mounted =
            true


        // ====================================
        // CARREGAR SESSÃO EXISTENTE
        // ====================================

        async function loadSession() {

            try {

                const {
                    data: {
                        session:
                            currentSession
                    },
                    error:
                        sessionError
                } =
                    await supabase.auth
                        .getSession()


                if (
                    !mounted
                ) {

                    return

                }


                // ==================================
                // ERRO NA SESSÃO
                // ==================================

                if (
                    sessionError
                ) {

                    if (
                        import.meta.env.DEV
                    ) {

                        console.error(
                            "Erro ao carregar sessão:",
                            sessionError.message
                        )

                    }


                    setUser(null)

                    setSession(null)

                    clearPasswordRecovery()

                    return

                }


                // ==================================
                // NÃO EXISTE SESSÃO
                // ==================================

                if (
                    !currentSession
                ) {

                    setUser(null)

                    setSession(null)

                    clearPasswordRecovery()

                    return

                }


                // ==================================
                // VALIDAR USUÁRIO NO SUPABASE
                // ==================================

                const {
                    data: {
                        user:
                            verifiedUser
                    },
                    error:
                        userError
                } =
                    await supabase.auth
                        .getUser()


                if (
                    !mounted
                ) {

                    return

                }


                // ==================================
                // USUÁRIO INVÁLIDO
                // ==================================

                if (
                    userError ||
                    !verifiedUser
                ) {

                    if (
                        userError &&
                        import.meta.env.DEV
                    ) {

                        console.error(
                            "Erro ao validar usuário:",
                            userError.message
                        )

                    }


                    setUser(null)

                    setSession(null)

                    clearPasswordRecovery()

                    return

                }


                // ==================================
                // SESSÃO VÁLIDA
                // ==================================

                setSession(
                    currentSession
                )


                setUser(
                    verifiedUser
                )

            }

            catch (
                error
            ) {

                if (
                    !mounted
                ) {

                    return

                }


                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro inesperado ao carregar autenticação:",
                        error
                    )

                }


                setUser(null)

                setSession(null)

            }

            finally {

                if (
                    mounted
                ) {

                    setLoading(false)

                }

            }

        }


        loadSession()


        // ====================================
        // ESCUTAR ALTERAÇÕES DO SUPABASE AUTH
        // ====================================

        const {
            data: {
                subscription
            }
        } =
            supabase.auth
                .onAuthStateChange(
                    (
                        event,
                        newSession
                    ) => {

                        if (
                            !mounted
                        ) {

                            return

                        }


                        // ==========================
                        // ATUALIZAR SESSÃO
                        // ==========================

                        setSession(
                            newSession
                        )


                        // ==========================
                        // ATUALIZAR USUÁRIO
                        // ==========================

                        setUser(
                            newSession?.user ??
                            null
                        )


                        // ==========================
                        // PASSWORD RECOVERY
                        // ==========================

                        if (
                            event ===
                            "PASSWORD_RECOVERY"
                        ) {

                            markPasswordRecovery()

                        }


                        // ==========================
                        // LOGOUT
                        // ==========================

                        if (
                            event ===
                            "SIGNED_OUT"
                        ) {

                            clearPasswordRecovery()

                        }


                        /*
                            Eventos como:

                            SIGNED_IN
                            TOKEN_REFRESHED
                            USER_UPDATED

                            e atualizações provocadas pelo MFA

                            não limpam a recuperação.

                            Isso é importante porque a
                            verificação do Google Authenticator
                            pode atualizar os tokens da sessão
                            antes da nova senha ser definida.
                        */


                        setLoading(false)

                    }
                )


        // ====================================
        // LIMPEZA DO LISTENER
        // ====================================

        return () => {

            mounted =
                false


            subscription
                .unsubscribe()

        }

    }, [])


    // ========================================
    // LOGOUT
    // ========================================

    async function logout() {

        try {

            const {
                error
            } =
                await supabase.auth
                    .signOut({

                        scope:
                            "local"

                    })


            if (
                error
            ) {

                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro ao sair:",
                        error.message
                    )

                }


                return {
                    error
                }

            }


            clearPasswordRecovery()


            return {
                error: null
            }

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro inesperado ao sair:",
                    error
                )

            }


            return {
                error
            }

        }

    }


    // ========================================
    // CONTEXTO
    // ========================================

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


// ========================================
// HOOK
// ========================================

function useAuth() {

    const context =
        useContext(
            AuthContext
        )


    if (
        !context
    ) {

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