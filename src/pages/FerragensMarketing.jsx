import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

// ==========================================
// ESTILOS
// ==========================================

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/FerragensMarketing.css";

// ==========================================
// IMPORTAÇÃO AUTOMÁTICA DAS IMAGENS
// ==========================================

const arquivos = import.meta.glob(
  "../assets/marketing-ferragens/*",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// ==========================================
// CADASTRO AUTOMÁTICO DOS PRODUTOS
// ==========================================

const imagens = Object.entries(arquivos)
  .filter(([caminho]) =>
    /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(caminho)
  )
  .map(([caminho, src]) => {
    const arquivo = caminho.split("/").pop();

    const nome = arquivo
      .replace(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/gi, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const titulo = nome
      .split(" ")
      .map(
        (palavra) =>
          palavra.charAt(0).toUpperCase() +
          palavra.slice(1).toLowerCase()
      )
      .join(" ");

    return {
      id: caminho,
      titulo,
      src,
      arquivo,
    };
  })
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR")
  );

console.log(
  "[Ferragens] Imagens carregadas:",
  imagens.length
);

console.log(
  "[Ferragens] Arquivos encontrados:",
  Object.keys(arquivos)
);

const LIMITE_MOBILE = 3;

// ==========================================
// NORMALIZAÇÃO DA PESQUISA
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
// ÍCONE DE DOWNLOAD
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 16v4h16v-4" />
    </svg>
  );
}

// ==========================================
// CARTÃO DE IMAGEM
// ==========================================

function FerragemCard({ item, onAbrir }) {
  return (
    <article className="ferragens-card">

      <button
        type="button"
        className="ferragens-card-preview"
        onClick={() => onAbrir(item)}
        aria-label={`Ampliar ${item.titulo}`}
      >
        <img
          src={item.src}
          alt={item.titulo}
          loading="lazy"
        />
      </button>

      <div className="ferragens-card-info">

        <h3>{item.titulo}</h3>

        <p>
          Conteúdo para apoiar ações comerciais
          e de marketing.
        </p>

        <div className="ferragens-card-botoes">

          <a
            className="botao-assistir ferragens-download"
            href={item.src}
            download={item.arquivo}
          >
            <IconeDownload />
            Baixar imagem
          </a>

        </div>

      </div>

    </article>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function FerragensMarketing() {

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [mostrarTodos, setMostrarTodos] =
    useState(false);

  const [imagemAberta, setImagemAberta] =
    useState(null);

  // ========================================
  // PESQUISA
  // ========================================

  const imagensFiltradas = imagens.filter(
    (item) =>
      normalizar(
        `${item.titulo} ${item.arquivo}`
      ).includes(normalizar(pesquisa))
  );

  const imagensMobile = mostrarTodos
    ? imagensFiltradas
    : imagensFiltradas.slice(0, LIMITE_MOBILE);

  const restantes = Math.max(
    0,
    imagensFiltradas.length - LIMITE_MOBILE
  );

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodos(false);
  }

  function limparPesquisa() {
    setPesquisa("");
    setMostrarTodos(false);
  }

  const mensagemVazia =
    imagens.length === 0
      ? "Nenhuma imagem de ferragens foi carregada."
      : "Nenhuma imagem encontrada para esta pesquisa.";

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page ferragens-marketing-page">

      <Header />

      {/* =====================================
          HERO — PADRÃO MECÂNICAS E DIGITAIS
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
            Vídeos e Imagens de Ferragens
          </h1>

          <p className="dig-marketing-description">
            Acesse imagens das ferragens Synter
            para divulgação, campanhas e ações
            de marketing.
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
            IMAGENS DE FERRAGENS
          </h4>

        </div>

        {/* PESQUISA */}

        <div className="pesquisa-videos dig-marketing-search">

          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarPesquisa(evento.target.value)
            }
            aria-label="Pesquisar imagens de ferragens"
          />

        </div>

        {/* =====================================
            DESKTOP
        ===================================== */}

        <div className="dig-marketing-desktop">

          {imagensFiltradas.length > 0 ? (

            <div className="videos-grid ferragens-grid">

              {imagensFiltradas.map((item) => (

                <FerragemCard
                  key={item.id}
                  item={item}
                  onAbrir={setImagemAberta}
                />

              ))}

            </div>

          ) : (

            <p
              className="nenhum-video"
              role="status"
            >
              {mensagemVazia}
            </p>

          )}

        </div>

        {/* =====================================
            MOBILE
        ===================================== */}

        <div className="dig-marketing-mobile">

          {imagensMobile.length > 0 ? (

            <>

              <div className="dig-marketing-mobile-list">

                {imagensMobile.map((item) => (

                  <FerragemCard
                    key={item.id}
                    item={item}
                    onAbrir={setImagemAberta}
                  />

                ))}

              </div>

              {imagensFiltradas.length >
                LIMITE_MOBILE && (

                <button
                  type="button"
                  className="dig-marketing-more"
                  onClick={() =>
                    setMostrarTodos(
                      (atual) => !atual
                    )
                  }
                  aria-expanded={mostrarTodos}
                >

                  {mostrarTodos
                    ? "Mostrar menos imagens"
                    : `Ver mais ${restantes} imagens`}

                </button>

              )}

            </>

          ) : (

            <div className="dig-marketing-empty">

              <strong>
                {mensagemVazia}
              </strong>

              {imagens.length > 0 && (

                <>

                  <p>
                    Tente pesquisar outro modelo.
                  </p>

                  <button
                    type="button"
                    onClick={limparPesquisa}
                  >
                    Limpar pesquisa
                  </button>

                </>

              )}

            </div>

          )}

        </div>

        {/* =====================================
            AMPLIAÇÃO DA IMAGEM
        ===================================== */}

        {imagemAberta && (

          <div
            className="ferragens-overlay"
            onClick={() => setImagemAberta(null)}
            onKeyDown={(evento) => {
              if (evento.key === "Escape") {
                setImagemAberta(null);
              }
            }}
          >

            <div
              className="ferragens-modal"
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
                className="ferragens-modal-fechar"
                onClick={() => setImagemAberta(null)}
              >
                Fechar ×
              </button>

              <img
                src={imagemAberta.src}
                alt={imagemAberta.titulo}
              />

              <a
                className="botao-assistir"
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