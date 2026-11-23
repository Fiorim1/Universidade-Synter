import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Turnstile } from "@marsidev/react-turnstile";

import { supabase } from "../services/supabaseClient";

import {
  validateEmail,
  sanitizeEmail,
} from "../utils/validators";

import Header from "../components/Header";
import Footer from "../components/Footer";

import LockImage from "../assets/venuss3.png";

import "../styles/Login.css";

// ========================================
// LOGIN — UNIVERSIDADE SYNTER
// AUTENTICAÇÃO POR E-MAIL E SENHA
// SEM GOOGLE AUTHENTICATOR / MFA
// ========================================

function Login() {
  const navigate = useNavigate();

  // ========================================
  // CAMPOS
  // ========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  // ========================================
  // ESTADOS
  // ========================================

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================================
  // TURNSTILE
  // ========================================

  const turnstileRef = useRef(null);

  // ========================================
  // LOGIN
  // ========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setErrorMsg("");

    // ====================================
    // VALIDAR E-MAIL
    // ====================================

    const cleanEmail = sanitizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      setErrorMsg("Digite um e-mail válido.");
      return;
    }

    // ====================================
    // VALIDAR SENHA
    // ====================================

    if (!password) {
      setErrorMsg("Digite sua senha.");
      return;
    }

    // ====================================
    // VALIDAR CAPTCHA
    // ====================================

    if (!captchaToken) {
      setErrorMsg(
        "Confirme que você não é um robô."
      );

      return;
    }

    // ====================================
    // INICIAR AUTENTICAÇÃO
    // ====================================

    setLoading(true);

    try {
      // ==================================
      // LOGIN POR E-MAIL E SENHA
      // ==================================

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,

          options: {
            captchaToken: captchaToken,
          },
        });

      // ==================================
      // VERIFICAR ERRO DE LOGIN
      // ==================================

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro no login:",
            error.message
          );
        }

        setErrorMsg(
          "Não foi possível entrar. Verifique seu e-mail e sua senha."
        );

        return;
      }

      // ==================================
      // VALIDAR USUÁRIO E SESSÃO
      // ==================================

      if (!data?.user || !data?.session) {
        throw new Error(
          "Não foi possível estabelecer uma sessão válida."
        );
      }

      // ==================================
      // LOGIN CONCLUÍDO
      //
      // NÃO EXIGE GOOGLE AUTHENTICATOR
      // ==================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro ao autenticar usuário:",
          error
        );
      }

      setErrorMsg(
        "Não foi possível concluir o login. Tente novamente."
      );

    } finally {
      // ==================================
      // FINALIZAR CARREGAMENTO
      // ==================================

      setLoading(false);

      // ==================================
      // REDEFINIR CAPTCHA
      // ==================================

      turnstileRef.current?.reset();
      setCaptchaToken("");
    }
  }

  // ========================================
  // INTERFACE DO LOGIN
  // ========================================

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <div className="login-container">

          {/* ========================================
              LADO ESQUERDO
          ======================================== */}

          <section className="login-left">
            <div className="login-content">

              {/* CABEÇALHO */}

              <div className="login-heading">
                <span className="login-small-title">
                  UNIVERSIDADE SYNTER
                </span>

                <h1>
                  Bem-vindo de volta.
                </h1>

                <p>
                  Acesse sua conta para continuar
                  explorando conteúdos, treinamentos
                  e materiais Synter.
                </p>
              </div>

              {/* FORMULÁRIO */}

              <form
                className="login-form"
                onSubmit={handleSubmit}
              >

                {/* ERRO */}

                {errorMsg && (
                  <div
                    className="auth-error"
                    role="alert"
                  >
                    {errorMsg}
                  </div>
                )}

                {/* E-MAIL */}

                <div className="login-field">
                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="seuemail@empresa.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>

                {/* SENHA */}

                <div className="login-field">

                  <div className="login-password-header">
                    <label htmlFor="password">
                      Senha
                    </label>

                    <button
                      className="forgot-password"
                      type="button"
                      onClick={() =>
                        navigate("/forgot-password")
                      }
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                </div>

                {/* CAPTCHA */}

                <div className="captcha-container">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={
                      import.meta.env
                        .VITE_TURNSTILE_SITE_KEY
                    }
                    onSuccess={setCaptchaToken}
                    onExpire={() =>
                      setCaptchaToken("")
                    }
                    onError={() =>
                      setCaptchaToken("")
                    }
                  />
                </div>

                {/* BOTÃO ENTRAR */}

                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Entrando..."
                      : "Entrar"}
                  </span>

                  {!loading && (
                    <span className="login-submit-arrow">
                      →
                    </span>
                  )}
                </button>

                {/* CRIAR CONTA */}

                <div className="create-account">
                  <span>
                    Ainda não possui uma conta?
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/register")
                    }
                  >
                    Criar conta
                  </button>
                </div>

              </form>
            </div>
          </section>

          {/* ========================================
              LADO DIREITO
          ======================================== */}

          <section className="login-visual">
            <div className="login-visual-content">

              <div className="login-visual-text">
                <span>
                  TECNOLOGIA • CONHECIMENTO
                </span>

                <h2>
                  Tudo sobre a Synter
                  em um só lugar.
                </h2>

                <p>
                  Uma plataforma criada para
                  conectar pessoas, produtos e
                  conhecimento.
                </p>
              </div>

              <img
                src={LockImage}
                alt="Fechadura digital Synter"
                className="login-lock-image"
              />

            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;