
import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

import AppIcon from "../assets/app-icon.png";
import AstIcon from "../assets/ast-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";

import "../styles/Dashboard.css";
import "../styles/DashboardSAC.css";

function DashboardSAC() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="dashboard-page dashboard-sac-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <Header />

      {/* ========================================
          HERO — PADRÃO SYNTER
      ======================================== */}

      <section className="dashboard-sac-hero">
        <div className="dashboard-sac-hero-inner">

          <div className="dashboard-sac-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="dashboard-sac-hero-text">

            <div className="dashboard-sac-eyebrow">
              <svg
                width="23"
                height="23"
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
                  rx="4"
                />
                <path d="M3 9h18M9 3v18" />
              </svg>

              <span>SUPORTE E ATENDIMENTO</span>
            </div>

            <h1>Gestão de Atendimento</h1>

            <p>
              Centralize os chamados técnicos, registre
              visitas e acompanhe os indicadores de
              qualidade e desempenho do SAC Synter.
            </p>

          </div>

        </div>
      </section>

      {/* ========================================
          CONTEÚDO PRINCIPAL
      ======================================== */}

      <main className="dashboard-content">

        <div className="dashboard-section-title">
          <div className="dashboard-section-bar"></div>
          <h4>ACESSO RÁPIDO</h4>
        </div>

        <div className="cards">

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

      {/* ========================================
          FOOTER
      ======================================== */}

      <Footer />

      {/* ========================================
          PERFIL
      ======================================== */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}

export default DashboardSAC;
