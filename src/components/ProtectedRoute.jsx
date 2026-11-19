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
        !session?.access_token ||
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
    session?.access_token,
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
  // RECUPERAÇÃO ATIVA
  // ========================================

  if (session && isPasswordRecovery) {
    return (
      <Navigate
        to="/update-password"
        replace
      />
    );
  }

  // ========================================
  // EXIGIR SESSÃO
  // ========================================

  if (!user || !session?.access_token) {
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

    // Aceita um cargo ("adm"), vários separados por vírgula ("adm,sat")
    // ou uma lista (["adm", "sat"]).
    const rolesExigidas = (
      Array.isArray(requiredRole)
        ? requiredRole
        : String(requiredRole).split(",")
    )
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);

    if (!rolesExigidas.includes(permissao.role)) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  return children;
}