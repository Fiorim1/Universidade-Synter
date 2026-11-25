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
  "Marine Color",
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
  "Marine",
  "Marine Color",
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
  const texto = normalizar(nome)
    .replace(/\baqua\b/g, "acqua");

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

  if (/\bpolid+[ao]\b/.test(texto)) {
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
  return [
    ...new Set(
      imagens
        .map((item) => item[campo])
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

const FILTRO_MODELOS = criarOpcoes("modelo");
const FILTRO_ACABAMENTOS = criarOpcoes("acabamento");
const FILTRO_APLICACOES = criarOpcoes("aplicacao");

// ==========================================
// ÍCONES
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

function IconeDownload() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 15v5h14v-5" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

// ==========================================
// CARD DESKTOP
// ==========================================

function ImagemCard({ item, abrirImagem }) {
  return (
    <article className="video-card mec-imagem-card">

      <img
        src={item.src}
        alt={item.titulo}
        className="video-preview"
        loading="lazy"
        role="button"
        tabIndex={0}
        style={{
          objectFit: "contain",
          background: "#ffffff",
          cursor: "zoom-in",
        }}
        onClick={() => abrirImagem(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            abrirImagem(item);
          }
        }}
      />

      <div className="video-card-info">

        <h2>{item.titulo}</h2>

        <p>
          {item.linha && `${item.linha} • `}
          Material para divulgação das fechaduras
          mecânicas Synter.
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
// CARD MOBILE
// ==========================================

function ImagemCardMobile({ item, abrirImagem }) {
  return (
    <article className="video-card mec-imagem-card">

      <img
        src={item.src}
        alt={item.titulo}
        className="video-preview"
        loading="lazy"
        role="button"
        tabIndex={0}
        style={{
          objectFit: "contain",
          background: "#ffffff",
          cursor: "zoom-in",
        }}
        onClick={() => abrirImagem(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            abrirImagem(item);
          }
        }}
      />

      <div className="video-card-info">

        <h2>{item.titulo}</h2>

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

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [modelo, setModelo] =
    useState("Todos");

  const [acabamento, setAcabamento] =
    useState("Todos");

  const [aplicacao, setAplicacao] =
    useState("Todas");

  const [imagemAberta, setImagemAberta] =
    useState(null);

  const [
    mostrarTodasImagens,
    setMostrarTodasImagens,
  ] = useState(false);

  // ========================================
  // FECHAR IMAGEM COM ESC
  // ========================================

  useEffect(() => {

    function fecharComEsc(event) {
      if (event.key === "Escape") {
        setImagemAberta(null);
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };

  }, []);

  // ========================================
  // BLOQUEAR ROLAGEM COM MODAL ABERTO
  // ========================================

  useEffect(() => {

    if (!imagemAberta) return;

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };

  }, [imagemAberta]);

  // ========================================
  // PESQUISA DESKTOP
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

    return texto.includes(
      normalizar(pesquisa)
    );

  });

  // ========================================
  // FILTROS EXCLUSIVOS DO MOBILE
  // ========================================

  const imagensFiltradas = imagensDesktop.filter(
    (item) => {

      const correspondeModelo =
        modelo === "Todos" ||
        item.modelo === modelo;

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

    }
  );

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

      {/* CONTEÚDO DESKTOP */}

      <main className="dig-marketing-desktop">

        <section
          className="mec-marketing-section"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "36px 24px 60px",
          }}
        >

          <h2
            className="dig-marketing-section-title"
            style={{
              borderLeft: "3px solid #ffffff",
              paddingLeft: "12px",
              fontSize: "14px",
              letterSpacing: "2px",
              marginBottom: "26px",
            }}
          >
            IMAGENS DE FECHADURAS MECÂNICAS
          </h2>

          <input
            type="search"
            className="dig-marketing-search"
            placeholder="Pesquisar imagem ou modelo..."
            aria-label="Pesquisar imagem ou modelo"
            value={pesquisa}
            onChange={(e) =>
              alterarPesquisa(e.target.value)
            }
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "14px 16px",
              marginBottom: "28px",
              border: "1px solid #333333",
              borderRadius: "8px",
              background: "#101010",
              color: "#ffffff",
              boxSizing: "border-box",
            }}
          />

          <div
            className="mec-marketing-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "22px",
            }}
          >

            {imagensDesktop.map((item) => (

              <ImagemCard
                key={item.id}
                item={item}
                abrirImagem={setImagemAberta}
              />

            ))}

          </div>

          {imagensDesktop.length === 0 && (

            <p className="dig-marketing-empty">
              Nenhuma imagem encontrada.
            </p>

          )}

        </section>

      </main>

      {/* CONTEÚDO MOBILE */}

      <main className="dig-marketing-mobile">

        <section
          className="mec-marketing-section"
          style={{
            padding: "24px 16px",
          }}
        >

          <h2 className="dig-marketing-section-title">
            IMAGENS DE FECHADURAS MECÂNICAS
          </h2>

          <input
            type="search"
            className="dig-marketing-search"
            placeholder="Pesquisar imagem ou modelo..."
            aria-label="Pesquisar imagem ou modelo"
            value={pesquisa}
            onChange={(e) =>
              alterarPesquisa(e.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              border: "1px solid #333333",
              borderRadius: "8px",
              background: "#101010",
              color: "#ffffff",
              boxSizing: "border-box",
            }}
          />

          {/* FILTROS MOBILE */}

          <div
            className="mec-marketing-filtros"
            style={{
              display: "grid",
              gap: "8px",
              marginBottom: "20px",
            }}
          >

            <select
              aria-label="Modelo"
              value={modelo}
              onChange={(e) => {
                setModelo(e.target.value);
                setMostrarTodasImagens(false);
              }}
            >

              <option value="Todos">
                Todos os modelos
              </option>

              {FILTRO_MODELOS.map((item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>

            <select
              aria-label="Acabamento"
              value={acabamento}
              onChange={(e) => {
                setAcabamento(e.target.value);
                setMostrarTodasImagens(false);
              }}
            >

              <option value="Todos">
                Todos os acabamentos
              </option>

              {FILTRO_ACABAMENTOS.map((item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>

            <select
              aria-label="Aplicação"
              value={aplicacao}
              onChange={(e) => {
                setAplicacao(e.target.value);
                setMostrarTodasImagens(false);
              }}
            >

              <option value="Todas">
                Todas as aplicações
              </option>

              {FILTRO_APLICACOES.map((item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>

            <button
              type="button"
              className="botao-assistir"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>

          </div>

          {/* LISTA DE IMAGENS MOBILE */}

          <div className="dig-marketing-mobile-list">

            {imagensMobile.map((item) => (

              <ImagemCardMobile
                key={item.id}
                item={item}
                abrirImagem={setImagemAberta}
              />

            ))}

          </div>

          {imagensFiltradas.length === 0 && (

            <p className="dig-marketing-empty">
              Nenhuma imagem encontrada.
            </p>

          )}

          {imagensFiltradas.length > LIMITE_MOBILE && (

            <button
              type="button"
              className="dig-marketing-more"
              onClick={() =>
                setMostrarTodasImagens(
                  !mostrarTodasImagens
                )
              }
            >

              {mostrarTodasImagens
                ? "Ver menos imagens"
                : `Ver mais ${
                    imagensFiltradas.length -
                    LIMITE_MOBILE
                  } imagens`}

            </button>

          )}

        </section>

      </main>

      {/* MODAL DE AMPLIAÇÃO */}

      {imagemAberta && (

        <div
          className="mec-imagem-modal"
          role="dialog"
          aria-modal="true"
          aria-label={imagemAberta.titulo}
          onClick={() => setImagemAberta(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >

          <div
            className="mec-imagem-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#111111",
              borderRadius: "16px",
              padding: "16px",
              boxSizing: "border-box",
            }}
          >

            <button
              type="button"
              aria-label="Fechar imagem"
              onClick={() => setImagemAberta(null)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <IconeFechar />
            </button>

            <img
              src={imagemAberta.src}
              alt={imagemAberta.titulo}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                background: "#ffffff",
                borderRadius: "10px",
              }}
            />

            <h2
              style={{
                color: "#ffffff",
                fontSize: "18px",
                margin: "18px 0",
              }}
            >
              {imagemAberta.titulo}
            </h2>

            <a
              href={imagemAberta.src}
              download={imagemAberta.arquivo}
              className="botao-assistir"
            >
              <IconeDownload />
              Baixar imagem
            </a>

          </div>

        </div>

      )}

      {/* PERFIL */}

      {profileOpen && (

        <Profile
          onClose={() => setProfileOpen(false)}
        />

      )}

      <Footer />

    </div>

  );
}