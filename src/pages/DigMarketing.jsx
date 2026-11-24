
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
import "../styles/DigMarketingGaleria.css";

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

import imagem0 from "../assets/marketing-digitais/Imagem Eris S2 Face Id App.png";
import imagem1 from "../assets/marketing-digitais/Imagem Eris S2 Face Id Bateria.png";
import imagem2 from "../assets/marketing-digitais/Imagem Eris S2 Face Id Carga Bateria.png";
import imagem3 from "../assets/marketing-digitais/Imagem Eris S2 Face Id Cepo.png";
import imagem4 from "../assets/marketing-digitais/Imagem Eris S2 Face Id Senha.png";
import imagem5 from "../assets/marketing-digitais/Imagem Eris S2 Face Id Água.png";
import imagem6 from "../assets/marketing-digitais/Imagem Eris S2 Face Id.jpg";
import imagem7 from "../assets/marketing-digitais/Imagem Eris S2 face Id Digital.png";
import imagem8 from "../assets/marketing-digitais/Imagem Gateway.jpg";
import imagem9 from "../assets/marketing-digitais/Imagem S2 Face Id Senha com Água.png";
import imagem10 from "../assets/marketing-digitais/Imagem S2 Pro Neo.jpg";
import imagem11 from "../assets/marketing-digitais/Imagem S2 Pro.jpg";

import imagem12 from "../assets/marketing-digitais/Imagem Syrius S3 Max.jpg";
import imagem13 from "../assets/marketing-digitais/Imagem Dallas S3 Pro.jpg";
import imagem14 from "../assets/marketing-digitais/Imagem Venus S3 Pro.jpg";
import imagem15 from "../assets/marketing-digitais/Imagem Syrius S3 Pro.jpg";
import imagem16 from "../assets/marketing-digitais/Imagem Lyra App.png";
import imagem17 from "../assets/marketing-digitais/Imagem Lyra Máquina.png";
import imagem18 from "../assets/marketing-digitais/Imagem Lyra Senha.png";
import imagem19 from "../assets/marketing-digitais/Imagem Lyra Tag.png";
import imagem20 from "../assets/marketing-digitais/Imagem Lyra Cepo Traseira.png";
import imagem21 from "../assets/marketing-digitais/Imagem Lyra Cepo.png";
import imagem22 from "../assets/marketing-digitais/Imagem Lyra.jpg";

import imagem23 from "../assets/marketing-digitais/Controladora Digital.jpg";
import imagem24 from "../assets/marketing-digitais/Controladora QR Code.jpg";
import imagem25 from "../assets/marketing-digitais/Controladora Face Id.jpg";

const imagens = [
  { id: 1, titulo: "Eris S2 Face Id App", linha: "Eris", src: imagem0, arquivo: "Imagem Eris S2 Face Id App.png" },
  { id: 2, titulo: "Eris S2 Face Id Bateria", linha: "Eris", src: imagem1, arquivo: "Imagem Eris S2 Face Id Bateria.png" },
  { id: 3, titulo: "Eris S2 Face Id Carga Bateria", linha: "Eris", src: imagem2, arquivo: "Imagem Eris S2 Face Id Carga Bateria.png" },
  { id: 4, titulo: "Eris S2 Face Id Cepo", linha: "Eris", src: imagem3, arquivo: "Imagem Eris S2 Face Id Cepo.png" },
  { id: 5, titulo: "Eris S2 Face Id Senha", linha: "Eris", src: imagem4, arquivo: "Imagem Eris S2 Face Id Senha.png" },
  { id: 6, titulo: "Eris S2 Face Id Água", linha: "Eris", src: imagem5, arquivo: "Imagem Eris S2 Face Id Água.png" },
  { id: 7, titulo: "Eris S2 Face Id", linha: "Eris", src: imagem6, arquivo: "Imagem Eris S2 Face Id.jpg" },
  { id: 8, titulo: "Eris S2 face Id Digital", linha: "Eris", src: imagem7, arquivo: "Imagem Eris S2 face Id Digital.png" },
  { id: 9, titulo: "Gateway", linha: "Gateway", src: imagem8, arquivo: "Imagem Gateway.jpg" },
  { id: 10, titulo: "S2 Face Id Senha com Água", linha: "Eris", src: imagem9, arquivo: "Imagem S2 Face Id Senha com Água.png" },
  { id: 11, titulo: "Syrius S2 Pro Neo", linha: "Syrius", src: imagem10, arquivo: "Imagem S2 Pro Neo.jpg" },
  { id: 12, titulo: "Syrius S2 Pro", linha: "Syrius", src: imagem11, arquivo: "Imagem S2 Pro.jpg" },
  { id: 13, titulo: "Syrius S3 Max", linha: "Syrius", src: imagem12, arquivo: "Imagem Syrius S3 Max.jpg" },
  { id: 14, titulo: "Dallas S3 Pro", linha: "Dallas", src: imagem13, arquivo: "Imagem Dallas S3 Pro.jpg" },
  { id: 15, titulo: "Venus S3 Pro", linha: "Venus", src: imagem14, arquivo: "Imagem Venus S3 Pro.jpg" },
  { id: 16, titulo: "Syrius S3 Pro", linha: "Syrius", src: imagem15, arquivo: "Imagem Syrius S3 Pro.jpg" },
  { id: 17, titulo: "Lyra App", linha: "Lyra", src: imagem16, arquivo: "Imagem Lyra App.png" },
  { id: 18, titulo: "Lyra Máquina", linha: "Lyra", src: imagem17, arquivo: "Imagem Lyra Máquina.png" },
  { id: 19, titulo: "Lyra Senha", linha: "Lyra", src: imagem18, arquivo: "Imagem Lyra Senha.png" },
  { id: 20, titulo: "Lyra Tag", linha: "Lyra", src: imagem19, arquivo: "Imagem Lyra Tag.png" },
  { id: 21, titulo: "Lyra Cepo Traseira", linha: "Lyra", src: imagem20, arquivo: "Imagem Lyra Cepo Traseira.png" },
  { id: 22, titulo: "Lyra Cepo", linha: "Lyra", src: imagem21, arquivo: "Imagem Lyra Cepo.png" },
  { id: 23, titulo: "Lyra", linha: "Lyra", src: imagem22, arquivo: "Imagem Lyra.jpg" },
  { id: 24, titulo: "Controladora Digital", linha: "Controladoras", src: imagem23, arquivo: "Controladora Digital.jpg" },
  { id: 25, titulo: "Controladora QR Code", linha: "Controladoras", src: imagem24, arquivo: "Controladora QR Code.jpg" },
  { id: 26, titulo: "Controladora Face Id", linha: "Controladoras", src: imagem25, arquivo: "Controladora Face Id.jpg" },
];

const LIMITE_MOBILE = 3;

const LINHAS = [
  "Todas",
  ...Array.from(
    new Set([...videos, ...imagens].map((item) => item.linha))
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
  const [imagemAberta, setImagemAberta] = useState(null);

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

  const imagensFiltradas = imagens.filter((item) =>
    (linha === "Todas" || item.linha === linha) &&
    normalizar(`${item.titulo} ${item.linha}`).includes(normalizar(pesquisa))
  );

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
            Vídeos e Imagens de Fechaduras Digitais
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos e imagens das fechaduras digitais
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
            placeholder="Pesquisar vídeo, imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarPesquisa(evento.target.value)
            }
            aria-label="Pesquisar materiais de fechaduras digitais"
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

        <section className="dm-gallery" aria-label="Imagens de produtos">
          <div className="videos-section-title">
            <div className="videos-section-bar" />
            <h4>IMAGENS DE FECHADURAS DIGITAIS E ACESSÓRIOS</h4>
          </div>
          {imagensFiltradas.length ? (
            <div className="videos-grid dm-gallery-grid">
              {imagensFiltradas.map((item) => (
                <article className="dm-gallery-card" key={item.id}>
                  <button type="button" className="dm-gallery-preview" onClick={() => setImagemAberta(item)} aria-label={`Ampliar ${item.titulo}`}>
                    <img src={item.src} alt={item.titulo} loading="lazy" />
                  </button>
                  <div className="dm-gallery-body">
                    <h3>{item.titulo}</h3>
                    <p>Conteúdo para apoiar ações comerciais e de marketing.</p>
                    <a className="dm-gallery-download" href={item.src} download={item.arquivo}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" /></svg>
                      Baixar imagem
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : <p>Nenhuma imagem encontrada.</p>}
        </section>
        {imagemAberta && (
          <div className="dm-gallery-overlay" onClick={() => setImagemAberta(null)} onKeyDown={(e) => { if (e.key === "Escape") setImagemAberta(null); }}>
            <div className="dm-gallery-modal" role="dialog" aria-modal="true" aria-label={imagemAberta.titulo} onClick={(e) => e.stopPropagation()}>
              <button autoFocus type="button" onClick={() => setImagemAberta(null)}>Fechar ×</button>
              <img src={imagemAberta.src} alt={imagemAberta.titulo} />
              <a href={imagemAberta.src} download={imagemAberta.arquivo}>Baixar imagem</a>
            </div>
          </div>
        )}
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
