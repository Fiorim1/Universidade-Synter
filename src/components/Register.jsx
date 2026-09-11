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

import LockImage from "../assets/login-back.png"

import "../styles/Register.css"


function Register() {

    // Nome completo
    const [fullName, setFullName] = useState("")

    // E-mail
    const [email, setEmail] = useState("")

    // Senha
    const [password, setPassword] = useState("")

    // Confirmação da senha
    const [confirmPassword, setConfirmPassword] = useState("")

    // Token do Cloudflare Turnstile
    const [captchaToken, setCaptchaToken] = useState("")

    // Mensagem de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Mensagem de sucesso
    const [successMsg, setSuccessMsg] = useState("")

    // Estado de carregamento
    const [loading, setLoading] = useState(false)

    // Referência do CAPTCHA
    const turnstileRef = useRef(null)



    async function handleSubmit(e) {

        e.preventDefault()

        // Limpa mensagens anteriores
        setErrorMsg("")
        setSuccessMsg("")


        // ================================
        // NOME
        // ================================

        const cleanName = fullName.trim()


        if (cleanName.length < 3) {

            setErrorMsg(
                "Digite seu nome completo."
            )

            return
        }



        // ================================
        // E-MAIL
        // ================================

        const cleanEmail =
            sanitizeEmail(email)


        if (!validateEmail(cleanEmail)) {

            setErrorMsg(
                "Digite um e-mail válido."
            )

            return
        }



        // ================================
        // SENHA
        // ================================

        const passwordErrors =
            validatePassword(password)


        if (passwordErrors.length > 0) {

            setErrorMsg(
                passwordErrors.join(" • ")
            )

            return
        }



        // Confirma se as senhas são iguais
        if (password !== confirmPassword) {

            setErrorMsg(
                "As senhas não coincidem."
            )

            return
        }



        // ================================
        // CAPTCHA
        // ================================

        if (!captchaToken) {

            setErrorMsg(
                "Confirme que você não é um robô."
            )

            return
        }



        // ================================
        // CADASTRO
        // ================================

        setLoading(true)


        try {

            const { error } =
                await supabase.auth.signUp({

                    email: cleanEmail,

                    password: password,

                    options: {

                        // Dados públicos permitidos
                        // para o perfil do usuário
                        data: {
                            full_name: cleanName
                        },


                        // Após confirmar o e-mail,
                        // retorna para o Login
                        emailRedirectTo:
                            `${window.location.origin}/login`,


                        // CAPTCHA validado pelo Supabase
                        captchaToken: captchaToken
                    }

                })



            // ================================
            // ERRO
            // ================================

            if (error) {

                // Detalhes técnicos somente
                // durante desenvolvimento
                if (import.meta.env.DEV) {

                    console.error(
                        "Erro ao criar conta:",
                        error.message
                    )

                }


                /*
                    Mensagem genérica.

                    Não informamos se determinado
                    e-mail já está cadastrado.
                */
                setErrorMsg(
                    "Não foi possível concluir o cadastro. Verifique os dados e tente novamente."
                )

                return
            }



            // ================================
            // RESPOSTA SEGURA
            // ================================

            /*
                IMPORTANTE:

                O Supabase pode não informar
                diretamente que determinado
                e-mail já existe.

                Isso protege o sistema contra
                enumeração de usuários.

                Portanto não mostramos:

                "Conta criada!"

                porque não podemos afirmar isso
                com segurança apenas pela resposta
                do frontend.
            */

            setSuccessMsg(
                "Se este e-mail estiver disponível para cadastro, enviaremos uma mensagem de confirmação. Caso você já possua uma conta, utilize o login ou a recuperação de senha."
            )



            // Limpa os campos
            setFullName("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")

        } catch (error) {

            // Erro técnico somente no desenvolvimento
            if (import.meta.env.DEV) {

                console.error(
                    "Erro inesperado no cadastro:",
                    error
                )

            }


            setErrorMsg(
                "Não foi possível concluir o cadastro. Tente novamente."
            )

        } finally {

            // Finaliza carregamento
            setLoading(false)


            // Reseta CAPTCHA
            turnstileRef.current?.reset()


            // Remove token antigo
            setCaptchaToken("")

        }

    }



    return (

        <div className="register-page">

            <Header />


            <main className="register-main">

                <div className="register-layout">


                    {/* ================================ */}
                    {/* LADO ESQUERDO                    */}
                    {/* ================================ */}

                    <section className="register-left">

                        <div className="register-content">


                            <Hero
                                one="Universidade Synter"
                                two="Crie sua conta"
                                three="Preencha seus dados abaixo para acessar conteúdos, treinamentos e materiais exclusivos."
                            />


                            <form
                                className="register-form"
                                onSubmit={handleSubmit}
                            >


                                {/* ERRO */}

                                {errorMsg && (

                                    <div className="register-error">

                                        {errorMsg}

                                    </div>

                                )}



                                {/* SUCESSO */}

                                {successMsg && (

                                    <div className="register-success">

                                        {successMsg}

                                    </div>

                                )}



                                {/* ================================ */}
                                {/* NOME                             */}
                                {/* ================================ */}

                                <div className="register-field">

                                    <label htmlFor="fullName">

                                        Nome completo

                                    </label>


                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"

                                        value={fullName}

                                        onChange={(e) =>
                                            setFullName(
                                                e.target.value
                                            )
                                        }

                                        placeholder="Digite seu nome completo"

                                        autoComplete="name"

                                        required
                                    />

                                </div>



                                {/* ================================ */}
                                {/* E-MAIL                           */}
                                {/* ================================ */}

                                <div className="register-field">

                                    <label htmlFor="email">

                                        E-mail

                                    </label>


                                    <input
                                        type="email"
                                        id="email"
                                        name="email"

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



                                {/* ================================ */}
                                {/* SENHAS                           */}
                                {/* ================================ */}

                                <div className="register-password-grid">


                                    <div className="register-field">

                                        <label htmlFor="password">

                                            Senha

                                        </label>


                                        <input
                                            type="password"
                                            id="password"
                                            name="password"

                                            value={password}

                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }

                                            placeholder="Digite sua senha"

                                            autoComplete="new-password"

                                            required
                                        />

                                    </div>



                                    <div className="register-field">

                                        <label htmlFor="confirmPassword">

                                            Confirmar senha

                                        </label>


                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"

                                            value={confirmPassword}

                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }

                                            placeholder="Repita sua senha"

                                            autoComplete="new-password"

                                            required
                                        />

                                    </div>

                                </div>



                                {/* ================================ */}
                                {/* CAPTCHA                          */}
                                {/* ================================ */}

                                <div className="register-captcha">

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

                                        onError={() =>
                                            setCaptchaToken("")
                                        }

                                    />

                                </div>



                                {/* ================================ */}
                                {/* CRIAR CONTA                      */}
                                {/* ================================ */}

                                <button
                                    className="register-submit"
                                    type="submit"
                                    disabled={loading}
                                >

                                    <span>

                                        {
                                            loading
                                                ? "Processando..."
                                                : "Criar conta"
                                        }

                                    </span>


                                    {!loading && (

                                        <span className="register-submit-arrow">

                                            →

                                        </span>

                                    )}

                                </button>


                            </form>

                        </div>

                    </section>



                    {/* ================================ */}
                    {/* LADO DIREITO                     */}
                    {/* ================================ */}

                    <section className="register-visual">

                        <div className="register-visual-content">


                            <div className="register-visual-text">

                                <span>

                                    CONHECIMENTO • TECNOLOGIA

                                </span>


                                <h2>

                                    Faça parte da
                                    Universidade Synter.

                                </h2>


                                <p>

                                    Uma plataforma criada para
                                    conectar pessoas, produtos,
                                    treinamentos e conhecimento.

                                </p>

                            </div>



                            <img
                                src={LockImage}
                                alt="Fechadura digital Synter"
                                className="register-lock-image"
                            />

                        </div>

                    </section>


                </div>

            </main>


            <Footer />

        </div>

    )

}


export default Register