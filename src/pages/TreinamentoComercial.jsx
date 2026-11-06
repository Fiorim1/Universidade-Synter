
import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/TreinamentoComercial.css";

// ==========================================
// ENDEREÇO DOS DOCUMENTOS
// ==========================================

const BASE = `${
  import.meta.env.BASE_URL || "/"
}treinamento-comercial/`;

// ==========================================
// MATERIAIS DE CAPACITAÇÃO
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
// VALIDAR E CARREGAR PDF ORIGINAL
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

  // Confirma que recebemos um PDF de verdade,
  // e não uma página HTML do sistema.

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
// VISUALIZAR PDF EM NOVA ABA
// ==========================================

async function visualizarPdf(material, definirErro) {
  // A aba é criada imediatamente após o clique
  // para evitar bloqueio de pop-up.

  const aba = window.open("about:blank", "_blank");

  if (!aba) {
    definirErro(
      "O navegador bloqueou a abertura do PDF. Permita pop-ups para este site e tente novamente."
    );
    return;
  }

  try {
    aba.document.title = `Abrindo ${material.titulo}`;

    aba.document.body.style.cssText =
      "margin:0;background:#111;color:#fff;" +
      "font-family:Arial,sans-serif;" +
      "display:flex;align-items:center;" +
      "justify-content:center;min-height:100vh;";

    aba.document.body.textContent =
      "Carregando documento PDF...";

    const arquivo = await carregarPdf(material);

    const urlTemporaria =
      URL.createObjectURL(arquivo);

    // Abre o visualizador nativo do navegador.

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
// BAIXAR PDF ORIGINAL
// ==========================================

async function baixarPdf(material, definirErro) {
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
// ÍCONE DO HERO
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
  if (tipo === "digital") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 3H4v18h7M13 3h7v18h-7M11 2h2v20h-2z" />
        <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5.5C7 4 10 4 12 6c2-2 5-2 8-.5V19c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5V5.5Z" />
      <path d="M12 6v13.5M7 9h2M15 9h2M7 12h2M15 12h2" />
    </svg>
  );
}

// ==========================================
// ÍCONE PDF
// ==========================================

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

// ==========================================
// ÍCONE DOWNLOAD
// ==========================================

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

// ==========================================
// ÍCONE VISUALIZAR
// ==========================================

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
// CARTÃO DE TREINAMENTO
// ==========================================

function CardMaterial({ material, definirErro }) {
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
    <article className="tc-material-card">

      {/* ÍCONE + PDF */}

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

      {/* INFORMAÇÕES */}

      <div className="tc-material-meta">
        <span>{material.paginas} páginas</span>
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
// PÁGINA TREINAMENTO COMERCIAL
// ==========================================

export default function TreinamentoComercial() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [erroDocumento, setErroDocumento] =
    useState("");

  return (
    <div className="tc-page">

      {/* HEADER */}

      <Header />

      {/* =====================================
          HERO
      ===================================== */}

      <section className="tc-hero">
        <div className="tc-container tc-hero-inner">

          {/* PERFIL */}

          <div className="tc-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          {/* IDENTIFICAÇÃO */}

          <div className="tc-eyebrow">
            <IconeCubo />

            <span>
              CAPACITAÇÃO E DESENVOLVIMENTO
            </span>
          </div>

          {/* TÍTULO */}

          <h1>
            Treinamento Comercial
          </h1>

          {/* DESCRIÇÃO */}

          <p>
            Consulte os materiais oficiais de
            capacitação da Synter e aprofunde
            seus conhecimentos sobre produtos,
            aplicações e práticas comerciais.
          </p>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="tc-container tc-main">

        {/* CABEÇALHO */}

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
            04 documentos
          </span>

        </div>

        {/* MENSAGEM AMIGÁVEL */}

        {erroDocumento && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: "15px 18px",
              background: "#151515",
              color: "#ffffff",
              border: "1px solid #444",
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <strong>
              Não foi possível acessar o material.
            </strong>

            <p
              style={{
                margin: "7px 0 0",
                color: "#b7b7bf",
              }}
            >
              {erroDocumento}
            </p>
          </div>
        )}

        {/* GRID */}

        <div className="tc-grid">
          {materiais.map((material) => (
            <CardMaterial
              key={material.id}
              material={material}
              definirErro={setErroDocumento}
            />
          ))}
        </div>

        {/* INFORMAÇÃO */}

        <div className="tc-info">
          <IconeDocumento />

          <span>
            Clique em “Visualizar” para abrir o
            PDF diretamente em uma nova aba.
            Para salvar uma cópia, utilize
            “Baixar PDF”.
          </span>
        </div>

      </main>

      {/* FOOTER */}

      <Footer />

      {/* PERFIL */}

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
