import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"


function PublicRoute({ children }) {

    const { user, loading } =
        useAuth()


    // Aguarda a verificação da sessão.
    if (loading) {

        return (
            <p>Carregando...</p>
        )

    }


    // Se já está autenticado,
    // não mostra Login/Register novamente.
    if (user) {

        return (

            <Navigate
                to="/dashboard"
                replace
            />

        )

    }


    return children

}


export default PublicRoute