
import { useEffect, useState } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { tecnicosClient } from "../lib/tecnicosClient";

// ========================================
// UNIVERSIDADE SYNTER
// PROTEÇÃO DE ROTAS
//
// Autenticação normal:
// - Exige usuário autenticado.
//
// Rotas administrativas:
// - Exige usuário autenticado.
// - Exige perfil ADM.
//
// Recuperação de senha:
// - Não permite acessar áreas protegidas
//   enquanto a redefinição estiver ativa.
// ========================================

export default function ProtectedRoute({
  children,
  requiredRole = null,
}) {
  const {
    user,
    session,
    loading,
    isPasswordRecovery,
  } = useAuth();

  const location = useLocation();

  const [permissao, setPermissao] = useState({
    userId: null,
    role: null,
    verificado: false,
  });

  // ========================================
  // CONSULTAR PERMISSÃO ADMINISTRATIVA
  // ========================================

  useEffect(() => {
    let ativo = true;

    async function verificarPermissao() {
      if (
        loading ||
        !user?.id ||
        !requiredRole ||
        isPasswordRecovery
      ) {
        return;
      }

      setPermissao({
        userId: user.id,
        role: null,
        verificado: false,
      });

      try {
        const { data, error } =
          await tecnicosClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
          throw error;
        }

        if (!ativo) return;

        setPermissao({
          userId: user.id,
          role: String(data?.role || "")
            .trim()
            .toLowerCase(),
          verificado: true,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro ao verificar permissão:",
            error
          );
        }

        if (!ativo) return;

        setPermissao({
          userId: user.id,
          role: null,
          verificado: true,
        });
      }
    }

    verificarPermissao();

    return () => {
      ativo = false;
    };
  }, [
    loading,
    user?.id,
    requiredRole,
    isPasswordRecovery,
  ]);

  // ========================================
  // AGUARDAR AUTENTICAÇÃO
  // ========================================

  if (loading) {
    return <p>Carregando...</p>;
  }

  // ========================================
  // RECUPERAÇÃO DE SENHA ATIVA
  // ========================================

  // O link de recuperação pode criar uma
  // sessão temporária no Supabase.
  //
  // A sessão não deve ser utilizada para
  // entrar no dashboard antes da conclusão
  // da troca de senha.

  if (session && isPasswordRecovery) {
    return (
      <Navigate
        to="/update-password"
        replace
      />
    );
  }

  // ========================================
  // USUÁRIO NÃO AUTENTICADO
  // ========================================

  if (!user || !session) {
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
  // VERIFICAR PERFIL ADMINISTRATIVO
  // ========================================

  if (requiredRole) {
    const permissaoAtual =
      permissao.userId === user.id &&
      permissao.verificado;

    if (!permissaoAtual) {
      return (
        <p>
          Verificando suas permissões...
        </p>
      );
    }

    const roleExigida = String(requiredRole)
      .trim()
      .toLowerCase();

    if (permissao.role !== roleExigida) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  // ========================================
  // ACESSO AUTORIZADO
  // ========================================

  return children;
}
