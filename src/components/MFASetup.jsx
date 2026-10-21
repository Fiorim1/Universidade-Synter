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

import "../styles/MFASetup.css"


const MFA_FRIENDLY_NAME =
    "Universidade Synter"


function MFASetup() {

    const navigate =
        useNavigate()


    // ========================================
    // MFA
    // ========================================

    const [
        qrCode,
        setQrCode
    ] = useState("")


    const [
        secret,
        setSecret
    ] = useState("")


    const [
        factorId,
        setFactorId
    ] = useState("")


    const [
        codigo,
        setCodigo
    ] = useState("")


    // ========================================
    // ESTADOS
    // ========================================

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


    const [
        copied,
        setCopied
    ] = useState(false)


    // ========================================
    // PREPARAR MFA
    // ========================================

    useEffect(() => {

        let ativo =
            true


        async function iniciarMFA() {

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


                const fatoresTotp =
                    factorsData?.totp ||
                    []


                // ==================================
                // FATOR JÁ VERIFICADO
                // ==================================

                const fatorVerificado =
                    fatoresTotp.find(
                        (
                            factor
                        ) =>
                            factor.status ===
                            "verified"
                    )


                if (
                    fatorVerificado
                ) {

                    navigate(
                        "/mfa/verify",
                        {
                            replace: true
                        }
                    )

                    return

                }


                // ==================================
                // REMOVER FATORES PENDENTES
                // ==================================

                const fatoresPendentes =
                    fatoresTotp.filter(
                        (
                            factor
                        ) =>
                            factor.status ===
                                "unverified" &&
                            (
                                !factor.friendly_name ||
                                factor.friendly_name ===
                                    MFA_FRIENDLY_NAME
                            )
                    )


                for (
                    const fator of
                    fatoresPendentes
                ) {

                    const {
                        error:
                            unenrollError
                    } =
                        await supabase.auth.mfa
                            .unenroll({

                                factorId:
                                    fator.id

                            })


                    if (
                        unenrollError
                    ) {

                        throw unenrollError

                    }

                }


                if (
                    !ativo
                ) {

                    return

                }


                // ==================================
                // CRIAR NOVO TOTP
                // ==================================

                const {
                    data,
                    error:
                        enrollError
                } =
                    await supabase.auth.mfa
                        .enroll({

                            factorType:
                                "totp",

                            friendlyName:
                                MFA_FRIENDLY_NAME

                        })


                if (
                    enrollError
                ) {

                    throw enrollError

                }


                if (
                    !ativo
                ) {

                    return

                }


                if (
                    !data?.id ||
                    !data?.totp?.qr_code ||
                    !data?.totp?.secret
                ) {

                    throw new Error(
                        "Dados do MFA incompletos."
                    )

                }


                // ==================================
                // SALVAR DADOS
                // ==================================

                setFactorId(
                    data.id
                )


                setQrCode(
                    data.totp.qr_code
                )


                setSecret(
                    data.totp.secret
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
                        "Erro ao iniciar MFA:",
                        err
                    )

                }


                setError(
                    "Não foi possível iniciar a configuração da autenticação em dois fatores. Tente novamente."
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


        iniciarMFA()


        return () => {

            ativo =
                false

        }

    }, [
        navigate
    ])


    // ========================================
    // COPIAR CHAVE
    // ========================================

    async function copiarSecret() {

        if (
            !secret
        ) {

            return

        }


        try {

            await navigator.clipboard
                .writeText(
                    secret
                )


            setCopied(true)


            setTimeout(
                () => {

                    setCopied(false)

                },
                1800
            )

        }

        catch (
            err
        ) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro ao copiar chave:",
                    err
                )

            }

        }

    }


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


        setError("")


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
                "O autenticador ainda não foi preparado. Aguarde alguns segundos."
            )

            return

        }


        try {

            setVerificando(true)


            // ==================================
            // CRIAR DESAFIO
            // ==================================

            const {
                data: challengeData,
                error:
                    challengeError
            } =
                await supabase.auth.mfa
                    .challenge({

                        factorId:
                            factorId

                    })


            if (
                challengeError
            ) {

                throw challengeError

            }


            if (
                !challengeData?.id
            ) {

                throw new Error(
                    "Desafio MFA inválido."
                )

            }


            // ==================================
            // VERIFICAR CÓDIGO
            // ==================================

            const {
                error:
                    verifyError
            } =
                await supabase.auth.mfa
                    .verify({

                        factorId:
                            factorId,

                        challengeId:
                            challengeData.id,

                        code:
                            codigoLimpo

                    })


            if (
                verifyError
            ) {

                throw verifyError

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
                    "Erro ao confirmar MFA:",
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

        <div className="mfa-setup-page">

            <Header />


            <main className="mfa-setup-main">

                <div className="mfa-setup-wrapper">


                    {/* ================================= */}
                    {/* CABEÇALHO DA PÁGINA               */}
                    {/* ================================= */}

                    <section className="mfa-setup-heading">

                        <div className="mfa-setup-eyebrow">

                            <span className="mfa-setup-eyebrow-icon">
                                ◇
                            </span>

                            <span>
                                SEGURANÇA DA CONTA
                            </span>

                        </div>


                        <h1>
                            Autenticação em dois fatores
                        </h1>


                        <p>

                            Adicione uma camada extra de segurança
                            à sua conta da Universidade Synter.

                        </p>

                    </section>


                    {/* ================================= */}
                    {/* CARREGANDO                        */}
                    {/* ================================= */}

                    {loading && (

                        <section className="mfa-setup-card mfa-setup-loading">

                            <div className="mfa-loading-icon">
                                ↻
                            </div>

                            <h2>
                                Preparando autenticação
                            </h2>

                            <p>
                                Aguarde enquanto configuramos
                                seu acesso seguro.
                            </p>

                        </section>

                    )}


                    {/* ================================= */}
                    {/* CONTEÚDO                          */}
                    {/* ================================= */}

                    {!loading && (

                        <section className="mfa-setup-card">


                            {/* ========================= */}
                            {/* TOPO DO CARD              */}
                            {/* ========================= */}

                            <div className="mfa-card-header">

                                <div>

                                    <span className="mfa-card-step">
                                        ETAPA OBRIGATÓRIA
                                    </span>

                                    <h2>
                                        Configure o Google Authenticator
                                    </h2>

                                    <p>

                                        Escaneie o QR Code usando
                                        o aplicativo Google Authenticator
                                        no seu celular.

                                    </p>

                                </div>


                                <div className="mfa-security-badge">

                                    <span className="mfa-security-icon">
                                        ✓
                                    </span>

                                    <div>

                                        <strong>
                                            Acesso protegido
                                        </strong>

                                        <span>
                                            Verificação em 2 etapas
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="mfa-divider" />


                            {/* ========================= */}
                            {/* CONTEÚDO PRINCIPAL        */}
                            {/* ========================= */}

                            <div className="mfa-content-grid">


                                {/* ===================== */}
                                {/* QR CODE               */}
                                {/* ===================== */}

                                <div className="mfa-qr-area">

                                    <div className="mfa-section-number">
                                        01
                                    </div>


                                    <div className="mfa-section-title">

                                        <h3>
                                            Escaneie o QR Code
                                        </h3>

                                        <p>
                                            Abra o Google Authenticator
                                            e toque em adicionar nova conta.
                                        </p>

                                    </div>


                                    {qrCode && (

                                        <div className="mfa-qr-box">

                                            <img
                                                src={
                                                    qrCode
                                                }

                                                alt="QR Code para configurar autenticação em dois fatores"
                                            />

                                        </div>

                                    )}


                                    {secret && (

                                        <div className="mfa-manual-code">

                                            <span className="mfa-manual-label">
                                                Não consegue escanear?
                                            </span>


                                            <p>
                                                Digite manualmente esta chave
                                                no Google Authenticator.
                                            </p>


                                            <div className="mfa-secret-box">

                                                <code>
                                                    {secret}
                                                </code>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        copiarSecret
                                                    }
                                                >

                                                    {
                                                        copied
                                                            ? "Copiado"
                                                            : "Copiar"
                                                    }

                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>


                                {/* ===================== */}
                                {/* CONFIRMAÇÃO           */}
                                {/* ===================== */}

                                <div className="mfa-confirm-area">

                                    <div className="mfa-section-number">
                                        02
                                    </div>


                                    <div className="mfa-section-title">

                                        <h3>
                                            Confirme o código
                                        </h3>

                                        <p>

                                            Digite o código de 6 dígitos
                                            exibido no aplicativo para
                                            concluir a configuração.

                                        </p>

                                    </div>


                                    {error && (

                                        <div className="mfa-error">

                                            <span>
                                                !
                                            </span>

                                            <p>
                                                {error}
                                            </p>

                                        </div>

                                    )}


                                    {factorId && (

                                        <form
                                            onSubmit={
                                                confirmarCodigo
                                            }
                                            className="mfa-code-form"
                                        >

                                            <label htmlFor="mfa-code">

                                                Código de verificação

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
                                            />


                                            <button
                                                className="mfa-confirm-button"

                                                type="submit"

                                                disabled={
                                                    verificando ||
                                                    codigo.length !== 6
                                                }
                                            >

                                                <span>

                                                    {
                                                        verificando
                                                            ? "Verificando..."
                                                            : "Confirmar autenticação"
                                                    }

                                                </span>


                                                {!verificando && (
                                                    <span className="mfa-button-arrow">
                                                        →
                                                    </span>
                                                )}

                                            </button>

                                        </form>

                                    )}


                                    <div className="mfa-help-box">

                                        <span className="mfa-help-icon">
                                            i
                                        </span>

                                        <p>

                                            O código muda automaticamente
                                            a cada poucos segundos.
                                            Utilize sempre o código atual
                                            exibido no aplicativo.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>

                    )}

                </div>

            </main>


            <Footer />

        </div>

    )

}


export default MFASetup