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

// IMAGENS DE FERRAGENS
import img1 from "../assets/marketing-ferragens/Jade Polida.jpg";
import img2 from "../assets/marketing-ferragens/Jade Preta.jpg";
import img3 from "../assets/marketing-ferragens/Jade Max Escovada.jpg";
import img4 from "../assets/marketing-ferragens/Jade Max Polida.jpg";
import img5 from "../assets/marketing-ferragens/Jade Max Preta.jpg";
import img6 from "../assets/marketing-ferragens/Jaspe Escovada.jpg";
import img7 from "../assets/marketing-ferragens/Jaspe Polida.jpg";
import img8 from "../assets/marketing-ferragens/Jaspe Preta.jpg";
import img9 from "../assets/marketing-ferragens/Jaspe Com Furo Escovada.jpg";
import img10 from "../assets/marketing-ferragens/Jaspe Com Furo Polida.jpg";
import img11 from "../assets/marketing-ferragens/Jaspe Com Furo Preta.jpg";
import img12 from "../assets/marketing-ferragens/Opala Escovada.jpg";
import img13 from "../assets/marketing-ferragens/Opala Preta.jpg";
import img14 from "../assets/marketing-ferragens/Quartzo Escovada.jpg";
import img15 from "../assets/marketing-ferragens/Quartzo Polida.jpg";
import img16 from "../assets/marketing-ferragens/Quartzo Preta.jpg";

const imagensFerragens = [
  { id: "jade-polido", titulo: "Puxador Jade - Polido", modelo: "Puxador Jade", categoria: "Puxadores", acabamento: "Polido", imagem: img1, extensao: "jpg" },
  { id: "jade-preto", titulo: "Puxador Jade - Preto", modelo: "Puxador Jade", categoria: "Puxadores", acabamento: "Preto", imagem: img2, extensao: "jpg" },
  { id: "jade-max-escovado", titulo: "Puxador Jade Max - Escovado", modelo: "Puxador Jade Max", categoria: "Puxadores", acabamento: "Escovado", imagem: img3, extensao: "jpg" },
  { id: "jade-max-polido", titulo: "Puxador Jade Max - Polido", modelo: "Puxador Jade Max", categoria: "Puxadores", acabamento: "Polido", imagem: img4, extensao: "jpg" },
  { id: "jade-max-preto", titulo: "Puxador Jade Max - Preto", modelo: "Puxador Jade Max", categoria: "Puxadores", acabamento: "Preto", imagem: img5, extensao: "jpg" },
  { id: "jaspe-escovado", titulo: "Puxador Jaspe - Escovado", modelo: "Puxador Jaspe", categoria: "Puxadores", acabamento: "Escovado", imagem: img6, extensao: "jpg" },
  { id: "jaspe-polido", titulo: "Puxador Jaspe - Polido", modelo: "Puxador Jaspe", categoria: "Puxadores", acabamento: "Polido", imagem: img7, extensao: "jpg" },
  { id: "jaspe-preto", titulo: "Puxador Jaspe - Preto", modelo: "Puxador Jaspe", categoria: "Puxadores", acabamento: "Preto", imagem: img8, extensao: "jpg" },
  { id: "jaspe-com-furo-escovado", titulo: "Puxador Jaspe Com Furo - Escovado", modelo: "Puxador Jaspe Com Furo", categoria: "Puxadores", acabamento: "Escovado", imagem: img9, extensao: "jpg" },
  { id: "jaspe-com-furo-polido", titulo: "Puxador Jaspe Com Furo - Polido", modelo: "Puxador Jaspe Com Furo", categoria: "Puxadores", acabamento: "Polido", imagem: img10, extensao: "jpg" },
  { id: "jaspe-com-furo-preto", titulo: "Puxador Jaspe Com Furo - Preto", modelo: "Puxador Jaspe Com Furo", categoria: "Puxadores", acabamento: "Preto", imagem: img11, extensao: "jpg" },
  { id: "opala-escovado", titulo: "Puxador Opala - Escovado", modelo: "Puxador Opala", categoria: "Puxadores", acabamento: "Escovado", imagem: img12, extensao: "jpg" },
  { id: "opala-preto", titulo: "Puxador Opala - Preto", modelo: "Puxador Opala", categoria: "Puxadores", acabamento: "Preto", imagem: img13, extensao: "jpg" },
  { id: "quartzo-escovado", titulo: "Puxador Quartzo - Escovado", modelo: "Puxador Quartzo", categoria: "Puxadores", acabamento: "Escovado", imagem: img14, extensao: "jpg" },
  { id: "quartzo-polido", titulo: "Puxador Quartzo - Polido", modelo: "Puxador Quartzo", categoria: "Puxadores", acabamento: "Polido", imagem: img15, extensao: "jpg" },
  { id: "quartzo-preto", titulo: "Puxador Quartzo - Preto", modelo: "Puxador Quartzo", categoria: "Puxadores", acabamento: "Preto", imagem: img16, extensao: "jpg" },
];

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

export default function FerragensMarketing() {
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [modelo, setModelo] = useState("Todos");
  const [acabamento, setAcabamento] = useState("Todos");
  const [limiteMobile, setLimiteMobile] = useState(3);

  const imagensFiltradas = imagensFerragens.filter((item) => {
    const texto = normalizar(
      `${item.titulo} ${item.categoria} ${item.modelo} ${item.acabamento}`
    );

    const correspondePesquisa = normalizar(pesquisa)
      .split(/\s+/)
      .every((termo) => texto.includes(termo));

    return (
      correspondePesquisa &&
      (categoria === "Todos" ||
        item.categoria === categoria) &&
      (modelo === "Todos" || item.modelo === modelo) &&
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
    setModelo("Todos");
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
            Vídeos e Imagens de Ferragens
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
              <h2>Imagens de Ferragens</h2>
              <p>
                Encontre e baixe imagens das ferragens Synter.
              </p>
            </div>

            <span className="mec-total-imagens">
              <ImageIcon size={17} />
              {imagensFerragens.length} imagens
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
              <select aria-label="Categoria" value={categoria} onChange={(e) => alterarFiltro(setCategoria, e.target.value)}>
                <option value="Todos">Todas as categorias</option>
                <option value="Puxadores">Puxadores</option>
              </select>
              <select aria-label="Modelo" value={modelo} onChange={(e) => alterarFiltro(setModelo, e.target.value)}>
                <option value="Todos">Todos os modelos</option>
                {[...new Set(imagensFerragens.map(item => item.modelo))].map(nome => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
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
