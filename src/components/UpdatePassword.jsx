import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Header from "./Header"
import Hero from "./Hero"
import Footer from "./Footer"

import { supabase } from "../services/supabaseClient"

import { validatePassword } from "../utils/validators"

import "../styles/UpdatePassword.css"

function UpdatePassword() {

    // Permite navegar para outra rota
    const navigate = useNavigate()

    // Guarda a nova senha
    const [password, setPassword] = useState("")

    // Guarda a confirmação da nova senha
    const [confirmPassword, setConfirmPassword] = useState("")

    // Guarda mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Guarda mensagem de sucesso
    const [successMsg, setSuccessMsg] = useState("")

    // Controla o botão enquanto a senha é atualizada
    const [loading, setLoading] = useState(false)

    // Controla se o usuário realmente chegou
    // através de um link válido de recuperação
    const [recoveryReady, setRecoveryReady] = useState(false)



    useEffect(() => {

        // Escuta mudanças na autenticação do Supabase
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (event) => {

                // Esse evento acontece quando o usuário
                // entra através do link de recuperação de senha
                if (event === "PASSWORD_RECOVERY") {

                    setRecoveryReady(true)

                }

            }
        )


        // Remove o listener quando sair da página
        return () => {

            subscription.unsubscribe()

        }

    }, [])



    async function handleSubmit(e) {

        // Impede o recarregamento da página
        e.preventDefault()

        // Limpa mensagens anteriores
        setErrorMsg("")
        setSuccessMsg("")


        // Impede a troca caso o usuário
        // não tenha vindo do fluxo de recuperação
        if (!recoveryReady) {

            setErrorMsg(
                "O link de recuperação é inválido ou expirou."
            )

            return
        }


        // Valida a senha utilizando validators.js
        const passwordErrors =
            validatePassword(password)

        if (passwordErrors.length > 0) {

            setErrorMsg(
                passwordErrors.join(" • ")
            )

            return
        }


        // Confirma se as duas senhas são iguais
        if (password !== confirmPassword) {

            setErrorMsg(
                "As senhas não coincidem."
            )

            return
        }


        // Ativa o carregamento
        setLoading(true)


        // Atualiza a senha do usuário autenticado
        const { error } =
            await supabase.auth.updateUser({

                password: password

            })


        // Caso ocorra algum erro
        if (error) {

            setLoading(false)

            console.error(
                "Erro ao atualizar senha:",
                error.message
            )

            setErrorMsg(
                "Não foi possível atualizar a senha."
            )

            return
        }


        // Encerra apenas a sessão atual
        // criada pelo link de recuperação
        await supabase.auth.signOut({
            scope: "local"
        })


        setLoading(false)


        // Informa que deu certo
        setSuccessMsg(
            "Senha atualizada com sucesso!"
        )


        // Aguarda 2 segundos e envia para o Login
        setTimeout(() => {

            navigate("/login")

        }, 2000)

    }



    return (

        <div>

            <Header />


            <Hero
                one="Redefinição de senha"
                two="Crie uma nova senha"
                three="Digite sua nova senha abaixo para concluir a recuperação da sua conta."
            />


            <div className="update-container">
                <form onSubmit={handleSubmit}>

                    <div className="update-password-container">

                        <h2>
                            Nova Senha
                        </h2>


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


                        {/* Nova senha */}

                        <div className="update-password-input">

                            <label htmlFor="password">

                                Nova senha:

                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}

                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }

                                required
                            />

                        </div>


                        {/* Confirmação da nova senha */}

                        <div className="update-password-input">

                            <label htmlFor="confirmPassword">

                                Confirme sua nova senha:

                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}

                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }

                                required
                            />

                        </div>


                        <button
                            type="submit"

                            // O botão fica bloqueado enquanto
                            // o Supabase processa a alteração
                            disabled={loading}
                        >

                            {loading
                                ? "Atualizando..."
                                : "Atualizar Senha"
                            }

                        </button>

                    </div>

                </form>

            </div>

            <Footer />

        </div>

    )

}

export default UpdatePassword