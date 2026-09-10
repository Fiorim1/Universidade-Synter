import { useState } from "react"

import { useNavigate } from "react-router-dom"

import Header from "../components/Header"
import Hero from "../components/Hero"
import Footer from "../components/Footer"

import { supabase } from "../services/supabaseClient"

import { useAuth } from "../context/AuthContext"

import { validatePassword } from "../utils/validators"

import "../styles/UpdatePassword.css"


function UpdatePassword() {

    const navigate =
        useNavigate()


    const {
        session,
        loading: authLoading,
        isPasswordRecovery,
        clearPasswordRecovery
    } = useAuth()


    const [
        password,
        setPassword
    ] = useState("")

    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("")

    const [
        errorMsg,
        setErrorMsg
    ] = useState("")

    const [
        successMsg,
        setSuccessMsg
    ] = useState("")

    const [
        loading,
        setLoading
    ] = useState(false)



    // Só permitimos alteração se:
    //
    // 1. existe sessão válida
    // 2. ela veio de PASSWORD_RECOVERY
    const recoveryReady =
        Boolean(
            session &&
            isPasswordRecovery
        )



    async function handleSubmit(e) {

        e.preventDefault()

        setErrorMsg("")
        setSuccessMsg("")


        // Impede que alguém simplesmente digite
        // /update-password no navegador
        // e tente usar uma sessão normal.
        if (
            authLoading ||
            !recoveryReady
        ) {

            setErrorMsg(
                "O link de recuperação é inválido ou expirou."
            )

            return
        }


        const passwordErrors =
            validatePassword(password)


        if (
            passwordErrors.length > 0
        ) {

            setErrorMsg(
                passwordErrors.join(" • ")
            )

            return
        }


        if (
            password !==
            confirmPassword
        ) {

            setErrorMsg(
                "As senhas não coincidem."
            )

            return
        }


        setLoading(true)


        try {

            // O Supabase recebe a nova senha
            // e faz o armazenamento seguro dela.
            //
            // Nós nunca armazenamos a senha.
            const { error } =
                await supabase.auth.updateUser({

                    password

                })


            if (error) {

                if (import.meta.env.DEV) {

                    console.error(
                        "Erro ao alterar senha:",
                        error.message
                    )

                }


                setErrorMsg(
                    "Não foi possível atualizar a senha."
                )

                return
            }


            // Limpa a flag de recuperação.
            clearPasswordRecovery()


            // Encerra a sessão temporária
            // utilizada para redefinir a senha.
            const {
                error: signOutError
            } =
                await supabase.auth.signOut({
                    scope: "local"
                })


            if (signOutError) {

                if (import.meta.env.DEV) {

                    console.error(
                        signOutError.message
                    )

                }


                setErrorMsg(
                    "A senha foi alterada, mas não foi possível encerrar a sessão atual."
                )

                return
            }


            // Limpa as senhas da memória
            // do componente.
            setPassword("")
            setConfirmPassword("")


            setSuccessMsg(
                "Senha atualizada com sucesso!"
            )


            // Redireciona para Login
            // sem deixar update-password
            // no histórico.
            setTimeout(() => {

                navigate(
                    "/login",
                    { replace: true }
                )

            }, 1500)

        } catch (error) {

            if (import.meta.env.DEV) {

                console.error(error)

            }


            setErrorMsg(
                "Não foi possível atualizar a senha."
            )

        } finally {

            setLoading(false)

        }

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


                        {!authLoading &&
                         !recoveryReady && (

                            <p className="auth-error">

                                O link de recuperação é inválido ou expirou.

                            </p>

                        )}


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
                                    setPassword(
                                        e.target.value
                                    )
                                }

                                autoComplete="new-password"

                                minLength={8}

                                disabled={
                                    !recoveryReady ||
                                    loading
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
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }

                                autoComplete="new-password"

                                minLength={8}

                                disabled={
                                    !recoveryReady ||
                                    loading
                                }

                                required
                            />

                        </div>



                        <button
                            type="submit"

                            disabled={
                                loading ||
                                !recoveryReady
                            }
                        >

                            {
                                loading
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