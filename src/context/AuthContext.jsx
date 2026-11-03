
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabaseClient";

// ========================================
// UNIVERSIDADE SYNTER
// CONTEXTO DE AUTENTICAÇÃO
//
// LOGIN POR E-MAIL E SENHA
// SEM EXIGÊNCIA DE MFA / GOOGLE AUTHENTICATOR
// ========================================

const AuthContext = createContext(null);

// ========================================
// CHAVE DA RECUPERAÇÃO DE SENHA
// ========================================

const PASSWORD_RECOVERY_STORAGE_KEY =
  "synter_password_recovery";

// ========================================
// LER ESTADO DA RECUPERAÇÃO DE SENHA
// ========================================

function getStoredPasswordRecovery() {
  try {
    return (
      window.sessionStorage.getItem(
        PASSWORD_RECOVERY_STORAGE_KEY
      ) === "true"
    );
  } catch {
    return false;
  }
}

// ========================================
// PROVIDER DE AUTENTICAÇÃO
// ========================================

function AuthProvider({ children }) {
  // ========================================
  // USUÁRIO E SESSÃO
  // ========================================

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // ========================================
  // CARREGAMENTO
  // ========================================

  const [loading, setLoading] = useState(true);

  // ========================================
  // RECUPERAÇÃO DE SENHA
  // ========================================

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(getStoredPasswordRecovery);

  // ========================================
  // MARCAR RECUPERAÇÃO DE SENHA
  // ========================================

  function markPasswordRecovery() {
    setIsPasswordRecovery(true);

    try {
      window.sessionStorage.setItem(
        PASSWORD_RECOVERY_STORAGE_KEY,
        "true"
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro ao registrar recuperação de senha:",
          error
        );
      }
    }
  }

  // ========================================
  // LIMPAR RECUPERAÇÃO DE SENHA
  // ========================================

  function clearPasswordRecovery() {
    setIsPasswordRecovery(false);

    try {
      window.sessionStorage.removeItem(
        PASSWORD_RECOVERY_STORAGE_KEY
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro ao limpar recuperação de senha:",
          error
        );
      }
    }
  }

  // ========================================
  // INICIALIZAR AUTENTICAÇÃO
  // ========================================

  useEffect(() => {
    let mounted = true;

    // ====================================
    // CARREGAR SESSÃO EXISTENTE
    // ====================================

    async function loadSession() {
      try {
        const {
          data: {
            session: currentSession,
          },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // ==================================
        // ERRO AO CARREGAR SESSÃO
        // ==================================

        if (sessionError) {
          if (import.meta.env.DEV) {
            console.error(
              "Erro ao carregar sessão:",
              sessionError.message
            );
          }

          setUser(null);
          setSession(null);
          clearPasswordRecovery();

          return;
        }

        // ==================================
        // NENHUMA SESSÃO ENCONTRADA
        // ==================================

        if (!currentSession) {
          setUser(null);
          setSession(null);
          clearPasswordRecovery();

          return;
        }

        // ==================================
        // VALIDAR USUÁRIO NO SUPABASE
        // ==================================

        const {
          data: {
            user: verifiedUser,
          },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        // ==================================
        // USUÁRIO INVÁLIDO
        // ==================================

        if (userError || !verifiedUser) {
          if (
            userError &&
            import.meta.env.DEV
          ) {
            console.error(
              "Erro ao validar usuário:",
              userError.message
            );
          }

          setUser(null);
          setSession(null);
          clearPasswordRecovery();

          return;
        }

        // ==================================
        // SESSÃO VÁLIDA
        // ==================================

        setSession(currentSession);
        setUser(verifiedUser);

      } catch (error) {
        if (!mounted) return;

        if (import.meta.env.DEV) {
          console.error(
            "Erro ao inicializar autenticação:",
            error
          );
        }

        setUser(null);
        setSession(null);

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // ====================================
    // ESCUTAR EVENTOS DE AUTENTICAÇÃO
    // ====================================

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        // Atualizar sessão e usuário

        setSession(newSession);

        setUser(
          newSession?.user ?? null
        );

        // ==================================
        // RECUPERAÇÃO DE SENHA
        // ==================================

        if (event === "PASSWORD_RECOVERY") {
          markPasswordRecovery();
        }

        // ==================================
        // LOGOUT
        // ==================================

        if (event === "SIGNED_OUT") {
          clearPasswordRecovery();
        }

        // Eventos como SIGNED_IN,
        // TOKEN_REFRESHED e USER_UPDATED
        // atualizam normalmente a sessão.
        //
        // A recuperação de senha permanece
        // ativa até a atualização ser concluída.

        setLoading(false);
      }
    );

    loadSession();

    // ====================================
    // LIMPAR LISTENER
    // ====================================

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  async function logout() {
    try {
      const { error } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro ao sair:",
            error.message
          );
        }

        return { error };
      }

      clearPasswordRecovery();

      return {
        error: null,
      };

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro inesperado ao sair:",
          error
        );
      }

      return { error };
    }
  }

  // ========================================
  // DISPONIBILIZAR CONTEXTO
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        logout,
        isPasswordRecovery,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// HOOK DE AUTENTICAÇÃO
// ========================================

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return context;
}

// ========================================
// EXPORTAÇÕES
// ========================================

export {
  AuthProvider,
  useAuth,
};
