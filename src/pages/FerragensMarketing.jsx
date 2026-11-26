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

const puxadores = modelosPuxadores
  .flatMap((modelo) =>
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
  )
  .filter((produto) => produto.imagem);

const materiais = [...puxadores];

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
    <article className="ferragens-card">

      <div className="ferragens-card-preview">
        <img
          src={produto.imagem}
          alt={produto.titulo}
          loading="lazy"
        />
      </div>

      <div className="ferragens-card-info">

        <span className="ferragens-card-categoria">
          {produto.categoria} Synter
        </span>

        <h3>{produto.titulo}</h3>

        <span
          className={`ferragens-acabamento ${normalizar(
            produto.acabamento
          )}`}
        >
          <span className="ferragens-acabamento-cor" />

          {produto.acabamento}
        </span>

        <div className="ferragens-card-botoes">

          <a
            className="ferragens-download"
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

    return (
      textoPesquisa.includes(normalizar(busca)) &&
      (categoria === "Todos" ||
        item.categoria === categoria) &&
      (modelo === "Todos" ||
        item.modelo === modelo) &&
      (acabamento === "Todos" ||
        item.acabamento === acabamento)
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

      <main className="ferragens-marketing-page">

        {/* HERO */}

        <section className="ferragens-hero">

          <div className="ferragens-container">

            <div className="ferragens-hero-topo">

              <Link
                to="/marketing"
                className="ferragens-voltar"
              >
                <ArrowLeft size={16} />
                Voltar para Marketing
              </Link>

              <UserProfileButton />

            </div>

            <div className="ferragens-eyebrow">
              <Box size={20} />
              <span>CONTEÚDOS PARA DIVULGAÇÃO</span>
            </div>

            <h1>Marketing de Ferragens</h1>

            <p className="ferragens-hero-descricao">
              Encontre imagens, vídeos e materiais de apoio
              para divulgar as ferragens Synter e fortalecer
              suas ações comerciais e de marketing.
            </p>

            <div className="ferragens-beneficios">

              <div className="ferragens-beneficio">

                <div className="ferragens-beneficio-icon">
                  <Image size={18} />
                </div>

                <div>
                  <strong>Materiais Visuais</strong>
                  <small>Conteúdos para divulgação</small>
                </div>

              </div>

              <div className="ferragens-beneficio">

                <div className="ferragens-beneficio-icon">
                  <Megaphone size={18} />
                </div>

                <div>
                  <strong>Marketing</strong>
                  <small>Apoio às ações comerciais</small>
                </div>

              </div>

              <div className="ferragens-beneficio">

                <div className="ferragens-beneficio-icon">
                  <Zap size={18} />
                </div>

                <div>
                  <strong>Acesso Rápido</strong>
                  <small>Materiais em um só lugar</small>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* CATÁLOGO */}

        <section className="ferragens-catalogo">

          <div className="ferragens-container">

            <div className="ferragens-section-label">
              MATERIAIS DE MARKETING
            </div>

            <div className="ferragens-catalogo-topo">

              <div>
                <h2>Imagens de Ferragens</h2>
                <p>
                  Encontre e baixe as imagens dos produtos Synter.
                </p>
              </div>

              <div className="ferragens-contadores">
                <span>
                  <Image size={15} />
                  {materiais.length} imagens disponíveis
                </span>
              </div>

            </div>

            {/* PESQUISA E FILTROS */}

            <div className="ferragens-filtros">

              <div className="ferragens-pesquisa">

                <Search size={18} />

                <input
                  type="search"
                  aria-label="Buscar ferragens"
                  placeholder="Pesquisar imagem ou modelo..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setLimiteMobile(3);
                  }}
                />

              </div>

              <div className="ferragens-selects">

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

            </div>

            {/* CONTADOR */}

            <div className="ferragens-resultados">
              {materiaisFiltrados.length}{" "}
              {materiaisFiltrados.length === 1
                ? "imagem encontrada"
                : "imagens encontradas"}
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

            {/* DESKTOP */}

            <div className="ferragens-desktop">

              <div className="ferragens-grid">

                {materiaisFiltrados.map((produto) => (
                  <FerragemCard
                    key={produto.id}
                    produto={produto}
                  />
                ))}

              </div>

            </div>

            {/* MOBILE */}

            <div className="ferragens-mobile">

              <div className="ferragens-mobile-lista">

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
                  className="ferragens-ver-mais"
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