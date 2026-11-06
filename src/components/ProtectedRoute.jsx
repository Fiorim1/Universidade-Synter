
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
// Sem requiredRole:
// exige apenas autenticação.
//
// Com requiredRole="adm":
// exige autenticação e perfil ADM.
// ========================================

function ProtectedRoute({
  children,
  requiredRole = null,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [permissao, setPermissao] = useState({
    userId: null,
    role: null,
    verificado: false,
  });

  // ========================================
  // CONSULTAR FUNÇÃO NO SUPABASE
  // ========================================

  useEffect(() => {
    let ativo = true;

    async function verificarPermissao() {
      if (!user?.id || !requiredRole) {
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

        if (ativo) {
          setPermissao({
            userId: user.id,
            role: String(
              data?.role || ""
            ).trim().toLowerCase(),
            verificado: true,
          });
        }
      } catch (erro) {
        console.error(
          "Erro ao verificar permissão:",
          erro
        );

        if (ativo) {
          setPermissao({
            userId: user.id,
            role: null,
            verificado: true,
          });
        }
      }
    }

    verificarPermissao();

    return () => {
      ativo = false;
    };
  }, [user?.id, requiredRole]);

  // ========================================
  // AGUARDAR AUTENTICAÇÃO
  // ========================================

  if (loading) {
    return <p>Carregando...</p>;
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
  // VERIFICAR FUNÇÃO EXIGIDA
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

    if (permissao.role !== requiredRole) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  // ========================================
  // ACESSO PERMITIDO
  // ========================================

  return children;
}

export default ProtectedRoute;
