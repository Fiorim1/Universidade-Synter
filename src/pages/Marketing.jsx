
import { useState } from "react";

// ========================================
// COMPONENTES
// ========================================

import Header from "../components/Header";
import Profile from "../components/Profile";
import UserProfileButton from "../components/UserProfileButton";
import Footer from "../components/Footer";
import CardsDashboard from "../components/CardsDashboard";

// ========================================
// ÍCONES DOS CARTÕES
// ========================================

import MKT1 from "../assets/logomkt1.png";
import MKT2 from "../assets/logomkt2.png";
import MKT3 from "../assets/logomkt3.png";

// ========================================
// ESTILOS
// ========================================

import "../styles/Dashboard.css";
import "../styles/Marketing.css";
import "../styles/MarketingHero.css";

// ========================================
// ÍCONE GEOMÉTRICO PADRÃO SYNTER
// ========================================

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

// ========================================
// ÍCONES DOS DESTAQUES
// ========================================

function IconeConteudo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11v2a2 2 0 0 0 2 2h3l3 5h3l-3-6" />
      <path d="M8 10c5 0 8-2 12-5v14c-4-3-7-5-12-5V10Z" />
      <path d="M20 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

function IconeAcesso() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m13 2-8 11h6l-1 9 9-12h-6V2Z" />
    </svg>
  );
}

// ========================================
// COMPONENTE DE DESTAQUE
// ========================================

function DestaqueMarketing({
  icone,
  titulo,
  descricao,
}) {
  return (
    <div className="synter-mkt-feature">
      <span className="synter-mkt-feature-icon">
        {icone}
      </span>

      <div className="synter-mkt-feature-text">
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </div>
    </div>
  );
}

// ========================================
// PÁGINA DE MARKETING
// ========================================

function Marketing() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  return (
    <div className="dashboard-page synter-marketing-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <Header />

      {/* =====================================
          HERO PADRÃO UNIVERSIDADE SYNTER
      ===================================== */}

      <section className="synter-mkt-hero">
        <div className="synter-mkt-hero-container">

          {/* PERFIL */}

          <div className="synter-mkt-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          {/* CONTEÚDO */}

          <div className="synter-mkt-hero-content">

            <div className="synter-mkt-eyebrow">
              <IconeSynter />

              <span>
                CONTEÚDOS PARA DIVULGAÇÃO
              </span>
            </div>

            <h1 className="synter-mkt-title">
              Materiais de Marketing
            </h1>

            <p className="synter-mkt-description">
              Encontre artes, conteúdos e materiais de
              apoio para divulgar os produtos Synter
              e fortalecer suas ações de marketing.
            </p>

            {/* DESTAQUES */}

            <div className="synter-mkt-features">

              <DestaqueMarketing
                icone={<IconeConteudo />}
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

      <main className="dashboard-content">

        {/* TÍTULO DA SEÇÃO */}

        <div className="dashboard-section-title">
          <div className="dashboard-section-bar" />

          <h4>
            MATERIAIS DE MARKETING
          </h4>
        </div>

        {/* =====================================
            CARTÕES DE MARKETING
        ===================================== */}

        <div className="cards">

          {/* FECHADURAS DIGITAIS */}

          <CardsDashboard
            image={MKT1}
            title="Vídeos e Imagens de Fechaduras Digitais"
            desc="Acesse vídeos, imagens e materiais visuais das fechaduras digitais Synter para divulgação e apoio comercial."
            route="/digmarketing"
          />

          {/* FECHADURAS MECÂNICAS */}

          <CardsDashboard
            image={MKT2}
            title="Vídeos e Imagens de Fechaduras Mecânicas"
            desc="Acesse vídeos, imagens e materiais visuais das fechaduras mecânicas Synter para divulgação e apoio comercial."
            enabled={false}
          />

          {/* FERRAGENS */}

          <CardsDashboard
            image={MKT3}
            title="Vídeos e Imagens de Ferragens"
            desc="Acesse vídeos, imagens e materiais visuais das ferragens Synter para divulgação e apoio comercial."
            enabled={false}
          />

        </div>

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />

      {/* =====================================
          MODAL DO PERFIL
      ===================================== */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}

export default Marketing;