import { useState } from "react"

import Header from "./Header"
import Hero from "./Hero"
import Footer from "./Footer"

import { supabase } from "../services/supabaseClient"

import "../styles/ForgotPassword.css"

function ForgotPassword() {

    // Guarda o e-mail digitado
    const [email, setEmail] = useState("")

    // Mensagens para o usuário
    const [message, setMessage] = useState("")

    // Controla o botão durante o envio
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

        setMessage("")

        setLoading(true)

        // Solicita ao Supabase o envio do link
        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${window.location.origin}/update-password`
            }
        )

        setLoading(false)


        // Caso aconteça algum erro técnico
        if (error) {

            console.error(error.message)

            setMessage(
                "Não foi possível processar a solicitação. Tente novamente."
            )

            return
        }


        // Mensagem genérica por segurança
        setMessage(
            "Se existir uma conta vinculada a este e-mail, enviaremos um link para redefinir sua senha."
        )

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

                    <h4>Digite seu E-mail</h4>


                    <div className="forgot-password">

                        <label htmlFor="email">
                            E-mail:
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Seu e-mail"

                            // Guarda o que o usuário digitar
                            value={email}

                            onChange={(e) =>
                                setEmail(e.target.value)
                            }

                            required
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
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