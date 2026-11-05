
import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

// ========================================
// ÍCONES DOS CARTÕES
// ========================================

import AppIcon from "../assets/app-icon.png";
import AstIcon from "../assets/ast-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";

// ========================================
// ESTILOS
// ========================================

import "../styles/Dashboard.css";
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
// DASHBOARD SAC
// ========================================

function DashboardSAC() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="dashboard-page dashboard-sac-page">

      {/* HEADER */}

      <Header />

      {/* =====================================
          HERO — PADRÃO UNIVERSIDADE SYNTER
      ===================================== */}

      <section className="synter-sac-hero">
        <div className="synter-sac-hero-container">

          <div className="synter-sac-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
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
              Centralize os chamados técnicos, registre
              visitas e acompanhe os indicadores de
              qualidade e desempenho do SAC Synter.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO — ACESSO RÁPIDO
      ===================================== */}

      <main className="dashboard-content synter-sac-content">

        <div className="dashboard-section-title synter-sac-section-title">
          <div className="dashboard-section-bar" />

          <h4>
            ACESSO RÁPIDO
          </h4>
        </div>

        {/* TRÊS CARTÕES LADO A LADO */}

        <div className="cards synter-sac-cards">

          <CardsDashboard
            image={AppIcon}
            title="Chamados Técnicos"
            desc="Consulte os chamados e acompanhe os atendimentos dos clientes."
            route="/assistencia-tecnica"
          />

          <CardsDashboard
            image={AstIcon}
            title="Documentos de Visita Técnica"
            desc="Registre visitas, colete assinaturas e gere formulários em PDF."
            route="/visitas-tecnicas"
          />

          <CardsDashboard
            image={TabelaIcon}
            title="Synter Analytics"
            desc="Analise os chamados do Notion com gráficos, relatórios e indicadores gerenciais."
            route="/synter-analytics"
          />

        </div>

      </main>

      {/* FOOTER */}

      <Footer />

      {/* PERFIL */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}

export default DashboardSAC;
