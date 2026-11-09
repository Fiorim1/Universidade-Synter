
import { useEffect, useMemo, useState } from "react";

// ========================================
// COMPONENTES
// ========================================

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

// ========================================
// CAPAS DOS VÍDEOS
// ========================================

import capaSyriusReversao from "../assets/SyriusS2-Reversao.png";
import capaResetS1 from "../assets/caparesets1.png";
import capaResetS2 from "../assets/caparesets2.png";
import capaRetiradaPortaS2 from "../assets/retiradaportas2.png";
import cadastroAppS2 from "../assets/s2cadastroapp.png";
import trocaPlacaS1 from "../assets/trocaplacas1.png";
import erroPortaSempreAbertaS1 from "../assets/erroportaabertas1.png";
import cadastroVenusS3IMG from "../assets/cadastros3venus.png";
import cadastroMarsS2IMG from "../assets/marss2cadastro.png";
import resetMarsS2IMG from "../assets/marss2reset.png";
import venuss2TrocaIdioma from "../assets/venuss2trocaidioma.png";
import marsS2Traseira from "../assets/marsS2traseira.png";
import marsS2Frontal from "../assets/marss2frontal.png";
import x1ResetImg from "../assets/x1reset.png";
import x1ExcluirSenha from "../assets/x1exclusaosenhauser.png";
import x1ConfigAudio from "../assets/x1configsom.png";
import x1CadUser from "../assets/x1cadastrouser.png";
import x1CadAdm from "../assets/x1cadadm.png";

// ========================================
// ESTILOS
// ========================================

import "../styles/Videos.css";
import "../styles/VideosHero.css";
import "../styles/VideosMobile.css";

// ========================================
// VÍDEOS EDUCATIVOS
// ========================================

const videos = [
  {
    id: 1,
    titulo: "Syrius S2 - Reversão do lado de abertura",
    descricao:
      "Aprenda como realizar corretamente a reversão do lado de abertura.",
    video: "https://www.youtube.com/embed/4Q1IiKGvS6M",
    capa: capaSyriusReversao,
  },
  {
    id: 2,
    titulo: "Syrius S1 - Como realizar o reset",
    descricao:
      "Aprenda como realizar corretamente o processo de reset da fechadura.",
    video: "https://youtube.com/shorts/TJSIOX6BK5I?feature=share",
    capa: capaResetS1,
  },
  {
    id: 3,
    titulo: "Syrius S2 - Como realizar o reset",
    descricao:
      "Aprenda como realizar corretamente o processo de reset da fechadura.",
    video: "https://youtube.com/shorts/YtlF1Tv08sk",
    capa: capaResetS2,
  },
  {
    id: 4,
    titulo: "Syrius S2 - Retirada da Porta",
    descricao:
      "Aprenda o passo a passo para realizar corretamente a retirada da fechadura da porta.",
    video: "https://youtube.com/shorts/Dt3rD-t5v8g?feature=share",
    capa: capaRetiradaPortaS2,
  },
  {
    id: 5,
    titulo: "Syrius S2 - Cadastro no App",
    descricao:
      "Aprenda como realizar corretamente o cadastro da fechadura da linha Syrius S2 no aplicativo Synter.",
    video: "https://youtube.com/shorts/C7pg0rwKtBA",
    capa: cadastroAppS2,
  },
  {
    id: 6,
    titulo: "Syrius S1 - Troca de Placa da Bateria",
    descricao:
      "Aprenda o passo a passo para realizar corretamente a troca da placa da bateria nas fechaduras da linha S1.",
    video: "https://youtube.com/shorts/cCacriajKGg",
    capa: trocaPlacaS1,
  },
  {
    id: 7,
    titulo: "Syrius S1 - Erro Porta Sempre Aberta",
    descricao:
      "Aprenda como identificar e corrigir o erro de porta sempre aberta nas fechaduras da linha S1.",
    video: "https://youtube.com/shorts/EJBrtiv1ccI",
    capa: erroPortaSempreAbertaS1,
  },
  {
    id: 8,
    titulo: "Venus S3 - Cadastro",
    descricao:
      "Aprenda como realizar corretamente o cadastro da fechadura Venus S3.",
    video: "https://youtu.be/G-0pJ70Wupg",
    capa: cadastroVenusS3IMG,
  },
  {
    id: 9,
    titulo: "Mars S2 - Cadastro",
    descricao:
      "Aprenda como realizar corretamente o cadastro de usuários na fechadura Mars S2.",
    video: "https://youtube.com/shorts/_xmbUmvTooo",
    capa: cadastroMarsS2IMG,
  },
  {
    id: 10,
    titulo: "Mars S2 - Reset",
    descricao:
      "Aprenda como realizar corretamente o reset da fechadura Mars S2.",
    video: "https://youtube.com/shorts/zjBiI0PYUSg?feature=share",
    capa: resetMarsS2IMG,
  },
  {
    id: 11,
    titulo: "Mars S2 - Retirada da Porta Parte Traseira",
    descricao:
      "Aprenda como realizar corretamente a retirada da parte traseira da fechadura Mars S2.",
    video: "https://youtube.com/shorts/BXjROLwm2-M",
    capa: marsS2Traseira,
  },
  {
    id: 12,
    titulo: "Venus S2 - Troca de Idioma",
    descricao:
      "Aprenda como realizar corretamente a troca de idioma na fechadura Venus S2.",
    video: "https://youtube.com/shorts/GO9NWpYvjBk",
    capa: venuss2TrocaIdioma,
  },
  {
    id: 13,
    titulo: "Mars S2 - Retirada da Porta Parte Frontal",
    descricao:
      "Aprenda como realizar corretamente a retirada da parte frontal da fechadura Mars S2.",
    video: "https://youtube.com/shorts/aYo6oJCV63c",
    capa: marsS2Frontal,
  },
  {
    id: 14,
    titulo: "X1 - Reset",
    descricao:
      "Aprenda como realizar corretamente o reset da fechadura X1.",
    video: "https://youtube.com/shorts/ON1WW4jUGn4",
    capa: x1ResetImg,
  },
  {
    id: 15,
    titulo: "X1 - Exclusão de Senha de Usuário",
    descricao:
      "Aprenda como realizar corretamente a exclusão de senha de usuário na fechadura X1.",
    video: "https://youtube.com/shorts/zL1le3iMcvg",
    capa: x1ExcluirSenha,
  },
  {
    id: 16,
    titulo: "X1 - Configuração de Som",
    descricao:
      "Aprenda como realizar corretamente a configuração de som na fechadura X1.",
    video: "https://youtube.com/shorts/kFpSE6XCBgo",
    capa: x1ConfigAudio,
  },
  {
    id: 17,
    titulo: "X1 - Cadastro de Usuário",
    descricao:
      "Aprenda como realizar corretamente o cadastro de usuário na fechadura X1.",
    video: "https://youtube.com/shorts/-mPrd8eMDWg",
    capa: x1CadUser,
  },
  {
    id: 18,
    titulo: "X1 - Cadastro de Administrador",
    descricao:
      "Aprenda como realizar corretamente o cadastro de administrador na fechadura X1.",
    video: "https://youtube.com/shorts/s67_jfqKYHs",
    capa: x1CadAdm,
  },
];

// ========================================
// NORMALIZAR TEXTO DA PESQUISA
// ========================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ========================================
// LINHA E PROCEDIMENTO DE CADA VÍDEO
// Derivados dos títulos já cadastrados.
// ========================================

function obterLinha(titulo) {
  const nome = normalizarTexto(titulo);
  if (nome.startsWith("syrius")) return "Syrius";
  if (nome.startsWith("venus")) return "Venus";
  if (nome.startsWith("mars")) return "Mars";
  if (nome.startsWith("x1")) return "X1";
  return "Outros";
}

function obterProcedimento(titulo) {
  const nome = normalizarTexto(titulo);
  if (nome.includes("reset")) return "Reset";
  if (nome.includes("retirada")) return "Retirada da porta";
  if (nome.includes("cadastro")) return "Cadastro";
  if (nome.includes("troca de placa")) return "Manutenção";
  if (nome.includes("erro")) return "Diagnóstico";
  if (nome.includes("configuracao") || nome.includes("idioma")) {
    return "Configuração";
  }
  if (nome.includes("exclusao")) return "Exclusão";
  if (nome.includes("reversao")) return "Reversão";
  return "Outros";
}

const LINHAS = [...new Set(videos.map((item) => obterLinha(item.titulo)))];
const PROCEDIMENTOS = [
  ...new Set(videos.map((item) => obterProcedimento(item.titulo))),
];

// ========================================
// ÍCONE GEOMÉTRICO — PADRÃO SYNTER
// ========================================

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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function Videos() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [linha, setLinha] = useState("todas");
  const [procedimento, setProcedimento] = useState("todos");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia("(max-width: 750px)").matches
  );

  // Reage também quando o DevTools muda entre desktop e celular.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 750px)");
    const atualizar = () => setMobile(media.matches);
    atualizar();
    media.addEventListener("change", atualizar);
    return () => media.removeEventListener("change", atualizar);
  }, []);

  const videosFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);
    return videos.filter((item) => {
      const texto = normalizarTexto(`${item.titulo} ${item.descricao}`);
      return (
        (!termo || texto.includes(termo)) &&
        (linha === "todas" || obterLinha(item.titulo) === linha) &&
        (procedimento === "todos" ||
          obterProcedimento(item.titulo) === procedimento)
      );
    });
  }, [pesquisa, linha, procedimento]);

  // Desktop mostra todos os resultados. Mobile mostra só 3 inicialmente.
  const videosVisiveis = mobile && !mostrarTodos
    ? videosFiltrados.slice(0, 3)
    : videosFiltrados;

  const existemMais = mobile && videosFiltrados.length > 3;

  function limparFiltros() {
    setPesquisa("");
    setLinha("todas");
    setProcedimento("todos");
    setMostrarTodos(false);
  }

  return (
    <div className="videos-page synter-videos-page">
      {/* HEADER */}

      <Header />

      {/* =====================================
          HERO — PADRÃO PERGUNTAS FREQUENTES
      ===================================== */}

      <section className="synter-videos-hero">
        <div className="synter-videos-hero-container">
          {/* PERFIL */}

          <div className="synter-videos-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          {/* IDENTIFICAÇÃO SUPERIOR */}

          <div className="synter-videos-eyebrow">
            <IconeSynter />

            <span>CONTEÚDO EM VÍDEO</span>
          </div>

          {/* TÍTULO */}

          <h1 className="synter-videos-title">
            Vídeos Educativos
          </h1>

          {/* DESCRIÇÃO */}

          <p className="synter-videos-description">
            Aprenda através de vídeos práticos
            sobre instalação, configuração e
            utilização dos produtos Synter.
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

          <h4>VÍDEOS EDUCATIVOS</h4>
        </div>

        {/* =====================================
            PESQUISA
        ===================================== */}

        <div className="pesquisa-videos synter-videos-search">
          <div className="synter-videos-search-field">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 5 5" />
            </svg>

            <input
              type="search"
              placeholder="Pesquisar vídeo, fechadura ou procedimento..."
              value={pesquisa}
              onChange={(evento) => {
                setPesquisa(evento.target.value);
                setMostrarTodos(false);
              }}
              aria-label="Pesquisar vídeos educativos"
            />

            {pesquisa && (
              <button
                type="button"
                className="synter-videos-clear"
                onClick={limparFiltros}
                aria-label="Limpar pesquisa"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* FILTROS DE LINHA E PROCEDIMENTO */}
        <div className="synter-videos-filters">
          <label className="synter-videos-filter">
            <span>Linha de fechaduras</span>
            <select
              value={linha}
              onChange={(evento) => {
                setLinha(evento.target.value);
                setMostrarTodos(false);
              }}
            >
              <option value="todas">Todas as linhas</option>
              {LINHAS.map((nome) => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </label>

          <label className="synter-videos-filter">
            <span>Tipo de procedimento</span>
            <select
              value={procedimento}
              onChange={(evento) => {
                setProcedimento(evento.target.value);
                setMostrarTodos(false);
              }}
            >
              <option value="todos">Todos os procedimentos</option>
              {PROCEDIMENTOS.map((nome) => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </label>
        </div>

        {/* =====================================
            CONTAGEM DOS RESULTADOS
        ===================================== */}

        <div className="synter-videos-results">
          <span>
            {videosFiltrados.length === 1
              ? "1 vídeo encontrado"
              : `${videosFiltrados.length} vídeos encontrados`}
          </span>
        </div>

        {/* =====================================
            CARDS DOS VÍDEOS
        ===================================== */}

        {videosFiltrados.length > 0 ? (
          <div className="videos-grid">
            {videosVisiveis.map((item) => (
              <VideoCard
                key={item.id}
                titulo={item.titulo}
                descricao={item.descricao}
                video={item.video}
                capa={item.capa}
              />
            ))}
          </div>
        ) : (
          <div
            className="synter-videos-empty"
            role="status"
          >
            <div className="synter-videos-empty-icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 5 5" />
              </svg>
            </div>

            <h3>Nenhum vídeo encontrado</h3>

            <p>
              Não encontramos vídeos correspondentes
              à sua pesquisa. Tente utilizar outro
              modelo ou palavra-chave.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
            >
              Limpar pesquisa
            </button>
          </div>
        )}

        {existemMais && (
          <button
            type="button"
            className="synter-videos-show-more"
            onClick={() => setMostrarTodos((atual) => !atual)}
          >
            {mostrarTodos
              ? "Mostrar somente 3 vídeos"
              : `Ver mais ${videosFiltrados.length - 3} vídeos`}
          </button>
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

export default Videos;
