import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Turnstile } from "@marsidev/react-turnstile"

import { supabase } from "../services/supabaseClient"

import {
    validateEmail,
    sanitizeEmail
} from "../utils/validators"

import Header from "../components/Header"
import Footer from "../components/Footer"

import LockImage from "../assets/login-back.png"

import "../styles/Login.css"


function Login() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [captchaToken, setCaptchaToken] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [loading, setLoading] = useState(false)

    const turnstileRef = useRef(null)


    async function handleSubmit(e) {

        e.preventDefault()

        setErrorMsg("")

        const cleanEmail = sanitizeEmail(email)


        if (!validateEmail(cleanEmail)) {

            setErrorMsg("Digite um e-mail válido.")

            return
        }


        if (!captchaToken) {

            setErrorMsg("Confirme que você não é um robô.")

            return
        }


        setLoading(true)


        const { data, error } =
            await supabase.auth.signInWithPassword({

                email: cleanEmail,

                password: password,

                options: {
                    captchaToken: captchaToken
                }

            })


        setLoading(false)

        turnstileRef.current?.reset()

        setCaptchaToken("")


        if (error) {

            console.error(
                "Erro no login:",
                error.message
            )

            setErrorMsg(
                "E-mail ou senha inválidos."
            )

            return
        }


        console.log(
            "Usuário logado:",
            data.user
        )


        navigate(
            "/dashboard",
            { replace: true }
        )
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
                                onSubmit={handleSubmit}
                            >


                                {errorMsg && (

                                    <div className="auth-error">
                                        {errorMsg}
                                    </div>

                                )}


                                {/* E-mail */}

                                <div className="login-field">

                                    <label htmlFor="email">
                                        E-mail
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="seuemail@empresa.com"
                                        autoComplete="email"
                                        required
                                    />

                                </div>


                                {/* Senha */}

                                <div className="login-field">

                                    <div className="login-password-header">

                                        <label htmlFor="password">
                                            Senha
                                        </label>


                                        <button
                                            className="forgot-password"
                                            type="button"
                                            onClick={() =>
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
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Digite sua senha"
                                        autoComplete="current-password"
                                        required
                                    />

                                </div>


                                {/* CAPTCHA */}

                                <div className="captcha-container">

                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={
                                            import.meta.env
                                                .VITE_TURNSTILE_SITE_KEY
                                        }
                                        onSuccess={setCaptchaToken}
                                        onExpire={() =>
                                            setCaptchaToken("")
                                        }
                                    />

                                </div>


                                {/* Entrar */}

                                <button
                                    className="login-submit"
                                    type="submit"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "Entrando..."
                                            : "Entrar"
                                        }
                                    </span>

                                    {!loading && (
                                        <span className="login-submit-arrow">
                                            →
                                        </span>
                                    )}

                                </button>


                                {/* Criar conta */}

                                <div className="create-account">

                                    <span>
                                        Ainda não possui uma conta?
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/register")
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
                                src={LockImage}
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