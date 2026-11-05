
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

import capaMarketing1 from "../assets/mecmkt1.png";
import capaMarketing2 from "../assets/mecmkt2.png";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/MecMarketingHero.css";

// ========================================
// VÍDEOS DE FECHADURAS MECÂNICAS
// ========================================

const videos = [
  {
    id: 1,
    titulo: "Fechadura Mecânica - Acqua Max Escovada",
    descricao:
      "Conheça os recursos e diferenciais das fechaduras mecânicas Synter.",
    video: "https://youtu.be/mc-EJPVmRbQ",
    capa: capaMarketing1,
  },
  {
    id: 2,
    titulo: "Fechadura Mecânica - Crispus Max",
    descricao:
      "Material audiovisual para divulgação das fechaduras mecânicas Synter.",
    video: "",
    capa: capaMarketing2,
  },
];

// ========================================
// NORMALIZAR TEXTO
// ========================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
// COMPONENTE PRINCIPAL
// ========================================

function MecMarketing() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  // Exibe somente vídeos que possuem link.
  const videosDisponiveis = useMemo(() => {
    return videos.filter(
      (item) => Boolean(item.video?.trim())
    );
  }, []);

  const videosFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    if (!termo) return videosDisponiveis;

    return videosDisponiveis.filter((item) =>
      normalizarTexto(
        `${item.titulo} ${item.descricao}`
      ).includes(termo)
    );
  }, [pesquisa, videosDisponiveis]);

  return (
    <div className="videos-page mec-marketing-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <Header />

      {/* =====================================
          HERO PADRÃO UNIVERSIDADE SYNTER
      ===================================== */}

      <section className="mec-marketing-hero">
        <div className="mec-marketing-hero-container">

          {/* PERFIL */}

          <div className="mec-marketing-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          {/* IDENTIFICAÇÃO SUPERIOR */}

          <div className="mec-marketing-eyebrow">
            <IconeSynter />

            <span>
              CONTEÚDOS PARA DIVULGAÇÃO
            </span>
          </div>

          {/* TÍTULO */}

          <h1 className="mec-marketing-title">
            Vídeos de Fechaduras Mecânicas
          </h1>

          {/* DESCRIÇÃO */}

          <p className="mec-marketing-description">
            Acesse vídeos das fechaduras mecânicas
            Synter para divulgação, campanhas e
            ações de marketing.
          </p>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="videos-content">

        {/* TÍTULO DA SEÇÃO */}

        <div className="videos-section-title">
          <div className="videos-section-bar" />

          <h4>
            VÍDEOS DE FECHADURAS MECÂNICAS
          </h4>
        </div>

        {/* PESQUISA */}

        <div className="pesquisa-videos">
          <input
            type="search"
            placeholder="Pesquisar vídeo..."
            value={pesquisa}
            onChange={(evento) =>
              setPesquisa(evento.target.value)
            }
            aria-label="Pesquisar vídeos de fechaduras mecânicas"
          />
        </div>

        {/* QUANTIDADE DISPONÍVEL */}

        <div className="mec-marketing-counter">
          <span>
            {videosFiltrados.length === 1
              ? "1 vídeo encontrado"
              : `${videosFiltrados.length} vídeos encontrados`}
          </span>
        </div>

        {/* VÍDEOS */}

        {videosFiltrados.length > 0 ? (
          <div className="videos-grid">
            {videosFiltrados.map((item) => (
              <VideoCard
                key={item.id}
                titulo={item.titulo}
                descricao={item.descricao}
                video={item.video}
                capa={item.capa}
              />
            ))}
          </div>
        ) : (
          <div
            className="mec-marketing-empty"
            role="status"
          >
            <h3>
              Nenhum vídeo encontrado
            </h3>

            <p>
              Não encontramos vídeos disponíveis
              para esta pesquisa. Tente utilizar
              outra palavra-chave.
            </p>

            {pesquisa && (
              <button
                type="button"
                onClick={() => setPesquisa("")}
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        )}

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />

      {/* =====================================
          PERFIL DO USUÁRIO
      ===================================== */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}

export default MecMarketing;
