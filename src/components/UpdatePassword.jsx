import {
    useEffect,
    useState
} from "react"

import {
    useNavigate
} from "react-router-dom"

import Header from "../components/Header"
import Hero from "../components/Hero"
import Footer from "../components/Footer"

import {
    supabase
} from "../services/supabaseClient"

import {
    useAuth
} from "../context/AuthContext"

import {
    validatePassword
} from "../utils/validators"

import "../styles/UpdatePassword.css"


function UpdatePassword() {

    const navigate =
        useNavigate()


    const {
        session,
        loading: authLoading,
        isPasswordRecovery,
        clearPasswordRecovery
    } = useAuth()


    // ========================================
    // SENHA
    // ========================================

    const [
        password,
        setPassword
    ] = useState("")


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("")


    // ========================================
    // MFA
    // ========================================

    const [
        factorId,
        setFactorId
    ] = useState("")


    const [
        mfaCode,
        setMfaCode
    ] = useState("")


    const [
        mfaVerified,
        setMfaVerified
    ] = useState(false)


    const [
        mfaLoading,
        setMfaLoading
    ] = useState(true)


    const [
        mfaVerifying,
        setMfaVerifying
    ] = useState(false)


    const [
        mfaError,
        setMfaError
    ] = useState("")


    const [
        hasMFA,
        setHasMFA
    ] = useState(null)


    // ========================================
    // MENSAGENS
    // ========================================

    const [
        errorMsg,
        setErrorMsg
    ] = useState("")


    const [
        successMsg,
        setSuccessMsg
    ] = useState("")


    // ========================================
    // CARREGAMENTO DA TROCA DE SENHA
    // ========================================

    const [
        loading,
        setLoading
    ] = useState(false)


    // ========================================
    // RECUPERAÇÃO VÁLIDA
    // ========================================

    const recoveryReady =
        Boolean(
            session &&
            isPasswordRecovery
        )


    // ========================================
    // VERIFICAR MFA DA CONTA
    // ========================================

    useEffect(() => {

        let ativo = true


        async function verificarMFA() {

            // Ainda carregando autenticação
            if (
                authLoading
            ) {

                return

            }


            // Link inválido ou não é recuperação
            if (
                !recoveryReady
            ) {

                if (ativo) {

                    setMfaLoading(false)

                    setHasMFA(null)

                    setMfaVerified(false)

                }

                return

            }


            try {

                if (ativo) {

                    setMfaLoading(true)

                    setMfaError("")

                }


                // ==================================
                // VERIFICAR NÍVEL AAL
                // ==================================

                const {
                    data: aalData,
                    error: aalError
                } =
                    await supabase.auth.mfa
                        .getAuthenticatorAssuranceLevel()


                if (
                    aalError
                ) {

                    throw aalError

                }


                if (
                    !ativo
                ) {

                    return

                }


                // ==================================
                // JÁ ESTÁ EM AAL2
                // ==================================

                if (
                    aalData?.currentLevel ===
                    "aal2"
                ) {

                    setHasMFA(true)

                    setMfaVerified(true)

                    setMfaLoading(false)

                    return

                }


                // ==================================
                // LISTAR FATORES
                // ==================================

                const {
                    data: factorsData,
                    error: factorsError
                } =
                    await supabase.auth.mfa
                        .listFactors()


                if (
                    factorsError
                ) {

                    throw factorsError

                }


                if (
                    !ativo
                ) {

                    return

                }


                // ==================================
                // PROCURAR TOTP VERIFICADO
                // ==================================

                const fatoresTotp =
                    factorsData?.totp ||
                    []


                const fatorVerificado =
                    fatoresTotp.find(
                        (
                            factor
                        ) =>
                            factor.status ===
                            "verified"
                    )


                // ==================================
                // NÃO POSSUI 2FA
                // ==================================

                if (
                    !fatorVerificado
                ) {

                    setHasMFA(false)

                    setFactorId("")

                    setMfaVerified(false)

                    return

                }


                // ==================================
                // POSSUI 2FA
                // ==================================

                setHasMFA(true)

                setFactorId(
                    fatorVerificado.id
                )

                setMfaVerified(false)

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


                setMfaError(
                    "Não foi possível validar a autenticação em dois fatores."
                )


                setMfaVerified(false)

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
        authLoading,
        recoveryReady,
        session?.access_token
    ])


    // ========================================
    // CONFIRMAR CÓDIGO DO AUTHENTICATOR
    // ========================================

    async function handleVerifyMFA(
        e
    ) {

        e.preventDefault()


        if (
            mfaVerifying
        ) {

            return

        }


        setMfaError("")

        setErrorMsg("")


        // ====================================
        // VALIDAR RECUPERAÇÃO
        // ====================================

        if (
            !recoveryReady
        ) {

            setMfaError(
                "O link de recuperação é inválido ou expirou."
            )

            return

        }


        // ====================================
        // VALIDAR FATOR
        // ====================================

        if (
            !factorId
        ) {

            setMfaError(
                "Não foi possível identificar o Google Authenticator cadastrado."
            )

            return

        }


        // ====================================
        // LIMPAR CÓDIGO
        // ====================================

        const codigoLimpo =
            mfaCode
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    6
                )


        if (
            codigoLimpo.length !==
            6
        ) {

            setMfaError(
                "Digite o código de 6 dígitos do Google Authenticator."
            )

            return

        }


        try {

            setMfaVerifying(true)


            // ==================================
            // DESAFIAR + VERIFICAR
            // ==================================

            const {
                error
            } =
                await supabase.auth.mfa
                    .challengeAndVerify({

                        factorId:
                            factorId,

                        code:
                            codigoLimpo

                    })


            if (
                error
            ) {

                throw error

            }


            // ==================================
            // CONFIRMAR AAL2
            // ==================================

            const {
                data: aalData,
                error: aalError
            } =
                await supabase.auth.mfa
                    .getAuthenticatorAssuranceLevel()


            if (
                aalError
            ) {

                throw aalError

            }


            if (
                aalData?.currentLevel !==
                "aal2"
            ) {

                throw new Error(
                    "A sessão não atingiu o nível AAL2."
                )

            }


            // ==================================
            // MFA CONFIRMADO
            // ==================================

            setMfaCode("")

            setMfaVerified(true)

            setMfaError("")

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro ao confirmar MFA:",
                    error
                )

            }


            setMfaVerified(false)


            setMfaError(
                "Código inválido ou expirado. Confira o Google Authenticator e tente novamente."
            )

        }

        finally {

            setMfaVerifying(false)

        }

    }


    // ========================================
    // ALTERAR SENHA
    // ========================================

    async function handleSubmit(
        e
    ) {

        e.preventDefault()


        setErrorMsg("")

        setSuccessMsg("")


        // ====================================
        // VERIFICAR LINK DE RECUPERAÇÃO
        // ====================================

        if (
            authLoading ||
            !recoveryReady
        ) {

            setErrorMsg(
                "O link de recuperação é inválido ou expirou."
            )

            return

        }


        // ====================================
        // MFA OBRIGATÓRIO
        // ====================================

        if (
            !mfaVerified
        ) {

            setErrorMsg(
                "Confirme primeiro o código do Google Authenticator."
            )

            return

        }


        // ====================================
        // CONFIRMAR NOVAMENTE AAL2
        // ====================================

        try {

            const {
                data: aalData,
                error: aalError
            } =
                await supabase.auth.mfa
                    .getAuthenticatorAssuranceLevel()


            if (
                aalError
            ) {

                throw aalError

            }


            if (
                aalData?.currentLevel !==
                "aal2"
            ) {

                setMfaVerified(false)


                setErrorMsg(
                    "Sua autenticação em dois fatores precisa ser confirmada novamente."
                )

                return

            }

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro ao validar AAL2:",
                    error
                )

            }


            setMfaVerified(false)


            setErrorMsg(
                "Não foi possível validar a autenticação em dois fatores."
            )

            return

        }


        // ====================================
        // VALIDAR NOVA SENHA
        // ====================================

        const passwordErrors =
            validatePassword(
                password
            )


        if (
            passwordErrors.length >
            0
        ) {

            setErrorMsg(
                passwordErrors.join(
                    " • "
                )
            )

            return

        }


        // ====================================
        // CONFIRMAR SENHAS
        // ====================================

        if (
            password !==
            confirmPassword
        ) {

            setErrorMsg(
                "As senhas não coincidem."
            )

            return

        }


        // ====================================
        // ATUALIZAR
        // ====================================

        setLoading(true)


        try {

            // ==================================
            // ALTERAR SENHA NO SUPABASE
            // ==================================

            const {
                error
            } =
                await supabase.auth
                    .updateUser({

                        password

                    })


            if (
                error
            ) {

                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro ao alterar senha:",
                        error.message
                    )

                }


                setErrorMsg(
                    "Não foi possível atualizar a senha."
                )

                return

            }


            // ==================================
            // LIMPAR RECUPERAÇÃO
            // ==================================

            clearPasswordRecovery()


            // ==================================
            // ENCERRAR SESSÃO TEMPORÁRIA
            // ==================================

            const {
                error: signOutError
            } =
                await supabase.auth
                    .signOut({

                        scope:
                            "local"

                    })


            if (
                signOutError
            ) {

                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro ao encerrar sessão:",
                        signOutError.message
                    )

                }


                setErrorMsg(
                    "A senha foi alterada, mas não foi possível encerrar a sessão atual."
                )

                return

            }


            // ==================================
            // LIMPAR DADOS
            // ==================================

            setPassword("")

            setConfirmPassword("")

            setMfaCode("")

            setMfaVerified(false)


            // ==================================
            // SUCESSO
            // ==================================

            setSuccessMsg(
                "Senha atualizada com sucesso!"
            )


            // ==================================
            // VOLTAR AO LOGIN
            // ==================================

            setTimeout(
                () => {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    )

                },
                1500
            )

        }

        catch (
            error
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    error
                )

            }


            setErrorMsg(
                "Não foi possível atualizar a senha."
            )

        }

        finally {

            setLoading(false)

        }

    }


    // ========================================
    // TELA
    // ========================================

    return (

        <div>

            <Header />


            <Hero
                one="Redefinição de senha"
                two="Proteja sua conta"
                three="Confirme sua autenticação em dois fatores e defina uma nova senha."
            />


            <div className="update-container">


                {/* ================================= */}
                {/* LINK INVÁLIDO                     */}
                {/* ================================= */}

                {!authLoading &&
                 !recoveryReady && (

                    <div className="update-password-container">

                        <h2>
                            Link inválido
                        </h2>


                        <p className="auth-error">

                            O link de recuperação é inválido ou expirou.

                        </p>

                    </div>

                )}


                {/* ================================= */}
                {/* CARREGANDO MFA                    */}
                {/* ================================= */}

                {recoveryReady &&
                 mfaLoading && (

                    <div className="update-password-container">

                        <h2>
                            Verificando segurança
                        </h2>


                        <p>
                            Aguarde enquanto verificamos
                            a autenticação da sua conta.
                        </p>

                    </div>

                )}


                {/* ================================= */}
                {/* CONTA SEM MFA                     */}
                {/* ================================= */}

                {recoveryReady &&
                 !mfaLoading &&
                 hasMFA === false && (

                    <div className="update-password-container">

                        <h2>
                            2FA obrigatório
                        </h2>


                        <p className="auth-error">

                            Esta conta ainda não possui
                            autenticação em dois fatores
                            configurada. Por segurança,
                            a senha não pode ser alterada
                            por este fluxo.

                        </p>


                        <p>

                            Entre na sua conta e configure
                            o Google Authenticator antes
                            de realizar alterações de senha.

                        </p>

                    </div>

                )}


                {/* ================================= */}
                {/* CONFIRMAR GOOGLE AUTHENTICATOR    */}
                {/* ================================= */}

                {recoveryReady &&
                 !mfaLoading &&
                 hasMFA === true &&
                 !mfaVerified && (

                    <form
                        onSubmit={
                            handleVerifyMFA
                        }
                    >

                        <div className="update-password-container">

                            <h2>
                                Confirme o 2FA
                            </h2>


                            <p>

                                Abra o Google Authenticator
                                e informe o código de
                                6 dígitos da Universidade Synter.

                            </p>


                            {mfaError && (

                                <p className="auth-error">

                                    {mfaError}

                                </p>

                            )}


                            <div className="update-password-input">

                                <label htmlFor="mfaCode">

                                    Código do Google Authenticator:

                                </label>


                                <input
                                    id="mfaCode"

                                    type="text"

                                    inputMode="numeric"

                                    autoComplete="one-time-code"

                                    maxLength={6}

                                    value={
                                        mfaCode
                                    }

                                    onChange={
                                        (
                                            e
                                        ) => {

                                            const valor =
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        6
                                                    )


                                            setMfaCode(
                                                valor
                                            )


                                            setMfaError("")

                                        }
                                    }

                                    placeholder="000000"

                                    disabled={
                                        mfaVerifying
                                    }

                                    required
                                />

                            </div>


                            <button
                                type="submit"

                                disabled={
                                    mfaVerifying ||
                                    mfaCode.length !== 6
                                }
                            >

                                {
                                    mfaVerifying
                                        ? "Verificando..."
                                        : "Confirmar 2FA"
                                }

                            </button>

                        </div>

                    </form>

                )}


                {/* ================================= */}
                {/* NOVA SENHA                        */}
                {/* ================================= */}

                {recoveryReady &&
                 !mfaLoading &&
                 mfaVerified && (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="update-password-container">

                            <h2>
                                Nova Senha
                            </h2>


                            <p className="auth-success">

                                Autenticação em dois fatores confirmada.

                            </p>


                            {errorMsg && (

                                <p className="auth-error">

                                    {errorMsg}

                                </p>

                            )}


                            {successMsg && (

                                <p className="auth-success">

                                    {successMsg}

                                </p>

                            )}


                            {/* ===================== */}
                            {/* NOVA SENHA            */}
                            {/* ===================== */}

                            <div className="update-password-input">

                                <label htmlFor="password">

                                    Nova senha:

                                </label>


                                <input
                                    id="password"

                                    type="password"

                                    value={
                                        password
                                    }

                                    onChange={
                                        (
                                            e
                                        ) =>
                                            setPassword(
                                                e.target.value
                                            )
                                    }

                                    autoComplete="new-password"

                                    minLength={8}

                                    disabled={
                                        loading
                                    }

                                    required
                                />

                            </div>


                            {/* ===================== */}
                            {/* CONFIRMAR SENHA       */}
                            {/* ===================== */}

                            <div className="update-password-input">

                                <label htmlFor="confirmPassword">

                                    Confirme sua nova senha:

                                </label>


                                <input
                                    id="confirmPassword"

                                    type="password"

                                    value={
                                        confirmPassword
                                    }

                                    onChange={
                                        (
                                            e
                                        ) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                    }

                                    autoComplete="new-password"

                                    minLength={8}

                                    disabled={
                                        loading
                                    }

                                    required
                                />

                            </div>


                            {/* ===================== */}
                            {/* ATUALIZAR             */}
                            {/* ===================== */}

                            <button
                                type="submit"

                                disabled={
                                    loading ||
                                    !mfaVerified
                                }
                            >

                                {
                                    loading
                                        ? "Atualizando..."
                                        : "Atualizar Senha"
                                }

                            </button>

                        </div>

                    </form>

                )}


            </div>


            <Footer />

        </div>

    )

}


export default UpdatePassword