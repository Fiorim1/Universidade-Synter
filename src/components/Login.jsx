import { useState, useRef } from 'react'

import { useNavigate } from "react-router-dom"

// Componente do Cloudflare Turnstile
// Responsável pelo CAPTCHA
import { Turnstile } from '@marsidev/react-turnstile'

// Cliente do Supabase
import { supabase } from '../services/supabaseClient'

// CSS da tela de login
import "../styles/Login.css"

function Login() {

    const navigate = useNavigate()

    // Armazena o e-mail digitado pelo usuário
    const [email, setEmail] = useState("")

    // Armazena a senha digitada pelo usuário
    const [password, setPassword] = useState("")

    // Armazena o token gerado pelo CAPTCHA
    const [captchaToken, setCaptchaToken] = useState("")

    // Armazena mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Controla o estado do botão enquanto o login está sendo realizado
    const [loading, setLoading] = useState(false)

    // Referência utilizada para controlar e resetar o Turnstile
    const turnstileRef = useRef(null)


    // Função executada quando o formulário é enviado
    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        // Limpa erros anteriores
        setErrorMsg("")

        // Verifica se o usuário realizou o CAPTCHA
        if (!captchaToken) {
            setErrorMsg("Confirme que você não é um robô.")
            return
        }

        // Ativa o estado de carregamento
        setLoading(true)

        // Realiza o login no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({

            // Envia o e-mail informado
            email: email,

            // Envia a senha informada
            password: password,

            options: {

                // Envia o token do Cloudflare Turnstile para o Supabase
                captchaToken: captchaToken
            }

        })

        // Finaliza o carregamento
        setLoading(false)

        // Reseta o CAPTCHA depois da tentativa de login
        turnstileRef.current?.reset()

        // Limpa o token antigo
        setCaptchaToken("")

        // Caso o Supabase retorne algum erro
        if (error) {

            // Mostra o erro real no console
            console.error(error.message)

            // Mostra uma mensagem para o usuário
            setErrorMsg("E-mail ou senha inválidos.")

            return
        }

        // Caso o login seja realizado com sucesso
        console.log("Usuário logado:", data.user)

    }


    return (

        // Ao enviar o formulário executa handleSubmit
        <form onSubmit={handleSubmit}>

            <div className="input-container">

                {/* Título da área de login */}
                <div className="text-login">

                    <h1>Login</h1>

                    <p>Acesse sua conta, para entrar no sistema.</p>

                </div>


                {/* Exibe a mensagem de erro somente se existir erroMsg */}
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

                            // Valor vem do estado email
                            value={email}

                            // Atualiza o estado quando o usuário digita
                            onChange={(e) => setEmail(e.target.value)}

                            // Torna o campo obrigatório
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

                            // Valor vem do estado password
                            value={password}

                            // Atualiza a senha quando o usuário digita
                            onChange={(e) => setPassword(e.target.value)}

                            required
                        />


                        {/* Botão para recuperação de senha */}
                        <div className="forgot-password">

                            <button type="button"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Esqueci minha Senha
                            </button>

                        </div>

                    </div>

                </div>


                {/* CAPTCHA Cloudflare Turnstile */}
                <div className="captcha-container">
                    <Turnstile

                        // Permite controlar o componente através do useRef
                        ref={turnstileRef}

                        // Site Key armazenada no arquivo .env
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}

                        // Quando o CAPTCHA é validado,
                        // o token é armazenado no estado
                        onSuccess={setCaptchaToken}

                        // Se o token expirar, ele é removido
                        onExpire={() => setCaptchaToken("")}
                    />
                </div>


                {/* Área para criação de conta */}
                <div className="create-account">

                    <p>
                        Caso não possua conta:

                        <button type="button"
                            onClick={() => navigate("/register")}
                        >
                            Crie uma conta
                        </button>

                    </p>

                </div>


                {/* Botão principal de login */}
                <button
                    type="submit"

                    // Impede vários cliques enquanto estiver carregando
                    disabled={loading}
                >

                    {/* Altera o texto enquanto o login está acontecendo */}
                    {loading ? "Entrando..." : "Entrar"}

                </button>

            </div>

        </form>

    )

}

export default Login