import {
    useRef,
    useState
} from "react"

import { Turnstile } from "@marsidev/react-turnstile"

import Header from "../components/Header"
import Hero from "../components/Hero"
import Footer from "../components/Footer"

import { supabase } from "../services/supabaseClient"

import {
    sanitizeEmail,
    validateEmail
} from "../utils/validators"

import "../styles/ForgotPassword.css"


function ForgotPassword() {

    const [
        email,
        setEmail
    ] = useState("")

    const [
        captchaToken,
        setCaptchaToken
    ] = useState("")

    const [
        message,
        setMessage
    ] = useState("")

    const [
        errorMsg,
        setErrorMsg
    ] = useState("")

    const [
        loading,
        setLoading
    ] = useState(false)

    const turnstileRef =
        useRef(null)



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

                            // O endereço precisa estar
                            // autorizado nas Redirect URLs
                            // do Supabase.
                            redirectTo:
                                `${window.location.origin}/update-password`,

                            // CAPTCHA enviado ao backend.
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


            // Nunca dizemos:
            //
            // "e-mail não encontrado"
            //
            // pois isso permitiria enumeração
            // de usuários cadastrados.
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

        <div>

            <Header />


            <Hero
                one="Esqueceu sua senha?"
                two="Não se preocupe!"
                three="Digite seu e-mail abaixo e enviaremos um link para redefinir sua senha."
            />


            <form onSubmit={handleSubmit}>

                <div className="forgot-password-container">

                    <h4>
                        Digite seu E-mail
                    </h4>


                    {errorMsg && (

                        <p className="auth-error">
                            {errorMsg}
                        </p>

                    )}



                    <div className="forgot-password">

                        <label htmlFor="email">
                            E-mail:
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

                            autoComplete="email"

                            required
                        />

                    </div>



                    <div className="captcha-container">

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



                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Enviando..."
                                : "Enviar Link"
                        }

                    </button>



                    {message && (

                        <p className="forgot-message">
                            {message}
                        </p>

                    )}

                </div>

            </form>


            <Footer />

        </div>

    )

}


export default ForgotPassword