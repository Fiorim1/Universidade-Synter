import Header from "./Header"
import Hero from "./Hero"
import Footer from "./Footer"

import "../styles/Register.css"

function Register() {

    function handleSubmit(e) {

        // Impede a página de recarregar
        e.preventDefault()

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

                    <div className="text-register">

                        <h1>Registre-se</h1>

                        <p>
                            Crie a sua conta, preenchendo as informações abaixo.
                        </p>

                    </div>


                    <div className="inputs">

                        <div className="input-register-email">

                            <label htmlFor="email">
                                E-mail:
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                            />

                        </div>


                        <div className="input-register-password">

                            <label htmlFor="password">
                                Senha:
                            </label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                            />

                        </div>


                        <div className="input-register-password">

                            <label htmlFor="confirmPassword">
                                Confirme sua senha:
                            </label>

                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                            />

                        </div>

                    </div>


                    <button type="submit">
                        Criar Conta
                    </button>

                </div>

            </form>

            <Footer />

        </div>

    )

}

export default Register