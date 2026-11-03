
import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

// ========================================
// ÍCONES
// ========================================

import AppIcon from "../assets/app-icon.png";
import AstIcon from "../assets/ast-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";

// ========================================
// ESTILOS
// ========================================

import "../styles/Dashboard.css";

// ========================================
// DASHBOARD SAC
// ========================================

function DashboardSAC() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="dashboard-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <Header />

      {/* ========================================
          HERO
      ======================================== */}

      <section className="dashboard-hero-area">

        <div className="dashboard-profile">
          <UserProfileButton
            onClick={() => setProfileOpen(true)}
          />
        </div>

        <div className="dashboard-hero-content">
          <Hero
            variant="dashboard"
            one="Gestão de Atendimento"
            two="Universidade Synter | SAC"
            three="Centralize os chamados técnicos, registre visitas e acompanhe os indicadores de qualidade e desempenho do atendimento."
            showFeatures
          />
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

        {/* ========================================
            CARTÕES DO DASHBOARD
        ======================================== */}

        <div className="cards">

          {/* ====================================
              CHAMADOS TÉCNICOS
          ==================================== */}

          <CardsDashboard
            image={AppIcon}
            title="Chamados Técnicos"
            desc="Consulte os chamados e acompanhe os atendimentos dos clientes."
            route="/assistencia-tecnica"
          />

          {/* ====================================
              VISITAS TÉCNICAS
          ==================================== */}

          <CardsDashboard
            image={AstIcon}
            title="Documentos de Visita Técnica"
            desc="Registre visitas, colete assinaturas e gere formulários em PDF."
            route="/visitas-tecnicas"
          />

          {/* ====================================
              SYNTER ANALYTICS
          ==================================== */}

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
          MODAL DO PERFIL
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
