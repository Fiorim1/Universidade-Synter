import { useState, useRef } from 'react'

import { useNavigate } from "react-router-dom"

// Componente do Cloudflare Turnstile
import { Turnstile } from '@marsidev/react-turnstile'

// Cliente do Supabase
import { supabase } from '../services/supabaseClient'

// Funções de validação
import {
    validateEmail,
    sanitizeEmail
} from '../utils/validators'

// CSS da tela de login
import "../styles/Login.css"

import Header from '../components/Header'
import Hero from "../components/Hero"
import Footer from '../components/Footer'


function Login() {

    // Permite navegar entre as rotas do projeto
    const navigate = useNavigate()


    // Armazena o e-mail digitado pelo usuário
    const [email, setEmail] = useState("")

    // Armazena a senha digitada pelo usuário
    const [password, setPassword] = useState("")

    // Armazena o token gerado pelo CAPTCHA
    const [captchaToken, setCaptchaToken] = useState("")

    // Armazena mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Controla o botão enquanto o login está sendo realizado
    const [loading, setLoading] = useState(false)

    // Permite controlar e resetar o Turnstile
    const turnstileRef = useRef(null)



    // Função executada quando o formulário é enviado
    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        // Limpa mensagens de erro anteriores
        setErrorMsg("")


        // Remove espaços e deixa o e-mail em letras minúsculas
        const cleanEmail = sanitizeEmail(email)


        // Verifica se o formato do e-mail é válido
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


        // Envia e-mail, senha e CAPTCHA para o Supabase
        const { data, error } = await supabase.auth.signInWithPassword({

            email: cleanEmail,

            password: password,

            options: {

                // Token fornecido pelo Cloudflare Turnstile
                captchaToken: captchaToken

            }

        })


        // Finaliza o carregamento
        setLoading(false)


        // Reseta o CAPTCHA depois da tentativa de login
        turnstileRef.current?.reset()

        // Remove o token antigo
        setCaptchaToken("")


        // Se o Supabase retornar erro
        if (error) {

            // Erro técnico fica somente no console
            console.error("Erro no login:", error.message)

            // Mensagem exibida para o usuário
            setErrorMsg("E-mail ou senha inválidos.")

            return
        }


        // Login realizado com sucesso
        console.log("Usuário logado:", data.user)


        // Redireciona o usuário para o Dashboard
        navigate("/dashboard")

    }



    return (



        <>

        <Header />
        <Hero />
            <form onSubmit={handleSubmit}>



                <div className="input-container">


                    {/* Título da tela */}

                    <div className="text-login">

                        <h1>Login</h1>

                        <p>
                            Acesse sua conta, para entrar no sistema.
                        </p>

                    </div>



                    {/* Mensagem de erro */}

                    {errorMsg && (

                        <p className="auth-error">

                            {errorMsg}

                        </p>

                    )}



                    <div className="input-container">


                        {/* Campo de e-mail */}

                        <div className="input-email">

                            <label htmlFor="email">

                                E-mail:

                            </label>

                            <input
                                id="email"
                                type="email"

                                // Valor armazenado no estado
                                value={email}

                                // Atualiza o estado conforme o usuário digita
                                onChange={(e) => setEmail(e.target.value)}

                                required
                            />

                        </div>



                        {/* Campo de senha */}

                        <div className="input-password">

                            <label htmlFor="password">

                                Senha:

                            </label>

                            <input
                                id="password"
                                type="password"

                                // Valor armazenado no estado
                                value={password}

                                // Atualiza a senha conforme o usuário digita
                                onChange={(e) => setPassword(e.target.value)}

                                required
                            />



                            {/* Recuperação de senha */}

                            <div className="forgot-password">

                                <button
                                    type="button"

                                    // Vai para a página de recuperação
                                    onClick={() =>
                                        navigate("/forgot-password")
                                    }
                                >

                                    Esqueci minha Senha

                                </button>

                            </div>

                        </div>

                    </div>



                    {/* CAPTCHA Cloudflare Turnstile */}

                    <div className="captcha-container">

                        <Turnstile

                            // Referência utilizada para resetar o CAPTCHA
                            ref={turnstileRef}

                            // Site Key armazenada no .env
                            siteKey={
                                import.meta.env.VITE_TURNSTILE_SITE_KEY
                            }

                            // Salva o token quando o CAPTCHA é validado
                            onSuccess={setCaptchaToken}

                            // Remove o token quando ele expira
                            onExpire={() =>
                                setCaptchaToken("")
                            }

                        />

                    </div>



                    {/* Criação de conta */}

                    <div className="create-account">

                        <p>

                            Caso não possua conta:

                            <button
                                type="button"

                                // Vai para a página de cadastro
                                onClick={() =>
                                    navigate("/register")
                                }
                            >

                                Crie uma conta

                            </button>

                        </p>

                    </div>



                    {/* Botão principal */}

                    <button
                        type="submit"

                        // Impede vários cliques enquanto o Supabase responde
                        disabled={loading}
                    >

                        {loading
                            ? "Entrando..."
                            : "Entrar"
                        }

                    </button>


                </div>

            </form>

            <Footer />
        </>

    )

}

export default Login