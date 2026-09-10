import {
    Navigate,
    useLocation
} from "react-router-dom"

import { useAuth } from "../context/AuthContext"


function ProtectedRoute({ children }) {

    const { user, loading } =
        useAuth()

    const location =
        useLocation()


    // Enquanto o Supabase verifica a sessão,
    // não mostramos a página protegida.
    if (loading) {

        return (
            <p>Carregando...</p>
        )

    }


    // Sem usuário autenticado:
    //
    // bloqueia o acesso e manda para login.
    if (!user) {

        return (

            <Navigate
                to="/login"
                replace

                // Guarda qual página o usuário
                // estava tentando acessar.
                state={{
                    from: location.pathname
                }}
            />

        )

    }


    // Usuário autenticado:
    // libera o componente.
    return children

}


export default ProtectedRoute