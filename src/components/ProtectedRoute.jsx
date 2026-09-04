import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"


function ProtectedRoute({ children }) {

    // Pega do AuthContext:
    // user = usuário autenticado
    // loading = informa se o Supabase ainda está verificando a sessão
    const { user, loading } = useAuth()


    // Enquanto o Supabase verifica se existe
    // uma sessão ativa, não libera a página ainda
    if (loading) {

        return (
            <p>
                Carregando...
            </p>
        )

    }


    // Caso não exista usuário autenticado,
    // redireciona automaticamente para o Login
    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        )

    }


    // Se existe usuário autenticado,
    // libera o acesso à página protegida
    return children

}


export default ProtectedRoute