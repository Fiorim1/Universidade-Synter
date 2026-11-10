
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

const PRODUCTION_URL =
  "https://universidade-synter.vercel.app";

function obterUrlRecuperacao() {
  const host = window.location.hostname;

  const desenvolvimento =
    import.meta.env.DEV &&
    (host === "localhost" || host === "127.0.0.1");

  const base = desenvolvimento
    ? window.location.origin
    : PRODUCTION_URL;

  return `${base}/update-password`;
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const turnstileRef = useRef(null);

  const turnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY;

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setErrorMsg("");

    const cleanEmail = sanitizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      setErrorMsg("Digite um e-mail válido.");
      return;
    }

    if (!turnstileSiteKey) {
      setErrorMsg(
        "A verificação de segurança está indisponível."
      );
      return;
    }

    if (!captchaToken) {
      setErrorMsg(
        "Confirme a verificação de segurança."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: obterUrlRecuperacao(),
            captchaToken,
          }
        );

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro ao solicitar recuperação:",
            error
          );
        }

        setErrorMsg(
          "Não foi possível processar a solicitação. " +
          "Tente novamente em alguns instantes."
        );
        return;
      }

      // Não informa se o e-mail existe no sistema.
      setMessage(
        "Se existir uma conta vinculada a este e-mail, " +
        "você receberá um link para redefinir sua senha."
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
        "Não foi possível processar a solicitação. " +
        "Tente novamente em alguns instantes."
      );
    } finally {
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setLoading(false);
    }
  }

  return (
    <div className="forgot-page">
      <Header />

      <main className="forgot-main">
        <div className="forgot-layout">
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
                  >
                    {errorMsg}
                  </div>
                )}

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
                      setEmail(event.target.value)
                    }
                    placeholder="seuemail@empresa.com"
                    autoComplete="email"
                    maxLength={254}
                    disabled={loading}
                    required
                  />
                </div>

                {turnstileSiteKey && (
                  <div className="forgot-captcha">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setErrorMsg("");
                      }}
                      onExpire={() => {
                        setCaptchaToken("");
                      }}
                      onError={() => {
                        setCaptchaToken("");
                        setErrorMsg(
                          "Não foi possível validar a " +
                          "verificação de segurança."
                        );
                      }}
                    />
                  </div>
                )}

                <button
                  className="forgot-submit"
                  type="submit"
                  disabled={loading || !captchaToken}
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

                <button
                  className="forgot-back"
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                >
                  ← Voltar para o login
                </button>
              </form>
            </div>
          </section>

          <section className="forgot-visual">
            <div className="forgot-visual-content">
              <div className="forgot-visual-text">
                <span>SEGURANÇA • ACESSO</span>

                <h2>
                  Recupere seu acesso
                  com segurança.
                </h2>

                <p>
                  Utilize o e-mail associado à sua
                  conta para receber as instruções
                  de redefinição de senha.
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
