
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../services/supabaseClient";

/* ==========================================
   UNIVERSIDADE SYNTER
   CONTEXTO DE AUTENTICAÇÃO
========================================== */

const AuthContext = createContext(null);

const RECOVERY_KEY =
  "synter_password_recovery_v2";

const LEGACY_RECOVERY_KEY =
  "synter_password_recovery";

// Limite local para o indicador da interface.
// Não altera a validade real do link Supabase.
const RECOVERY_MAX_AGE = 15 * 60 * 1000;

// ==========================================
// LER INDICADOR DE RECUPERAÇÃO
// ==========================================

function readRecovery() {
  try {
    const raw = sessionStorage.getItem(
      RECOVERY_KEY
    );

    if (!raw) return null;

    const data = JSON.parse(raw);

    const valid =
      typeof data?.userId === "string" &&
      typeof data?.createdAt === "number" &&
      data.createdAt <= Date.now() &&
      Date.now() - data.createdAt <
        RECOVERY_MAX_AGE;

    if (!valid) {
      sessionStorage.removeItem(RECOVERY_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

// ==========================================
// SALVAR INDICADOR
// ==========================================

function saveRecovery(userId) {
  if (!userId) return null;

  const data = {
    userId,
    createdAt: Date.now(),
  };

  try {
    sessionStorage.setItem(
      RECOVERY_KEY,
      JSON.stringify(data)
    );
  } catch {
    // A autenticação continua no Supabase.
  }

  return data;
}

// ==========================================
// LIMPAR INDICADORES
// ==========================================

function removeRecovery() {
  try {
    sessionStorage.removeItem(RECOVERY_KEY);
    sessionStorage.removeItem(
      LEGACY_RECOVERY_KEY
    );
  } catch {
    // Nenhum segredo de autenticação é
    // armazenado nesses indicadores.
  }
}

// ==========================================
// PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [
    recoveryRecord,
    setRecoveryRecord,
  ] = useState(readRecovery);

  // Identifica eventos de autenticação
  // mais recentes que o carregamento inicial.
  const authVersion = useRef(0);

  const clearPasswordRecovery = useCallback(
    () => {
      removeRecovery();
      setRecoveryRecord(null);
    },
    []
  );

  const markPasswordRecovery = useCallback(
    (userId) => {
      if (!userId) return;

      const data = saveRecovery(userId);

      setRecoveryRecord(data);
    },
    []
  );

  // ========================================
  // INICIALIZAÇÃO DA AUTENTICAÇÃO
  // ========================================

  useEffect(() => {
    let mounted = true;

    // Remove o indicador antigo que não
    // estava vinculado à identidade do usuário.
    try {
      sessionStorage.removeItem(
        LEGACY_RECOVERY_KEY
      );
    } catch {
      // Sem ação adicional.
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        authVersion.current += 1;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Evento emitido pelo Supabase após
        // reconhecer um link de recuperação.
        if (event === "PASSWORD_RECOVERY") {
          markPasswordRecovery(
            newSession?.user?.id
          );
        }

        if (event === "SIGNED_OUT") {
          clearPasswordRecovery();
        }

        // Login comum realizado fora da
        // página de recuperação.
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

    // ======================================
    // CARREGAR SESSÃO EXISTENTE
    // ======================================

    async function loadSession() {
      const versionAtStart =
        authVersion.current;

      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // Evita sobrescrever uma sessão que
        // chegou por evento mais recente.
        if (
          authVersion.current !== versionAtStart
        ) {
          return;
        }

        if (sessionError) {
          if (import.meta.env.DEV) {
            console.error(
              "Erro ao obter sessão:",
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
          return;
        }

        const {
          data: { user: verifiedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          !mounted ||
          authVersion.current !== versionAtStart
        ) {
          return;
        }

        if (userError || !verifiedUser) {
          if (import.meta.env.DEV) {
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
        if (
          !mounted ||
          authVersion.current !== versionAtStart
        ) {
          return;
        }

        if (import.meta.env.DEV) {
          console.error(
            "Falha ao inicializar autenticação:",
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
  }, [
    clearPasswordRecovery,
    markPasswordRecovery,
  ]);

  // ========================================
  // RECUPERAÇÃO ATIVA
  // ========================================

  const isPasswordRecovery = Boolean(
    recoveryRecord &&
      session?.user?.id &&
      recoveryRecord.userId ===
        session.user.id &&
      Date.now() - recoveryRecord.createdAt <
        RECOVERY_MAX_AGE
  );

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
            "Erro ao encerrar sessão:",
            error
          );
        }

        return { error };
      }

      clearPasswordRecovery();

      return { error: null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro inesperado no logout:",
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

// ==========================================
// HOOK DE AUTENTICAÇÃO
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return context;
}
