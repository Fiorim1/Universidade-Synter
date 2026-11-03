
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ========================================
// UNIVERSIDADE SYNTER
// CONTROLE DE ROTAS PÚBLICAS
//
// Login por e-mail e senha
// Sem Google Authenticator / MFA
// ========================================

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // ========================================
  // AGUARDAR VERIFICAÇÃO DA SESSÃO
  // ========================================

  if (loading) {
    return (
      <p>Carregando...</p>
    );
  }

  // ========================================
  // USUÁRIO JÁ AUTENTICADO
  // ========================================

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ========================================
  // USUÁRIO NÃO AUTENTICADO
  //
  // PERMITE ACESSAR LOGIN E CADASTRO
  // ========================================

  return children;
}

export default PublicRoute;
