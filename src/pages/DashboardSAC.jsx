
import { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import AppIcon from "../assets/app-icon.png";
import AstIcon from "../assets/ast-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";

import "../styles/DashboardSAC.css";

// ========================================
// ÍCONE PADRÃO SYNTER
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
// ÍCONE DE SETA
// ========================================

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

// ========================================
// CARTÃO PADRÃO SAC
// ========================================

function CartaoSAC({
  imagem,
  titulo,
  descricao,
  rota,
}) {
  return (
    <Link
      to={rota}
      className="sac-link-card"
      aria-label={`Acessar ${titulo}`}
    >
      <div className="sac-link-icon">
        <img
          src={imagem}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="sac-link-info">
        <h3>{titulo}</h3>
        <p>{descricao}</p>
      </div>

      <span
        className="sac-link-arrow"
        aria-hidden="true"
      >
        <IconeSeta />
      </span>
    </Link>
  );
}

// ========================================
// DASHBOARD SAC
// ========================================

export default function DashboardSAC() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  return (
    <div className="dashboard-sac-page">
      <Header />

      {/* ====================================
          HERO PADRÃO UNIVERSIDADE SYNTER
      ==================================== */}

      <section className="synter-sac-hero">
        <div className="synter-sac-hero-container">

          <div className="synter-sac-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="synter-sac-hero-content">
            <div className="synter-sac-eyebrow">
              <IconeSynter />
              <span>
                SUPORTE E ATENDIMENTO
              </span>
            </div>

            <h1 className="synter-sac-title">
              Gestão de Atendimento
            </h1>

            <p className="synter-sac-description">
              Centralize os chamados técnicos,
              registre visitas e acompanhe os
              indicadores de qualidade e desempenho
              do SAC Synter.
            </p>
          </div>

        </div>
      </section>

      {/* ====================================
          ACESSO RÁPIDO
      ==================================== */}

      <main className="sac-quick-content">

        <div className="sac-section-heading">
          <span className="sac-section-bar" />

          <h2>
            ACESSO RÁPIDO
          </h2>
        </div>

        <div className="sac-links-grid">

          <CartaoSAC
            imagem={AppIcon}
            titulo="Chamados Técnicos"
            descricao="Consulte os chamados e acompanhe os atendimentos dos clientes."
            rota="/assistencia-tecnica"
          />

          <CartaoSAC
            imagem={AstIcon}
            titulo="Documentos de Visita Técnica"
            descricao="Registre visitas, colete assinaturas e gere formulários em PDF."
            rota="/visitas-tecnicas"
          />

          <CartaoSAC
            imagem={TabelaIcon}
            titulo="Synter Analytics"
            descricao="Analise os chamados com gráficos, relatórios e indicadores gerenciais."
            rota="/synter-analytics"
          />

        </div>
      </main>

      <Footer />

      {/* ====================================
          PERFIL
      ==================================== */}

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
