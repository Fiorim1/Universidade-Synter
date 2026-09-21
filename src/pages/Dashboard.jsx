import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";

import ManualIcon from "../assets/manual-icon.png";
import YtIcon from "../assets/yt-icon.png";
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

  const [profileOpen, setProfileOpen] = useState(false);


  return (

    <div className="dashboard-page">

      <Header />


      {/* HERO */}

      <section className="dashboard-hero-area">

        <div className="dashboard-profile">

          <UserProfileButton
            onClick={() => setProfileOpen(true)}
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


      {/* ACESSO RÁPIDO */}

      <main className="dashboard-content">

        <div className="dashboard-section-title">

          <div className="dashboard-section-bar"></div>

          <h4>
            ACESSO RÁPIDO
          </h4>

        </div>


        <div className="cards">

          <CardsDashboard
            image={ManualIcon}
            title="Manual de Produtos"
            desc="Acesse os manuais dos nossos produtos"
            onClick={() => navigate("/manuals")}
          />


          <CardsDashboard
            image={YtIcon}
            title="Vídeos de Instalação"
            desc="Acesse nossos vídeos de instalação"
            onClick={() => navigate("/videos")}
          />


          <CardsDashboard
            image={TreinamentoIcon}
            title="Treinamentos Técnicos"
            desc="Acesse nossos treinamentos técnicos"
          />


          <CardsDashboard
            image={TabelaIcon}
            title="Tabela de Preços"
            desc="Acesse nossa tabela de preços"
          />


          <CardsDashboard
            image={FtIcon}
            title="Fichas Técnicas"
            desc="Acesse as fichas técnicas dos nossos produtos"
          />


          <CardsDashboard
            image={ImgIcon}
            title="Imagens de Produtos"
            desc="Acesse as imagens dos nossos produtos"
          />


          <CardsDashboard
            image={TcIcon}
            title="Treinamento Comercial"
            desc="Acesse nosso treinamento comercial"
          />


          <CardsDashboard
            image={MktIcon}
            title="Materiais de Marketing"
            desc="Acesse nossos materiais de marketing"
          />


          <CardsDashboard
            image={AppIcon}
            title="Aplicativo Synter"
            desc="Desbrave mais sobre o aplicativo Synter"
          />


          <CardsDashboard
            image={QuestionIcon}
            title="Perguntas Frequentes"
            desc="Caso tenha uma pergunta, acesse aqui"
          />


          <CardsDashboard
            image={AstIcon}
            title="Assistência Técnica"
            desc="Acesse documentos relacionados à assistência técnica"
          />


          <CardsDashboard
            image={NvdIcon}
            title="Novidades Synter"
            desc="Acompanhe as novidades da Synter"
          />

        </div>

      </main>


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

export default Dashboard;