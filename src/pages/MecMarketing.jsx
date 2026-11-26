
import React, { useState } from "react";
import {
  Box,
  Image as ImageIcon,
  Megaphone,
  Zap,
  Download,
  Search,
  X,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";

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

export default function MecMarketing() {
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [aplicacao, setAplicacao] = useState("Todos");
  const [testa, setTesta] = useState("Todos");
  const [acabamento, setAcabamento] = useState("Todos");
  const [limiteMobile, setLimiteMobile] = useState(3);

  const imagensFiltradas = imagensMecanicas.filter((item) => {
    const texto = normalizar(
      `${item.titulo} ${item.categoria} ${item.aplicacao} ${item.testa} ${item.acabamento}`
    );

    const correspondePesquisa = normalizar(pesquisa)
      .split(/\s+/)
      .every((termo) => texto.includes(termo));

    return (
      correspondePesquisa &&
      (categoria === "Todos" ||
        item.categoria === categoria) &&
      (aplicacao === "Todos" ||
        item.aplicacao === aplicacao) &&
      (testa === "Todos" ||
        item.testa === testa) &&
      (acabamento === "Todos" ||
        item.acabamento === acabamento)
    );
  });

  function alterarFiltro(setter, valor) {
    setter(valor);
    setLimiteMobile(3);
  }

  function limparFiltros() {
    setPesquisa("");
    setCategoria("Todos");
    setAplicacao("Todos");
    setTesta("Todos");
    setAcabamento("Todos");
    setLimiteMobile(3);
  }

  const restantes = Math.max(
    0,
    imagensFiltradas.length - limiteMobile
  );

  return (
    <>
      <Header />

      <main className="videos-page dig-marketing-page mec-marketing-page">

        {/* HERO */}

        <section className="mec-marketing-hero">
          <div className="mec-hero-topo">
            <div className="mec-hero-identificacao">
              <Megaphone size={18} />
              <span>MARKETING SYNTER</span>
            </div>

            <UserProfileButton />
          </div>

          <h1>
            Vídeos e Imagens de Fechaduras Mecânicas
          </h1>

          <p>
            Acesse materiais oficiais da Synter para
            divulgação, apresentação comercial e
            comunicação com seus clientes.
          </p>

          <div className="mec-hero-beneficios">
            <span>
              <ImageIcon size={17} />
              Imagens oficiais
            </span>

            <span>
              <Box size={17} />
              Produtos Synter
            </span>

            <span>
              <Zap size={17} />
              Download rápido
            </span>
          </div>
        </section>

        {/* CATÁLOGO */}

        <section className="mec-catalogo">
          <div className="mec-catalogo-cabecalho">
            <div>
              <h2>Imagens de produtos</h2>
              <p>
                Encontre e baixe imagens das fechaduras
                mecânicas Synter.
              </p>
            </div>

            <span className="mec-total-imagens">
              <ImageIcon size={17} />
              {imagensMecanicas.length} imagens
            </span>
          </div>

          {/* PESQUISA */}

          <div className="mec-filtros">
            <div className="mec-pesquisa">
              <Search size={19} />

              <input
                type="search"
                aria-label="Pesquisar produto"
                placeholder="Pesquisar produto..."
                value={pesquisa}
                onChange={(e) =>
                  alterarFiltro(
                    setPesquisa,
                    e.target.value
                  )
                }
              />
            </div>

            <div className="mec-filtros-selects">
              <select
                aria-label="Categoria"
                value={categoria}
                onChange={(e) =>
                  alterarFiltro(
                    setCategoria,
                    e.target.value
                  )
                }
              >
                <option value="Todos">
                  Todas as categorias
                </option>
                <option value="Máquinas">
                  Máquinas
                </option>
                <option value="Fechaduras">
                  Fechaduras
                </option>
              </select>

              <select
                aria-label="Aplicação"
                value={aplicacao}
                onChange={(e) =>
                  alterarFiltro(
                    setAplicacao,
                    e.target.value
                  )
                }
              >
                <option value="Todos">
                  Todas as aplicações
                </option>
                <option value="Externa">Externa</option>
                <option value="Interna">Interna</option>
                <option value="Banheiro">Banheiro</option>
              </select>

              <select
                aria-label="Formato da testa"
                value={testa}
                onChange={(e) =>
                  alterarFiltro(setTesta, e.target.value)
                }
              >
                <option value="Todos">
                  Todas as testas
                </option>
                <option value="Redonda">
                  Testa redonda
                </option>
                <option value="Quadrada">
                  Testa quadrada
                </option>
              </select>

              <select
                aria-label="Acabamento"
                value={acabamento}
                onChange={(e) =>
                  alterarFiltro(
                    setAcabamento,
                    e.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos os acabamentos
                </option>
                <option value="Escovado">Escovado</option>
                <option value="Polido">Polido</option>
                <option value="Preto">Preto</option>
              </select>

              <button
                type="button"
                className="mec-limpar-filtros"
                onClick={limparFiltros}
              >
                <X size={15} />
                Limpar filtros
              </button>
            </div>
          </div>

          {/* CONTADOR */}

          <p className="mec-resultados">
            {imagensFiltradas.length}{" "}
            {imagensFiltradas.length === 1
              ? "imagem encontrada"
              : "imagens encontradas"}
          </p>

          {/* SEM RESULTADOS */}

          {imagensFiltradas.length === 0 && (
            <div className="mec-sem-resultados">
              <Search size={32} />

              <h3>Nenhuma imagem encontrada</h3>

              <p>
                Tente pesquisar outro produto ou
                alterar os filtros.
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
    </>
  );
}
