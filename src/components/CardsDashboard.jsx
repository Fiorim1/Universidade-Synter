
import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/CardsDashboard.css";

// ==========================================
// ÍCONE DE SETA — PADRÃO SYNTER
// ==========================================

function IconeSeta() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="m12 8 4 4-4 4" />
    </svg>
  );
}

// ==========================================
// ÍCONE FECHAR
// ==========================================

function IconeFechar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ==========================================
// CARD DASHBOARD
// ==========================================

function CardsDashboard({
  image,
  title,
  desc,
  route,
  enabled = true,
}) {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const tituloModalId = useId();

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  function handleClick() {
    if (enabled && route) {
      navigate(route);
      return;
    }

    setModalOpen(true);
  }

  // ========================================
  // FECHAR MODAL
  // ========================================

  function fecharModal() {
    setModalOpen(false);
  }

  // ========================================
  // ESC E ROLAGEM DA PÁGINA
  // ========================================

  useEffect(() => {
    if (!modalOpen) return;

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") {
        setModalOpen(false);
      }
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      aoPressionarTecla
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [modalOpen]);

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <>
      {/* =====================================
          CARD ORIGINAL UNIVERSIDADE SYNTER
      ===================================== */}

      <button
        type="button"
        className={`cads-container ${
          !enabled || !route
            ? "card-disabled"
            : ""
        }`}
        onClick={handleClick}
        aria-label={
          enabled && route
            ? `Acessar ${title}`
            : `${title} - conteúdo em desenvolvimento`
        }
      >
        {/* IMAGEM / ÍCONE */}

        <div className="card-image">
          {image && (
            <img
              src={image}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}
        </div>

        {/* INFORMAÇÕES */}

        <div className="content-text-cards">
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>

        {/* SETA ORIGINAL */}

        <span className="card-arrow">
          <IconeSeta />
        </span>
      </button>

      {/* =====================================
          MODAL — PROJETO EM PRODUÇÃO
      ===================================== */}

      {modalOpen && (
        <div
          className="card-production-overlay"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget
            ) {
              fecharModal();
            }
          }}
        >
          <section
            className="card-production-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloModalId}
          >
            {/* FECHAR */}

            <button
              type="button"
              className="card-production-close"
              onClick={fecharModal}
              aria-label="Fechar mensagem"
            >
              <IconeFechar />
            </button>

            {/* ÍCONE */}

            <div className="card-production-icon">
              <span aria-hidden="true">!</span>
            </div>

            {/* CONTEÚDO */}

            <div className="card-production-content">
              <span className="card-production-label">
                UNIVERSIDADE SYNTER
              </span>

              <h2 id={tituloModalId}>
                Projeto em Produção
              </h2>

              <p>
                Este conteúdo está em desenvolvimento
                e será disponibilizado em breve na
                Universidade Synter.
              </p>
            </div>

            {/* BOTÃO */}

            <button
              type="button"
              className="card-production-button"
              onClick={fecharModal}
            >
              Entendi
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default CardsDashboard;
