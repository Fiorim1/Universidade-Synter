
import React, { useState } from "react";
import { Download } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/MecMarketing.css";

// ==========================================
// IMAGENS - MÁQUINAS 40 MM
// ==========================================

import maquinaQuadradaInterna from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Interna.png";
import maquinaRedondaInterna from "../assets/marketing-mecanicas/Máquina 40mm Redonda Interna.png";
import maquinaRedondaExterna from "../assets/marketing-mecanicas/Máquina 40mm Redonda Externa.png";
import maquinaQuadradaExterna from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Externa.png";
import maquinaRedondaBanheiro from "../assets/marketing-mecanicas/Máquina 40mm Redonda Banheiro.png";
import maquinaQuadradaBanheiro from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Banheiro.png";

// ==========================================
// IMAGENS - CILINDRO EUROPEU REDONDA
// ==========================================

import cilindroRedondaEscovada from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Escovada.jpg";
import cilindroRedondaPolida from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Polida.jpg";
import cilindroRedondaPreta from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Preta.jpg";

// ==========================================
// IMAGENS - CILINDRO EUROPEU QUADRADA
// ==========================================

import cilindroQuadradaEscovada from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Escovada.jpg";
import cilindroQuadradaPolida from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Polida.jpg";
import cilindroQuadradaPreta from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Preta.jpg";

// ==========================================
// IMAGENS - CONCHA STAND
// ==========================================

import conchaEscovada from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Escovada.jpg";
import conchaPolida from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Polida.jpg";
import conchaPreta from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Preta.jpg";

// ==========================================
// IMAGENS - ROLETE REDONDA
// ==========================================

import roleteRedondaEscovada from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Escovada.jpg";
import roleteRedondaPolida from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Polida.jpg";
import roleteRedondaPreta from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Preta.jpg";

// ==========================================
// IMAGENS - ROLETE QUADRADA
// ==========================================

import roleteQuadradaEscovada from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Escovada.jpg";
import roleteQuadradaPolida from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Polida.jpg";
import roleteQuadradaPreta from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Preta.jpg";

// ==========================================
// CATÁLOGO - MÁQUINAS 40 MM
// ==========================================

const maquinas = [
  {
    id: "maquina40-quadrada-interna",
    titulo: "Máquina 40 mm Quadrada Interna",
    categoria: "Máquinas",
    aplicacao: "Interna",
    testa: "Quadrada",
    acabamento: "",
    imagem: maquinaQuadradaInterna,
    extensao: "png",
  },
  {
    id: "maquina40-redonda-interna",
    titulo: "Máquina 40 mm Redonda Interna",
    categoria: "Máquinas",
    aplicacao: "Interna",
    testa: "Redonda",
    acabamento: "",
    imagem: maquinaRedondaInterna,
    extensao: "png",
  },
  {
    id: "maquina40-redonda-externa",
    titulo: "Máquina 40 mm Redonda Externa",
    categoria: "Máquinas",
    aplicacao: "Externa",
    testa: "Redonda",
    acabamento: "",
    imagem: maquinaRedondaExterna,
    extensao: "png",
  },
  {
    id: "maquina40-quadrada-externa",
    titulo: "Máquina 40 mm Quadrada Externa",
    categoria: "Máquinas",
    aplicacao: "Externa",
    testa: "Quadrada",
    acabamento: "",
    imagem: maquinaQuadradaExterna,
    extensao: "png",
  },
  {
    id: "maquina40-redonda-banheiro",
    titulo: "Máquina 40 mm Redonda Banheiro",
    categoria: "Máquinas",
    aplicacao: "Banheiro",
    testa: "Redonda",
    acabamento: "",
    imagem: maquinaRedondaBanheiro,
    extensao: "png",
  },
  {
    id: "maquina40-quadrada-banheiro",
    titulo: "Máquina 40 mm Quadrada Banheiro",
    categoria: "Máquinas",
    aplicacao: "Banheiro",
    testa: "Quadrada",
    acabamento: "",
    imagem: maquinaQuadradaBanheiro,
    extensao: "png",
  },
];

// ==========================================
// CATÁLOGO - FECHADURAS MECÂNICAS
// ==========================================

const modelos = [
  {
    id: "cilindro-europeu-redonda",
    titulo: "Externa com Cilindro Europeu Redonda",
    categoria: "Fechaduras",
    aplicacao: "Externa",
    testa: "Redonda",
    imagens: [
      ["Escovado", cilindroRedondaEscovada],
      ["Polido", cilindroRedondaPolida],
      ["Preto", cilindroRedondaPreta],
    ],
  },
  {
    id: "cilindro-europeu-quadrada",
    titulo: "Externa com Cilindro Europeu Quadrada",
    categoria: "Fechaduras",
    aplicacao: "Externa",
    testa: "Redonda",
    imagens: [
      ["Escovado", cilindroQuadradaEscovada],
      ["Polido", cilindroQuadradaPolida],
      ["Preto", cilindroQuadradaPreta],
    ],
  },
  {
    id: "concha-stand",
    titulo: "Interna com Chave Dobrável e Concha Stand",
    categoria: "Fechaduras",
    aplicacao: "Interna",
    testa: "Redonda",
    imagens: [
      ["Escovado", conchaEscovada],
      ["Polido", conchaPolida],
      ["Preto", conchaPreta],
    ],
  },
  {
    id: "rolete-redonda",
    titulo: "Externa Rolete Roseta Redonda",
    categoria: "Fechaduras",
    aplicacao: "Externa",
    testa: "Redonda",
    imagens: [
      ["Escovado", roleteRedondaEscovada],
      ["Polido", roleteRedondaPolida],
      ["Preto", roleteRedondaPreta],
    ],
  },
  {
    id: "rolete-quadrada",
    titulo: "Externa Rolete Roseta Quadrada",
    categoria: "Fechaduras",
    aplicacao: "Externa",
    testa: "Redonda",
    imagens: [
      ["Escovado", roleteQuadradaEscovada],
      ["Polido", roleteQuadradaPolida],
      ["Preto", roleteQuadradaPreta],
    ],
  },
];

const fechaduras = modelos.flatMap((modelo) =>
  modelo.imagens.map(([acabamento, imagem]) => ({
    id: `${modelo.id}-${acabamento.toLowerCase()}`,
    titulo: `${modelo.titulo} - ${acabamento}`,
    categoria: modelo.categoria,
    aplicacao: modelo.aplicacao,
    testa: modelo.testa,
    acabamento,
    imagem,
    extensao: "jpg",
  }))
);

const imagensMecanicas = [...maquinas, ...fechaduras];

// ==========================================
// NORMALIZAÇÃO DA PESQUISA
// ==========================================

function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ==========================================
// COMPONENTE DO CARD
// ==========================================

function ImagemCard({ item }) {
  return (
    <article className="video-card mec-imagem-card">
      <img
        className="video-preview mec-imagem-preview"
        src={item.imagem}
        alt={item.titulo}
        loading="lazy"
      />

      <div className="video-card-info mec-card-info">
        <h2>{item.titulo}</h2>

        <p className="mec-card-descricao">
          {item.categoria} • {item.aplicacao}
        </p>

        {item.acabamento && (
          <span
            className={`mec-acabamento ${normalizar(
              item.acabamento
            )}`}
          >
            <span className="mec-acabamento-cor" />
            {item.acabamento}
          </span>
        )}

        <div className="video-card-botoes mec-card-botoes">
          <a
            href={item.imagem}
            download={`${item.id}.${item.extensao}`}
            className="botao-assistir mec-botao-download"
          >
            <Download size={16} />
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

export default function MecMarketing() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [limiteMobile, setLimiteMobile] = useState(3);
  const [pesquisa, setPesquisa] = useState("");
  const imagensFiltradas = imagensMecanicas.filter((item) =>
    normalizar(`${item.titulo} ${item.categoria} ${item.aplicacao} ${item.testa} ${item.acabamento}`)
      .includes(normalizar(pesquisa))
  );

  const restantes = Math.max(
    0,
    imagensFiltradas.length - limiteMobile
  );

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

            <span>
              CONTEÚDOS PARA DIVULGAÇÃO
            </span>
          </div>

          <h1 className="dig-marketing-title">
            Vídeos e Imagens de Fechaduras Mecânicas
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos e imagens das fechaduras mecânicas
            Synter para divulgação, campanhas
            e ações de marketing.
          </p>

        </div>
      </section>

        {/* CATÁLOGO */}

      <main className="videos-content">
        <div className="videos-section-title">
          <div className="videos-section-bar" />
          <h4>IMAGENS DE FECHADURAS MECÂNICAS</h4>
        </div>
        <div className="pesquisa-videos dig-marketing-search">
          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) => {
              setPesquisa(evento.target.value);
              setLimiteMobile(3);
            }}
            aria-label="Pesquisar imagens de fechaduras mecânicas"
          />
        </div>
        {imagensFiltradas.length === 0 && (
          <p className="nenhum-video" role="status">Nenhuma imagem encontrada.</p>
        )}
        <section className="mec-catalogo">
          {/* DESKTOP */}

          <div className="dig-marketing-desktop">
            <div className="mec-imagens-grid">
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
            <div className="dig-marketing-mobile-list mec-imagens-mobile">
              {imagensFiltradas
                .slice(0, limiteMobile)
                .map((item) => (
                  <ImagemCard
                    key={item.id}
                    item={item}
                  />
                ))}
            </div>

            {restantes > 0 && (
              <button
                type="button"
                className="dig-marketing-more mec-ver-mais"
                onClick={() =>
                  setLimiteMobile(
                    (anterior) => anterior + 3
                  )
                }
              >
                Ver mais {Math.min(3, restantes)}{" "}
                {restantes === 1 ? "imagem" : "imagens"}
              </button>
            )}

            {restantes === 0 &&
              limiteMobile > 3 &&
              imagensFiltradas.length > 3 && (
                <button
                  type="button"
                  className="dig-marketing-more mec-ver-mais"
                  onClick={() => setLimiteMobile(3)}
                >
                  Ver menos imagens
                </button>
              )}
          </div>
        </section>
      </main>

      <Footer />
      {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
