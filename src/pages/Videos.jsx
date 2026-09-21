import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

import videoReversao from "../videos/Syrius_S2 _Reversão_do_lado_de_abertura.MOV";
import videoResetS1 from "../videos/Reset_Syrius_S1_Pro.mp4"
import videoResetS2 from "../videos/Linha_Syrius_s2_Reset.mp4"
import videoRetiradaPortaS2 from "../videos/Linha_Syrius_s2_Retirada_da_Porta.mp4"
import s2cadastroApp from "../videos/Linha-Syrius-s2-Cadastro-no-app.mp4"
import trocaPlacaBateriaS1 from "../videos/Linha-S1-Troca-de-placa-da- bateria.mp4"
import erroPortaAbertaS1 from "../videos/Linha-S1-Erro-porta-sempre-aberta.mp4"
import cadastroVenusS3 from "../videos/Venus-S3-Cadastro.mp4"
import cadastroMarsS2 from "../videos/Linha-Mars-S2-Cadastro.mp4"
import resetMarsS2 from "../videos/Linha-Mars-S2-Reset.mp4"

import capaSyriusReversao from "../assets/SyriusS2-Reversao.png";
import capaResetS1 from "../assets/caparesets1.png"
import capaResetS2 from "../assets/caparesets2.png"
import capaRetiradaPortaS2 from "../assets/retiradaportas2.png"
import cadastroAppS2 from "../assets/s2cadastroapp.png"
import trocaPlacaS1 from "../assets/trocaplacas1.png"
import erroPortaSempreAbertaS1 from "../assets/erroportaabertas1.png"
import cadastroVenusS3IMG from "../assets/cadastros3venus.png"
import cadastroMarsS2IMG from "../assets/marss2cadastro.png"
import resetMarsS2IMG from "../assets/marss2reset.png"

import "../styles/Videos.css";


function Videos() {

  const [profileOpen, setProfileOpen] = useState(false);

  return (

    <div className="videos-page">

      <Header />


      {/* HERO */}

      <section className="videos-hero-area">

        <div className="videos-profile">

          <UserProfileButton
            onClick={() => setProfileOpen(true)}
          />

        </div>

        {/* PERFIL */}

        {profileOpen && (

          <Profile
            onClose={() => setProfileOpen(false)}
          />

        )}


        <div className="videos-hero-content">

          <Hero
            variant="dashboard"
            one="Conteúdo em Vídeo"
            two="Vídeos Educativos"
            three="Aprenda através de vídeos práticos sobre instalação, configuração e utilização dos produtos Synter."
          />

        </div>

      </section>


      {/* CONTEÚDO */}

      <main className="videos-content">

        <div className="videos-section-title">

          <div className="videos-section-bar"></div>

          <h4>
            VÍDEOS DE INSTALAÇÃO
          </h4>

        </div>


        <div className="videos-grid">

          <VideoCard
            titulo="Syrius S2 - Reversão do lado de abertura"
            descricao="Aprenda como realizar corretamente a reversão do lado de abertura."
            video={videoReversao}
            capa={capaSyriusReversao}
          />

          <VideoCard
            titulo="Syrius S1 - Como realizar o reset"
            descricao="Aprenda como realizar corretamente o processo de reset da fechadura."
            video={videoResetS1}
            capa={capaResetS1}
          />

          <VideoCard
            titulo="Syrius S2 - Como realizar o reset"
            descricao="Aprenda como realizar corretamente o processo de reset da fechadura."
            video={videoResetS2}
            capa={capaResetS2}
          />

          <VideoCard
            titulo="Syrius S2 - Retirada da Porta"
            descricao="Aprenda o passo a passo para realizar corretamente a retirada da fechadura da porta."
            video={videoRetiradaPortaS2}
            capa={cadastroAppS2}
          />

          <VideoCard
            titulo="Syrius S2 - Cadastr no App"
            descricao="Aprenda como realizar corretamente o cadastro da fechadura da linha Syrius S2 no aplicativo Synter."
            video={s2cadastroApp}
            capa={capaRetiradaPortaS2}
          />

          <VideoCard
            titulo="Syrius S1 - Troca de Placa da Bateria"
            descricao="Aprenda o passo a passo para realizar corretamente a troca da placa da bateria nas fechaduras da linha S1."
            video={trocaPlacaBateriaS1}
            capa={trocaPlacaS1}
          />

          <VideoCard
            titulo="Syrius S1 - Erro Porta Sempre Aberta"
            descricao="Aprenda como identificar e corrigir o erro de porta sempre aberta nas fechaduras da linha S1."
            video={erroPortaAbertaS1}
            capa={erroPortaSempreAbertaS1}
          />
          <VideoCard
            titulo="Venus S3 - Cadastro"
            descricao="Aprenda como realizar corretamente o cadastro da fechadura Venus S3."
            video={cadastroVenusS3}
            capa={cadastroVenusS3IMG}
          />

          <VideoCard
            titulo="Mars S2 - Cadastro"
            descricao="Aprenda como realizar corretamente o cadastro das fechaduras da linha Mars S2."
            video={cadastroMarsS2}
            capa={cadastroMarsS2IMG}
          />

          <VideoCard
            titulo="Mars S2 - Reset"
            descricao="Aprenda como realizar corretamente o reset das fechaduras da linha Mars S2."
            video={resetMarsS2}
            capa={resetMarsS2IMG}
          />

        </div>

      </main>


      <Footer />



    </div>

  );

}

export default Videos;