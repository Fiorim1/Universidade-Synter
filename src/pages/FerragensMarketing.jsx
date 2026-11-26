
import { useState } from "react";
import {
  Box,
  Image,
  Megaphone,
  Zap,
  Download,
  Search,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/FerragensMarketing.css";

// ==========================================
// IMPORTAÇÃO AUTOMÁTICA DAS IMAGENS
// ==========================================

const imagensPuxadores = import.meta.glob(
  "../assets/marketing-ferragens/puxadores/*.jpg",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// ==========================================
// MODELOS
// ==========================================

const modelosPuxadores = [
  { nome: "Quartzo", arquivo: "quartzo" },
  { nome: "Opala", arquivo: "opala" },
  { nome: "Jaspe", arquivo: "jaspe" },
  { nome: "Jaspe com Furo", arquivo: "jaspe-com-furo" },
  { nome: "Jade", arquivo: "jade" },
  { nome: "Jade Max", arquivo: "jade-max" },
];

// ==========================================
// ACABAMENTOS
// ==========================================

const acabamentosPuxadores = [
  { nome: "Preto", arquivo: "preta" },
  { nome: "Escovado", arquivo: "escovada" },
  { nome: "Polido", arquivo: "polida" },
];

// ==========================================
// CADASTRO DOS PRODUTOS
// ==========================================

const puxadores = modelosPuxadores.flatMap((modelo) =>
  acabamentosPuxadores.map((acabamento) => {
    const arquivo =
      `${modelo.arquivo}-${acabamento.arquivo}.jpg`;

    return {
      id: `puxador-${modelo.arquivo}-${acabamento.arquivo}`,
      titulo: `Puxador ${modelo.nome} ${acabamento.nome}`,
      categoria: "Puxadores",
      modelo: modelo.nome,
      acabamento: acabamento.nome,
      tipo: "imagem",
      imagem:
        imagensPuxadores[
          `../assets/marketing-ferragens/puxadores/${arquivo}`
        ],
      arquivo,
    };
  })
).filter((produto) => produto.imagem);

// ==========================================
// TODOS OS MATERIAIS DE FERRAGENS
// ==========================================

const materiais = [
  ...puxadores,
];

// ==========================================
// NORMALIZAÇÃO DA PESQUISA
// ==========================================

function normalizar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ==========================================
// CARD DO PRODUTO
// ==========================================

function FerragemCard({ produto }) {
  return (
    <article className="video-card ferragem-card">

      <img
        className="video-preview ferragem-preview"
        src={produto.imagem}
        alt={produto.titulo}
        loading="lazy"
      />

      <div className="video-card-info">

        <h2>{produto.titulo}</h2>

        <p>
          {produto.categoria} Synter • {produto.acabamento}
        </p>

        <div className="video-card-botoes">

          <a
            className="botao-assistir"
            href={produto.imagem}
            download={produto.arquivo}
          >
            <Download size={15} />
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

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [modelo, setModelo] = useState("Todos");
  const [acabamento, setAcabamento] = useState("Todos");
  const [limiteMobile, setLimiteMobile] = useState(3);

  const categorias = [
    ...new Set(materiais.map((item) => item.categoria)),
  ];

  const modelos = [
    ...new Set(materiais.map((item) => item.modelo)),
  ];

  const acabamentos = [
    ...new Set(materiais.map((item) => item.acabamento)),
  ];

  // ========================================
  // FILTRAGEM
  // ========================================

  const materiaisFiltrados = materiais.filter((item) => {

    const textoPesquisa = normalizar(
      `${item.titulo} ${item.categoria} ${item.modelo} ${item.acabamento}`
    );

    const correspondeBusca =
      textoPesquisa.includes(normalizar(busca));

    const correspondeCategoria =
      categoria === "Todos" ||
      item.categoria === categoria;

    const correspondeModelo =
      modelo === "Todos" ||
      item.modelo === modelo;

    const correspondeAcabamento =
      acabamento === "Todos" ||
      item.acabamento === acabamento;

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeModelo &&
      correspondeAcabamento
    );
  });

  function limparFiltros() {
    setBusca("");
    setCategoria("Todos");
    setModelo("Todos");
    setAcabamento("Todos");
    setLimiteMobile(3);
  }

  return (
    <>
      <Header />

      <main className="videos-page dig-marketing-page ferragens-marketing-page">

        {/* ==================================
            HERO
        ================================== */}

        <section className="dig-marketing-hero">

          <div className="dig-marketing-hero-container">

            <div className="dig-marketing-profile">
              <UserProfileButton />
            </div>

            <Link
              to="/marketing"
              className="ferragens-voltar"
            >
              <ArrowLeft size={16} />
              Voltar para Marketing
            </Link>

            <div className="dig-marketing-eyebrow">
              <Box size={20} />
              <span>CONTEÚDOS PARA DIVULGAÇÃO</span>
            </div>

            <h1>Marketing de Ferragens</h1>

            <p className="dig-marketing-hero-description">
              Encontre imagens, vídeos e materiais de apoio
              para divulgar as ferragens Synter e fortalecer
              suas ações comerciais e de marketing.
            </p>

            <div className="dig-marketing-benefits">

              <div className="dig-marketing-benefit">

                <div className="dig-marketing-benefit-icon">
                  <Image size={18} />
                </div>

                <div>
                  <strong>Materiais Visuais</strong>
                  <span>Conteúdos para divulgação</span>
                </div>

              </div>

              <div className="dig-marketing-benefit">

                <div className="dig-marketing-benefit-icon">
                  <Megaphone size={18} />
                </div>

                <div>
                  <strong>Marketing</strong>
                  <span>Apoio às ações comerciais</span>
                </div>

              </div>

              <div className="dig-marketing-benefit">

                <div className="dig-marketing-benefit-icon">
                  <Zap size={18} />
                </div>

                <div>
                  <strong>Acesso Rápido</strong>
                  <span>Materiais em um só lugar</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================
            CONTEÚDO
        ================================== */}

        <section className="ferragens-content">

          <div className="ferragens-container">

            <div className="ferragens-section-title">
              MATERIAIS DE MARKETING
            </div>

            {/* PESQUISA E FILTROS */}

            <div className="ferragens-filtros">

              <div className="ferragens-search">

                <Search size={18} />

                <input
                  type="search"
                  aria-label="Buscar ferragens"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setLimiteMobile(3);
                  }}
                />

              </div>

              <select
                aria-label="Categoria"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setLimiteMobile(3);
                }}
              >
                <option value="Todos">
                  Todas as categorias
                </option>

                {categorias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

              <select
                aria-label="Modelo"
                value={modelo}
                onChange={(e) => {
                  setModelo(e.target.value);
                  setLimiteMobile(3);
                }}
              >
                <option value="Todos">
                  Todos os modelos
                </option>

                {modelos.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

              <select
                aria-label="Acabamento"
                value={acabamento}
                onChange={(e) => {
                  setAcabamento(e.target.value);
                  setLimiteMobile(3);
                }}
              >
                <option value="Todos">
                  Todos os acabamentos
                </option>

                {acabamentos.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

              <button
                type="button"
                className="ferragens-limpar"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>

            </div>

            {/* TÍTULO E CONTADOR */}

            <div className="ferragens-resultados">

              <h2>
                {categoria === "Todos"
                  ? "IMAGENS DE FERRAGENS"
                  : categoria.toUpperCase()}
              </h2>

              <span>
                {materiaisFiltrados.length}{" "}
                {materiaisFiltrados.length === 1
                  ? "imagem encontrada"
                  : "imagens encontradas"}
              </span>

            </div>

            {/* NENHUM RESULTADO */}

            {materiaisFiltrados.length === 0 && (
              <div className="ferragens-vazio">

                <Search size={32} />

                <h3>Nenhum material encontrado</h3>

                <p>
                  Tente pesquisar outro produto ou alterar os filtros.
                </p>

                <button
                  type="button"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </button>

              </div>
            )}

            {/* ==================================
                DESKTOP
            ================================== */}

            <div className="dig-marketing-desktop">

              <div className="ferragens-grid">

                {materiaisFiltrados.map((produto) => (
                  <FerragemCard
                    key={produto.id}
                    produto={produto}
                  />
                ))}

              </div>

            </div>

            {/* ==================================
                MOBILE
            ================================== */}

            <div className="dig-marketing-mobile">

              <div className="dig-marketing-mobile-list">

                {materiaisFiltrados
                  .slice(0, limiteMobile)
                  .map((produto) => (
                    <FerragemCard
                      key={produto.id}
                      produto={produto}
                    />
                  ))}

              </div>

              {limiteMobile < materiaisFiltrados.length && (

                <button
                  type="button"
                  className="dig-marketing-more"
                  onClick={() =>
                    setLimiteMobile((anterior) => anterior + 3)
                  }
                >
                  Ver mais{" "}
                  {Math.min(
                    3,
                    materiaisFiltrados.length - limiteMobile
                  )}{" "}
                  imagens

                  <ChevronDown size={16} />

                </button>

              )}

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
