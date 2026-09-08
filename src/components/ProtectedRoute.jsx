import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"


function ProtectedRoute({ children }) {

    // Pega informações do AuthContext:
    // user = usuário atualmente autenticado
    // loading = informa se o Supabase ainda está verificando a sessão
    const { user, loading } = useAuth()


    // Enquanto o Supabase verifica a sessão,
    // não libera nem redireciona a página
    if (loading) {

        return (
            <p>
                Carregando...
            </p>
        )

    }


    // Se não existir usuário autenticado,
    // envia automaticamente para a tela de Login
    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        )

    }


    // Se existe usuário autenticado,
    // libera o acesso ao componente protegido
    return children

}


export default ProtectedRoute