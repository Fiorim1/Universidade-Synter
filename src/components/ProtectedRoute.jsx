
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ========================================
// UNIVERSIDADE SYNTER
// PROTEÇÃO DE ROTAS
//
// Autenticação por e-mail e senha
// Sem exigência de MFA / Google Authenticator
// ========================================

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  const location = useLocation();

  // ========================================
  // AGUARDAR VERIFICAÇÃO DA SESSÃO
  // ========================================

  if (loading) {
    return (
      <p>Carregando...</p>
    );
  }

  // ========================================
  // USUÁRIO NÃO AUTENTICADO
  // ========================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ========================================
  // USUÁRIO AUTENTICADO
  // ========================================

  return children;
}

export default ProtectedRoute;
