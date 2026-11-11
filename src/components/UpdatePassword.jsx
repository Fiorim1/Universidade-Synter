
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../utils/validators";

import "../styles/UpdatePassword.css";

function traduzirErro(error) {
  const code = error?.code || "";
  const message = error?.message || "";
  const texto = message.toLowerCase();

  if (
    code === "same_password" ||
    texto.includes("same password")
  ) {
    return "A nova senha deve ser diferente da senha atual.";
  }

  if (
    code === "weak_password" ||
    texto.includes("weak password")
  ) {
    return "A senha não atende aos requisitos de segurança.";
  }

  if (
    code === "session_not_found" ||
    code === "session_expired" ||
    code === "invalid_jwt" ||
    texto.includes("jwt expired") ||
    texto.includes("session not found")
  ) {
    return "Sua sessão expirou. Solicite um novo link de recuperação.";
  }

  if (
    code === "reauthentication_needed" ||
    code === "reauthentication_not_valid" ||
    texto.includes("reauthentication")
  ) {
    return "O Supabase está exigindo uma nova confirmação de identidade. Verifique as configurações de autenticação.";
  }

  if (
    code === "insufficient_aal" ||
    texto.includes("aal2") ||
    texto.includes("mfa")
  ) {
    return "A atualização exige uma verificação adicional de autenticação. Verifique os fatores MFA da conta.";
  }

  if (
    code === "over_request_rate_limit" ||
    texto.includes("rate limit")
  ) {
    return "Muitas tentativas realizadas. Aguarde antes de tentar novamente.";
  }

  return message
    ? `Não foi possível atualizar a senha: ${message}`
    : "Não foi possível atualizar a senha. Tente novamente.";
}

export default function UpdatePassword() {
  const navigate = useNavigate();

  const {
    session,
    loading: authLoading,
    isPasswordRecovery,
    clearPasswordRecovery,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoutPending, setLogoutPending] =
    useState(false);

  const query = new URLSearchParams(
    window.location.search
  );

  const hash = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  const linkComErro =
    query.has("error") ||
    query.has("error_code") ||
    hash.has("error") ||
    hash.has("error_code");

  // Nunca aceitar uma sessão comum como
  // autorização para redefinir a senha.
  const recoveryReady = Boolean(
    session && isPasswordRecovery
  );

  const verificando = authLoading && !success;

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || success) return;

    setErrorMsg("");

    if (authLoading || !recoveryReady || linkComErro) {
      setErrorMsg(
        "Link inválido ou sessão de recuperação não reconhecida. Solicite um novo link."
      );
      return;
    }

    const errosSenha = validatePassword(password);

    if (errosSenha.length > 0) {
      setErrorMsg(errosSenha.join(" • "));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    setSaving(true);

    try {
      // Consulta novamente a sessão do Supabase.
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!currentSession?.user) {
        throw new Error(
          "Sessão de recuperação não encontrada."
        );
      }

      if (currentSession.user.id !== session.user.id) {
        throw new Error(
          "A identidade da sessão foi alterada. Solicite um novo link."
        );
      }

      // Confirma a identidade com o servidor.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user || user.id !== currentSession.user.id) {
        throw new Error(
          "Não foi possível validar sua identidade."
        );
      }

      // Atualiza a senha.
      const {
        data,
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error("Erro ao atualizar senha:", {
          message: updateError.message,
          code: updateError.code,
          status: updateError.status,
        });

        throw updateError;
      }

      if (!data?.user || data.user.id !== user.id) {
        throw new Error(
          "O Supabase não confirmou a atualização da senha."
        );
      }

      // A atualização foi confirmada.
      setPassword("");
      setConfirmPassword("");
      setSuccess(true);

      // Encerra a sessão de recuperação.
      const { error: signOutError } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (signOutError) {
        console.error(
          "Erro ao encerrar sessão:",
          signOutError
        );

        setLogoutPending(true);
        setErrorMsg(
          "A senha foi alterada, mas não foi possível encerrar a sessão. Tente sair novamente antes de entrar."
        );
        return;
      }

      clearPasswordRecovery();
      setLogoutPending(false);
      setErrorMsg("");
    } catch (error) {
      console.error("Falha na redefinição:", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      setErrorMsg(traduzirErro(error));
    } finally {
      setSaving(false);
    }
  }

  async function voltarLogin() {
    if (logoutPending) {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        setErrorMsg(
          "Não foi possível encerrar a sessão. Tente novamente."
        );
        return;
      }

      clearPasswordRecovery();
      setLogoutPending(false);
    }

    navigate("/login", { replace: true });
  }

  return (
    <div className="update-password-page">
      <Header />

      <Hero
        one="Redefinição de senha"
        two="Proteja sua conta"
        three="Cadastre uma nova senha para acessar a Universidade Synter."
      />

      <main className="update-container">
        {verificando && (
          <div className="update-password-container">
            <h2>Verificando o link</h2>
            <p>
              Validando sua solicitação de
              recuperação de senha.
            </p>
          </div>
        )}

        {!verificando &&
          !success &&
          (!recoveryReady || linkComErro) && (
            <div className="update-password-container">
              <h2>Link inválido ou expirado</h2>

              <p className="auth-error" role="alert">
                Sua solicitação não pôde ser
                validada. Solicite um novo link.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/forgot-password", {
                    replace: true,
                  })
                }
              >
                Solicitar novo link
              </button>
            </div>
          )}

        {!verificando &&
          recoveryReady &&
          !linkComErro &&
          !success && (
            <form onSubmit={handleSubmit}>
              <div className="update-password-container">
                <h2>Criar nova senha</h2>

                <p>
                  Informe uma senha forte e
                  confirme para atualizar seu acesso.
                </p>

                <p>
                  Utilize letras maiúsculas,
                  minúsculas, números e pelo menos
                  um caractere especial.
                </p>

                {errorMsg && (
                  <p
                    className="auth-error"
                    role="alert"
                  >
                    {errorMsg}
                  </p>
                )}

                <div className="update-password-input">
                  <label htmlFor="password">
                    Nova senha
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    minLength={8}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="update-password-input">
                  <label htmlFor="confirmPassword">
                    Confirmar nova senha
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    minLength={8}
                    disabled={saving}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Atualizando senha..."
                    : "Atualizar senha"}
                </button>
              </div>
            </form>
          )}

        {success && (
          <div className="update-password-container">
            <h2>Senha atualizada!</h2>

            <p
              className="auth-success"
              role="status"
            >
              Sua senha foi alterada com sucesso.
            </p>

            {errorMsg && (
              <p className="auth-error" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={voltarLogin}
            >
              {logoutPending
                ? "Encerrar sessão e ir para login"
                : "Ir para o login"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
