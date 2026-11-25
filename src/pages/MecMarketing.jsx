
import { useState } from "react";

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

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
].sort((a, b) => b.length - a.length);

// ==========================================
// LINHA INOX PRIME
// ==========================================

const INOX_PRIME = [
  "Acqua",
  "Crispus Max",
  "Luck",
  "Navis",
  "Polo Max",
  "Star",
  "Star Max",
];

function identificarCategoria(modelo) {
  return INOX_PRIME.includes(modelo)
    ? "INOX PRIME"
    : "";
}

// ==========================================
// IDENTIFICAR MODELO
// ==========================================

function identificarLinha(nome) {
  const texto = normalizar(nome);

  return (
    MODELOS.find((item) =>
      texto.includes(normalizar(item))
    ) || "Outros"
  );
}

// ==========================================
// IDENTIFICAR ACABAMENTO
// ==========================================

function identificarAcabamento(nome) {
  const texto = normalizar(nome);

  if (
    texto.includes("preta") ||
    texto.includes("preto")
  ) {
    return "Preto";
  }

  if (
    texto.includes("escovada") ||
    texto.includes("escovado")
  ) {
    return "Escovado";
  }

  if (
    texto.includes("polida") ||
    texto.includes("polido")
  ) {
    return "Polido";
  }

  if (texto.includes("macaneta")) {
    return "Polido";
  }

  return "";
}

// ==========================================
// IDENTIFICAR APLICAÇÃO
// ==========================================

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
// ORGANIZAÇÃO DAS IMAGENS
// ==========================================

const imagens = Object.entries(arquivos)
  .map(([caminho, src]) => {
    const arquivo = caminho.split("/").pop();
    const titulo = arquivo.replace(/\.[^.]+$/, "");
    const linha = identificarLinha(titulo);

    return {
      id: caminho,
      titulo,
      arquivo,
      src,
      linha,
      categoria: identificarCategoria(linha),
      acabamento: identificarAcabamento(titulo),
      aplicacao: identificarAplicacao(titulo),
    };
  })
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR", {
      numeric: true,
    })
  );

// ==========================================
// FILTROS
// ==========================================

const LIMITE_MOBILE = 3;

const LINHAS = [
  "Todas",
  ...Array.from(
    new Set(imagens.map((item) => item.linha))
  ).sort((a, b) => a.localeCompare(b, "pt-BR")),
];

const ACABAMENTOS = [
  "Todos",
  "Polido",
  "Escovado",
  "Preto",
];

const APLICACOES = [
  "Todas",
  "Interna",
  "Externa",
  "Banheiro",
  "Banheiro - Chave Reta",
  "Maçaneta",
];

// ==========================================
// ÍCONE SYNTER
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
// CARD PADRÃO
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
        <h3>{item.titulo}</h3>

        <p>
          {[
            item.categoria,
            item.acabamento,
            item.aplicacao,
          ]
            .filter(Boolean)
            .join(" • ")}
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

  const [pesquisa, setPesquisa] = useState("");
  const [linha, setLinha] = useState("Todas");
  const [acabamento, setAcabamento] =
    useState("Todos");
  const [aplicacao, setAplicacao] =
    useState("Todas");

  // ========================================
  // FILTRAGEM
  // ========================================

  const imagensFiltradas = imagens.filter((item) => {
    const texto = normalizar(
      [
        item.titulo,
        item.linha,
        item.categoria,
        item.acabamento,
        item.aplicacao,
      ].join(" ")
    );

    return (
      texto.includes(normalizar(pesquisa)) &&
      (linha === "Todas" || item.linha === linha) &&
      (acabamento === "Todos" ||
        item.acabamento === acabamento) &&
      (aplicacao === "Todas" ||
        item.aplicacao === aplicacao)
    );
  });

  // Desktop utiliza apenas a pesquisa.

  const imagensDesktop = imagens.filter((item) => {
    const texto = normalizar(
      [
        item.titulo,
        item.linha,
        item.categoria,
        item.acabamento,
        item.aplicacao,
      ].join(" ")
    );

    return texto.includes(normalizar(pesquisa));
  });

  function limparFiltros() {
    setPesquisa("");
    setLinha("Todas");
    setAcabamento("Todos");
    setAplicacao("Todas");
    setMostrarTodasImagens(false);
  }

  function alterarFiltro(setter, valor) {
    setter(valor);
    setMostrarTodasImagens(false);
  }

  const imagensMobile = mostrarTodasImagens
    ? imagensFiltradas
    : imagensFiltradas.slice(0, LIMITE_MOBILE);

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page mec-marketing-page">

      <Header />

      {/* HERO PADRÃO ORIGINAL */}

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

      {/* CONTEÚDO PRINCIPAL */}

      <main className="videos-content">

        <div className="videos-section-title">
          <div className="videos-section-bar" />

          <h4>
            IMAGENS DE FECHADURAS MECÂNICAS
          </h4>
        </div>

        {/* PESQUISA DESKTOP E MOBILE */}

        <div className="pesquisa-videos dig-marketing-search">
          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) =>
              alterarFiltro(
                setPesquisa,
                evento.target.value
              )
            }
            aria-label="Pesquisar imagem ou modelo"
          />
        </div>

        {/* =====================================
            FILTROS EXCLUSIVOS DO MOBILE
        ===================================== */}

        <div className="mec-mobile-filters">

          <div className="mec-filter-row">

            <div className="mec-filter-field">
              <label htmlFor="mec-modelo">
                Modelo
              </label>

              <select
                id="mec-modelo"
                value={linha}
                onChange={(evento) =>
                  alterarFiltro(
                    setLinha,
                    evento.target.value
                  )
                }
              >
                {LINHAS.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao === "Todas"
                      ? "Todos os modelos"
                      : opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="mec-filter-field">
              <label htmlFor="mec-acabamento">
                Acabamento
              </label>

              <select
                id="mec-acabamento"
                value={acabamento}
                onChange={(evento) =>
                  alterarFiltro(
                    setAcabamento,
                    evento.target.value
                  )
                }
              >
                {ACABAMENTOS.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao === "Todos"
                      ? "Todos os acabamentos"
                      : opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="mec-filter-field">
              <label htmlFor="mec-aplicacao">
                Aplicação
              </label>

              <select
                id="mec-aplicacao"
                value={aplicacao}
                onChange={(evento) =>
                  alterarFiltro(
                    setAplicacao,
                    evento.target.value
                  )
                }
              >
                {APLICACOES.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao === "Todas"
                      ? "Todas as aplicações"
                      : opcao}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="mec-clear-filters"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>

          </div>

          <div
            className="mec-result-count"
            role="status"
            aria-live="polite"
          >
            {imagensFiltradas.length === 1
              ? "1 imagem encontrada"
              : `${imagensFiltradas.length} imagens encontradas`}
          </div>

        </div>

        {/* =====================================
            GALERIA DESKTOP
        ===================================== */}

        <section className="dm-gallery mec-desktop-gallery">

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

            <div className="dig-marketing-empty">
              <strong>
                Nenhuma imagem encontrada
              </strong>

              <p>
                Tente pesquisar outro modelo.
              </p>
            </div>

          )}

        </section>

        {/* =====================================
            GALERIA MOBILE
        ===================================== */}

        <section className="dm-gallery mec-mobile-gallery">

          {imagensMobile.length > 0 ? (

            <div className="videos-grid dm-gallery-grid dm-gallery-expanded">

              {imagensMobile.map((item) => (
                <ImagemCard
                  key={item.id}
                  item={item}
                  abrirImagem={setImagemAberta}
                />
              ))}

            </div>

          ) : (

            <div className="dig-marketing-empty">
              <strong>
                Nenhuma imagem encontrada
              </strong>

              <p>
                Tente pesquisar outro modelo
                ou limpar os filtros.
              </p>

              <button
                type="button"
                className="mec-clear-filters"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            </div>

          )}

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
            VISUALIZAÇÃO AMPLIADA
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
