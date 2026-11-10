
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

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // A recuperação precisa estar marcada pelo
  // evento PASSWORD_RECOVERY do Supabase.
  // Ter uma sessão normal não é suficiente.
  const recoveryReady =
    Boolean(session && isPasswordRecovery);

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

  const verificando =
    authLoading && !success;

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || success) return;

    setErrorMsg("");

    if (
      authLoading ||
      !recoveryReady ||
      linkComErro
    ) {
      setErrorMsg(
        "O link de recuperação é inválido ou expirou. " +
        "Solicite um novo link."
      );
      return;
    }

    // Validação de senha existente no sistema.
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
      // Confirma a identidade do usuário
      // diretamente com o Supabase Auth.
      const {
        data: { user },
        error: identityError,
      } = await supabase.auth.getUser();

      if (identityError || !user) {
        throw new Error(
          "Sessão de recuperação inválida."
        );
      }

      // Não permite que uma sessão que perdeu
      // a identidade continue a operação.
      if (user.id !== session.user.id) {
        throw new Error(
          "A sessão de recuperação foi alterada."
        );
      }

      // Atualização efetiva da senha.
      const {
        data,
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      // Verifica a resposta da atualização.
      if (
        !data?.user ||
        data.user.id !== user.id
      ) {
        throw new Error(
          "O Supabase não confirmou a atualização."
        );
      }

      // A troca foi confirmada.
      // Remove os valores de senha da interface.
      setPassword("");
      setConfirmPassword("");

      // Encerra primeiro a sessão de recuperação.
      const {
        error: signOutError,
      } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        if (import.meta.env.DEV) {
          console.error(
            "Falha ao encerrar a sessão:",
            signOutError
          );
        }

        // A atualização foi confirmada, mas
        // não vamos indicar que o logout funcionou.
        clearPasswordRecovery();
        setSuccess(true);
        setErrorMsg(
          "A senha foi alterada, mas não foi " +
          "possível encerrar a sessão automaticamente. " +
          "Saia da conta antes de entrar novamente."
        );
        return;
      }

      // Limpa o marcador local somente
      // depois da tentativa de encerrar a sessão.
      clearPasswordRecovery();

      // Exibe a confirmação na própria página.
      // Não navega automaticamente ao dashboard.
      setSuccess(true);

      // Não chamamos navigate("/dashboard").
      // O usuário escolherá voltar ao login.
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Falha na redefinição da senha:",
          error
        );
      }

      setErrorMsg(
        "Não foi possível atualizar a senha. " +
        "Verifique os requisitos ou solicite " +
        "um novo link de recuperação."
      );
    } finally {
      setSaving(false);
    }
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
              Aguarde enquanto validamos sua
              solicitação de recuperação.
            </p>
          </div>
        )}

        {!verificando &&
          !success &&
          (!recoveryReady || linkComErro) && (
            <div className="update-password-container">
              <h2>Link inválido ou expirado</h2>

              <p className="auth-error">
                Sua solicitação não pôde ser
                validada. Peça um novo link
                para redefinir sua senha.
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
                  Informe uma senha forte
                  e confirme para atualizar
                  seu acesso.
                </p>

                <p>
                  Utilize letras maiúsculas,
                  minúsculas, números e pelo
                  menos um caractere especial.
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
              O Supabase confirmou a
              alteração da sua senha.
            </p>

            {errorMsg && (
              <p
                className="auth-error"
                role="alert"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                // Se houver sessão remanescente,
                // não enviamos o usuário ao login
                // antes de tentar encerrá-la.
                if (errorMsg) {
                  supabase.auth
                    .signOut({ scope: "local" })
                    .then(({ error }) => {
                      if (error) {
                        setErrorMsg(
                          "Não foi possível sair. " +
                          "Tente encerrar a sessão novamente."
                        );
                        return;
                      }

                      setErrorMsg("");
                      navigate("/login", {
                        replace: true,
                      });
                    });
                  return;
                }

                navigate("/login", {
                  replace: true,
                });
              }}
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
