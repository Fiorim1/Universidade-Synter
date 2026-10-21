import {
    useState,
    useRef
} from "react"

import {
    useNavigate
} from "react-router-dom"

import {
    Turnstile
} from "@marsidev/react-turnstile"

import {
    supabase
} from "../services/supabaseClient"

import {
    validateEmail,
    sanitizeEmail
} from "../utils/validators"

import Header from "../components/Header"
import Footer from "../components/Footer"

import LockImage from "../assets/venuss3.png"

import "../styles/Login.css"


function Login() {

    const navigate =
        useNavigate()


    // ========================================
    // CAMPOS
    // ========================================

    const [email, setEmail] =
        useState("")

    const [password, setPassword] =
        useState("")

    const [captchaToken, setCaptchaToken] =
        useState("")


    // ========================================
    // ESTADOS
    // ========================================

    const [errorMsg, setErrorMsg] =
        useState("")

    const [loading, setLoading] =
        useState(false)


    // ========================================
    // TURNSTILE
    // ========================================

    const turnstileRef =
        useRef(null)


    // ========================================
    // LOGIN
    // ========================================

    async function handleSubmit(e) {

        e.preventDefault()

        setErrorMsg("")


        // ====================================
        // E-MAIL
        // ====================================

        const cleanEmail =
            sanitizeEmail(
                email
            )


        if (
            !validateEmail(
                cleanEmail
            )
        ) {

            setErrorMsg(
                "Digite um e-mail válido."
            )

            return
        }


        // ====================================
        // SENHA
        // ====================================

        if (
            !password
        ) {

            setErrorMsg(
                "Digite sua senha."
            )

            return
        }


        // ====================================
        // CAPTCHA
        // ====================================

        if (
            !captchaToken
        ) {

            setErrorMsg(
                "Confirme que você não é um robô."
            )

            return
        }


        // ====================================
        // INICIAR LOGIN
        // ====================================

        setLoading(true)


        try {


            // ==================================
            // PRIMEIRO FATOR
            //
            // E-MAIL + SENHA
            // ==================================

            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({

                        email:
                            cleanEmail,

                        password:
                            password,

                        options: {

                            captchaToken:
                                captchaToken

                        }

                    })


            // ==================================
            // ERRO DE LOGIN
            // ==================================

            if (error) {

                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro no login:",
                        error.message
                    )

                }


                setErrorMsg(
                    "E-mail ou senha inválidos."
                )

                return
            }


            // ==================================
            // GARANTIA DE USUÁRIO
            // ==================================

            if (
                !data?.user
            ) {

                setErrorMsg(
                    "Não foi possível autenticar sua conta."
                )

                return
            }


            // ==================================
            // VERIFICAR MFA
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


            // ==================================
            // NÍVEL ATUAL
            // ==================================

            const currentLevel =
                aalData?.currentLevel ||
                "aal1"


            // ==================================
            // PRÓXIMO NÍVEL POSSÍVEL
            // ==================================

            const nextLevel =
                aalData?.nextLevel ||
                "aal1"


            // ==================================
            // CASO 1
            //
            // MFA JÁ CONFIRMADO NESTA SESSÃO
            //
            // aal2 -> aal2
            // ==================================

            if (
                currentLevel === "aal2" &&
                nextLevel === "aal2"
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
            // CASO 2
            //
            // JÁ POSSUI GOOGLE AUTHENTICATOR
            // MAS AINDA NÃO CONFIRMOU O CÓDIGO
            //
            // aal1 -> aal2
            // ==================================

            if (
                currentLevel === "aal1" &&
                nextLevel === "aal2"
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
            // CASO 3
            //
            // AINDA NÃO POSSUI MFA
            //
            // aal1 -> aal1
            // ==================================

            if (
                currentLevel === "aal1" &&
                nextLevel === "aal1"
            ) {

                navigate(
                    "/mfa/setup",
                    {
                        replace: true
                    }
                )

                return
            }


            // ==================================
            // SITUAÇÃO INESPERADA
            // ==================================

            await supabase.auth
                .signOut()


            setErrorMsg(
                "Não foi possível validar a segurança da sua conta. Entre novamente."
            )

        }

        catch (error) {

            if (
                import.meta.env.DEV
            ) {

                console.error(
                    "Erro ao verificar autenticação:",
                    error
                )

            }


            /*
                Se não conseguirmos descobrir
                corretamente o estado do MFA,
                não deixamos a sessão aberta.

                Isso evita liberar acesso em
                uma condição de segurança
                desconhecida.
            */

            try {

                await supabase.auth
                    .signOut()

            }

            catch (
                signOutError
            ) {

                if (
                    import.meta.env.DEV
                ) {

                    console.error(
                        "Erro ao encerrar sessão:",
                        signOutError
                    )

                }

            }


            setErrorMsg(
                "Não foi possível concluir a autenticação. Tente novamente."
            )

        }

        finally {


            // ==================================
            // FINALIZA CARREGAMENTO
            // ==================================

            setLoading(false)


            // ==================================
            // RESETAR CAPTCHA
            // ==================================

            turnstileRef.current
                ?.reset()


            setCaptchaToken("")

        }

    }


    return (

        <div className="login-page">

            <Header />


            <main className="login-main">

                <div className="login-container">


                    {/* ========================= */}
                    {/* LADO ESQUERDO             */}
                    {/* ========================= */}

                    <section className="login-left">

                        <div className="login-content">


                            <div className="login-heading">

                                <span className="login-small-title">
                                    UNIVERSIDADE SYNTER
                                </span>

                                <h1>
                                    Bem-vindo de volta.
                                </h1>

                                <p>
                                    Acesse sua conta para continuar
                                    explorando conteúdos, treinamentos
                                    e materiais Synter.
                                </p>

                            </div>


                            <form
                                className="login-form"
                                onSubmit={
                                    handleSubmit
                                }
                            >


                                {/* ===================== */}
                                {/* ERRO                  */}
                                {/* ===================== */}

                                {errorMsg && (

                                    <div className="auth-error">
                                        {errorMsg}
                                    </div>

                                )}


                                {/* ===================== */}
                                {/* E-MAIL                */}
                                {/* ===================== */}

                                <div className="login-field">

                                    <label htmlFor="email">
                                        E-mail
                                    </label>

                                    <input
                                        id="email"
                                        type="email"

                                        value={
                                            email
                                        }

                                        onChange={
                                            (e) =>
                                                setEmail(
                                                    e.target.value
                                                )
                                        }

                                        placeholder="seuemail@empresa.com"

                                        autoComplete="email"

                                        required
                                    />

                                </div>


                                {/* ===================== */}
                                {/* SENHA                 */}
                                {/* ===================== */}

                                <div className="login-field">

                                    <div className="login-password-header">

                                        <label htmlFor="password">
                                            Senha
                                        </label>


                                        <button
                                            className="forgot-password"
                                            type="button"

                                            onClick={
                                                () =>
                                                    navigate(
                                                        "/forgot-password"
                                                    )
                                            }
                                        >

                                            Esqueci minha senha

                                        </button>

                                    </div>


                                    <input
                                        id="password"
                                        type="password"

                                        value={
                                            password
                                        }

                                        onChange={
                                            (e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                        }

                                        placeholder="Digite sua senha"

                                        autoComplete="current-password"

                                        required
                                    />

                                </div>


                                {/* ===================== */}
                                {/* CAPTCHA               */}
                                {/* ===================== */}

                                <div className="captcha-container">

                                    <Turnstile
                                        ref={
                                            turnstileRef
                                        }

                                        siteKey={
                                            import.meta.env
                                                .VITE_TURNSTILE_SITE_KEY
                                        }

                                        onSuccess={
                                            setCaptchaToken
                                        }

                                        onExpire={
                                            () =>
                                                setCaptchaToken("")
                                        }
                                    />

                                </div>


                                {/* ===================== */}
                                {/* ENTRAR                */}
                                {/* ===================== */}

                                <button
                                    className="login-submit"
                                    type="submit"

                                    disabled={
                                        loading
                                    }
                                >

                                    <span>

                                        {
                                            loading
                                                ? "Verificando..."
                                                : "Entrar"
                                        }

                                    </span>


                                    {!loading && (

                                        <span className="login-submit-arrow">
                                            →
                                        </span>

                                    )}

                                </button>


                                {/* ===================== */}
                                {/* CRIAR CONTA           */}
                                {/* ===================== */}

                                <div className="create-account">

                                    <span>
                                        Ainda não possui uma conta?
                                    </span>

                                    <button
                                        type="button"

                                        onClick={
                                            () =>
                                                navigate(
                                                    "/register"
                                                )
                                        }
                                    >

                                        Criar conta

                                    </button>

                                </div>

                            </form>

                        </div>

                    </section>


                    {/* ========================= */}
                    {/* LADO DIREITO              */}
                    {/* ========================= */}

                    <section className="login-visual">

                        <div className="login-visual-content">

                            <div className="login-visual-text">

                                <span>
                                    TECNOLOGIA • CONHECIMENTO
                                </span>

                                <h2>
                                    Tudo sobre a Synter
                                    em um só lugar.
                                </h2>

                                <p>
                                    Uma plataforma criada para
                                    conectar pessoas, produtos e
                                    conhecimento.
                                </p>

                            </div>


                            <img
                                src={
                                    LockImage
                                }

                                alt="Fechadura digital Synter"

                                className="login-lock-image"
                            />

                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </div>

    )

}


export default Login