
import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/TreinamentoComercial.css";
import "../styles/TreinamentoComercialMobile.css";

// ==========================================
// CONFIGURAÇÃO DOS DOCUMENTOS
// ==========================================

const BASE = `${
  import.meta.env.BASE_URL || "/"
}treinamento-comercial/`;

// ==========================================
// MATERIAIS ORIGINAIS SYNTER
// ==========================================

const materiais = [
  {
    id: "inteligentes",
    categoria: "CAPACITAÇÃO DE PRODUTOS",
    titulo: "Fechaduras Inteligentes",
    descricao:
      "Conceitos de automação, fechaduras digitais, aplicativo Synter Smart e controle de acesso.",
    paginas: 22,
    arquivo: "capacitacao-fechaduras-inteligentes.pdf",
    nomeDownload:
      "Synter-Capacitacao-Fechaduras-Inteligentes.pdf",
    icone: "digital",
  },
  {
    id: "mecanicas",
    categoria: "CAPACITAÇÃO DE PRODUTOS",
    titulo: "Fechaduras Mecânicas",
    descricao:
      "Linhas de fechaduras, matérias-primas, componentes, rosetas e aplicações.",
    paginas: 16,
    arquivo: "capacitacao-fechaduras-mecanicas.pdf",
    nomeDownload:
      "Synter-Capacitacao-Fechaduras-Mecanicas.pdf",
    icone: "mecanica",
  },
  {
    id: "dobradicas",
    categoria: "CAPACITAÇÃO DE PRODUTOS",
    titulo: "Dobradiças",
    descricao:
      "Linhas Synter, materiais, modelos e orientações de aplicação e manutenção.",
    paginas: 10,
    arquivo: "capacitacao-dobradicas.pdf",
    nomeDownload:
      "Synter-Capacitacao-Dobradicas.pdf",
    icone: "dobradica",
  },
  {
    id: "playbook",
    categoria: "CONHECIMENTO COMERCIAL",
    titulo: "Playbook Synter",
    descricao:
      "Material institucional e comercial, com posicionamento da marca, funções comerciais e conceitos de vendas. Edição 2023–2025.",
    paginas: 15,
    arquivo: "playbook-synter-2023-2025.pdf",
    nomeDownload:
      "Synter-Playbook-2023-2025.pdf",
    icone: "playbook",
  },
];

// ==========================================
// CONFIGURAÇÕES DE FILTRO
// ==========================================

const CATEGORIAS = [
  {
    valor: "todos",
    nome: "Todos os materiais",
  },
  {
    valor: "CAPACITAÇÃO DE PRODUTOS",
    nome: "Capacitação de Produtos",
  },
  {
    valor: "CONHECIMENTO COMERCIAL",
    nome: "Conhecimento Comercial",
  },
];

const LIMITE_MOBILE = 2;

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ==========================================
// CARREGAR E VALIDAR PDF
// ==========================================

async function carregarPdf(material) {
  const url = `${BASE}${material.arquivo}`;

  const resposta = await fetch(url, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!resposta.ok) {
    throw new Error(
      `O documento não está disponível (${resposta.status}).`
    );
  }

  const dados = await resposta.arrayBuffer();

  if (dados.byteLength < 5) {
    throw new Error(
      "O arquivo recebido está vazio ou incompleto."
    );
  }

  const cabecalho = new TextDecoder("ascii").decode(
    dados.slice(0, 5)
  );

  if (cabecalho !== "%PDF-") {
    throw new Error(
      "O endereço não retornou um PDF válido. Verifique se o arquivo foi publicado na pasta correta."
    );
  }

  return new Blob([dados], {
    type: "application/pdf",
  });
}

// ==========================================
// VISUALIZAR PDF
// ==========================================

async function visualizarPdf(
  material,
  definirErro
) {
  const aba = window.open(
    "about:blank",
    "_blank"
  );

  if (!aba) {
    definirErro(
      "O navegador bloqueou a abertura do PDF. Permita pop-ups e tente novamente."
    );
    return;
  }

  try {
    aba.document.title =
      `Abrindo ${material.titulo}`;

    aba.document.body.style.cssText = [
      "margin:0",
      "background:#111",
      "color:#fff",
      "font-family:Arial,sans-serif",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "min-height:100vh",
    ].join(";");

    aba.document.body.textContent =
      "Carregando documento PDF...";

    const arquivo = await carregarPdf(material);

    const urlTemporaria =
      URL.createObjectURL(arquivo);

    if (!aba.closed) {
      aba.location.replace(urlTemporaria);
    } else {
      URL.revokeObjectURL(urlTemporaria);
    }
  } catch (erro) {
    if (!aba.closed) {
      aba.close();
    }

    definirErro(
      erro.message ||
        "Não foi possível abrir o documento."
    );
  }
}

// ==========================================
// BAIXAR PDF
// ==========================================

async function baixarPdf(
  material,
  definirErro
) {
  try {
    const arquivo = await carregarPdf(material);

    const urlTemporaria =
      URL.createObjectURL(arquivo);

    const link = document.createElement("a");

    link.href = urlTemporaria;
    link.download = material.nomeDownload;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(urlTemporaria);
    }, 60000);
  } catch (erro) {
    definirErro(
      erro.message ||
        "Não foi possível baixar o documento."
    );
  }
}

// ==========================================
// ÍCONE PADRÃO SYNTER
// ==========================================

function IconeCubo() {
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
// ÍCONES DOS MATERIAIS
// ==========================================

function IconeMaterial({ tipo }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (tipo === "digital") {
    return (
      <svg {...props}>
        <rect
          x="7"
          y="2"
          width="10"
          height="20"
          rx="2"
        />
        <path d="M10 6h4M10 10h.01M14 10h.01M10 13h.01M14 13h.01M11 18h2" />
      </svg>
    );
  }

  if (tipo === "mecanica") {
    return (
      <svg {...props}>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <circle cx="9" cy="12" r="3" />
        <path d="M12 12h7M16 12v3" />
      </svg>
    );
  }

  if (tipo === "dobradica") {
    return (
      <svg {...props}>
        <path d="M11 3H4v18h7M13 3h7v18h-7M11 2h2v20h-2z" />
        <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M4 5.5C7 4 10 4 12 6c2-2 5-2 8-.5V19c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5V5.5Z" />
      <path d="M12 6v13.5M7 9h2M15 9h2M7 12h2M15 12h2" />
    </svg>
  );
}

function IconeDocumento() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  );
}

function IconeDownload() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" />
    </svg>
  );
}

function IconeVisualizar() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

// ==========================================
// CARD DE MATERIAL
// ==========================================

function CardMaterial({
  material,
  definirErro,
  ocultarNoMobile,
}) {
  const [processando, setProcessando] =
    useState(false);

  async function handleDownload() {
    if (processando) return;

    setProcessando(true);
    definirErro("");

    try {
      await baixarPdf(material, definirErro);
    } finally {
      setProcessando(false);
    }
  }

  function handleVisualizar() {
    definirErro("");
    visualizarPdf(material, definirErro);
  }

  return (
    <article
      className={[
        "tc-material-card",
        ocultarNoMobile
          ? "tc-mobile-hidden"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ÍCONE E IDENTIFICAÇÃO PDF */}

      <div className="tc-card-top">
        <div className="tc-material-icon">
          <IconeMaterial
            tipo={material.icone}
          />
        </div>

        <span className="tc-file-type">
          <IconeDocumento />
          PDF
        </span>
      </div>

      {/* CATEGORIA */}

      <span className="tc-material-category">
        {material.categoria}
      </span>

      {/* TÍTULO */}

      <h3>{material.titulo}</h3>

      {/* DESCRIÇÃO */}

      <p className="tc-material-description">
        {material.descricao}
      </p>

      {/* METADADOS */}

      <div className="tc-material-meta">
        <span>
          {material.paginas} páginas
        </span>
        <span>Material Synter</span>
      </div>

      {/* AÇÕES */}

      <div className="tc-material-actions">
        <button
          type="button"
          className="tc-action tc-action-view"
          onClick={handleVisualizar}
        >
          <IconeVisualizar />
          Visualizar
        </button>

        <button
          type="button"
          className="tc-action tc-action-download"
          onClick={handleDownload}
          disabled={processando}
        >
          <IconeDownload />

          {processando
            ? "Baixando..."
            : "Baixar PDF"}
        </button>
      </div>
    </article>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function TreinamentoComercial() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [erroDocumento, setErroDocumento] =
    useState("");

  const [pesquisa, setPesquisa] =
    useState("");

  const [categoria, setCategoria] =
    useState("todos");

  const [mostrarTodos, setMostrarTodos] =
    useState(false);

  // ========================================
  // FILTRAR MATERIAIS
  // ========================================

  const materiaisFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return materiais.filter((material) => {
      const correspondePesquisa =
        !termo ||
        normalizarTexto(
          `${material.titulo} ${material.descricao} ${material.categoria}`
        ).includes(termo);

      const correspondeCategoria =
        categoria === "todos" ||
        material.categoria === categoria;

      return (
        correspondePesquisa &&
        correspondeCategoria
      );
    });
  }, [pesquisa, categoria]);

  function alterarPesquisa(valor) {
    setPesquisa(valor);
    setMostrarTodos(false);
  }

  function alterarCategoria(valor) {
    setCategoria(valor);
    setMostrarTodos(false);
  }

  function limparFiltros() {
    setPesquisa("");
    setCategoria("todos");
    setMostrarTodos(false);
  }

  const quantidadeRestante = Math.max(
    0,
    materiaisFiltrados.length -
      LIMITE_MOBILE
  );

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="tc-page">
      <Header />

      {/* =====================================
          HERO
      ===================================== */}

      <section className="tc-hero">
        <div className="tc-container tc-hero-inner">

          <div className="tc-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="tc-eyebrow">
            <IconeCubo />
            <span>
              CAPACITAÇÃO E DESENVOLVIMENTO
            </span>
          </div>

          <h1>
            Treinamento Comercial
          </h1>

          <p>
            Consulte os materiais oficiais de
            capacitação da Synter e aprofunde seus
            conhecimentos sobre produtos, aplicações
            e práticas comerciais.
          </p>
        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="tc-container tc-main">

        <div className="tc-section-heading">
          <span className="tc-section-bar" />

          <div>
            <h2>
              MATERIAIS DE TREINAMENTO
            </h2>

            <p>
              Selecione um conteúdo para
              visualizar ou baixar o
              material completo.
            </p>
          </div>

          <span className="tc-total">
            {materiaisFiltrados.length}
            {materiaisFiltrados.length === 1
              ? " documento"
              : " documentos"}
          </span>
        </div>

        {/* =====================================
            FILTROS
        ===================================== */}

        <div className="tc-filtros">
          <div className="tc-pesquisa">
            <label htmlFor="tc-pesquisar">
              Pesquisar treinamento
            </label>

            <input
              id="tc-pesquisar"
              type="search"
              value={pesquisa}
              onChange={(evento) =>
                alterarPesquisa(
                  evento.target.value
                )
              }
              placeholder="Pesquisar material..."
            />
          </div>

          <div className="tc-categoria">
            <label htmlFor="tc-categoria">
              Categoria
            </label>

            <select
              id="tc-categoria"
              value={categoria}
              onChange={(evento) =>
                alterarCategoria(
                  evento.target.value
                )
              }
            >
              {CATEGORIAS.map((opcao) => (
                <option
                  key={opcao.valor}
                  value={opcao.valor}
                >
                  {opcao.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="tc-limpar-filtros"
            onClick={limparFiltros}
          >
            Limpar
          </button>
        </div>

        {/* =====================================
            MENSAGEM DE ERRO
        ===================================== */}

        {erroDocumento && (
          <div
            className="tc-erro-documento"
            role="alert"
          >
            <strong>
              Não foi possível acessar o material.
            </strong>

            <p>{erroDocumento}</p>
          </div>
        )}

        {/* =====================================
            RESULTADOS
        ===================================== */}

        {materiaisFiltrados.length > 0 ? (
          <>
            <div
              className="tc-grid"
              aria-label="Materiais de treinamento"
            >
              {materiaisFiltrados.map(
                (material, indice) => (
                  <CardMaterial
                    key={material.id}
                    material={material}
                    definirErro={setErroDocumento}
                    ocultarNoMobile={
                      !mostrarTodos &&
                      indice >= LIMITE_MOBILE
                    }
                  />
                )
              )}
            </div>

            {materiaisFiltrados.length >
              LIMITE_MOBILE && (
              <div className="tc-mobile-pagination">
                <button
                  type="button"
                  className="tc-mobile-more"
                  onClick={() =>
                    setMostrarTodos(
                      (atual) => !atual
                    )
                  }
                  aria-expanded={mostrarTodos}
                >
                  {mostrarTodos
                    ? "Mostrar menos materiais"
                    : `Ver mais ${quantidadeRestante} materiais`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="tc-sem-resultados">
            <strong>
              Nenhum material encontrado
            </strong>

            <p>
              Tente pesquisar outro termo
              ou selecionar uma categoria diferente.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* =====================================
            ORIENTAÇÃO FINAL
        ===================================== */}

        <div className="tc-info">
          <IconeDocumento />

          <span>
            Clique em “Visualizar” para abrir
            o PDF em uma nova aba. Para salvar
            uma cópia, utilize “Baixar PDF”.
          </span>
        </div>

      </main>

      <Footer />

      {profileOpen && (
        <Profile
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </div>
  );
}
