
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
// ========================================

const AuthContext = createContext(null);

const PASSWORD_RECOVERY_STORAGE_KEY =
  "synter_password_recovery";

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

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(getStoredPasswordRecovery);

  function markPasswordRecovery() {
    setIsPasswordRecovery(true);

    try {
      window.sessionStorage.setItem(
        PASSWORD_RECOVERY_STORAGE_KEY,
        "true"
      );
    } catch {
      // A sessão válida continua sendo obrigatória.
    }
  }

  function clearPasswordRecovery() {
    setIsPasswordRecovery(false);

    try {
      window.sessionStorage.removeItem(
        PASSWORD_RECOVERY_STORAGE_KEY
      );
    } catch {
      // O Supabase ainda controla a sessão.
    }
  }

  useEffect(() => {
    let mounted = true;

    // O listener é registrado antes de carregar
    // a sessão para receber PASSWORD_RECOVERY.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === "PASSWORD_RECOVERY") {
          markPasswordRecovery();
        }

        if (event === "SIGNED_OUT") {
          clearPasswordRecovery();
        }

        // Um login comum não deve reutilizar
        // um indicador antigo de recuperação.
        if (
          event === "SIGNED_IN" &&
          window.location.pathname !==
            "/update-password"
        ) {
          clearPasswordRecovery();
        }

        setLoading(false);
      }
    );

    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          if (import.meta.env.DEV) {
            console.error(
              "Erro ao carregar sessão:",
              sessionError
            );
          }

          setUser(null);
          setSession(null);
          return;
        }

        if (!currentSession) {
          setUser(null);
          setSession(null);

          // Não limpar aqui: o Supabase pode
          // ainda estar processando o link.
          return;
        }

        const {
          data: { user: verifiedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError || !verifiedUser) {
          if (import.meta.env.DEV && userError) {
            console.error(
              "Erro ao validar usuário:",
              userError
            );
          }

          setUser(null);
          setSession(null);
          return;
        }

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

    loadSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Erro ao sair:", error);
        }

        return { error };
      }

      clearPasswordRecovery();

      return { error: null };
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

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return context;
}

export { AuthProvider, useAuth };
