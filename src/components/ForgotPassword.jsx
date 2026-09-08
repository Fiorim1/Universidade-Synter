import { useState, useRef } from "react"

// Componente do Cloudflare Turnstile
import { Turnstile } from "@marsidev/react-turnstile"

import Header from "./Header"
import Hero from "./Hero"
import Footer from "./Footer"

// Cliente do Supabase
import { supabase } from "../services/supabaseClient"

// Validações utilizadas no projeto
import {
    validateEmail,
    sanitizeEmail
} from "../utils/validators"

import "../styles/ForgotPassword.css"


function ForgotPassword() {

    // Guarda o e-mail digitado pelo usuário
    const [email, setEmail] = useState("")

    // Guarda o token gerado pelo CAPTCHA
    const [captchaToken, setCaptchaToken] = useState("")

    // Guarda mensagens exibidas para o usuário
    const [message, setMessage] = useState("")

    // Guarda mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Controla o botão enquanto a solicitação é processada
    const [loading, setLoading] = useState(false)

    // Permite resetar o Cloudflare Turnstile
    const turnstileRef = useRef(null)



    // Função executada quando o formulário é enviado
    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        // Limpa mensagens anteriores
        setMessage("")
        setErrorMsg("")


        // Remove espaços e converte o e-mail para minúsculo
        const cleanEmail = sanitizeEmail(email)


        // Verifica se o e-mail possui formato válido
        if (!validateEmail(cleanEmail)) {

            setErrorMsg("Digite um e-mail válido.")

            return
        }


        // Verifica se o CAPTCHA foi concluído
        if (!captchaToken) {

            setErrorMsg("Confirme que você não é um robô.")

            return
        }


        // Ativa o estado de carregamento
        setLoading(true)


        try {

            // Solicita ao Supabase o envio do link
            // de redefinição de senha
            const { error } =
                await supabase.auth.resetPasswordForEmail(
                    cleanEmail,
                    {
                        // Depois que o usuário clicar no link
                        // recebido por e-mail, será enviado
                        // para esta página
                        redirectTo:
                            `${window.location.origin}/update-password`,

                        // Token do Cloudflare Turnstile
                        captchaToken: captchaToken
                    }
                )


            // Caso o Supabase retorne algum erro
            if (error) {

                console.error(
                    "Erro na recuperação de senha:",
                    error.message
                )

                setErrorMsg(
                    "Não foi possível processar a solicitação. Tente novamente."
                )

                return
            }


            // Por segurança, não informamos se
            // o e-mail existe ou não no sistema
            setMessage(
                "Se existir uma conta vinculada a este e-mail, enviaremos um link para redefinir sua senha."
            )

        } catch (error) {

            // Trata erros inesperados
            console.error(
                "Erro inesperado:",
                error
            )

            setErrorMsg(
                "Não foi possível processar a solicitação. Tente novamente."
            )

        } finally {

            // Finaliza o carregamento
            setLoading(false)

            // Reseta o CAPTCHA
            turnstileRef.current?.reset()

            // Limpa o token antigo
            setCaptchaToken("")

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


                    {/* Mensagem de erro */}

                    {errorMsg && (

                        <p className="auth-error">
                            {errorMsg}
                        </p>

                    )}


                    {/* Campo de e-mail */}

                    <div className="forgot-password">

                        <label htmlFor="email">
                            E-mail:
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Seu e-mail"

                            // Valor armazenado no estado
                            value={email}

                            // Atualiza o estado conforme o usuário digita
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }

                            required
                        />

                    </div>


                    {/* CAPTCHA Cloudflare */}

                    <div className="captcha-container">

                        <Turnstile

                            // Referência usada para resetar o CAPTCHA
                            ref={turnstileRef}

                            // Site Key armazenada no arquivo .env
                            siteKey={
                                import.meta.env.VITE_TURNSTILE_SITE_KEY
                            }

                            // Guarda o token quando validado
                            onSuccess={setCaptchaToken}

                            // Limpa o token quando expirar
                            onExpire={() =>
                                setCaptchaToken("")
                            }

                        />

                    </div>


                    {/* Botão para solicitar o link */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Enviando..."
                            : "Enviar Link"
                        }

                    </button>


                    {/* Mensagem de sucesso */}

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