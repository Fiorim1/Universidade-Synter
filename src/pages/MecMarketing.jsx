
import { useState } from "react";
import {
  Box,
  Image,
  Megaphone,
  Zap,
  Download,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/MecMarketing.css";

/* ==========================================
   IMPORTAÇÃO DAS IMAGENS
========================================== */

// ==========================================
// IMAGENS DAS FECHADURAS MECÂNICAS
// ==========================================

import maquinaQuadradaInterna from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Interna.png";
import maquinaRedondaInterna from "../assets/marketing-mecanicas/Máquina 40mm Redonda Interna.png";
import maquinaRedondaExterna from "../assets/marketing-mecanicas/Máquina 40mm Redonda Externa.png";
import maquinaQuadradaExterna from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Externa.png";
import maquinaRedondaBanheiro from "../assets/marketing-mecanicas/Máquina 40mm Redonda Banheiro.png";
import maquinaQuadradaBanheiro from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Banheiro.png";

/* ==========================================
   CATÁLOGO DE IMAGENS
========================================== */

const IMAGENS = [
  {
    id: 1,
    titulo: "Máquina 40mm Quadrada Interna",
    categoria: "Máquinas",
    aplicacao: "Interna",
    testa: "Quadrada",
    imagem: maquinaQuadradaInterna,
  },
  {
    id: 2,
    titulo: "Máquina 40mm Redonda Interna",
    categoria: "Máquinas",
    aplicacao: "Interna",
    testa: "Redonda",
    imagem: maquinaRedondaInterna,
  },
  {
    id: 3,
    titulo: "Máquina 40mm Redonda Externa",
    categoria: "Máquinas",
    aplicacao: "Externa",
    testa: "Redonda",
    imagem: maquinaRedondaExterna,
  },
  {
    id: 4,
    titulo: "Máquina 40mm Quadrada Externa",
    categoria: "Máquinas",
    aplicacao: "Externa",
    testa: "Quadrada",
    imagem: maquinaQuadradaExterna,
  },
  {
    id: 5,
    titulo: "Máquina 40mm Redonda Banheiro",
    categoria: "Máquinas",
    aplicacao: "Banheiro",
    testa: "Redonda",
    imagem: maquinaRedondaBanheiro,
  },
  {
    id: 6,
    titulo: "Máquina 40mm Quadrada Banheiro",
    categoria: "Máquinas",
    aplicacao: "Banheiro",
    testa: "Quadrada",
    imagem: maquinaQuadradaBanheiro,
  },
];

const LIMITE_MOBILE = 3;

const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/* ==========================================
   CARD DE IMAGEM
========================================== */

function ImagemCard({ item }) {
  return (
    <article className="video-card mec-imagem-card">
      <img
        className="video-preview"
        src={item.imagem}
        alt={item.titulo}
        loading="lazy"
      />

      <div className="video-card-info">
        <h2>{item.titulo}</h2>

        <p>
          Conteúdo para apoiar ações comerciais
          e de marketing.
        </p>

        <div className="video-card-botoes">
          <a
            className="botao-assistir"
            href={item.imagem}
            download={`${item.titulo}.png`}
          >
            <Download size={16} />
            Baixar imagem
          </a>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   PÁGINA PRINCIPAL
========================================== */

export default function MecMarketing() {
  const [pesquisa, setPesquisa] = useState("");
  const [aplicacao, setAplicacao] = useState("Todas");
  const [testa, setTesta] = useState("Todas");
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const imagensFiltradas = IMAGENS.filter((item) => {
    const texto = normalizar(
      `${item.titulo} ${item.categoria} ${item.aplicacao} ${item.testa}`
    );

    const correspondePesquisa = texto.includes(
      normalizar(pesquisa.trim())
    );

    const correspondeAplicacao =
      aplicacao === "Todas" ||
      item.aplicacao === aplicacao;

    const correspondeTesta =
      testa === "Todas" ||
      item.testa === testa;

    return (
      correspondePesquisa &&
      correspondeAplicacao &&
      correspondeTesta
    );
  });

  const imagensMobile = mostrarTodas
    ? imagensFiltradas
    : imagensFiltradas.slice(0, LIMITE_MOBILE);

  function limparFiltros() {
    setPesquisa("");
    setAplicacao("Todas");
    setTesta("Todas");
    setMostrarTodas(false);
  }

  return (
    <div className="videos-page dig-marketing-page mec-marketing-page">
      <Header />

      {/* HERO */}

      <section className="dig-marketing-hero">
        <div className="dig-marketing-hero-container">
          <div className="dig-marketing-profile">
            <UserProfileButton />
          </div>

          <div className="dig-marketing-eyebrow">
            <Box size={22} />
            CONTEÚDOS PARA DIVULGAÇÃO
          </div>

          <h1 className="dig-marketing-title">
            Marketing de Fechaduras Mecânicas
          </h1>

          <p className="dig-marketing-description">
            Encontre imagens, vídeos e materiais
            de apoio das fechaduras mecânicas Synter
            para divulgação e ações comerciais.
          </p>

          <div className="mec-marketing-beneficios">
            <div>
              <Image size={20} />
              <span>
                <strong>Materiais Visuais</strong>
                <small>Conteúdos para divulgação</small>
              </span>
            </div>

            <div>
              <Megaphone size={20} />
              <span>
                <strong>Marketing</strong>
                <small>Apoio às ações comerciais</small>
              </span>
            </div>

            <div>
              <Zap size={20} />
              <span>
                <strong>Acesso Rápido</strong>
                <small>Materiais em um só lugar</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}

      <main className="videos-content">

        {/* PESQUISA */}

        <div className="dig-marketing-search">
          <input
            type="search"
            placeholder="Pesquisar produtos ou imagens..."
            aria-label="Pesquisar produtos ou imagens"
            value={pesquisa}
            onChange={(e) => {
              setPesquisa(e.target.value);
              setMostrarTodas(false);
            }}
          />
        </div>

        {/* FILTROS */}

        <div className="mec-marketing-filtros">
          <div className="dig-marketing-filter-row">

            <div className="dig-marketing-filter-field">
              <label htmlFor="mec-aplicacao">
                Aplicação
              </label>

              <select
                id="mec-aplicacao"
                value={aplicacao}
                onChange={(e) => {
                  setAplicacao(e.target.value);
                  setMostrarTodas(false);
                }}
              >
                <option value="Todas">Todas</option>
                <option value="Interna">Interna</option>
                <option value="Externa">Externa</option>
                <option value="Banheiro">Banheiro</option>
              </select>
            </div>

            <div className="dig-marketing-filter-field">
              <label htmlFor="mec-testa">
                Testa
              </label>

              <select
                id="mec-testa"
                value={testa}
                onChange={(e) => {
                  setTesta(e.target.value);
                  setMostrarTodas(false);
                }}
              >
                <option value="Todas">Todas</option>
                <option value="Quadrada">Quadrada</option>
                <option value="Redonda">Redonda</option>
              </select>
            </div>

            <button
              type="button"
              className="dig-marketing-clear"
              onClick={limparFiltros}
            >
              Limpar
            </button>
          </div>

          <p className="dig-marketing-result-count">
            {imagensFiltradas.length}{" "}
            {imagensFiltradas.length === 1
              ? "imagem encontrada"
              : "imagens encontradas"}
          </p>
        </div>

        {/* TÍTULO DA GALERIA */}

        <div className="videos-section-title">
          <h4>
            IMAGENS DE FECHADURAS MECÂNICAS E ACESSÓRIOS
          </h4>
        </div>

        {imagensFiltradas.length === 0 ? (
          <div className="dig-marketing-empty">
            <strong>Nenhuma imagem encontrada.</strong>

            <p>
              Tente pesquisar outro produto
              ou alterar os filtros.
            </p>

            <button onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <div className="dig-marketing-desktop">
              <div className="mec-marketing-grid">
                {imagensFiltradas.map((item) => (
                  <ImagemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </div>

            {/* MOBILE */}

            <div className="dig-marketing-mobile">
              <div className="dig-marketing-mobile-list">
                {imagensMobile.map((item) => (
                  <ImagemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>

              {imagensFiltradas.length > LIMITE_MOBILE && (
                <button
                  type="button"
                  className="dig-marketing-more"
                  onClick={() =>
                    setMostrarTodas(!mostrarTodas)
                  }
                >
                  {mostrarTodas
                    ? "Mostrar menos"
                    : `Ver mais ${
                        imagensFiltradas.length -
                        LIMITE_MOBILE
                      } imagens`}
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
