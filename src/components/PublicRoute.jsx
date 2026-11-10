
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// ========================================
// UNIVERSIDADE SYNTER
// CONTROLE DE ROTAS PÚBLICAS
//
// Login por e-mail e senha
// Recuperação de senha pelo Supabase
// Sem exigência de Google Authenticator
// ========================================

export default function PublicRoute({ children }) {
  const {
    user,
    session,
    loading,
    isPasswordRecovery,
  } = useAuth();

  // ========================================
  // AGUARDAR VERIFICAÇÃO DA SESSÃO
  // ========================================

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Verificando autenticação...
      </p>
    );
  }

  // ========================================
  // RECUPERAÇÃO DE SENHA ATIVA
  // ========================================

  // O Supabase pode criar uma sessão
  // autenticada após o usuário clicar
  // no link recebido por e-mail.
  //
  // Essa sessão não deve provocar o
  // redirecionamento automático ao dashboard
  // durante a recuperação de senha.

  if (session && isPasswordRecovery) {
    return (
      <Navigate
        to="/update-password"
        replace
      />
    );
  }

  // ========================================
  // USUÁRIO JÁ AUTENTICADO
  // ========================================

  // Somente usuários autenticados
  // fora do fluxo de recuperação
  // são enviados ao dashboard.

  if (user && session) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ========================================
  // USUÁRIO NÃO AUTENTICADO
  // ========================================

  // Permite acessar login, cadastro
  // e solicitação de recuperação.

  return children;
}
