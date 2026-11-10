
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PasswordRecoveryGuard({
  children,
}) {
  const location = useLocation();

  const {
    session,
    loading,
    isPasswordRecovery,
  } = useAuth();

  const recuperacaoAtiva =
    Boolean(session && isPasswordRecovery);

  // Durante uma recuperação ativa, o usuário
  // deve permanecer na página de nova senha.
  // O dashboard não deve ser aberto automaticamente.
  if (
    !loading &&
    recuperacaoAtiva &&
    location.pathname !== "/update-password"
  ) {
    return (
      <Navigate
        to="/update-password"
        replace
      />
    );
  }

  return children;
}
