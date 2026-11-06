
import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

// ==========================================
// ÍCONES
// ==========================================

import ManualIcon from "../assets/manual-icon.png";
import YtIcon from "../assets/Yt-Icon.png";
import TreinamentoIcon from "../assets/treinamento-icon.png";
import TabelaIcon from "../assets/tabela-icon.png";
import FtIcon from "../assets/Ft-icon.png";
import ImgIcon from "../assets/img-icon.png";
import TcIcon from "../assets/tc-icon.png";
import MktIcon from "../assets/mkt-icon.png";
import AppIcon from "../assets/app-icon.png";
import QuestionIcon from "../assets/perguntas-icon.png";
import NvdIcon from "../assets/nvd-icon.png";

// ==========================================
// ESTILOS
// ==========================================

import "../styles/Dashboard.css";
import "../styles/DashboardHero.css";
import "../styles/DashboardGrid.css";

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
// ÍCONES DO HERO
// ==========================================

function IconeAtualizado() {
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
      <path d="m12 2 3 2 3.5.3.7 3.5L21 11l-1.8 3.2-.7 3.5-3.5.3-3 2-3-2-3.5-.3-.7-3.5L3 11l1.8-3.2.7-3.5L9 4l3-2Z" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}

function IconeTreinamento() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
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

// ==========================================
// DESTAQUES DO HERO
// ==========================================

function DestaqueDashboard({
  icone,
  titulo,
  descricao,
}) {
  return (
    <div className="synter-db-feature">
      <span className="synter-db-feature-icon">
        {icone}
      </span>

      <div className="synter-db-feature-text">
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD PRINCIPAL
// ==========================================

function Dashboard() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  return (
    <div className="dashboard-page synter-dashboard">

      {/* HEADER */}

      <Header />

      {/* =====================================
          HERO
      ===================================== */}

      <section className="synter-db-hero">
        <div className="synter-db-hero-container">

          {/* PERFIL */}

          <div className="synter-db-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          {/* INFORMAÇÕES PRINCIPAIS */}

          <div className="synter-db-hero-content">

            <div className="synter-db-eyebrow">
              <IconeSynter />

              <span>
                PLATAFORMA DE CONHECIMENTO
              </span>
            </div>

            <h1 className="synter-db-title">
              Universidade Synter
            </h1>

            <p className="synter-db-description">
              Aqui você encontra tudo sobre nossos
              produtos, treinamentos e materiais de
              apoio para o seu dia a dia.
            </p>

            {/* DESTAQUES */}

            <div className="synter-db-features">

              <DestaqueDashboard
                icone={<IconeAtualizado />}
                titulo="Conteúdo Atualizado"
                descricao="Materiais sempre disponíveis"
              />

              <DestaqueDashboard
                icone={<IconeTreinamento />}
                titulo="Treinamentos"
                descricao="Conteúdo técnico e comercial"
              />

              <DestaqueDashboard
                icone={<IconeAcesso />}
                titulo="Acesso Rápido"
                descricao="Tudo em um único lugar"
              />

            </div>

          </div>
        </div>
      </section>

      {/* =====================================
          ACESSO RÁPIDO
      ===================================== */}

      <main className="dashboard-content">

        <div className="dashboard-section-title">
          <div className="dashboard-section-bar" />
          <h4>ACESSO RÁPIDO</h4>
        </div>

        <div className="cards">

          {/* APLICATIVO SYNTER */}

          <CardsDashboard
            image={AppIcon}
            title="Aplicativo Synter"
            desc="Aprenda a utilizar o aplicativo Synter Smart"
            route="/aplicativo-synter"
            enabled={true}
          />

          {/* ASSISTÊNCIA TÉCNICA */}

          <CardsDashboard
            image={FtIcon}
            title="Assistência / Suporte Técnico"
            desc="Acesse nosso SAC"
            route="/dashsac"
          />

          {/* FICHAS TÉCNICAS */}

          <CardsDashboard
            image={FtIcon}
            title="Fichas Técnicas"
            desc="Acesse as fichas técnicas dos nossos produtos"
            route="/fichas-tecnicas"
          />

          {/* ORÇAMENTOS */}

          <CardsDashboard
            image={ImgIcon}
            title="Orçamentos"
            desc="Crie e acompanhe seus orçamentos"
            route="/orcamentos"
          />

          {/* MANUAIS */}

          <CardsDashboard
            image={ManualIcon}
            title="Manual de Produtos"
            desc="Acesse os manuais dos nossos produtos"
            route="/manuals"
          />

          {/* MARKETING */}

          <CardsDashboard
            image={MktIcon}
            title="Materiais de Marketing"
            desc="Acesse nossos materiais de marketing"
            route="/marketing"
          />

          {/* =================================
              SELETOR DE FECHADURAS
              NOVA FUNCIONALIDADE
          ================================= */}

          <CardsDashboard
            image={NvdIcon}
            title="Seletor de Fechaduras"
            desc="Encontre modelos Synter conforme a necessidade do cliente."
            route="/seletor-fechaduras"
            enabled={true}
          />

          {/* PERGUNTAS FREQUENTES */}

          <CardsDashboard
            image={QuestionIcon}
            title="Perguntas Frequentes"
            desc="Encontre respostas e orientações sobre os produtos Synter."
            route="/perguntas-frequentes"
          />

          {/* TABELA DE PREÇOS */}

          <CardsDashboard
            image={TabelaIcon}
            title="Tabela de Preços"
            desc="Acesse nossa tabela de preços"
            route="/tabela-precos"
          />

          {/* TREINAMENTO COMERCIAL */}

          <CardsDashboard
            image={TcIcon}
            title="Treinamento Comercial"
            desc="Acesse nossos treinamentos comerciais"
            route="/treinamento-comercial"
            enabled={true}
          />

          {/* TREINAMENTOS TÉCNICOS */}

          <CardsDashboard
            image={TreinamentoIcon}
            title="Treinamentos Técnicos"
            desc="Acesse nossos treinamentos técnicos"
            enabled={false}
          />

          {/* VÍDEOS DE INSTALAÇÃO */}

          <CardsDashboard
            image={YtIcon}
            title="Vídeos de Instalação"
            desc="Acesse nossos vídeos de instalação"
            route="/videos"
          />

        </div>
      </main>

      {/* FOOTER */}

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

export default Dashboard;
