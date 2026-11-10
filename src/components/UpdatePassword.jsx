
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../utils/validators";

import "../styles/UpdatePassword.css";

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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const recoveryReady =
    !authLoading &&
    Boolean(session && isPasswordRecovery);

  const parametros = new URLSearchParams(
    window.location.search
  );

  const linkComErro =
    parametros.has("error") ||
    parametros.has("error_code");

  const aguardando =
    authLoading || loading;

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || success) return;

    setErrorMsg("");

    if (!recoveryReady || linkComErro) {
      setErrorMsg(
        "O link de recuperação é inválido ou expirou."
      );
      return;
    }

    const errosSenha = validatePassword(password);

    if (errosSenha.length > 0) {
      setErrorMsg(errosSenha.join(" • "));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        "As senhas informadas não coincidem."
      );
      return;
    }

    setLoading(true);

    try {
      // Confirma a identidade da sessão atual.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Sessão de recuperação inválida."
        );
      }

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro ao atualizar a senha:",
            error
          );
        }

        setErrorMsg(
          "Não foi possível atualizar a senha. " +
          "Confira os requisitos e tente novamente."
        );
        return;
      }

      // Invalida o indicador local de recuperação.
      clearPasswordRecovery();

      setPassword("");
      setConfirmPassword("");

      // Encerra a sessão no navegador.
      const { error: signOutError } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (signOutError && import.meta.env.DEV) {
        console.error(
          "Erro ao encerrar sessão:",
          signOutError
        );
      }

      setSuccess(true);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro inesperado ao redefinir a senha:",
          error
        );
      }

      setErrorMsg(
        "Não foi possível redefinir sua senha. " +
        "Solicite um novo link e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="update-password-page">
      <Header />

      <Hero
        one="Redefinição de senha"
        two="Proteja sua conta"
        three="Defina uma nova senha para acessar a Universidade Synter."
      />

      <main className="update-container">
        {aguardando && !success && (
          <div className="update-password-container">
            <h2>
              {loading
                ? "Atualizando sua senha"
                : "Verificando o link"}
            </h2>

            <p>
              {loading
                ? "Estamos salvando a nova senha."
                : "Aguarde enquanto validamos a recuperação."}
            </p>
          </div>
        )}

        {!aguardando &&
          !success &&
          (!recoveryReady || linkComErro) && (
            <div className="update-password-container">
              <h2>Link inválido ou expirado</h2>

              <p className="auth-error">
                Não foi possível confirmar a
                recuperação da sua conta.
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

        {!aguardando &&
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
                    disabled={loading}
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
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Atualizando..."
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
              Utilize a nova senha para entrar.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  replace: true,
                })
              }
            >
              Ir para o login
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
