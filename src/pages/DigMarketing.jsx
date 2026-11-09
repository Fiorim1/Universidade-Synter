
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

// ==========================================
// CAPAS DOS VÍDEOS
// ==========================================

import capaMarketing1 from "../assets/capaMarketing1.png";
import capaMarketing2 from "../assets/capaMarketing2.png";
import capaMarketing3 from "../assets/capaMarketing3.png";
import capaMarketing4 from "../assets/capaMarketing4.png";
import capaMarketing5 from "../assets/capaMarketing5.png";
import capaMarketing6 from "../assets/capaMarketing6.png";
import capaMarketing7 from "../assets/capaMarketing7.png";
import capaMarketing8 from "../assets/capaMarketing8.png";
import capaMarketing9 from "../assets/capaMarketing9.png";

// ==========================================
// ESTILOS
// ==========================================

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";

// ==========================================
// VÍDEOS DE MARKETING
// ==========================================

const videos = [
  {
    id: 1,
    titulo: "Fechadura Digital - Syrius S2 Pro",
    descricao:
      "Conheça os recursos e diferenciais das fechaduras digitais Synter.",
    video: "https://youtube.com/shorts/i2_8xFaqHgc",
    capa: capaMarketing1,
    linha: "Syrius",
  },
  {
    id: 2,
    titulo: "Fechadura Digital - Dallas S3",
    descricao:
      "Material audiovisual para divulgação das fechaduras digitais Synter.",
    video: "https://youtube.com/shorts/vuzLzcqCT5A",
    capa: capaMarketing2,
    linha: "Dallas",
  },
  {
    id: 3,
    titulo: "Fechadura Digital - Syrius S3 Max",
    descricao:
      "Apresente os principais benefícios das fechaduras digitais Synter.",
    video: "https://youtube.com/shorts/RMC2hm9reTQ",
    capa: capaMarketing3,
    linha: "Syrius",
  },
  {
    id: 4,
    titulo: "Fechadura Digital - Venus S3 Pro",
    descricao:
      "Conteúdo desenvolvido para divulgação comercial dos produtos Synter.",
    video: "https://youtube.com/shorts/3nLdCqSkRuE",
    capa: capaMarketing4,
    linha: "Venus",
  },
  {
    id: 5,
    titulo: "Fechadura Digital - Vega Face Id",
    descricao:
      "Vídeo promocional para apresentação das fechaduras digitais Synter.",
    video: "https://youtube.com/shorts/-h3p7BRSvR4",
    capa: capaMarketing5,
    linha: "Vega",
  },
  {
    id: 6,
    titulo: "Fechadura Digital - Syrius S3 Pro",
    descricao:
      "Material visual para campanhas e divulgação das fechaduras Synter.",
    video: "https://youtube.com/shorts/Wl7mP3oGji0",
    capa: capaMarketing6,
    linha: "Syrius",
  },
  {
    id: 7,
    titulo: "Fechadura Digital - Syrius S2 Pro Neo",
    descricao:
      "Conheça detalhes e funcionalidades das fechaduras digitais Synter.",
    video:
      "https://youtube.com/shorts/nOxgn_bKzNo?feature=share",
    capa: capaMarketing7,
    linha: "Syrius",
  },
  {
    id: 8,
    titulo: "Fechadura Digital - Lyra Pro",
    descricao:
      "Conteúdo para apoiar ações comerciais e de marketing.",
    video: "https://youtube.com/shorts/GQwlcEne9ks",
    capa: capaMarketing8,
    linha: "Lyra",
  },
  {
    id: 9,
    titulo: "Fechadura Digital - Eris Face Id",
    descricao:
      "Vídeo desenvolvido para apresentação dos produtos Synter.",
    video: "https://youtube.com/shorts/2_5_QFtbLIE",
    capa: capaMarketing9,
    linha: "Eris",
  },
];

// ==========================================
// CONSTANTES
// ==========================================

const LIMITE_MOBILE = 3;

const LINHAS = [
  "Todas",
  ...Array.from(
    new Set(videos.map((item) => item.linha))
  ).sort((a, b) => a.localeCompare(b, "pt-BR")),
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
// PÁGINA PRINCIPAL
// ==========================================

export default function DigMarketing() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [linha, setLinha] =
    useState("Todas");

  const [mostrarTodos, setMostrarTodos] =
    useState(false);

  // ========================================
  // FILTROS
  // ========================================

  const videosFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa);

    return videos.filter((item) => {
      const correspondePesquisa =
        !termo ||
        normalizar(
          `${item.titulo} ${item.descricao} ${item.linha}`
        ).includes(termo);

      const correspondeLinha =
        linha === "Todas" ||
        item.linha === linha;

      return correspondePesquisa && correspondeLinha;
    });
  }, [pesquisa, linha]);

  const videosMobile = mostrarTodos
    ? videosFiltrados
    : videosFiltrados.slice(0, LIMITE_MOBILE);

  const restantes = Math.max(
    0,
    videosFiltrados.length - LIMITE_MOBILE
  );

  function limparFiltros() {
    setPesquisa("");
    setLinha("Todas");
    setMostrarTodos(false);
  }

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodos(false);
  }

  function alterarLinha(valor) {
    setLinha(valor);
    setMostrarTodos(false);
  }

  // ========================================
  // RENDERIZAR UM VÍDEO
  // ========================================

  function renderizarVideo(item) {
    return (
      <VideoCard
        key={item.id}
        titulo={item.titulo}
        descricao={item.descricao}
        video={item.video}
        capa={item.capa}
      />
    );
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page">
      <Header />

      {/* =====================================
          HERO
      ===================================== */}

      <section className="dig-marketing-hero">
        <div className="dig-marketing-hero-container">

          <div className="dig-marketing-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="dig-marketing-eyebrow">
            <IconeSynter />

            <span>
              CONTEÚDOS PARA DIVULGAÇÃO
            </span>
          </div>

          <h1 className="dig-marketing-title">
            Vídeos de Fechaduras Digitais
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos das fechaduras digitais
            Synter para divulgação, campanhas
            e ações de marketing.
          </p>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="videos-content">

        <div className="videos-section-title">
          <div className="videos-section-bar" />

          <h4>
            VÍDEOS DE FECHADURAS DIGITAIS
          </h4>
        </div>

        {/* =====================================
            PESQUISA
        ===================================== */}

        <div className="pesquisa-videos dig-marketing-search">
          <input
            type="search"
            placeholder="Pesquisar vídeo ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarPesquisa(evento.target.value)
            }
            aria-label="Pesquisar vídeos de fechaduras digitais"
          />
        </div>

        {/* =====================================
            FILTROS MOBILE
        ===================================== */}

        <div className="dig-marketing-mobile-filters">
          <div className="dig-marketing-filter-row">

            <div className="dig-marketing-filter-field">
              <label htmlFor="dig-marketing-linha">
                Linha do produto
              </label>

              <select
                id="dig-marketing-linha"
                value={linha}
                onChange={(evento) =>
                  alterarLinha(evento.target.value)
                }
              >
                {LINHAS.map((opcao) => (
                  <option
                    key={opcao}
                    value={opcao}
                  >
                    {opcao === "Todas"
                      ? "Todas as linhas"
                      : opcao}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="dig-marketing-clear"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>

          </div>

          <div
            className="dig-marketing-result-count"
            role="status"
            aria-live="polite"
          >
            {videosFiltrados.length === 1
              ? "1 vídeo encontrado"
              : `${videosFiltrados.length} vídeos encontrados`}
          </div>
        </div>

        {/* =====================================
            DESKTOP
            VISUAL ORIGINAL
        ===================================== */}

        <div className="dig-marketing-desktop">
          {videosFiltrados.length > 0 ? (
            <div className="videos-grid">
              {videosFiltrados.map(renderizarVideo)}
            </div>
          ) : (
            <p className="nenhum-video" role="status">
              Nenhum vídeo encontrado para sua pesquisa.
            </p>
          )}
        </div>

        {/* =====================================
            MOBILE
            LISTA COMPACTA
        ===================================== */}

        <div className="dig-marketing-mobile">

          {videosMobile.length > 0 ? (
            <>
              <div className="dig-marketing-mobile-list">
                {videosMobile.map(renderizarVideo)}
              </div>

              {videosFiltrados.length >
                LIMITE_MOBILE && (
                <button
                  type="button"
                  className="dig-marketing-more"
                  onClick={() =>
                    setMostrarTodos((atual) => !atual)
                  }
                  aria-expanded={mostrarTodos}
                >
                  {mostrarTodos
                    ? "Mostrar menos vídeos"
                    : `Ver mais ${restantes} vídeos`}
                </button>
              )}
            </>
          ) : (
            <div className="dig-marketing-empty">
              <strong>
                Nenhum vídeo encontrado
              </strong>

              <p>
                Tente pesquisar outro modelo
                ou limpar os filtros.
              </p>

              <button
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            </div>
          )}

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
