import {
    useEffect,
    useState
} from "react"

import {
    Navigate
} from "react-router-dom"

import {
    useAuth
} from "../context/AuthContext"

import {
    supabase
} from "../services/supabaseClient"


function PublicRoute({
    children
}) {

    const {
        user,
        loading
    } = useAuth()


    // ========================================
    // MFA
    // ========================================

    const [
        mfaLoading,
        setMfaLoading
    ] = useState(false)


    const [
        currentLevel,
        setCurrentLevel
    ] = useState(null)


    const [
        nextLevel,
        setNextLevel
    ] = useState(null)


    const [
        mfaError,
        setMfaError
    ] = useState("")


    // ========================================
    // VERIFICAR NÍVEL DE AUTENTICAÇÃO
    // ========================================

    useEffect(() => {

        let ativo = true


        async function verificarMFA() {

            // ====================================
            // SEM USUÁRIO
            // ====================================

            if (
                !user
            ) {

                if (
                    ativo
                ) {

                    setMfaLoading(false)

                    setCurrentLevel(null)

                    setNextLevel(null)

                    setMfaError("")

                }

                return

            }


            // ====================================
            // USUÁRIO AUTENTICADO
            // ====================================

            try {

                if (
                    ativo
                ) {

                    setMfaLoading(true)

                    setMfaError("")

                }


                const {
                    data,
                    error
                } =
                    await supabase.auth.mfa
                        .getAuthenticatorAssuranceLevel()


                if (
                    error
                ) {

                    throw error

                }


                if (
                    !ativo
                ) {

                    return

                }


                setCurrentLevel(
                    data?.currentLevel ||
                    "aal1"
                )


                setNextLevel(
                    data?.nextLevel ||
                    "aal1"
                )

            }

            catch (
                error
            ) {

                if (
                    !ativo
                ) {

                    return

                }


                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro ao verificar MFA:",
                        error
                    )

                }


                setCurrentLevel(null)

                setNextLevel(null)


                setMfaError(
                    "Não foi possível validar a segurança da sua sessão."
                )

            }

            finally {

                if (
                    ativo
                ) {

                    setMfaLoading(false)

                }

            }

        }


        verificarMFA()


        return () => {

            ativo = false

        }

    }, [
        user?.id
    ])


    // ========================================
    // VERIFICANDO SESSÃO
    // ========================================

    if (
        loading
    ) {

        return (

            <p>
                Carregando...
            </p>

        )

    }


    // ========================================
    // SEM USUÁRIO
    // ========================================

    if (
        !user
    ) {

        return children

    }


    // ========================================
    // VERIFICANDO MFA
    // ========================================

    if (
        mfaLoading
    ) {

        return (

            <p>
                Verificando segurança da conta...
            </p>

        )

    }


    // ========================================
    // ERRO AO VERIFICAR MFA
    // ========================================

    if (
        mfaError
    ) {

        return (

            <div>

                <p>
                    {mfaError}
                </p>


                <button
                    type="button"

                    onClick={
                        async () => {

                            try {

                                await supabase.auth
                                    .signOut({
                                        scope: "local"
                                    })

                            }

                            catch (
                                error
                            ) {

                                if (
                                    import.meta.env.DEV
                                ) {

                                    console.error(
                                        "Erro ao encerrar sessão:",
                                        error
                                    )

                                }

                            }


                            window.location.href =
                                "/login"

                        }
                    }
                >

                    Voltar ao login

                </button>

            </div>

        )

    }


    // ========================================
    // AAL2
    //
    // LOGIN + SEGUNDO FATOR CONFIRMADOS
    // ========================================

    if (
        currentLevel ===
        "aal2"
    ) {

        return (

            <Navigate
                to="/dashboard"
                replace
            />

        )

    }


    // ========================================
    // AAL1 -> AAL2
    //
    // POSSUI 2FA CADASTRADO,
    // MAS AINDA NÃO CONFIRMOU O CÓDIGO
    // ========================================

    if (
        currentLevel === "aal1" &&
        nextLevel === "aal2"
    ) {

        return (

            <Navigate
                to="/mfa/verify"
                replace
            />

        )

    }


    // ========================================
    // AAL1 -> AAL1
    //
    // AINDA NÃO POSSUI 2FA CONFIGURADO
    // ========================================

    if (
        currentLevel === "aal1" &&
        nextLevel === "aal1"
    ) {

        return (

            <Navigate
                to="/mfa/setup"
                replace
            />

        )

    }


    // ========================================
    // SEGURANÇA EXTRA
    //
    // ESTADO DE AUTENTICAÇÃO INESPERADO
    // ========================================

    return (

        <div>

            <p>
                Não foi possível validar a segurança da sua conta.
            </p>

        </div>

    )

}


export default PublicRoute