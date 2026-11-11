
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ========================================
// UNIVERSIDADE SYNTER
// CONTROLE DE ROTAS PÚBLICAS
// ========================================

export default function PublicRoute({ children }) {
  const {
    user,
    session,
    loading,
    isPasswordRecovery,
  } = useAuth();

  // ========================================
  // AGUARDAR SESSÃO
  // ========================================

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Verificando autenticação...
      </p>
    );
  }

  // ========================================
  // RECUPERAÇÃO DE SENHA
  // ========================================

  // Não encaminhar ao dashboard durante
  // uma recuperação identificada pelo
  // contexto de autenticação.

  if (session && isPasswordRecovery) {
    return (
      <Navigate
        to="/update-password"
        replace
      />
    );
  }

  // ========================================
  // LOGIN NORMAL
  // ========================================

  if (user && session) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}
