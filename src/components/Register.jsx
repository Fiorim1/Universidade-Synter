
import { useEffect, useState, useRef } from "react";

import { Turnstile } from "@marsidev/react-turnstile";

import { supabase } from "../services/supabaseClient";

import {
  validateEmail,
  validatePassword,
  sanitizeEmail,
} from "../utils/validators";

import Header from "./Header";
import Hero from "./Hero";
import Footer from "./Footer";

import LockImage from "../assets/login-back.png";

import "../styles/Register.css";

// ========================================
// UNIVERSIDADE SYNTER
// CADASTRO DE USUÁRIOS
// SEM GOOGLE AUTHENTICATOR / MFA
// ========================================

function Register() {
  // ========================================
  // CAMPOS DO FORMULÁRIO
  // ========================================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [captchaToken, setCaptchaToken] =
    useState("");

  // ========================================
  // MENSAGENS
  // ========================================

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ========================================
  // MODAL DE VALIDAÇÃO DA SENHA
  // ========================================

  const [passwordModal, setPasswordModal] = useState({
    open: false,
    messages: [],
  });

  // ========================================
  // CARREGAMENTO
  // ========================================

  const [loading, setLoading] = useState(false);

  // ========================================
  // CLOUDFLARE TURNSTILE
  // ========================================

  const turnstileRef = useRef(null);

  // ========================================
  // ABRIR MODAL DE SENHA
  // ========================================

  function openPasswordModal(messages) {
    setPasswordModal({
      open: true,
      messages: Array.isArray(messages)
        ? messages
        : [messages],
    });
  }

  // ========================================
  // FECHAR MODAL DE SENHA
  // ========================================

  function closePasswordModal() {
    setPasswordModal({
      open: false,
      messages: [],
    });
  }

  // ========================================
  // COMPORTAMENTO DO MODAL
  // ========================================

  useEffect(() => {
    if (!passwordModal.open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closePasswordModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [passwordModal.open]);

  // ========================================
  // CADASTRAR USUÁRIO
  // ========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setErrorMsg("");
    setSuccessMsg("");
    closePasswordModal();

    // ====================================
    // VALIDAR NOME
    // ====================================

    const cleanName = fullName.trim();

    if (cleanName.length < 3) {
      setErrorMsg(
        "Digite seu nome completo."
      );

      return;
    }

    // ====================================
    // VALIDAR E-MAIL
    // ====================================

    const cleanEmail = sanitizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      setErrorMsg(
        "Digite um e-mail válido."
      );

      return;
    }

    // ====================================
    // VALIDAR SENHA
    // ====================================

    const passwordErrors =
      validatePassword(password);

    if (passwordErrors.length > 0) {
      openPasswordModal(passwordErrors);
      return;
    }

    // ====================================
    // CONFIRMAR SENHA
    // ====================================

    if (password !== confirmPassword) {
      openPasswordModal(
        "As senhas digitadas não coincidem."
      );

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
    // INICIAR CADASTRO
    // ====================================

    setLoading(true);

    try {
      // ==================================
      // CRIAR CONTA NO SUPABASE
      //
      // E-MAIL + SENHA
      // SEM EXIGÊNCIA DE MFA
      // ==================================

      const { error } =
        await supabase.auth.signUp({
          email: cleanEmail,

          password: password,

          options: {
            // Dados utilizados no perfil

            data: {
              full_name: cleanName,
            },

            // Após confirmar o e-mail,
            // o usuário retorna ao Login.

            emailRedirectTo:
              `${window.location.origin}/login`,

            // Proteção contra robôs

            captchaToken: captchaToken,
          },
        });

      // ==================================
      // ERRO DE CADASTRO
      // ==================================

      if (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Erro ao criar conta:",
            error.message
          );
        }

        // Mensagem genérica para não
        // revelar quais e-mails existem.

        setErrorMsg(
          "Não foi possível concluir o cadastro. Verifique os dados e tente novamente."
        );

        return;
      }

      // ==================================
      // CADASTRO CONCLUÍDO
      // ==================================

      setSuccessMsg(
        "Se este e-mail estiver disponível para cadastro, enviaremos uma mensagem de confirmação. Após confirmar seu endereço de e-mail, você poderá acessar a Universidade Synter utilizando seu e-mail e sua senha."
      );

      // ==================================
      // LIMPAR CAMPOS
      // ==================================

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Erro inesperado no cadastro:",
          error
        );
      }

      setErrorMsg(
        "Não foi possível concluir o cadastro. Tente novamente."
      );

    } finally {
      // ==================================
      // FINALIZAR CARREGAMENTO
      // ==================================

      setLoading(false);

      // ==================================
      // REINICIAR CAPTCHA
      // ==================================

      turnstileRef.current?.reset();

      setCaptchaToken("");
    }
  }

  // ========================================
  // INTERFACE DO CADASTRO
  // ========================================

  return (
    <div className="register-page">
      <Header />

      <main className="register-main">
        <div className="register-layout">

          {/* ====================================
              LADO ESQUERDO
          ==================================== */}

          <section className="register-left">
            <div className="register-content">

              {/* HERO */}

              <Hero
                one="Universidade Synter"
                two="Crie sua conta"
                three="Preencha seus dados abaixo para acessar conteúdos, treinamentos e materiais exclusivos."
              />

              {/* FORMULÁRIO */}

              <form
                className="register-form"
                onSubmit={handleSubmit}
              >

                {/* ERRO */}

                {errorMsg && (
                  <div
                    className="register-error"
                    role="alert"
                  >
                    {errorMsg}
                  </div>
                )}

                {/* SUCESSO */}

                {successMsg && (
                  <div
                    className="register-success"
                    role="status"
                  >
                    {successMsg}
                  </div>
                )}

                {/* ====================================
                    NOME COMPLETO
                ==================================== */}

                <div className="register-field">
                  <label htmlFor="fullName">
                    Nome completo
                  </label>

                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Digite seu nome completo"
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* ====================================
                    E-MAIL
                ==================================== */}

                <div className="register-field">
                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
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

                {/* ====================================
                    SENHAS
                ==================================== */}

                <div className="register-password-grid">

                  {/* SENHA */}

                  <div className="register-field">
                    <label htmlFor="password">
                      Senha
                    </label>

                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Digite sua senha"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* CONFIRMAR SENHA */}

                  <div className="register-field">
                    <label htmlFor="confirmPassword">
                      Confirmar senha
                    </label>

                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Repita sua senha"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />
                  </div>

                </div>

                {/* ====================================
                    CAPTCHA
                ==================================== */}

                <div className="register-captcha">
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

                {/* ====================================
                    BOTÃO CRIAR CONTA
                ==================================== */}

                <button
                  className="register-submit"
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Processando..."
                      : "Criar conta"}
                  </span>

                  {!loading && (
                    <span className="register-submit-arrow">
                      →
                    </span>
                  )}
                </button>

              </form>
            </div>
          </section>

          {/* ====================================
              LADO DIREITO
          ==================================== */}

          <section className="register-visual">
            <div className="register-visual-content">

              <div className="register-visual-text">
                <span>
                  CONHECIMENTO • TECNOLOGIA
                </span>

                <h2>
                  Faça parte da
                  Universidade Synter.
                </h2>

                <p>
                  Uma plataforma criada para
                  conectar pessoas, produtos,
                  treinamentos e conhecimento.
                </p>
              </div>

              <img
                src={LockImage}
                alt="Fechadura digital Synter"
                className="register-lock-image"
              />

            </div>
          </section>

        </div>
      </main>

      <Footer />

      {/* ========================================
          MODAL DE VALIDAÇÃO DA SENHA
      ======================================== */}

      {passwordModal.open && (
        <div
          className="register-password-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closePasswordModal();
            }
          }}
        >
          <section
            className="register-password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-password-modal-title"
          >

            {/* FECHAR */}

            <button
              type="button"
              className="register-password-modal-close"
              onClick={closePasswordModal}
              aria-label="Fechar aviso"
            >
              ×
            </button>

            {/* ÍCONE */}

            <div className="register-password-modal-icon">
              !
            </div>

            <span className="register-password-modal-eyebrow">
              UNIVERSIDADE SYNTER
            </span>

            <h2 id="register-password-modal-title">
              Verifique sua senha
            </h2>

            <p className="register-password-modal-description">
              Para continuar com o cadastro,
              corrija os itens abaixo.
            </p>

            <div className="register-password-modal-divider" />

            {/* LISTA DE ERROS */}

            <ul className="register-password-modal-list">
              {passwordModal.messages.map(
                (message, index) => (
                  <li
                    key={`${message}-${index}`}
                  >
                    {message}
                  </li>
                )
              )}
            </ul>

            {/* CONFIRMAR */}

            <button
              type="button"
              className="register-password-modal-confirm"
              onClick={closePasswordModal}
            >
              Entendi
            </button>

          </section>
        </div>
      )}

    </div>
  );
}

export default Register;
