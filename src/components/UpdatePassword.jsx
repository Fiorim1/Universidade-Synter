import { useState } from "react"
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

    // Guarda a nova senha digitada
    const [password, setPassword] = useState("")

    // Guarda a confirmação da nova senha
    const [confirmPassword, setConfirmPassword] = useState("")

    // Guarda mensagens de erro
    const [errorMsg, setErrorMsg] = useState("")

    // Guarda mensagem de sucesso
    const [successMsg, setSuccessMsg] = useState("")

    // Controla o estado do botão
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        // Limpa mensagens anteriores
        setErrorMsg("")
        setSuccessMsg("")


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


        // Ativa o carregamento
        setLoading(true)


        // Atualiza a senha do usuário no Supabase
        const { error } = await supabase.auth.updateUser({

            password: password

        })


        // Finaliza o carregamento
        setLoading(false)


        // Caso ocorra algum erro
        if (error) {

            console.error(error.message)

            setErrorMsg(
                "Não foi possível atualizar a senha."
            )

            return
        }


        // Informa que a senha foi alterada
        setSuccessMsg(
            "Senha atualizada com sucesso!"
        )


        // Aguarda um pouco e envia para o Login
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


            <form onSubmit={handleSubmit}>

                <div className="update-password-container">

                    <h2>
                        Nova Senha
                    </h2>


                    {errorMsg && (

                        <p className="auth-error">
                            {errorMsg}
                        </p>

                    )}


                    {successMsg && (

                        <p className="auth-success">
                            {successMsg}
                        </p>

                    )}


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


                    <div className="update-password-input">

                        <label htmlFor="confirmPassword">
                            Confirme sua nova senha:
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Atualizando..."
                            : "Atualizar Senha"
                        }

                    </button>

                </div>

            </form>


            <Footer />

        </div>

    )

}

export default UpdatePassword