import {
    useEffect,
    useState
} from "react"

import {
    useNavigate
} from "react-router-dom"

import {
    supabase
} from "../services/supabaseClient"

import Header from "./Header"
import Footer from "./Footer"

import "../styles/MFAVerify.css"


function MFAVerify() {

    const navigate =
        useNavigate()


    const [
        factorId,
        setFactorId
    ] = useState("")


    const [
        codigo,
        setCodigo
    ] = useState("")


    const [
        loading,
        setLoading
    ] = useState(true)


    const [
        verificando,
        setVerificando
    ] = useState(false)


    const [
        error,
        setError
    ] = useState("")


    // ========================================
    // CARREGAR MFA
    // ========================================

    useEffect(() => {

        let ativo =
            true


        async function carregarMFA() {

            try {

                setLoading(true)

                setError("")


                // ==================================
                // VERIFICAR NÍVEL ATUAL
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

                    navigate(
                        "/dashboard",
                        {
                            replace: true
                        }
                    )

                    return

                }


                // ==================================
                // LISTAR FATORES
                // ==================================

                const {
                    data,
                    error
                } =
                    await supabase.auth.mfa
                        .listFactors()


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


                const fatoresTotp =
                    data?.totp ||
                    []


                const fatorVerificado =
                    fatoresTotp.find(
                        (
                            fator
                        ) =>
                            fator.status ===
                            "verified"
                    )


                // ==================================
                // NÃO POSSUI MFA
                // ==================================

                if (
                    !fatorVerificado
                ) {

                    navigate(
                        "/mfa/setup",
                        {
                            replace: true
                        }
                    )

                    return

                }


                setFactorId(
                    fatorVerificado.id
                )

            }

            catch (
                err
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
                        "Erro ao carregar MFA:",
                        err
                    )

                }


                setError(
                    "Não foi possível carregar a autenticação em dois fatores."
                )

            }

            finally {

                if (
                    ativo
                ) {

                    setLoading(false)

                }

            }

        }


        carregarMFA()


        return () => {

            ativo =
                false

        }

    }, [
        navigate
    ])


    // ========================================
    // CONFIRMAR CÓDIGO
    // ========================================

    async function confirmarCodigo(
        event
    ) {

        event.preventDefault()


        if (
            verificando
        ) {

            return

        }


        const codigoLimpo =
            codigo
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

            setError(
                "Digite o código de 6 dígitos do Google Authenticator."
            )

            return

        }


        if (
            !factorId
        ) {

            setError(
                "Não foi possível identificar o autenticador."
            )

            return

        }


        try {

            setVerificando(true)

            setError("")


            // ==================================
            // VALIDAR CÓDIGO
            // ==================================

            const {
                error
            } =
                await supabase.auth.mfa
                    .challengeAndVerify({

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
                    "A sessão ainda não atingiu o nível AAL2."
                )

            }


            setCodigo("")


            navigate(
                "/dashboard",
                {
                    replace: true
                }
            )

        }

        catch (
            err
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro ao verificar 2FA:",
                    err
                )

            }


            setError(
                "Código inválido ou expirado. Confira o Google Authenticator e tente novamente."
            )

        }

        finally {

            setVerificando(false)

        }

    }


    // ========================================
    // TELA
    // ========================================

    return (

        <div className="mfa-verify-page">

            <Header />


            <main className="mfa-verify-main">

                <div className="mfa-verify-wrapper">


                    {/* ================================= */}
                    {/* CABEÇALHO                         */}
                    {/* ================================= */}

                    <section className="mfa-verify-heading">

                        <div className="mfa-verify-eyebrow">

                            <span className="mfa-verify-eyebrow-icon">
                                ◇
                            </span>

                            <span>
                                SEGURANÇA DA CONTA
                            </span>

                        </div>


                        <h1>
                            Confirme sua identidade
                        </h1>


                        <p>

                            Utilize o código temporário
                            do Google Authenticator para
                            concluir seu acesso à
                            Universidade Synter.

                        </p>

                    </section>


                    {/* ================================= */}
                    {/* CARD                              */}
                    {/* ================================= */}

                    <section className="mfa-verify-card">


                        {/* ============================= */}
                        {/* LADO ESQUERDO                 */}
                        {/* ============================= */}

                        <div className="mfa-verify-info">


                            <span className="mfa-verify-step">
                                AUTENTICAÇÃO EM DUAS ETAPAS
                            </span>


                            <h2>
                                Verificação de segurança
                            </h2>


                            <p>

                                Sua senha já foi confirmada.
                                Agora precisamos validar o
                                segundo fator de autenticação
                                antes de liberar o acesso.

                            </p>


                            <div className="mfa-verify-security-list">


                                <div className="mfa-verify-security-item">

                                    <span className="mfa-verify-security-icon">
                                        01
                                    </span>

                                    <div>

                                        <strong>
                                            Abra o aplicativo
                                        </strong>

                                        <span>
                                            Acesse o Google Authenticator no celular.
                                        </span>

                                    </div>

                                </div>


                                <div className="mfa-verify-security-item">

                                    <span className="mfa-verify-security-icon">
                                        02
                                    </span>

                                    <div>

                                        <strong>
                                            Localize a Universidade Synter
                                        </strong>

                                        <span>
                                            Veja o código temporário de 6 dígitos.
                                        </span>

                                    </div>

                                </div>


                                <div className="mfa-verify-security-item">

                                    <span className="mfa-verify-security-icon">
                                        03
                                    </span>

                                    <div>

                                        <strong>
                                            Confirme seu acesso
                                        </strong>

                                        <span>
                                            Digite o código ao lado para continuar.
                                        </span>

                                    </div>

                                </div>


                            </div>

                        </div>


                        {/* ============================= */}
                        {/* LADO DIREITO                  */}
                        {/* ============================= */}

                        <div className="mfa-verify-form-area">


                            <div className="mfa-verify-badge">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Acesso protegido
                                    </strong>

                                    <small>
                                        Google Authenticator
                                    </small>

                                </div>

                            </div>


                            <div className="mfa-verify-form-heading">

                                <h3>
                                    Código de verificação
                                </h3>

                                <p>

                                    Digite os 6 números
                                    exibidos atualmente
                                    no seu autenticador.

                                </p>

                            </div>


                            {loading && (

                                <div className="mfa-verify-loading">

                                    <div className="mfa-verify-spinner">
                                        ↻
                                    </div>

                                    <span>
                                        Verificando segurança...
                                    </span>

                                </div>

                            )}


                            {!loading && (

                                <form
                                    onSubmit={
                                        confirmarCodigo
                                    }
                                    className="mfa-verify-form"
                                >


                                    {error && (

                                        <div className="mfa-verify-error">

                                            <span>
                                                !
                                            </span>

                                            <p>
                                                {error}
                                            </p>

                                        </div>

                                    )}


                                    <label htmlFor="mfa-code">

                                        Código do Google Authenticator

                                    </label>


                                    <input
                                        id="mfa-code"

                                        type="text"

                                        inputMode="numeric"

                                        autoComplete="one-time-code"

                                        maxLength={6}

                                        placeholder="000000"

                                        value={
                                            codigo
                                        }

                                        onChange={
                                            (
                                                event
                                            ) => {

                                                const valor =
                                                    event.target.value
                                                        .replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                        .slice(
                                                            0,
                                                            6
                                                        )


                                                setCodigo(
                                                    valor
                                                )


                                                setError("")

                                            }
                                        }

                                        autoFocus

                                        disabled={
                                            verificando ||
                                            !factorId
                                        }
                                    />


                                    <button
                                        type="submit"

                                        className="mfa-verify-button"

                                        disabled={
                                            verificando ||
                                            !factorId ||
                                            codigo.length !== 6
                                        }
                                    >

                                        <span>

                                            {
                                                verificando
                                                    ? "Verificando..."
                                                    : "Confirmar acesso"
                                            }

                                        </span>


                                        {!verificando && (

                                            <span className="mfa-verify-arrow">
                                                →
                                            </span>

                                        )}

                                    </button>


                                </form>

                            )}


                            <div className="mfa-verify-help">

                                <span>
                                    i
                                </span>

                                <p>

                                    O código é renovado
                                    automaticamente pelo
                                    Google Authenticator.
                                    Caso ele expire, utilize
                                    o próximo código exibido.

                                </p>

                            </div>


                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </div>

    )

}


export default MFAVerify