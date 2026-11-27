
import React, { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  Search,
  X,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/MecMarketing.css";

// IMAGENS - FERRAGENS
import jadeEscovada from "../assets/marketing-ferragens/Jade Escovada.jpg";
import jadePolida from "../assets/marketing-ferragens/Jade Polida.jpg";
import jadePreta from "../assets/marketing-ferragens/Jade Preta.jpg";
import jadeMaxEscovada from "../assets/marketing-ferragens/Jade Max Escovada.jpg";
import jadeMaxPolida from "../assets/marketing-ferragens/Jade Max Polida.jpg";
import jadeMaxPreta from "../assets/marketing-ferragens/Jade Max Preta.jpg";
import jaspeEscovada from "../assets/marketing-ferragens/Jaspe Escovada.jpg";
import jaspePolida from "../assets/marketing-ferragens/Jaspe Polida.jpg";
import jaspePreta from "../assets/marketing-ferragens/Jaspe Preta.jpg";
import jaspeFuroEscovada from "../assets/marketing-ferragens/Jaspe Com Furo Escovada.jpg";
import jaspeFuroPolida from "../assets/marketing-ferragens/Jaspe Com Furo Polida.jpg";
import jaspeFuroPreta from "../assets/marketing-ferragens/Jaspe Com Furo Preta.jpg";
import opalaEscovada from "../assets/marketing-ferragens/Opala Escovada.jpg";
import opalaPolida from "../assets/marketing-ferragens/Opala Polida.jpg";
import opalaPreta from "../assets/marketing-ferragens/Opala Preta.jpg";
import quartzoEscovada from "../assets/marketing-ferragens/Quartzo Escovada.jpg";
import quartzoPolida from "../assets/marketing-ferragens/Quartzo Polida.jpg";
import quartzoPreta from "../assets/marketing-ferragens/Quartzo Preta.jpg";

import ferragem0Polida from "../assets/marketing-ferragens/Fecho Concha Trava Polida.jpg";
import ferragem0Preta from "../assets/marketing-ferragens/Fecho Concha Trava Preta.jpg";
import ferragem1Polida from "../assets/marketing-ferragens/Concha Stand Com Furo Polida.jpg";
import ferragem1Preta from "../assets/marketing-ferragens/Concha Stand Com Furo Preta.jpg";
import ferragem2Polida from "../assets/marketing-ferragens/Concha Stand Polida.jpg";
import ferragem2Preta from "../assets/marketing-ferragens/Concha Stand Preta.jpg";
import ferragem3Polida from "../assets/marketing-ferragens/Prendedor Para Veneziana Polida.jpg";
import ferragem4Polida from "../assets/marketing-ferragens/Levantador De Guilhotina Polida.jpg";
import ferragem4Preta from "../assets/marketing-ferragens/Levantador De Guilhotina Preta.jpg";
import ferragem5Polida from "../assets/marketing-ferragens/Borboleta Para Guilhotina Polida.jpg";
import ferragem5Preta from "../assets/marketing-ferragens/Borboleta Para Guilhotina Preta.jpg";
import ferragem6Polida from "../assets/marketing-ferragens/Cremona Polida.jpg";
import ferragem6Preta from "../assets/marketing-ferragens/Cremona Preta.jpg";
import ferragem7Polida from "../assets/marketing-ferragens/Fecho Pina Bola Polida.jpg";
import ferragem7Preta from "../assets/marketing-ferragens/Fecho Pina Bola Preta.jpg";
import ferragem8Polida from "../assets/marketing-ferragens/Fecho Para Janela De Correr Polida.jpg";
import ferragem8Preta from "../assets/marketing-ferragens/Fecho Para Janela De Correr Preta.jpg";

import novaFerragem0_0 from "../assets/marketing-ferragens/Vara Para Cremona Polida.jpg";
import novaFerragem0_1 from "../assets/marketing-ferragens/Vara Para Cremona Preta.jpg";
import novaFerragem1_0 from "../assets/marketing-ferragens/Dobradiça Leme Polida.jpg";
import novaFerragem1_1 from "../assets/marketing-ferragens/Dobradiça Leme Preta.jpg";
import novaFerragem2_0 from "../assets/marketing-ferragens/Alça Polida.jpg";
import novaFerragem2_1 from "../assets/marketing-ferragens/Alça Preta.jpg";
import novaFerragem3_0 from "../assets/marketing-ferragens/Fecho Fio Redondo Polida.jpg";
import novaFerragem4_0 from "../assets/marketing-ferragens/Targeta Polida.jpg";
import novaFerragem5_0 from "../assets/marketing-ferragens/Porta Cadeado Polida.jpg";
import novaFerragem6_0 from "../assets/marketing-ferragens/Gancho De Rede Polida.jpg";
import novaFerragem7_0 from "../assets/marketing-ferragens/Fecho Fio Chato Polida.jpg";
import novaFerragem8_0 from "../assets/marketing-ferragens/Fecho Porta Cadeado Polida.jpg";
import novaFerragem9_0 from "../assets/marketing-ferragens/Dobradiça Basculante (Gonzo) Polida Furo Único.jpg";
import novaFerragem10_0 from "../assets/marketing-ferragens/Dobradiça Basculante (Gonzo) Polida.jpg";

import numerosPreta from "../assets/marketing-ferragens/Números Dupla Face Preta.jpg";
import numerosPolida from "../assets/marketing-ferragens/Números Dupla Face Polida.jpg";
import amortecedorPolida from "../assets/marketing-ferragens/Amortecedor De Porta Polida.jpg";

// DOBRADIÇAS INOX 304 PREMIUM
import dobradicaPremium0 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 3 1-2x3, 3x2 1-2 (Polegada) Inox 304 Premium Escovada.jpg";
import dobradicaPremium1 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 3 1-2x3, 3x2 1-2 (Polegada) Inox 304 Premium Polida.jpg";
import dobradicaPremium2 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 3 1-2x3, 3x2 1-2 (Polegada) Inox 304 Premium Preta.jpg";
import dobradicaPremium3 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 4x3 (Polegada) Inox 304 Premium Polida.jpg";
import dobradicaPremium4 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Raio 16 3 1-2x3, 3x2 1-2 (Polegada) Inox 304 Premium Escovada.jpg";
import dobradicaPremium5 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Raio 16 3 1-2x3, 3x2 1-2 (Polegada) Inox 304 Premium Polida.jpg";
import dobradicaPremium6 from "../assets/marketing-ferragens/Dobradiça Pino Pivoltante 150-300 Inox 304 Premium Escovada.jpg";
import dobradicaPremium7 from "../assets/marketing-ferragens/Dobradiça Pino Pivoltante 150-300 Inox 304 Premium Preta.jpg";
import dobradicaPremium8 from "../assets/marketing-ferragens/Dobradiça Pino Simples 1-2 e 2(Polegada) Inox 304 Premium Polida.jpg";
import dobradicaPremium9 from "../assets/marketing-ferragens/Dobradiça Pino Simples 1-2 e 2(Polegada) Inox 304 Premium Preta.jpg";
import dobradicaPremium10 from "../assets/marketing-ferragens/Dobradiça Pino Simples 2 1-2 , 3, 3 1-2, 3x2 1-2, 3x3 (Polegada) Inox 304 Premium Polida.jpg";
import dobradicaPremium11 from "../assets/marketing-ferragens/Dobradiça Pino Simples 2 1-2 , 3, 3 1-2, 3x2 1-2, 3x3 (Polegada) Inox 304 Premium Preta.jpg";

// DOBRADIÇAS MÁXIMA INOX
import maxima0_0 from "../assets/marketing-ferragens/Dobradiça Sobrepor Canto Reto 4x3 (Polegada) Máxima Inox Polida.jpg";
import maxima0_1 from "../assets/marketing-ferragens/Dobradiça Sobrepor Canto Reto 4x3 (Polegada) Máxima Inox Escovada.jpg";
import maxima1_0 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Raio 16 3x2 1-2, 3 1-2x3 (Polegada) Máxima Inox Polida.jpg";
import maxima1_1 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Raio 16 3x2 1-2, 3 1-2x3 (Polegada) Máxima Inox Escovada.jpg";
import maxima2_0 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 3x2 1-2, 3 1-2x3 (Polegada) Máxima Inox Polida.jpg";
import maxima2_1 from "../assets/marketing-ferragens/Dobradiça Com Rolamento Canto Reto 3x2 1-2, 3 1-2x3 (Polegada) Máxima Inox Escovada.jpg";

// CATÁLOGO - FERRAGENS
const modelos = [
  {
    id: "jade",
    titulo: "Puxador Jade",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", jadeEscovada],
      ["Polido", jadePolida],
      ["Preto", jadePreta],
    ],
  },
  {
    id: "jade-max",
    titulo: "Puxador Jade Max",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", jadeMaxEscovada],
      ["Polido", jadeMaxPolida],
      ["Preto", jadeMaxPreta],
    ],
  },
  {
    id: "jaspe",
    titulo: "Puxador Jaspe",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", jaspeEscovada],
      ["Polido", jaspePolida],
      ["Preto", jaspePreta],
    ],
  },
  {
    id: "jaspe-com-furo",
    titulo: "Puxador Jaspe com Furo",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", jaspeFuroEscovada],
      ["Polido", jaspeFuroPolida],
      ["Preto", jaspeFuroPreta],
    ],
  },
  {
    id: "opala",
    titulo: "Puxador Opala",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", opalaEscovada],
      ["Polido", opalaPolida],
      ["Preto", opalaPreta],
    ],
  },
  {
    id: "quartzo",
    titulo: "Puxador Quartzo",
    categoria: "Puxadores",
    imagens: [
      ["Escovado", quartzoEscovada],
      ["Polido", quartzoPolida],
      ["Preto", quartzoPreta],
    ],
  },
  {
    id: "fecho-concha-trava",
    titulo: "Fecho Concha Trava",
    categoria: "Fechos",
    imagens: [
      ["Polida", ferragem0Polida],
      ["Preta", ferragem0Preta],
    ],
  },
  {
    id: "concha-stand-com-furo",
    titulo: "Concha Stand Com Furo",
    categoria: "Conchas",
    imagens: [
      ["Polida", ferragem1Polida],
      ["Preta", ferragem1Preta],
    ],
  },
  {
    id: "concha-stand",
    titulo: "Concha Stand",
    categoria: "Conchas",
    imagens: [
      ["Polida", ferragem2Polida],
      ["Preta", ferragem2Preta],
    ],
  },
  {
    id: "prendedor-para-veneziana",
    titulo: "Prendedor Para Veneziana",
    categoria: "Prendedores",
    imagens: [
      ["Polida", ferragem3Polida],
    ],
  },
  {
    id: "levantador-de-guilhotina",
    titulo: "Levantador De Guilhotina",
    categoria: "Acessórios para guilhotina",
    imagens: [
      ["Polida", ferragem4Polida],
      ["Preta", ferragem4Preta],
    ],
  },
  {
    id: "borboleta-para-guilhotina",
    titulo: "Borboleta Para Guilhotina",
    categoria: "Acessórios para guilhotina",
    imagens: [
      ["Polida", ferragem5Polida],
      ["Preta", ferragem5Preta],
    ],
  },
  {
    id: "cremona",
    titulo: "Cremona",
    categoria: "Cremonas",
    imagens: [
      ["Polida", ferragem6Polida],
      ["Preta", ferragem6Preta],
    ],
  },
  {
    id: "fecho-pina-bola",
    titulo: "Fecho Pina Bola",
    categoria: "Fechos",
    imagens: [
      ["Polida", ferragem7Polida],
      ["Preta", ferragem7Preta],
    ],
  },
  {
    id: "fecho-para-janela-de-correr",
    titulo: "Fecho Para Janela De Correr",
    categoria: "Fechos",
    imagens: [
      ["Polida", ferragem8Polida],
      ["Preta", ferragem8Preta],
    ],
  },
  {
    id: "nova-ferragem-0",
    titulo: "Vara para Cremona",
    categoria: "Cremonas",
    imagens: [
      ["Polida", novaFerragem0_0],
      ["Preta", novaFerragem0_1],
    ],
  },
  {
    id: "nova-ferragem-1",
    titulo: "Dobradiça Leme",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", novaFerragem1_0],
      ["Preta", novaFerragem1_1],
    ],
  },
  {
    id: "nova-ferragem-2",
    titulo: "Alça",
    categoria: "Alças",
    imagens: [
      ["Polida", novaFerragem2_0],
      ["Preta", novaFerragem2_1],
    ],
  },
  {
    id: "nova-ferragem-3",
    titulo: "Fecho Fio Redondo",
    categoria: "Fechos",
    imagens: [
      ["Polida", novaFerragem3_0],
    ],
  },
  {
    id: "nova-ferragem-4",
    titulo: "Targeta",
    categoria: "Fechos",
    imagens: [
      ["Polida", novaFerragem4_0],
    ],
  },
  {
    id: "nova-ferragem-5",
    titulo: "Porta Cadeado",
    categoria: "Fechos",
    imagens: [
      ["Polida", novaFerragem5_0],
    ],
  },
  {
    id: "nova-ferragem-6",
    titulo: "Gancho de Rede",
    categoria: "Ganchos",
    imagens: [
      ["Polida", novaFerragem6_0],
    ],
  },
  {
    id: "nova-ferragem-7",
    titulo: "Fecho Fio Chato",
    categoria: "Fechos",
    imagens: [
      ["Polida", novaFerragem7_0],
    ],
  },
  {
    id: "nova-ferragem-8",
    titulo: "Fecho Porta Cadeado",
    categoria: "Fechos",
    imagens: [
      ["Polida", novaFerragem8_0],
    ],
  },
  {
    id: "nova-ferragem-9",
    titulo: "Dobradiça Basculante (Gonzo) Furo Único",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", novaFerragem9_0],
    ],
  },
  {
    id: "nova-ferragem-10",
    titulo: "Dobradiça Basculante (Gonzo)",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", novaFerragem10_0],
    ],
  },
  {
    id: "numeros-dupla-face",
    titulo: "Números Dupla Face",
    categoria: "Acessórios",
    imagens: [["Preta", numerosPreta], ["Polida", numerosPolida]],
  },
  {
    id: "amortecedor-de-porta",
    titulo: "Amortecedor de Porta",
    categoria: "Acessórios",
    imagens: [["Polida", amortecedorPolida]],
  },
  {
    id: "dobradica-inox-304-rolamento-canto-reto-35x3-3x25",
    titulo: "Dobradiça Com Rolamento Canto Reto 3 1/2x3, 3x2 1/2 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Escovada", dobradicaPremium0],
      ["Polida", dobradicaPremium1],
      ["Preta", dobradicaPremium2],
    ],
  },
  {
    id: "dobradica-inox-304-rolamento-canto-reto-4x3",
    titulo: "Dobradiça Com Rolamento Canto Reto 4x3 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", dobradicaPremium3],
    ],
  },
  {
    id: "dobradica-inox-304-rolamento-raio-16",
    titulo: "Dobradiça Com Rolamento Raio 16 3 1/2x3, 3x2 1/2 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Escovada", dobradicaPremium4],
      ["Polida", dobradicaPremium5],
    ],
  },
  {
    id: "dobradica-inox-304-pino-pivotante-150-300",
    titulo: "Dobradiça Pino Pivotante 150-300 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Escovada", dobradicaPremium6],
      ["Preta", dobradicaPremium7],
    ],
  },
  {
    id: "dobradica-inox-304-pino-simples-05-2",
    titulo: "Dobradiça Pino Simples 1/2 e 2 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", dobradicaPremium8],
      ["Preta", dobradicaPremium9],
    ],
  },
  {
    id: "dobradica-inox-304-pino-simples-25-3-35-3x25-3x3",
    titulo: "Dobradiça Pino Simples 2 1/2, 3, 3 1/2, 3x2 1/2, 3x3 Inox 304 Premium",
    categoria: "Dobradiças",
    imagens: [
      ["Polida", dobradicaPremium10],
      ["Preta", dobradicaPremium11],
    ],
  },
  {
    id: "dobradica-maxima-sobrepor-4x3",
    titulo: "Dobradiça Máxima Inox Sobrepor Canto Reto 4x3",
    categoria: "Dobradiças",
    imagens: [["Polida", maxima0_0], ["Escovada", maxima0_1]],
  },
  {
    id: "dobradica-maxima-rolamento-raio-16",
    titulo: "Dobradiça Máxima Inox 201 Com Rolamento Raio 16 3x2 1/2, 3 1/2x3",
    categoria: "Dobradiças",
    imagens: [["Polida", maxima1_0], ["Escovada", maxima1_1]],
  },
  {
    id: "dobradica-maxima-rolamento-canto-reto",
    titulo: "Dobradiça Máxima Inox 201 Com Rolamento Canto Reto 3x2 1/2, 3 1/2x3",
    categoria: "Dobradiças",
    imagens: [["Polida", maxima2_0], ["Escovada", maxima2_1]],
  },
];

const imagensFerragens = modelos.flatMap((modelo) =>
  modelo.imagens.map(([acabamento, imagem]) => ({
    id: `${modelo.id}-${acabamento.toLowerCase()}`,
    titulo: `${modelo.titulo} - ${acabamento}`,
    categoria: modelo.categoria,
    modelo: modelo.id,
    acabamento,
    imagem,
    extensao: "jpg",
  }))
);

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
          {item.categoria} • Synter
        </p>

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

export default function FerragensMarketing() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [limiteMobile, setLimiteMobile] = useState(3);
  const [pesquisa, setPesquisa] = useState("");
  const imagensFiltradas = imagensFerragens.filter((item) =>
    normalizar(`${item.titulo} ${item.categoria} ${item.modelo} ${item.acabamento}`)
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
            Vídeos e Imagens de Ferragens
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos e imagens das ferragens
            Synter para divulgação, campanhas
            e ações de marketing.
          </p>

        </div>
      </section>

        {/* CATÁLOGO */}

      <main className="videos-content">
        <div className="videos-section-title">
          <div className="videos-section-bar" />
          <h4>IMAGENS DE FERRAGENS</h4>
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
            aria-label="Pesquisar imagens de ferragens"
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
