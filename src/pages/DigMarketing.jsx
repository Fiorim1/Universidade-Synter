
import { useMemo, useState, useEffect } from "react";

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
// IMPORTAÇÃO AUTOMÁTICA DAS IMAGENS
// ==========================================

const arquivos = import.meta.glob(
  "../assets/marketing-mecanicas/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const LIMITE_MOBILE = 3;

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

function identificarAcabamento(titulo) {
  const texto = normalizar(titulo);

  if (/\b(pret[ao]|black)\b/.test(texto)) return "Preta";
  if (/\b(escovad[ao])\b/.test(texto)) return "Escovada";
  if (/\b(polid[ao])\b/.test(texto)) return "Polida";
  if (/\b(cromad[ao])\b/.test(texto)) return "Cromada";
  if (/\b(dourad[ao])\b/.test(texto)) return "Dourada";
  if (/\b(branc[ao])\b/.test(texto)) return "Branca";
  if (/\b(oxid[ao]|oxidado|oxidada)\b/.test(texto)) return "Oxidada";
  if (/\b(acetinad[ao])\b/.test(texto)) return "Acetinada";

  return "Outros";
}

function identificarAplicacao(titulo) {
  const texto = normalizar(titulo);

  if (/\b(banheiro|wc)\b/.test(texto)) return "Banheiro";
  if (/\bextern[ao]\b/.test(texto)) return "Externa";
  if (/\bintern[ao]\b/.test(texto)) return "Interna";

  return "Outras";
}

function identificarModelo(titulo) {
  const modelo = titulo
    .split(
      /\s+(?:preta|preto|polida|polido|escovada|escovado|cromada|cromado|dourada|dourado|branca|branco|oxidada|oxidado|acetinada|acetinado|roseta|espelho|quadrada|redonda|interna|externa|banheiro|wc)\b/i
    )[0]
    .trim();

  return modelo || "Outros";
}

// ==========================================
// ORGANIZAÇÃO DAS IMAGENS
// ==========================================

const imagens = Object.entries(arquivos)
  .map(([caminho, src]) => {
    const arquivo = caminho.split("/").pop();

    const titulo = arquivo
      .replace(/\.[^.]+$/, "")
      .replace(/\s*\(\d+\)\s*$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\bStilus\b/gi, "Stillus")
      .trim();

    return {
      id: caminho,
      titulo,
      modelo: identificarModelo(titulo),
      acabamento: identificarAcabamento(titulo),
      aplicacao: identificarAplicacao(titulo),
      src,
      arquivo,
    };
  })
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    })
  );

// ==========================================
// FILTROS DISPONÍVEIS
// ==========================================

function criarOpcoes(campo) {
  return [
    "Todas",
    ...Array.from(
      new Set(imagens.map((item) => item[campo]))
    ).sort((a, b) => a.localeCompare(b, "pt-BR")),
  ];
}

const MODELOS = criarOpcoes("modelo");
const ACABAMENTOS = criarOpcoes("acabamento");
const APLICACOES = criarOpcoes("aplicacao");

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [imagemAberta, setImagemAberta] = useState(null);

  const [pesquisa, setPesquisa] = useState("");
  const [modelo, setModelo] = useState("Todas");
  const [acabamento, setAcabamento] = useState("Todas");
  const [aplicacao, setAplicacao] = useState("Todas");

  const [mostrarTodasImagens, setMostrarTodasImagens] =
    useState(false);

  // ========================================
  // FECHAR IMAGEM COM ESC
  // ========================================

  useEffect(() => {
    if (!imagemAberta) return;

    function fecharComEsc(evento) {
      if (evento.key === "Escape") {
        setImagemAberta(null);
      }
    }

    window.addEventListener("keydown", fecharComEsc);

    return () => {
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [imagemAberta]);

  // ========================================
  // FILTRAGEM DAS IMAGENS
  // ========================================

  const imagensFiltradas = useMemo(() => {
    const termo = normalizar(pesquisa);

    return imagens.filter((item) => {
      const correspondePesquisa =
        !termo ||
        normalizar(
          `${item.titulo} ${item.modelo} ${item.acabamento} ${item.aplicacao}`
        ).includes(termo);

      const correspondeModelo =
        modelo === "Todas" || item.modelo === modelo;

      const correspondeAcabamento =
        acabamento === "Todas" ||
        item.acabamento === acabamento;

      const correspondeAplicacao =
        aplicacao === "Todas" ||
        item.aplicacao === aplicacao;

      return (
        correspondePesquisa &&
        correspondeModelo &&
        correspondeAcabamento &&
        correspondeAplicacao
      );
    });
  }, [pesquisa, modelo, acabamento, aplicacao]);

  const restantes = Math.max(
    0,
    imagensFiltradas.length - LIMITE_MOBILE
  );

  // ========================================
  // CONTROLE DOS FILTROS
  // ========================================

  function limparFiltros() {
    setPesquisa("");
    setModelo("Todas");
    setAcabamento("Todas");
    setAplicacao("Todas");
    setMostrarTodasImagens(false);
  }

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodasImagens(false);
  }

  function alterarModelo(valor) {
    setModelo(valor);
    setMostrarTodasImagens(false);
  }

  function alterarAcabamento(valor) {
    setAcabamento(valor);
    setMostrarTodasImagens(false);
  }

  function alterarAplicacao(valor) {
    setAplicacao(valor);
    setMostrarTodasImagens(false);
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="videos-page dig-marketing-page mec-marketing-page">
      <Header />

      {/* HERO */}

      <section className="dig-marketing-hero">
        <div className="dig-marketing-hero-container">
          <div className="dig-marketing-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="dig-marketing-eyebrow">
            <IconeSynter />

            <span>CONTEÚDOS PARA DIVULGAÇÃO</span>
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

      {/* CONTEÚDO PRINCIPAL */}

      <main className="videos-content">
        <div className="videos-section-title">
          <div className="videos-section-bar" />

          <h4>IMAGENS DE FECHADURAS MECÂNICAS</h4>
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
            aria-label="Pesquisar imagens de fechaduras mecânicas"
          />
        </div>

        {/* FILTROS */}

        <div className="mec-marketing-filters">
          <select
            value={modelo}
            onChange={(evento) =>
              alterarModelo(evento.target.value)
            }
            aria-label="Filtrar por modelo"
          >
            {MODELOS.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao === "Todas"
                  ? "Todos os modelos"
                  : opcao}
              </option>
            ))}
          </select>

          <select
            value={acabamento}
            onChange={(evento) =>
              alterarAcabamento(evento.target.value)
            }
            aria-label="Filtrar por acabamento"
          >
            {ACABAMENTOS.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao === "Todas"
                  ? "Todos os acabamentos"
                  : opcao}
              </option>
            ))}
          </select>

          <select
            value={aplicacao}
            onChange={(evento) =>
              alterarAplicacao(evento.target.value)
            }
            aria-label="Filtrar por aplicação"
          >
            {APLICACOES.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao === "Todas"
                  ? "Todas as aplicações"
                  : opcao}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="dig-marketing-clear mec-marketing-clear"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        {/* GALERIA DE IMAGENS */}

        <section
          className="dm-gallery"
          aria-label="Imagens de fechaduras mecânicas"
        >
          {imagensFiltradas.length > 0 ? (
            <div
              className={`videos-grid dm-gallery-grid ${
                mostrarTodasImagens
                  ? "dm-gallery-expanded"
                  : ""
              }`}
            >
              {imagensFiltradas.map((item) => (
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
                      Conteúdo para apoiar ações comerciais
                      e de marketing.
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
              ))}
            </div>
          ) : (
            <div className="dig-marketing-empty">
              <strong>Nenhuma imagem encontrada</strong>

              <p>
                Tente pesquisar outro modelo ou limpar
                os filtros.
              </p>

              <button
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* MOSTRAR MAIS IMAGENS */}

          {imagensFiltradas.length > LIMITE_MOBILE && (
            <button
              type="button"
              className="dig-marketing-more dm-gallery-more"
              aria-expanded={mostrarTodasImagens}
              onClick={() =>
                setMostrarTodasImagens((atual) => !atual)
              }
            >
              {mostrarTodasImagens
                ? "Mostrar menos imagens"
                : `Ver mais ${restantes} imagens`}
            </button>
          )}
        </section>

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

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
