import {
    useEffect,
    useState
} from "react"

import {
    Navigate,
    useLocation
} from "react-router-dom"

import {
    useAuth
} from "../context/AuthContext"

import {
    supabase
} from "../services/supabaseClient"


function ProtectedRoute({ children }) {

    const {
        user,
        loading
    } = useAuth()


    const location =
        useLocation()


    // ========================================
    // ESTADOS DO MFA
    // ========================================

    const [mfaLoading, setMfaLoading] =
        useState(true)

    const [mfaStatus, setMfaStatus] =
        useState(null)

    const [mfaError, setMfaError] =
        useState("")

    const [checkedPath, setCheckedPath] =
        useState("")


    // ========================================
    // VERIFICAR MFA
    // ========================================

    useEffect(() => {

        let ativo = true


        async function verificarMFA() {

            // ====================================
            // NÃO EXISTE USUÁRIO
            // ====================================

            if (!user) {

                if (ativo) {

                    setMfaStatus(null)

                    setMfaError("")

                    setMfaLoading(false)

                    setCheckedPath(
                        location.pathname
                    )

                }

                return
            }


            try {

                if (ativo) {

                    setMfaLoading(true)

                    setMfaError("")

                }


                // ====================================
                // VERIFICA O NÍVEL DE AUTENTICAÇÃO
                // ====================================

                const {
                    data,
                    error
                } =
                    await supabase.auth.mfa
                        .getAuthenticatorAssuranceLevel()


                if (error) {

                    throw error

                }


                if (!ativo) {

                    return

                }


                // ====================================
                // AAL ATUAL
                // ====================================

                const currentLevel =
                    data?.currentLevel ||
                    "aal1"


                // ====================================
                // PRÓXIMO AAL POSSÍVEL
                // ====================================

                const nextLevel =
                    data?.nextLevel ||
                    "aal1"


                setMfaStatus({

                    currentLevel,

                    nextLevel

                })

            }

            catch (error) {

                if (!ativo) {

                    return

                }


                console.error(
                    "Erro ao verificar MFA:",
                    error
                )


                setMfaStatus(null)


                setMfaError(
                    "Não foi possível validar a autenticação em dois fatores."
                )

            }

            finally {

                if (ativo) {

                    setMfaLoading(false)

                    setCheckedPath(
                        location.pathname
                    )

                }

            }

        }


        verificarMFA()


        return () => {

            ativo = false

        }

    }, [
        user?.id,
        location.pathname
    ])


    // ========================================
    // SUPABASE AINDA VERIFICANDO A SESSÃO
    // ========================================

    if (loading) {

        return (

            <p>
                Carregando...
            </p>

        )

    }


    // ========================================
    // SEM USUÁRIO
    // ========================================

    if (!user) {

        return (

            <Navigate
                to="/login"
                replace
                state={{

                    from:
                        location.pathname

                }}
            />

        )

    }


    // ========================================
    // VERIFICANDO MFA
    // ========================================

    if (
        mfaLoading ||
        checkedPath !==
            location.pathname
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

    if (mfaError) {

        return (

            <div>

                <p>
                    {mfaError}
                </p>


                <button
                    type="button"
                    onClick={() => {

                        window.location.reload()

                    }}
                >
                    Tentar novamente
                </button>

            </div>

        )

    }


    // ========================================
    // NÍVEIS MFA
    // ========================================

    const currentLevel =
        mfaStatus?.currentLevel ||
        "aal1"


    const nextLevel =
        mfaStatus?.nextLevel ||
        "aal1"


    // ========================================
    // IDENTIFICAR ROTAS MFA
    // ========================================

    const isMFASetup =
        location.pathname ===
        "/mfa/setup"


    const isMFAVerify =
        location.pathname ===
        "/mfa/verify"


    // ========================================
    // CASO 1
    //
    // LOGIN + 2FA JÁ CONFIRMADOS
    //
    // aal2 -> aal2
    // ========================================

    if (
        currentLevel === "aal2" &&
        nextLevel === "aal2"
    ) {

        // Se já confirmou o 2FA,
        // não precisa continuar
        // nas telas de configuração.

        if (
            isMFASetup ||
            isMFAVerify
        ) {

            return (

                <Navigate
                    to="/dashboard"
                    replace
                />

            )

        }


        // Usuário completamente autenticado.
        return children

    }


    // ========================================
    // CASO 2
    //
    // TEM 2FA CADASTRADO,
    // MAS AINDA NÃO DIGITOU O CÓDIGO
    //
    // aal1 -> aal2
    // ========================================

    if (
        nextLevel === "aal2"
    ) {

        // Permite somente a página
        // onde o código será digitado.

        if (isMFAVerify) {

            return children

        }


        return (

            <Navigate
                to="/mfa/verify"
                replace
                state={{

                    from:
                        location.pathname

                }}
            />

        )

    }


    // ========================================
    // CASO 3
    //
    // NÃO TEM 2FA CONFIGURADO
    //
    // aal1 -> aal1
    // ========================================

    if (
        nextLevel === "aal1"
    ) {

        // Permite acessar somente
        // a configuração do QR Code.

        if (isMFASetup) {

            return children

        }


        return (

            <Navigate
                to="/mfa/setup"
                replace
                state={{

                    from:
                        location.pathname

                }}
            />

        )

    }


    // ========================================
    // SEGURANÇA EXTRA
    // ========================================

    return (

        <Navigate
            to="/login"
            replace
        />

    )

}


export default ProtectedRoute