
import { useState, useEffect } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/DigMarketingGaleria.css";
import "../styles/MecMarketing.css";

// ==========================================
// CARREGAMENTO AUTOMÁTICO DAS IMAGENS
// ==========================================

const arquivos = import.meta.glob(
  "../assets/marketing-mecanicas/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}",
  {
    eager: true,
    import: "default",
  }
);

const LIMITE_MOBILE = 3;

// ==========================================
// MODELOS
// ==========================================

const MODELOS = [
  "Máquina 40mm",
  "Acqua Max",
  "Acqua",
  "Crispus Max",
  "Crispus",
  "Glorian Max",
  "Glorian",
  "Gol",
  "Luck",
  "Marine",
  "Navis",
  "Olympia",
  "Polo Max",
  "Polo",
  "Star Max",
  "Star",
  "Stillus",
  "Champion",
].sort((a, b) => b.length - a.length);

// ==========================================
// LINHA INOX PRIME
// ==========================================

const INOX_PRIME = [
  "Acqua",
  "Acqua Max",
  "Crispus Max",
  "Luck",
  "Navis",
  "Polo Max",
  "Star",
  "Star Max",
];

// ==========================================
// LINHA UNIC INOX
// ==========================================

const UNIC_INOX = [
  "Champion",
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function identificarModelo(nome) {
  const texto = normalizar(nome);

  return (
    MODELOS.find((modelo) =>
      texto.includes(normalizar(modelo))
    ) || "Outros"
  );
}

function identificarLinha(modelo) {
  if (INOX_PRIME.includes(modelo)) {
    return "INOX PRIME";
  }

  if (UNIC_INOX.includes(modelo)) {
    return "UNIC INOX";
  }

  if (modelo === "Máquina 40mm") {
    return "MÁQUINAS";
  }

  return "";
}

function identificarAcabamento(nome) {
  const texto = normalizar(nome);

  if (/\bpret[ao]\b/.test(texto)) {
    return "Preto";
  }

  if (/\bescovad[ao]\b/.test(texto)) {
    return "Escovado";
  }

  if (/\bpolid[ao]\b/.test(texto)) {
    return "Polido";
  }

  if (texto.includes("macaneta")) {
    return "Polido";
  }

  return "";
}

function identificarAplicacao(nome) {
  const texto = normalizar(nome);

  if (texto.includes("chave reta")) {
    return "Banheiro - Chave Reta";
  }

  if (texto.includes("interna")) {
    return "Interna";
  }

  if (texto.includes("externa")) {
    return "Externa";
  }

  if (texto.includes("banheiro")) {
    return "Banheiro";
  }

  if (texto.includes("macaneta")) {
    return "Maçaneta";
  }

  return "";
}

// ==========================================
// ORGANIZAÇÃO AUTOMÁTICA DAS IMAGENS
// ==========================================

const imagens = Object.entries(arquivos)
  .map(([caminho, src]) => {
    const arquivo = caminho.split("/").pop();

    const titulo = arquivo
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim();

    const modelo = identificarModelo(titulo);

    return {
      id: caminho,
      titulo,
      modelo,
      linha: identificarLinha(modelo),
      acabamento: identificarAcabamento(titulo),
      aplicacao: identificarAplicacao(titulo),
      src,
      arquivo,
    };
  })
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR")
  );

// ==========================================
// OPÇÕES DOS FILTROS
// ==========================================

function criarOpcoes(campo) {
  return [...new Set(
    imagens.map((item) => item[campo]).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

const FILTRO_MODELOS = criarOpcoes("modelo");
const FILTRO_ACABAMENTOS = criarOpcoes("acabamento");
const FILTRO_APLICACOES = criarOpcoes("aplicacao");

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
// CARD DESKTOP
// ==========================================

function ImagemCard({ item, abrirImagem }) {
  return (
    <article className="dm-gallery-card">

      <button
        type="button"
        className="dm-gallery-preview"
        onClick={() => abrirImagem(item)}
        aria-label={`Ampliar ${item.titulo}`}
      >
        <img
          src={item.src}
          alt={item.titulo}
          loading="lazy"
        />
      </button>

      <div className="dm-gallery-body">

        {item.linha && (
          <span className="mec-product-line">
            {item.linha}
          </span>
        )}

        <h3>{item.titulo}</h3>

        <p>
          {[
            item.modelo,
            item.acabamento,
            item.aplicacao,
          ].filter(Boolean).join(" • ")}
        </p>

        <a
          href={item.src}
          download={item.arquivo}
          className="dm-gallery-download"
        >
          <IconeDownload />
          Baixar imagem
        </a>

      </div>
    </article>
  );
}

// ==========================================
// CARD MOBILE
// ==========================================

function ImagemCardMobile({ item, abrirImagem }) {
  return (
    <article className="video-card mec-mobile-card">

      <button
        type="button"
        className="mec-mobile-preview"
        onClick={() => abrirImagem(item)}
        aria-label={`Ampliar ${item.titulo}`}
      >
        <img
          src={item.src}
          alt={item.titulo}
          className="video-preview"
          loading="lazy"
        />
      </button>

      <div className="video-card-info">

        {item.linha && (
          <span className="mec-product-line">
            {item.linha}
          </span>
        )}

        <h3>{item.titulo}</h3>

        <p>
          {[
            item.acabamento,
            item.aplicacao,
          ].filter(Boolean).join(" • ")}
        </p>

        <div className="video-card-botoes">
          <a
            href={item.src}
            download={item.arquivo}
            className="botao-assistir"
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

export default function MecMarketing() {

  const [profileOpen, setProfileOpen] = useState(false);
  const [imagemAberta, setImagemAberta] = useState(null);

  const [pesquisa, setPesquisa] = useState("");
  const [modelo, setModelo] = useState("Todos");
  const [acabamento, setAcabamento] = useState("Todos");
  const [aplicacao, setAplicacao] = useState("Todas");

  const [mostrarTodasImagens, setMostrarTodasImagens] =
    useState(false);

  // ========================================
  // FECHAR IMAGEM COM ESC
  // ========================================

  useEffect(() => {
    if (!imagemAberta) return;

    function fechar(evento) {
      if (evento.key === "Escape") {
        setImagemAberta(null);
      }
    }

    window.addEventListener("keydown", fechar);

    return () => {
      window.removeEventListener("keydown", fechar);
    };
  }, [imagemAberta]);

  // ========================================
  // PESQUISA
  // ========================================

  const imagensDesktop = imagens.filter((item) => {
    const texto = normalizar(
      [
        item.titulo,
        item.modelo,
        item.linha,
        item.acabamento,
        item.aplicacao,
      ].join(" ")
    );

    return texto.includes(normalizar(pesquisa));
  });

  // ========================================
  // FILTROS EXCLUSIVOS DO MOBILE
  // ========================================

  const imagensFiltradas = imagensDesktop.filter((item) => {

    const correspondeModelo =
      modelo === "Todos" || item.modelo === modelo;

    const correspondeAcabamento =
      acabamento === "Todos" ||
      item.acabamento === acabamento;

    const correspondeAplicacao =
      aplicacao === "Todas" ||
      item.aplicacao === aplicacao;

    return (
      correspondeModelo &&
      correspondeAcabamento &&
      correspondeAplicacao
    );
  });

  const imagensMobile = mostrarTodasImagens
    ? imagensFiltradas
    : imagensFiltradas.slice(0, LIMITE_MOBILE);

  function limparFiltros() {
    setPesquisa("");
    setModelo("Todos");
    setAcabamento("Todos");
    setAplicacao("Todas");
    setMostrarTodasImagens(false);
  }

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodasImagens(false);
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page mec-marketing-page">

      <Header />

      {/* HERO PADRÃO */}

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
            Acesse imagens das fechaduras mecânicas
            Synter para divulgação, campanhas e ações
            de marketing.
          </p>

        </div>

      </section>

      <main className="videos-content">

        {/* TÍTULO DA SEÇÃO */}

        <div className="videos-section-title">

          <div className="videos-section-bar" />

          <h4>
            IMAGENS DE FECHADURAS MECÂNICAS
          </h4>

        </div>

        {/* PESQUISA PADRÃO */}

        <div className="dig-marketing-search mec-search">

          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarPesquisa(evento.target.value)
            }
            aria-label="Pesquisar imagens"
          />

        </div>

        {/* FILTROS SOMENTE MOBILE */}

        <div className="mec-mobile-filters">

          <div className="dig-marketing-filter-row">

            <div className="dig-marketing-filter-field">

              <label htmlFor="mec-modelo">
                Modelo
              </label>

              <select
                id="mec-modelo"
                value={modelo}
                onChange={(evento) => {
                  setModelo(evento.target.value);
                  setMostrarTodasImagens(false);
                }}
              >
                <option value="Todos">
                  Todos os modelos
                </option>

                {FILTRO_MODELOS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

            </div>

            <div className="dig-marketing-filter-field">

              <label htmlFor="mec-acabamento">
                Acabamento
              </label>

              <select
                id="mec-acabamento"
                value={acabamento}
                onChange={(evento) => {
                  setAcabamento(evento.target.value);
                  setMostrarTodasImagens(false);
                }}
              >
                <option value="Todos">
                  Todos os acabamentos
                </option>

                {FILTRO_ACABAMENTOS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

            </div>

            <div className="dig-marketing-filter-field">

              <label htmlFor="mec-aplicacao">
                Aplicação
              </label>

              <select
                id="mec-aplicacao"
                value={aplicacao}
                onChange={(evento) => {
                  setAplicacao(evento.target.value);
                  setMostrarTodasImagens(false);
                }}
              >
                <option value="Todas">
                  Todas as aplicações
                </option>

                {FILTRO_APLICACOES.map((item) => (
                  <option key={item} value={item}>
                    {item}
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
          >
            {imagensFiltradas.length} imagens encontradas
          </div>

        </div>

        {/* GALERIA DESKTOP */}

        <section className="mec-desktop-gallery">

          {imagensDesktop.length > 0 ? (

            <div className="videos-grid dm-gallery-grid">

              {imagensDesktop.map((item) => (
                <ImagemCard
                  key={item.id}
                  item={item}
                  abrirImagem={setImagemAberta}
                />
              ))}

            </div>

          ) : (

            <p className="nenhum-video">
              Nenhuma imagem encontrada.
            </p>

          )}

        </section>

        {/* GALERIA MOBILE */}

        <section className="mec-mobile-gallery">

          {imagensMobile.length > 0 ? (

            <div className="dig-marketing-mobile-list">

              {imagensMobile.map((item) => (
                <ImagemCardMobile
                  key={item.id}
                  item={item}
                  abrirImagem={setImagemAberta}
                />
              ))}

            </div>

          ) : (

            <p className="nenhum-video">
              Nenhuma imagem encontrada.
            </p>

          )}

          {imagensFiltradas.length > LIMITE_MOBILE && (

            <button
              type="button"
              className="dig-marketing-more"
              aria-expanded={mostrarTodasImagens}
              onClick={() =>
                setMostrarTodasImagens((atual) => !atual)
              }
            >
              {mostrarTodasImagens
                ? "Mostrar menos imagens"
                : `Ver mais ${
                    imagensFiltradas.length - LIMITE_MOBILE
                  } imagens`}
            </button>

          )}

        </section>

      </main>

      {/* AMPLIAÇÃO DA IMAGEM */}

      {imagemAberta && (

        <div
          className="dm-gallery-overlay"
          onClick={() => setImagemAberta(null)}
        >

          <div
            className="dm-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label={imagemAberta.titulo}
            onClick={(evento) => evento.stopPropagation()}
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

      <Footer />

      {/* PERFIL DO USUÁRIO */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}

    </div>
  );
}
