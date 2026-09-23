import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";


// ===============================
// VÍDEOS
// ===============================

import videoReversao from "../videos/Syrius_S2 _Reversão_do_lado_de_abertura.MOV";
import videoResetS1 from "../videos/Reset_Syrius_S1_Pro.mp4";
import videoResetS2 from "../videos/Linha_Syrius_s2_Reset.mp4";
import videoRetiradaPortaS2 from "../videos/Linha_Syrius_s2_Retirada_da_Porta.mp4";
import s2cadastroApp from "../videos/Linha-Syrius-s2-Cadastro-no-app.mp4";
import trocaPlacaBateriaS1 from "../videos/Linha-S1-Troca-de-placa-da- bateria.mp4";

import erroPortaAbertaS1 from "../videos/Linha-S1-Erro-porta-sempre-aberta.MP4";

import cadastroVenusS3 from "../videos/Venus-S3-Cadastro.mp4";

import cadastroMarsS2 from "../videos/Linha-Mars-S2-Cadastro.mp4";
import resetMarsS2 from "../videos/Linha-Mars-S2-Reset.mp4";

import trocaIdiomaS3 from "../videos/Venus-S3-Troca-De-Idioma.MP4";
import trocaIdiomaS2 from "../videos/Venus-S2-Troca-De-Idioma.MP4";

import marsTraseira from "../videos/Linha-Mars s2-retirada-da-porta-parte-traseira.mp4";
import marsFrontal from "../videos/mars-s2-parte-frontal.mp4";

import x1Reset from "../videos/Linha-X1-Reset.MP4";
import x1ExcluirSenhaUser from "../videos/x1-excluir-usuario.MP4";
import x1ConfigSom from "../videos/x1-config-som.MP4";

import x1CadastroUser from "../videos/x1-cad-user.mp4";
import x1CadastroAdm from "../videos/x1-cad-adm.mp4";


// ===============================
// CAPAS
// ===============================

import capaSyriusReversao from "../assets/SyriusS2-Reversao.png";
import capaResetS1 from "../assets/caparesets1.png";
import capaResetS2 from "../assets/caparesets2.png";
import capaRetiradaPortaS2 from "../assets/retiradaportas2.png";
import cadastroAppS2 from "../assets/s2cadastroapp.png";
import trocaPlacaS1 from "../assets/trocaplacas1.png";
import erroPortaSempreAbertaS1 from "../assets/erroportaabertas1.png";
import cadastroVenusS3IMG from "../assets/cadastros3venus.png";
import cadastroMarsS2IMG from "../assets/marss2cadastro.png";
import resetMarsS2IMG from "../assets/marss2reset.png";
import venuss3TrocaIdioma from "../assets/venuss3trocaidioma.png";
import venuss2TrocaIdioma from "../assets/venuss2trocaidioma.png";
import marsS2Traseira from "../assets/marsS2traseira.png";
import marsS2Frontal from "../assets/marss2frontal.png";
import x1ResetImg from "../assets/x1reset.png";
import x1ExcluirSenha from "../assets/x1exclusaosenhauser.png";
import x1ConfigAudio from "../assets/x1configsom.png";
import x1CadUser from "../assets/x1cadastrouser.png";
import x1CadAdm from "../assets/x1cadadm.png";

import "../styles/Videos.css";


function Videos() {

  const [profileOpen, setProfileOpen] = useState(false);

  // Guarda aquilo que o usuário digitar
  const [pesquisa, setPesquisa] = useState("");


  // Verifica se o título contém o texto pesquisado
  function mostrarCard(titulo) {

    return titulo
      .toLowerCase()
      .includes(pesquisa.toLowerCase());

  }


  return (

    <div className="videos-page">

      <Header />


      {/* ======================================== */}
      {/* HERO                                     */}
      {/* ======================================== */}

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


      {/* ======================================== */}
      {/* CONTEÚDO                                 */}
      {/* ======================================== */}

      <main className="videos-content">


        {/* ======================================== */}
        {/* TÍTULO                                   */}
        {/* ======================================== */}

        <div className="videos-section-title">

          <div className="videos-section-bar"></div>

          <h4>
            VÍDEOS DE INSTALAÇÃO
          </h4>

        </div>


        {/* ======================================== */}
        {/* PESQUISA                                 */}
        {/* ======================================== */}

        <div className="pesquisa-videos">

          <input
            type="text"
            placeholder="Pesquisar vídeo..."
            value={pesquisa}
            onChange={(evento) => setPesquisa(evento.target.value)}
          />

        </div>


        {/* ======================================== */}
        {/* CARDS                                    */}
        {/* ======================================== */}

        <div className="videos-grid">


          {mostrarCard("Syrius S2 - Reversão do lado de abertura") && (

            <VideoCard
              titulo="Syrius S2 - Reversão do lado de abertura"
              descricao="Aprenda como realizar corretamente a reversão do lado de abertura."
              video={videoReversao}
              capa={capaSyriusReversao}
            />

          )}


          {mostrarCard("Syrius S1 - Como realizar o reset") && (

            <VideoCard
              titulo="Syrius S1 - Como realizar o reset"
              descricao="Aprenda como realizar corretamente o processo de reset da fechadura."
              video={videoResetS1}
              capa={capaResetS1}
            />

          )}


          {mostrarCard("Syrius S2 - Como realizar o reset") && (

            <VideoCard
              titulo="Syrius S2 - Como realizar o reset"
              descricao="Aprenda como realizar corretamente o processo de reset da fechadura."
              video={videoResetS2}
              capa={capaResetS2}
            />

          )}


          {mostrarCard("Syrius S2 - Retirada da Porta") && (

            <VideoCard
              titulo="Syrius S2 - Retirada da Porta"
              descricao="Aprenda o passo a passo para realizar corretamente a retirada da fechadura da porta."
              video={videoRetiradaPortaS2}
              capa={cadastroAppS2}
            />

          )}


          {mostrarCard("Syrius S2 - Cadastro no App") && (

            <VideoCard
              titulo="Syrius S2 - Cadastro no App"
              descricao="Aprenda como realizar corretamente o cadastro da fechadura da linha Syrius S2 no aplicativo Synter."
              video={s2cadastroApp}
              capa={capaRetiradaPortaS2}
            />

          )}


          {mostrarCard("Syrius S1 - Troca de Placa da Bateria") && (

            <VideoCard
              titulo="Syrius S1 - Troca de Placa da Bateria"
              descricao="Aprenda o passo a passo para realizar corretamente a troca da placa da bateria nas fechaduras da linha S1."
              video={trocaPlacaBateriaS1}
              capa={trocaPlacaS1}
            />

          )}


          {mostrarCard("Syrius S1 - Erro Porta Sempre Aberta") && (

            <VideoCard
              titulo="Syrius S1 - Erro Porta Sempre Aberta"
              descricao="Aprenda como identificar e corrigir o erro de porta sempre aberta nas fechaduras da linha S1."
              video={erroPortaAbertaS1}
              capa={erroPortaSempreAbertaS1}
            />

          )}


          {mostrarCard("Venus S3 - Cadastro") && (

            <VideoCard
              titulo="Venus S3 - Cadastro"
              descricao="Aprenda como realizar corretamente o cadastro da fechadura Venus S3."
              video={cadastroVenusS3}
              capa={cadastroVenusS3IMG}
            />

          )}


          {mostrarCard("Mars S2 - Cadastro") && (

            <VideoCard
              titulo="Mars S2 - Cadastro"
              descricao="Aprenda como realizar corretamente o cadastro das fechaduras na fechadura Mars S2."
              video={cadastroMarsS2}
              capa={cadastroMarsS2IMG}
            />

          )}


          {mostrarCard("Mars S2 - Reset") && (

            <VideoCard
              titulo="Mars S2 - Reset"
              descricao="Aprenda como realizar corretamente o reset das fechaduras na fechadura Mars S2."
              video={resetMarsS2}
              capa={resetMarsS2IMG}
            />

          )}


          {mostrarCard("Mars S2 - Troca de Idioma") && (

            <VideoCard
              titulo="Mars S2 - Troca de Idioma"
              descricao="Aprenda como realizar corretamente a troca de idioma na fechadura Venus S3."
              video={marsTraseira}
              capa={marsS2Traseira}
            />

          )}


          {mostrarCard("Venus S2 - Troca de Idioma") && (

            <VideoCard
              titulo="Venus S2 - Troca de Idioma"
              descricao="Aprenda como realizar corretamente a troca de idioma na fechadura Venus S2."
              video={trocaIdiomaS2}
              capa={venuss2TrocaIdioma}
            />

          )}


          {mostrarCard("Venus S2 - Retirada da Porta Parte Traseira") && (

            <VideoCard
              titulo="Venus S2 - Retirada da Porta Parte Traseira"
              descricao="Aprenda como realizar corretamente a retirada da parte traseira da porta na Venus S2."
              video={trocaIdiomaS2}
              capa={venuss2TrocaIdioma}
            />

          )}


          {mostrarCard("Venus S2 - Retirada da Porta Parte Frontal") && (

            <VideoCard
              titulo="Venus S2 - Retirada da Porta Parte Frontal"
              descricao="Aprenda como realizar corretamente a retirada da parte frontal da porta na Venus S2."
              video={marsFrontal}
              capa={marsS2Frontal}
            />

          )}


          {mostrarCard("X1 - Reset") && (

            <VideoCard
              titulo="X1 - Reset"
              descricao="Aprenda como realizar corretamente o reset das fechaduras na fechadura X1."
              video={x1Reset}
              capa={x1ResetImg}
            />

          )}


          {mostrarCard("X1 - Exclusão de Senha de Usuário") && (

            <VideoCard
              titulo="X1 - Exclusão de Senha de Usuário"
              descricao="Aprenda como realizar corretamente a exclusão de senha de usuário na fechadura X1."
              video={x1ExcluirSenhaUser}
              capa={x1ExcluirSenha}
            />

          )}


          {mostrarCard("X1 - Configuração de Som") && (

            <VideoCard
              titulo="X1 - Configuração de Som"
              descricao="Aprenda como realizar corretamente a configuração de som na fechadura X1."
              video={x1ConfigSom}
              capa={x1ConfigAudio}
            />

          )}


          {mostrarCard("X1 - Cadastro de Usuário") && (

            <VideoCard
              titulo="X1 - Cadastro de Usuário"
              descricao="Aprenda como realizar corretamente o cadastro de usuário na fechadura X1."
              video={x1CadastroUser}
              capa={x1CadUser}
            />

          )}


          {mostrarCard("X1 - Cadastro de Administrador") && (

            <VideoCard
              titulo="X1 - Cadastro de Administrador"
              descricao="Aprenda como realizar corretamente o cadastro de usuário na fechadura X1."
              video={x1CadastroAdm}
              capa={x1CadAdm}
            />

          )}


          {/* ======================================== */}
          {/* NENHUM RESULTADO                         */}
          {/* ======================================== */}

          {pesquisa !== "" &&
            ![
              "Syrius S2 - Reversão do lado de abertura",
              "Syrius S1 - Como realizar o reset",
              "Syrius S2 - Como realizar o reset",
              "Syrius S2 - Retirada da Porta",
              "Syrius S2 - Cadastro no App",
              "Syrius S1 - Troca de Placa da Bateria",
              "Syrius S1 - Erro Porta Sempre Aberta",
              "Venus S3 - Cadastro",
              "Mars S2 - Cadastro",
              "Mars S2 - Reset",
              "Mars S2 - Troca de Idioma",
              "Venus S2 - Troca de Idioma",
              "Venus S2 - Retirada da Porta Parte Traseira",
              "Venus S2 - Retirada da Porta Parte Frontal",
              "X1 - Reset",
              "X1 - Exclusão de Senha de Usuário",
              "X1 - Configuração de Som",
              "X1 - Cadastro de Usuário",
              "X1 - Cadastro de Administrador"
            ].some(mostrarCard) && (

              <p className="nenhum-video">
                Nenhum vídeo encontrado.
              </p>

            )}

        </div>

      </main>


      <Footer />

    </div>

  );

}

export default Videos;