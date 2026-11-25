import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

// ==========================================
// IMAGENS DE FECHADURAS MECÂNICAS
// ==========================================

import imagem0 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Interna.png";
import imagem1 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Interna.png";
import imagem2 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Externa.png";
import imagem3 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Externa.png";
import imagem4 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Banheiro.png";
import imagem5 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Banheiro.png";

// ==========================================
// ESTILOS ORIGINAIS
// ==========================================

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/DigMarketingGaleria.css";

// ==========================================
// IMAGENS DE MARKETING
// ==========================================

const imagens = [
  {
    id: 1,
    titulo: "Máquina 40mm Quadrada Interna",
    linha: "Máquinas 40mm",
    src: imagem0,
    arquivo: "Máquina 40mm Quadrada Interna.png",
  },
  {
    id: 2,
    titulo: "Máquina 40mm Redonda Interna",
    linha: "Máquinas 40mm",
    src: imagem1,
    arquivo: "Máquina 40mm Redonda Interna.png",
  },
  {
    id: 3,
    titulo: "Máquina 40mm Quadrada Externa",
    linha: "Máquinas 40mm",
    src: imagem2,
    arquivo: "Máquina 40mm Quadrada Externa.png",
  },
  {
    id: 4,
    titulo: "Máquina 40mm Redonda Externa",
    linha: "Máquinas 40mm",
    src: imagem3,
    arquivo: "Máquina 40mm Redonda Externa.png",
  },
  {
    id: 5,
    titulo: "Máquina 40mm Quadrada Banheiro",
    linha: "Máquinas 40mm",
    src: imagem4,
    arquivo: "Máquina 40mm Quadrada Banheiro.png",
  },
  {
    id: 6,
    titulo: "Máquina 40mm Redonda Banheiro",
    linha: "Máquinas 40mm",
    src: imagem5,
    arquivo: "Máquina 40mm Redonda Banheiro.png",
  },
];

// ==========================================
// CONSTANTES
// ==========================================

const LIMITE_MOBILE = 3;

const LINHAS = [
  "Todas",
  ...Array.from(
    new Set(imagens.map((item) => item.linha))
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
// ÍCONE DOWNLOAD
// ==========================================

function IconeDownload() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
    </svg>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function MecMarketing() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [imagemAberta, setImagemAberta] =
    useState(null);

  const [
    mostrarTodasImagens,
    setMostrarTodasImagens,
  ] = useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [linha, setLinha] =
    useState("Todas");

  // ========================================
  // FILTROS
  // ========================================

  const imagensFiltradas = useMemo(() => {
    const termo = normalizar(pesquisa);

    return imagens.filter((item) => {
      const correspondePesquisa =
        !termo ||
        normalizar(
          `${item.titulo} ${item.linha}`
        ).includes(termo);

      const correspondeLinha =
        linha === "Todas" ||
        item.linha === linha;

      return (
        correspondePesquisa &&
        correspondeLinha
      );
    });
  }, [pesquisa, linha]);

  function limparFiltros() {
    setPesquisa("");
    setLinha("Todas");
    setMostrarTodasImagens(false);
  }

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodasImagens(false);
  }

  function alterarLinha(valor) {
    setLinha(valor);
    setMostrarTodasImagens(false);
  }

  // ========================================
  // RENDERIZAR IMAGEM
  // ========================================

  function renderizarImagem(item) {
    return (
      <article
        className="dm-gallery-card"
        key={item.id}
      >
        <button
          type="button"
          className="dm-gallery-preview"
          onClick={() => setImagemAberta(item)}
          aria-label={`Ampliar ${item.titulo}`}
        >
          <img
            src={item.src}
            alt={item.titulo}
            loading="lazy"
          />
        </button>

        <div className="dm-gallery-body">
          <h3>{item.titulo}</h3>

          <p>
            Conteúdo para apoiar ações
            comerciais e de marketing.
          </p>

          <a
            className="dm-gallery-download"
            href={item.src}
            download={item.arquivo}
          >
            <IconeDownload />

            Baixar imagem
          </a>
        </div>
      </article>
    );
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page">

      {/* HEADER */}

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
            Vídeos e Imagens de Fechaduras Mecânicas
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos e imagens das fechaduras
            mecânicas Synter para divulgação,
            campanhas e ações de marketing.
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
            IMAGENS DE FECHADURAS MECÂNICAS
          </h4>
        </div>

        {/* =====================================
            PESQUISA
        ===================================== */}

        <div className="pesquisa-videos dig-marketing-search">

          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarPesquisa(evento.target.value)
            }
            aria-label="Pesquisar materiais de fechaduras mecânicas"
          />

        </div>

        {/* =====================================
            FILTROS MOBILE
        ===================================== */}

        <div className="dig-marketing-mobile-filters">

          <div className="dig-marketing-filter-row">

            <div className="dig-marketing-filter-field">

              <label htmlFor="mec-marketing-linha">
                Linha do produto
              </label>

              <select
                id="mec-marketing-linha"
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
            {imagensFiltradas.length === 1
              ? "1 imagem encontrada"
              : `${imagensFiltradas.length} imagens encontradas`}
          </div>

        </div>

        {/* =====================================
            GALERIA DE IMAGENS
        ===================================== */}

        <section
          className="dm-gallery"
          aria-label="Imagens de fechaduras mecânicas"
          style={{ marginTop: 0 }}
        >

          {imagensFiltradas.length > 0 ? (
            <div
              className={`videos-grid dm-gallery-grid ${
                mostrarTodasImagens
                  ? "dm-gallery-expanded"
                  : ""
              }`}
            >
              {imagensFiltradas.map(renderizarImagem)}
            </div>
          ) : (
            <p
              className="nenhum-video"
              role="status"
            >
              Nenhuma imagem encontrada para sua pesquisa.
            </p>
          )}

          {/* MOSTRAR MAIS IMAGENS */}

          {imagensFiltradas.length > LIMITE_MOBILE && (
            <button
              type="button"
              className="dig-marketing-more dm-gallery-more"
              aria-expanded={mostrarTodasImagens}
              onClick={() =>
                setMostrarTodasImagens(
                  (atual) => !atual
                )
              }
            >
              {mostrarTodasImagens
                ? "Mostrar menos imagens"
                : `Ver mais ${
                    imagensFiltradas.length -
                    LIMITE_MOBILE
                  } imagens`}
            </button>
          )}

        </section>

        {/* =====================================
            AMPLIAÇÃO DA IMAGEM
        ===================================== */}

        {imagemAberta && (
          <div
            className="dm-gallery-overlay"
            onClick={() => setImagemAberta(null)}
            onKeyDown={(evento) => {
              if (evento.key === "Escape") {
                setImagemAberta(null);
              }
            }}
          >

            <div
              className="dm-gallery-modal"
              role="dialog"
              aria-modal="true"
              aria-label={imagemAberta.titulo}
              onClick={(evento) =>
                evento.stopPropagation()
              }
            >

              <button
                autoFocus
                type="button"
                onClick={() => setImagemAberta(null)}
              >
                Fechar ×
              </button>

              <img
                src={imagemAberta.src}
                alt={imagemAberta.titulo}
              />

              <a
                href={imagemAberta.src}
                download={imagemAberta.arquivo}
              >
                <IconeDownload />

                Baixar imagem
              </a>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}

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