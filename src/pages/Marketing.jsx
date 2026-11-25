
import { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

// ==========================================
// ÍCONES ORIGINAIS
// ==========================================

import MKT1 from "../assets/logomkt1.png";
import MKT2 from "../assets/logomkt2.png";
import MKT3 from "../assets/logomkt3.png";

// ==========================================
// ESTILOS
// ==========================================

import "../styles/Marketing.css";
import "../styles/MarketingMobile.css";

// ==========================================
// ÍCONE PADRÃO SYNTER
// ==========================================

function IconeSynter() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

// ==========================================
// ÍCONES DOS DESTAQUES
// ==========================================

function IconeImagem() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
      />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

function IconeDivulgacao() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10v4a2 2 0 0 0 2 2h3l3 5h3l-3-6" />
      <path d="M8 10c5 0 8-2 12-5v14c-4-3-7-5-12-5v-4Z" />
    </svg>
  );
}

function IconeAcesso() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m13 2-8 11h6l-1 9 9-12h-6V2Z" />
    </svg>
  );
}

// ==========================================
// ÍCONE DE NAVEGAÇÃO
// ==========================================

function IconeSeta() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="m12 8 4 4-4 4" />
    </svg>
  );
}

// ==========================================
// DESTAQUES DO HERO
// ==========================================

function DestaqueMarketing({
  icone,
  titulo,
  descricao,
}) {
  return (
    <div className="mkt-feature">
      <span className="mkt-feature-icon">
        {icone}
      </span>

      <div className="mkt-feature-info">
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </div>
    </div>
  );
}

// ==========================================
// CARTÃO DE MARKETING
// ==========================================

function CartaoMarketing({
  imagem,
  titulo,
  descricao,
  rota,
  disponivel = false,
}) {
  const conteudo = (
    <>
      <div className="mkt-card-icon">
        <img
          src={imagem}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="mkt-card-info">
        <h3>{titulo}</h3>
        <p>{descricao}</p>
      </div>

      {disponivel && rota ? (
        <span
          className="mkt-card-arrow"
          aria-hidden="true"
        >
          <IconeSeta />
        </span>
      ) : (
        <span className="mkt-card-status">
          Em breve
        </span>
      )}
    </>
  );

  if (!disponivel || !rota) {
    return (
      <div
        className="mkt-card mkt-card-disabled"
        aria-disabled="true"
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      to={rota}
      className="mkt-card mkt-card-active"
      aria-label={`Acessar ${titulo}`}
    >
      {conteudo}
    </Link>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function Marketing() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  return (
    <div className="synter-marketing-page">

      {/* HEADER */}

      <Header />

      {/* =====================================
          HERO
      ===================================== */}

      <section className="mkt-hero">
        <div className="mkt-hero-container">

          <div className="mkt-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="mkt-hero-content">

            <div className="mkt-eyebrow">
              <IconeSynter />

              <span>
                CONTEÚDOS PARA DIVULGAÇÃO
              </span>
            </div>

            <h1 className="mkt-title">
              Materiais de Marketing
            </h1>

            <p className="mkt-description">
              Encontre artes, conteúdos e materiais
              de apoio para divulgar os produtos
              Synter e fortalecer suas ações de marketing.
            </p>

            {/* DESTAQUES — VISÍVEIS NO DESKTOP */}

            <div className="mkt-features">

              <DestaqueMarketing
                icone={<IconeImagem />}
                titulo="Materiais Visuais"
                descricao="Conteúdos para divulgação"
              />

              <DestaqueMarketing
                icone={<IconeDivulgacao />}
                titulo="Marketing"
                descricao="Apoio às ações comerciais"
              />

              <DestaqueMarketing
                icone={<IconeAcesso />}
                titulo="Acesso Rápido"
                descricao="Materiais em um só lugar"
              />

            </div>

          </div>
        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="mkt-main">

        <div className="mkt-section-heading">
          <span className="mkt-section-bar" />

          <h2>
            MATERIAIS DE MARKETING
          </h2>
        </div>

        <div className="mkt-cards-grid">

          {/* FECHADURAS DIGITAIS */}

          <CartaoMarketing
            imagem={MKT1}
            titulo="Vídeos e Imagens de Fechaduras Digitais"
            descricao="Acesse vídeos, imagens e materiais visuais das fechaduras digitais Synter para divulgação e apoio comercial."
            rota="/digmarketing"
            disponivel={true}
          />

          {/* FECHADURAS MECÂNICAS */}

          <CartaoMarketing
            imagem={MKT2}
            titulo="Vídeos e Imagens de Fechaduras Mecânicas"
            descricao="Acesse vídeos, imagens e materiais visuais das fechaduras mecânicas Synter para divulgação e apoio comercial."
            rota="/mecmarketing"
            disponivel={true}
          />

          {/* FERRAGENS */}

          <CartaoMarketing
            imagem={MKT3}
            titulo="Vídeos e Imagens de Ferragens"
            descricao="Acesse vídeos, imagens e materiais visuais das ferragens Synter para divulgação e apoio comercial."
            disponivel={false}
          />

        </div>

      </main>

      {/* FOOTER */}

      <Footer />

      {/* PERFIL */}

      {profileOpen && (
        <Profile
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}

    </div>
  );
}
