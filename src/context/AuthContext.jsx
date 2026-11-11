
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
  "synter_password_recovery_v3";

const OLD_RECOVERY_KEYS = [
  "synter_password_recovery",
  "synter_password_recovery_v2",
];

// O marcador apenas identifica o fluxo.
// A sessão real é validada pelo Supabase.

function readRecovery() {
  try {
    const raw = sessionStorage.getItem(
      RECOVERY_KEY
    );

    if (!raw) return null;

    const data = JSON.parse(raw);

    if (
      !data ||
      typeof data.userId !== "string"
    ) {
      sessionStorage.removeItem(RECOVERY_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

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
    // A sessão permanece no Supabase.
  }

  return data;
}

function removeRecovery() {
  try {
    sessionStorage.removeItem(RECOVERY_KEY);

    OLD_RECOVERY_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch {
    // Sem ação adicional.
  }
}

/* ==========================================
   PROVIDER
========================================== */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [
    recoveryRecord,
    setRecoveryRecord,
  ] = useState(readRecovery);

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

  /* ========================================
     MONITORAMENTO DE AUTENTICAÇÃO
  ======================================== */

  useEffect(() => {
    let mounted = true;

    try {
      OLD_RECOVERY_KEYS.forEach((key) => {
        sessionStorage.removeItem(key);
      });
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

        if (event === "PASSWORD_RECOVERY") {
          markPasswordRecovery(
            newSession?.user?.id
          );

          if (import.meta.env.DEV) {
            console.info(
              "Sessão de recuperação reconhecida."
            );
          }
        }

        if (event === "SIGNED_OUT") {
          clearPasswordRecovery();
        }

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

    /* ======================================
       CARREGAMENTO INICIAL
    ====================================== */

    async function loadSession() {
      const versionAtStart =
        authVersion.current;

      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (
          !mounted ||
          authVersion.current !== versionAtStart
        ) {
          return;
        }

        if (sessionError) {
          throw sessionError;
        }

        if (!currentSession) {
          setSession(null);
          setUser(null);
          clearPasswordRecovery();
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

          setSession(null);
          setUser(null);
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
            "Erro de autenticação:",
            error
          );
        }

        setSession(null);
        setUser(null);

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

  /* ========================================
     RECUPERAÇÃO DE SENHA
  ======================================== */

  const isPasswordRecovery = Boolean(
    recoveryRecord &&
    session?.user?.id &&
    recoveryRecord.userId === session.user.id
  );

  /* ========================================
     LOGOUT
  ======================================== */

  const logout = useCallback(async () => {
    try {
      const { error } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (error) {
        console.error(
          "Erro ao encerrar sessão:",
          error
        );

        return { error };
      }

      clearPasswordRecovery();

      return { error: null };

    } catch (error) {
      console.error(
        "Falha inesperada no logout:",
        error
      );

      return { error };
    }
  }, [clearPasswordRecovery]);

  /* ========================================
     CONTEXTO GLOBAL
  ======================================== */

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

/* ==========================================
   HOOK DE AUTENTICAÇÃO
========================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return context;
}
