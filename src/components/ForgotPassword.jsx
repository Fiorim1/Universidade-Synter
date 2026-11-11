
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";

import {
  sanitizeEmail,
  validateEmail,
} from "../utils/validators";

import LockImage from "../assets/login-back.png";

import "../styles/ForgotPassword.css";

/* ==========================================
   UNIVERSIDADE SYNTER
   RECUPERAÇÃO DE SENHA
========================================== */

const PRODUCTION_URL =
  "https://universidade-synter.vercel.app";

// ==========================================
// URL SEGURA DE REDIRECIONAMENTO
// ==========================================

function getRecoveryRedirectUrl() {
  const hostname = window.location.hostname;

  const isLocalDevelopment =
    import.meta.env.DEV &&
    (hostname === "localhost" ||
      hostname === "127.0.0.1");

  const origin = isLocalDevelopment
    ? window.location.origin
    : PRODUCTION_URL;

  return `${origin}/update-password`;
}

// ==========================================
// CLASSIFICAR FALHAS SEM EXPOR DADOS
// ==========================================

function getRecoveryErrorMessage(error) {
  const status = Number(error?.status || 0);

  const code = String(
    error?.code || ""
  ).toLowerCase();

  if (
    status === 429 ||
    code.includes("rate_limit") ||
    code.includes("over_request_rate_limit")
  ) {
    return (
      "O limite temporário de solicitações " +
      "foi atingido. Aguarde antes de " +
      "solicitar outro link."
    );
  }

  if (
    code.includes("captcha") ||
    code.includes("verification_failed")
  ) {
    return (
      "A verificação de segurança não foi " +
      "aceita. Conclua o desafio novamente."
    );
  }

  return (
    "Não foi possível processar a solicitação. " +
    "Tente novamente mais tarde."
  );
}

// ==========================================
// COMPONENTE
// ==========================================

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] =
    useState("");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [captchaError, setCaptchaError] =
    useState(false);

  const [captchaVersion, setCaptchaVersion] =
    useState(0);

  const turnstileRef = useRef(null);

  const turnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // ========================================
  // REINICIAR CAPTCHA
  // ========================================

  function resetCaptcha() {
    setCaptchaToken("");

    try {
      turnstileRef.current?.reset();
    } catch {
      // O usuário pode reiniciar o widget.
    }
  }

  function retryCaptcha() {
    setCaptchaError(false);
    setErrorMsg("");
    setCaptchaToken("");

    setCaptchaVersion((value) => value + 1);
  }

  // ========================================
  // SOLICITAR RECUPERAÇÃO
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setErrorMsg("");

    const cleanEmail =
      sanitizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      setErrorMsg("Digite um e-mail válido.");
      return;
    }

    if (!turnstileSiteKey) {
      setErrorMsg(
        "A verificação de segurança não está configurada."
      );
      return;
    }

    if (!captchaToken || captchaError) {
      setErrorMsg(
        "Conclua a verificação de segurança " +
        "antes de solicitar o link."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              getRecoveryRedirectUrl(),
            captchaToken,
          }
        );

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro na recuperação de senha:",
            {
              status: error.status,
              code: error.code,
              message: error.message,
            }
          );
        }

        setErrorMsg(
          getRecoveryErrorMessage(error)
        );
        return;
      }

      // Mensagem genérica para não permitir
      // a identificação de contas existentes.
      setMessage(
        "Se existir uma conta vinculada a " +
        "este e-mail, você receberá um link " +
        "para redefinir sua senha."
      );

      setEmail("");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro inesperado na recuperação:",
          error
        );
      }

      setErrorMsg(
        "Não foi possível solicitar a " +
        "recuperação. Tente novamente " +
        "mais tarde."
      );
    } finally {
      resetCaptcha();
      setLoading(false);
    }
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="forgot-page">
      <Header />

      <main className="forgot-main">
        <div className="forgot-layout">
          {/* FORMULÁRIO */}

          <section className="forgot-left">
            <div className="forgot-content">
              <Hero
                one="Esqueceu sua senha?"
                two="Não se preocupe!"
                three="Digite seu e-mail abaixo e enviaremos um link para redefinir sua senha."
              />

              <form
                className="forgot-form"
                onSubmit={handleSubmit}
              >
                {errorMsg && (
                  <div
                    className="forgot-error"
                    role="alert"
                    aria-live="polite"
                  >
                    {errorMsg}
                  </div>
                )}

                {/* E-MAIL */}

                <div className="forgot-field">
                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="seuemail@empresa.com"
                    autoComplete="email"
                    maxLength={254}
                    disabled={loading}
                    required
                  />
                </div>

                {/* CLOUDFLARE TURNSTILE */}

                <div className="forgot-captcha">
                  {turnstileSiteKey ? (
                    <Turnstile
                      key={captchaVersion}
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setCaptchaError(false);
                        setErrorMsg("");
                      }}
                      onExpire={() => {
                        setCaptchaToken("");
                      }}
                      onError={() => {
                        setCaptchaToken("");
                        setCaptchaError(true);

                        setErrorMsg(
                          "A verificação do Cloudflare " +
                          "falhou. Utilize a opção " +
                          "Tentar novamente."
                        );
                      }}
                    />
                  ) : (
                    <p
                      className="forgot-error"
                      role="alert"
                    >
                      Verificação de segurança
                      indisponível.
                    </p>
                  )}

                  {captchaError && (
                    <button
                      className="forgot-back"
                      type="button"
                      onClick={retryCaptcha}
                      disabled={loading}
                    >
                      Tentar verificação novamente
                    </button>
                  )}
                </div>

                {/* BOTÃO DE ENVIO */}

                <button
                  className="forgot-submit"
                  type="submit"
                  disabled={
                    loading ||
                    !captchaToken ||
                    captchaError
                  }
                >
                  <span>
                    {loading
                      ? "Enviando..."
                      : "Enviar link"}
                  </span>

                  {!loading && (
                    <span className="forgot-submit-arrow">
                      →
                    </span>
                  )}
                </button>

                {/* MENSAGEM DE SUCESSO */}

                {message && (
                  <div
                    className="forgot-success"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="forgot-success-icon">
                      ✓
                    </span>

                    <p>{message}</p>
                  </div>
                )}

                {/* VOLTAR AO LOGIN */}

                <button
                  className="forgot-back"
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  disabled={loading}
                >
                  ← Voltar para o login
                </button>
              </form>
            </div>
          </section>

          {/* APRESENTAÇÃO VISUAL */}

          <section className="forgot-visual">
            <div className="forgot-visual-content">
              <div className="forgot-visual-text">
                <span>
                  SEGURANÇA • ACESSO
                </span>

                <h2>
                  Recupere seu acesso
                  com segurança.
                </h2>

                <p>
                  Utilize o e-mail associado à
                  sua conta para receber as
                  instruções de redefinição
                  de senha.
                </p>
              </div>

              <img
                src={LockImage}
                alt="Fechadura digital Synter"
                className="forgot-lock-image"
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
