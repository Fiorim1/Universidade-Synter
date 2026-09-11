import {
    useRef,
    useState
} from "react"

import { useNavigate } from "react-router-dom"

import { Turnstile } from "@marsidev/react-turnstile"

import Header from "../components/Header"
import Hero from "../components/Hero"
import Footer from "../components/Footer"

import { supabase } from "../services/supabaseClient"

import {
    sanitizeEmail,
    validateEmail
} from "../utils/validators"

import LockImage from "../assets/login-back.png"

import "../styles/ForgotPassword.css"


function ForgotPassword() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [captchaToken, setCaptchaToken] = useState("")
    const [message, setMessage] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [loading, setLoading] = useState(false)

    const turnstileRef = useRef(null)


    async function handleSubmit(e) {

        e.preventDefault()

        setMessage("")
        setErrorMsg("")

        const cleanEmail =
            sanitizeEmail(email)


        if (!validateEmail(cleanEmail)) {

            setErrorMsg(
                "Digite um e-mail válido."
            )

            return
        }


        if (!captchaToken) {

            setErrorMsg(
                "Confirme que você não é um robô."
            )

            return
        }


        setLoading(true)


        try {

            const { error } =
                await supabase.auth
                    .resetPasswordForEmail(
                        cleanEmail,
                        {
                            redirectTo:
                                `${window.location.origin}/update-password`,

                            captchaToken
                        }
                    )


            if (error) {

                if (import.meta.env.DEV) {

                    console.error(
                        "Erro na recuperação:",
                        error.message
                    )
                }


                setErrorMsg(
                    "Não foi possível processar a solicitação."
                )

                return
            }


            /*
                Mensagem genérica por segurança.

                Não informa se o e-mail existe
                ou não na base de usuários.
            */

            setMessage(
                "Se existir uma conta vinculada a este e-mail, enviaremos um link para redefinir sua senha."
            )

        } catch (error) {

            if (import.meta.env.DEV) {
                console.error(error)
            }


            setErrorMsg(
                "Não foi possível processar a solicitação."
            )

        } finally {

            turnstileRef.current?.reset()

            setCaptchaToken("")

            setLoading(false)
        }
    }


    return (

        <div className="forgot-page">

            <Header />


            <main className="forgot-main">

                <div className="forgot-layout">


                    {/* ========================= */}
                    {/* LADO ESQUERDO             */}
                    {/* ========================= */}

                    <section className="forgot-left">

                        <div className="forgot-content">


                            <Hero
    one="Esqueceu sua senha?"
    two="Não se preocupe!"
    three="Digite seu e-mail abaixo e enviaremos um link para redefinir sua senha."
/>


                            <form
                                className="forgot-form"
                                onSubmit={handleSubmit}
                            >


                                {/* ERRO */}

                                {errorMsg && (

                                    <div className="forgot-error">
                                        {errorMsg}
                                    </div>

                                )}



                                {/* E-MAIL */}

                                <div className="forgot-field">

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



                                {/* CAPTCHA */}

                                <div className="forgot-captcha">

                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={
                                            import.meta.env
                                                .VITE_TURNSTILE_SITE_KEY
                                        }
                                        onSuccess={
                                            setCaptchaToken
                                        }
                                        onExpire={() =>
                                            setCaptchaToken("")
                                        }
                                    />

                                </div>



                                {/* ENVIAR */}

                                <button
                                    className="forgot-submit"
                                    type="submit"
                                    disabled={loading}
                                >

                                    <span>
                                        {
                                            loading
                                                ? "Enviando..."
                                                : "Enviar link"
                                        }
                                    </span>


                                    {!loading && (

                                        <span className="forgot-submit-arrow">
                                            →
                                        </span>

                                    )}

                                </button>



                                {/* SUCESSO */}

                                {message && (

                                    <div className="forgot-success">

                                        <span className="forgot-success-icon">
                                            ✓
                                        </span>

                                        <p>
                                            {message}
                                        </p>

                                    </div>

                                )}



                                {/* VOLTAR */}

                                <button
                                    className="forgot-back"
                                    type="button"
                                    onClick={() =>
                                        navigate("/login")
                                    }
                                >
                                    ← Voltar para o login
                                </button>

                            </form>

                        </div>

                    </section>



                    {/* ========================= */}
                    {/* LADO DIREITO              */}
                    {/* ========================= */}

                    <section className="forgot-visual">

                        <div className="forgot-visual-content">


                            <div className="forgot-visual-text">

                                <span>
                                    SEGURANÇA • ACESSO
                                </span>

                                <h2>
                                    Recupere seu acesso
                                    com segurança.
                                </h2>

                                <p>
                                    Utilize o e-mail associado à sua
                                    conta para receber as instruções
                                    de redefinição de senha.
                                </p>

                            </div>


                            <img
                                src={LockImage}
                                alt="Fechadura digital Synter"
                                className="forgot-lock-image"
                            />

                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </div>

    )

}


export default ForgotPassword