import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

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
import AstIcon from "../assets/ast-icon.png";
import NvdIcon from "../assets/nvd-icon.png";

import "../styles/Dashboard.css";


function Dashboard() {

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);


  return (

    <div className="dashboard-page">

      <Header />


      {/* ================================= */}
      {/* HERO                              */}
      {/* ================================= */}

      <section className="dashboard-hero-area">

        <div className="dashboard-profile">

          <UserProfileButton
            onClick={() =>
              setProfileOpen(true)
            }
          />

        </div>


        <div className="dashboard-hero-content">

          <Hero
            variant="dashboard"
            one="Plataforma de Conhecimento"
            two="Universidade Synter"
            three="Aqui você encontra tudo sobre nossos produtos, treinamentos e materiais de apoio para o seu dia a dia."
            showFeatures
          />

        </div>

      </section>


      {/* ================================= */}
      {/* ACESSO RÁPIDO                     */}
      {/* ================================= */}

      <main className="dashboard-content">

        <div className="dashboard-section-title">

          <div className="dashboard-section-bar"></div>

          <h4>
            ACESSO RÁPIDO
          </h4>

        </div>


        <div className="cards">


          {/* ================================= */}
          {/* APLICATIVO SYNTER                 */}
          {/* ================================= */}

          <CardsDashboard
            image={AppIcon}
            title="Aplicativo Synter"
            desc="Desbrave mais sobre o aplicativo Synter"
            enabled={false}
          />


          {/* ================================= */}
          {/* ASSISTÊNCIA TÉCNICA               */}
          {/* ================================= */}

          <CardsDashboard
            image={AstIcon}
            title="Assistência Técnica"
            desc="Consulte e baixe seus chamados de assistência técnica"
            route="/assistencia-tecnica"
          />


          {/* ================================= */}
          {/* FICHAS TÉCNICAS                   */}
          {/* ================================= */}

          <CardsDashboard
            image={FtIcon}
            title="Fichas Técnicas"
            desc="Acesse as fichas técnicas dos nossos produtos"
            enabled={false}
          />


          {/* ================================= */}
          {/* ORÇAMENTOS                        */}
          {/* ================================= */}

          <CardsDashboard
            image={ImgIcon}
            title="Orçamentos"
            desc="Crie e acompanhe seus orçamentos"
            route="/orcamentos"
          />


          {/* ================================= */}
          {/* MANUAL DE PRODUTOS                */}
          {/* ================================= */}

          <CardsDashboard
            image={ManualIcon}
            title="Manual de Produtos"
            desc="Acesse os manuais dos nossos produtos"
            route="/manuals"
          />


          {/* ================================= */}
          {/* MATERIAIS DE MARKETING            */}
          {/* ================================= */}

          <CardsDashboard
            image={MktIcon}
            title="Materiais de Marketing"
            desc="Acesse nossos materiais de marketing"
            route="/marketing"
          />


          {/* ================================= */}
          {/* NOVIDADES SYNTER                  */}
          {/* ================================= */}

          <CardsDashboard
            image={NvdIcon}
            title="Novidades Synter"
            desc="Acompanhe as novidades da Synter"
            enabled={false}
          />


          {/* ================================= */}
          {/* PERGUNTAS FREQUENTES              */}
          {/* ================================= */}

          <CardsDashboard
            image={QuestionIcon}
            title="Perguntas Frequentes"
            desc="Caso tenha uma pergunta, acesse aqui"
            enabled={false}
          />


          {/* ================================= */}
          {/* TABELA DE PREÇOS                  */}
          {/* ================================= */}

          <CardsDashboard
            image={TabelaIcon}
            title="Tabela de Preços"
            desc="Acesse nossa tabela de preços"
            route="/tabela-precos"
          />


          {/* ================================= */}
          {/* TREINAMENTO COMERCIAL             */}
          {/* ================================= */}

          <CardsDashboard
            image={TcIcon}
            title="Treinamento Comercial"
            desc="Acesse nossos treinamentos comerciais"
            enabled={false}
          />


          {/* ================================= */}
          {/* TREINAMENTOS TÉCNICOS             */}
          {/* ================================= */}

          <CardsDashboard
            image={TreinamentoIcon}
            title="Treinamentos Técnicos"
            desc="Acesse nossos treinamentos técnicos"
            enabled={false}
          />


          {/* ================================= */}
          {/* VÍDEOS DE INSTALAÇÃO              */}
          {/* ================================= */}

          <CardsDashboard
            image={YtIcon}
            title="Vídeos de Instalação"
            desc="Acesse nossos vídeos de instalação"
            route="/videos"
          />


        </div>

      </main>


      {/* ================================= */}
      {/* FOOTER                            */}
      {/* ================================= */}

      <Footer />


      {/* ================================= */}
      {/* PERFIL                            */}
      {/* ================================= */}

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


export default Dashboard;