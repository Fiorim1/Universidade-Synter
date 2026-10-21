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


const MFA_FRIENDLY_NAME =
    "Universidade Synter"


function MFASetup() {

    const navigate =
        useNavigate()


    // ========================================
    // DADOS DO MFA
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


    // ========================================
    // CÓDIGO DIGITADO
    // ========================================

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
                // PROCURAR FATOR JÁ VERIFICADO
                // ==================================

                const fatorVerificado =
                    fatoresTotp.find(
                        (
                            factor
                        ) =>
                            factor.status ===
                            "verified"
                    )


                // ==================================
                // JÁ POSSUI GOOGLE AUTHENTICATOR
                // ==================================

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
                // REMOVER FATORES PENDENTES ANTIGOS
                // ==================================

                /*
                    O enroll cria inicialmente um
                    fator "unverified".

                    Se o usuário atualizar a página
                    antes de terminar, aquele fator
                    pode continuar pendente.

                    Removemos somente fatores TOTP
                    não verificados criados para
                    Universidade Synter.
                */

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
                // CRIAR NOVO FATOR TOTP
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


                // ==================================
                // VALIDAR RESPOSTA
                // ==================================

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


        // ======================================
        // LIMPAR CÓDIGO
        // ======================================

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


        // ======================================
        // VALIDAR CÓDIGO
        // ======================================

        if (
            codigoLimpo.length !==
            6
        ) {

            setError(
                "Digite o código de 6 dígitos do Google Authenticator."
            )

            return

        }


        // ======================================
        // VALIDAR FATOR
        // ======================================

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


            // ==================================
            // LIMPAR CÓDIGO
            // ==================================

            setCodigo("")


            // ==================================
            // LIBERAR SISTEMA
            // ==================================

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
    // CARREGANDO
    // ========================================

    if (
        loading
    ) {

        return (

            <div>

                <h2>
                    Preparando autenticação...
                </h2>

                <p>
                    Aguarde alguns segundos.
                </p>

            </div>

        )

    }


    // ========================================
    // TELA
    // ========================================

    return (

        <div>


            <h1>
                Configurar autenticação em dois fatores
            </h1>


            <p>
                Abra o Google Authenticator no seu celular.
            </p>


            <p>
                Adicione uma nova conta e escaneie o QR Code abaixo.
            </p>


            {/* ================================= */}
            {/* ERRO                              */}
            {/* ================================= */}

            {error && (

                <p>
                    {error}
                </p>

            )}


            {/* ================================= */}
            {/* QR CODE                           */}
            {/* ================================= */}

            {qrCode && (

                <div>

                    <img
                        src={
                            qrCode
                        }

                        alt="QR Code para configurar autenticação em dois fatores"
                    />

                </div>

            )}


            {/* ================================= */}
            {/* CÓDIGO MANUAL                     */}
            {/* ================================= */}

            {secret && (

                <>

                    <p>

                        Caso não consiga escanear
                        o QR Code, utilize o código
                        abaixo:

                    </p>


                    <strong>

                        {secret}

                    </strong>

                </>

            )}


            {/* ================================= */}
            {/* CONFIRMAÇÃO                       */}
            {/* ================================= */}

            {factorId && (

                <form
                    onSubmit={
                        confirmarCodigo
                    }
                >

                    <p>

                        Digite o código de 6 dígitos
                        exibido no Google Authenticator.

                    </p>


                    <input
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
                    />


                    <button
                        type="submit"

                        disabled={
                            verificando ||
                            codigo.length !== 6
                        }
                    >

                        {
                            verificando
                                ? "Verificando..."
                                : "Confirmar 2FA"
                        }

                    </button>


                </form>

            )}


        </div>

    )

}


export default MFASetup