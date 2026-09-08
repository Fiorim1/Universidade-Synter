import { useState, useRef } from "react"

import { Turnstile } from "@marsidev/react-turnstile"

import { supabase } from "../services/supabaseClient"

import {
    validateEmail,
    validatePassword,
    sanitizeEmail
} from "../utils/validators"

import Header from "./Header"
import Hero from "./Hero"
import Footer from "./Footer"

import "../styles/Register.css"


function Register() {

    // Armazena o nome completo do usuário
    const [fullName, setFullName] = useState("")

    // Armazena o e-mail digitado
    const [email, setEmail] = useState("")

    // Armazena a senha
    const [password, setPassword] = useState("")

    // Armazena a confirmação da senha
    const [confirmPassword, setConfirmPassword] = useState("")

    // Armazena o token gerado pelo Cloudflare Turnstile
    const [captchaToken, setCaptchaToken] = useState("")

    // Armazena mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Armazena mensagens de sucesso
    const [successMsg, setSuccessMsg] = useState("")

    // Controla o botão durante o cadastro
    const [loading, setLoading] = useState(false)

    // Permite resetar o CAPTCHA
    const turnstileRef = useRef(null)



    // Função executada quando o formulário é enviado
    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        // Limpa mensagens anteriores
        setErrorMsg("")
        setSuccessMsg("")


        // Remove espaços extras do nome
        const cleanName = fullName.trim()


        // Verifica se o nome foi preenchido
        if (cleanName.length < 3) {

            setErrorMsg("Digite seu nome completo.")

            return
        }


        // Remove espaços do e-mail e converte para minúsculo
        const cleanEmail = sanitizeEmail(email)


        // Valida o formato do e-mail
        if (!validateEmail(cleanEmail)) {

            setErrorMsg("Digite um e-mail válido.")

            return
        }


        // Valida a senha
        const passwordErrors = validatePassword(password)

        if (passwordErrors.length > 0) {

            setErrorMsg(passwordErrors.join(" • "))

            return
        }


        // Verifica se as duas senhas são iguais
        if (password !== confirmPassword) {

            setErrorMsg("As senhas não coincidem.")

            return
        }


        // Verifica se o CAPTCHA foi concluído
        if (!captchaToken) {

            setErrorMsg("Confirme que você não é um robô.")

            return
        }


        // Ativa o carregamento
        setLoading(true)


        // Cria o usuário no Supabase
        const { error } = await supabase.auth.signUp({

            // E-mail utilizado na conta
            email: cleanEmail,

            // Senha utilizada na conta
            password: password,

            options: {

                // Informações extras do usuário
                // O full_name também será utilizado pelo seu perfil
                data: {
                    full_name: cleanName
                },

                // Depois da confirmação do e-mail,
                // o usuário será enviado para o Login
                emailRedirectTo: `${window.location.origin}/login`,

                // Token do Cloudflare Turnstile
                captchaToken: captchaToken

            }

        })


        // Finaliza o carregamento
        setLoading(false)


        // Reseta o CAPTCHA
        turnstileRef.current?.reset()

        // Remove o token utilizado
        setCaptchaToken("")


        // Caso ocorra algum erro durante o cadastro
        if (error) {

            console.error(
                "Erro ao criar conta:",
                error.message
            )

            setErrorMsg(
                "Não foi possível criar a conta. Verifique os dados e tente novamente."
            )

            return
        }


        // Cadastro realizado com sucesso
        setSuccessMsg(
            "Conta criada! Verifique seu e-mail para confirmar o cadastro."
        )


        // Limpa os campos depois do cadastro
        setFullName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")

    }



    return (

        <div>

            <Header />

            <Hero />


            <form
                onSubmit={handleSubmit}
                className="register-form"
            >

                <div className="register-container">


                    {/* Título */}

                    <div className="text-register">

                        <h1>Registre-se</h1>

                        <p>
                            Crie a sua conta, preenchendo as informações abaixo.
                        </p>

                    </div>



                    {/* Mensagem de erro */}

                    {errorMsg && (

                        <p className="auth-error">
                            {errorMsg}
                        </p>

                    )}



                    {/* Mensagem de sucesso */}

                    {successMsg && (

                        <p className="auth-success">
                            {successMsg}
                        </p>

                    )}



                    <div className="inputs">


                        {/* Nome completo */}

                        <div className="input-register-email">

                            <label htmlFor="fullName">
                                Nome completo:
                            </label>

                            <input
                                type="text"
                                id="fullName"
                                name="fullName"

                                value={fullName}

                                onChange={(e) =>
                                    setFullName(e.target.value)
                                }

                                required
                            />

                        </div>



                        {/* E-mail */}

                        <div className="input-register-email">

                            <label htmlFor="email">
                                E-mail:
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"

                                value={email}

                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }

                                required
                            />

                        </div>



                        {/* Senha */}

                        <div className="input-register-password">

                            <label htmlFor="password">
                                Senha:
                            </label>

                            <input
                                type="password"
                                id="password"
                                name="password"

                                value={password}

                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }

                                required
                            />

                        </div>



                        {/* Confirmação da senha */}

                        <div className="input-register-password">

                            <label htmlFor="confirmPassword">
                                Confirme sua senha:
                            </label>

                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"

                                value={confirmPassword}

                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }

                                required
                            />

                        </div>

                    </div>



                    {/* CAPTCHA */}

                    <div className="captcha-container">

                        <Turnstile

                            // Permite resetar o CAPTCHA
                            ref={turnstileRef}

                            // Site Key armazenada no .env
                            siteKey={
                                import.meta.env.VITE_TURNSTILE_SITE_KEY
                            }

                            // Guarda o token quando o CAPTCHA é validado
                            onSuccess={setCaptchaToken}

                            // Remove o token quando ele expira
                            onExpire={() =>
                                setCaptchaToken("")
                            }

                        />

                    </div>



                    {/* Botão para criar a conta */}

                    <button
                        type="submit"

                        // Bloqueia novos cliques durante o cadastro
                        disabled={loading}
                    >

                        {loading
                            ? "Criando..."
                            : "Criar Conta"
                        }

                    </button>

                </div>

            </form>


            <Footer />

        </div>

    )

}

export default Register