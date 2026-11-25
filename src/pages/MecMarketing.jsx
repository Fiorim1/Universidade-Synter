import React, { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/DigMarketingGaleria.css";

// ======================================================
// CARREGAMENTO AUTOMÁTICO DAS IMAGENS
// ======================================================

const arquivos = import.meta.glob(
  "../assets/marketing-mecanicas/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}",
  {
    eager: true,
    import: "default",
  }
);

const normalizar = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// ======================================================
// LINHAS E MODELOS
// ======================================================

const MODELOS = [
  "Máquina 40mm",
  "Acqua Max",
  "Acqua",
  "Crispus Max",
  "Crispus",
  "Glorian Max",
  "Glorian",
  "Gol",
  "Luck",
  "Marine",
  "Navis",
  "Olympia",
  "Polo Max",
  "Polo",
  "Star Max",
  "Star",
  "Stillus",
].sort((a, b) => b.length - a.length);

// ======================================================
// IDENTIFICAÇÃO AUTOMÁTICA DO MODELO
// ======================================================

function identificarLinha(nome) {
  const texto = normalizar(nome);

  const modelo = MODELOS.find((item) =>
    texto.includes(normalizar(item))
  );

  return modelo || "Outros";
}

// ======================================================
// IDENTIFICAÇÃO DO ACABAMENTO
// ======================================================

function identificarAcabamento(nome) {
  const texto = normalizar(nome);

  if (texto.includes("preta") || texto.includes("preto")) {
    return "Preto";
  }

  if (
    texto.includes("escovada") ||
    texto.includes("escovado")
  ) {
    return "Escovado";
  }

  if (
    texto.includes("polida") ||
    texto.includes("polido")
  ) {
    return "Polido";
  }

  if (texto.includes("macaneta")) {
    return "Polido";
  }

  return "";
}

// ======================================================
// IDENTIFICAÇÃO DA APLICAÇÃO
// ======================================================

function identificarAplicacao(nome) {
  const texto = normalizar(nome);

  if (texto.includes("chave reta")) {
    return "Banheiro - Chave Reta";
  }

  if (texto.includes("interna")) {
    return "Interna";
  }

  if (texto.includes("externa")) {
    return "Externa";
  }

  if (texto.includes("banheiro")) {
    return "Banheiro";
  }

  if (texto.includes("macaneta")) {
    return "Maçaneta";
  }

  return "";
}

// ======================================================
// ORGANIZAÇÃO DAS IMAGENS
// ======================================================

const imagens = Object.entries(arquivos)
  .map(([caminho, imagem]) => {
    const arquivo = caminho.split("/").pop();

    const titulo = arquivo.replace(/\.[^.]+$/, "");

    return {
      id: caminho,
      titulo,
      arquivo,
      imagem,
      linha: identificarLinha(titulo),
      acabamento: identificarAcabamento(titulo),
      aplicacao: identificarAplicacao(titulo),
    };
  })
  .sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR", {
      numeric: true,
    })
  );

// ======================================================
// FILTROS
// ======================================================

const LINHAS = [
  "Todas",
  ...new Set(imagens.map((item) => item.linha)),
];

const ACABAMENTOS = [
  "Todos",
  "Polido",
  "Escovado",
  "Preto",
];

const APLICACOES = [
  "Todas",
  "Interna",
  "Externa",
  "Banheiro",
  "Banheiro - Chave Reta",
  "Maçaneta",
];

const LIMITE_MOBILE = 6;

// ======================================================
// COMPONENTE DO CARD
// ======================================================

function ImagemCard({ item, abrirImagem }) {
  return (
    <article className="dm-gallery-card">
      <button
        type="button"
        className="dm-gallery-preview"
        onClick={() => abrirImagem(item)}
        aria-label={`Visualizar ${item.titulo}`}
        style={{
          width: "100%",
          border: "none",
          background: "#ffffff",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <img
          src={item.imagem}
          alt={item.titulo}
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "contain",
            background: "#ffffff",
            display: "block",
          }}
        />
      </button>

      <div className="dm-gallery-info">
        <h3>{item.titulo}</h3>

        <p>
          {[
            item.linha,
            item.acabamento,
            item.aplicacao,
          ]
            .filter(Boolean)
            .join(" • ")}
        </p>

        <a
          href={item.imagem}
          download={item.arquivo}
          className="dm-gallery-download botao-assistir"
        >
          ↓ Baixar imagem
        </a>
      </div>
    </article>
  );
}

// ======================================================
// PÁGINA PRINCIPAL
// ======================================================

export default function MecMarketing() {
  const [pesquisa, setPesquisa] = useState("");
  const [linha, setLinha] = useState("Todas");
  const [acabamento, setAcabamento] = useState("Todos");
  const [aplicacao, setAplicacao] = useState("Todas");

  const [imagemAberta, setImagemAberta] = useState(null);

  const [
    mostrarTodasImagens,
    setMostrarTodasImagens,
  ] = useState(false);

  // ====================================================
  // FILTRAGEM
  // ====================================================

  const imagensFiltradas = imagens.filter((item) => {
    const texto = normalizar(
      [
        item.titulo,
        item.linha,
        item.acabamento,
        item.aplicacao,
      ].join(" ")
    );

    const correspondePesquisa = texto.includes(
      normalizar(pesquisa)
    );

    const correspondeLinha =
      linha === "Todas" || item.linha === linha;

    const correspondeAcabamento =
      acabamento === "Todos" ||
      item.acabamento === acabamento;

    const correspondeAplicacao =
      aplicacao === "Todas" ||
      item.aplicacao === aplicacao;

    return (
      correspondePesquisa &&
      correspondeLinha &&
      correspondeAcabamento &&
      correspondeAplicacao
    );
  });

  const imagensMobile = mostrarTodasImagens
    ? imagensFiltradas
    : imagensFiltradas.slice(0, LIMITE_MOBILE);

  function limparFiltros() {
    setPesquisa("");
    setLinha("Todas");
    setAcabamento("Todos");
    setAplicacao("Todas");
    setMostrarTodasImagens(false);
  }

  return (
    <>
      <Header />

      <main className="videos-page dig-marketing-page">

        {/* CABEÇALHO */}

        <section className="dig-marketing-hero">
          <div className="dig-marketing-hero-content">
            <span className="dig-marketing-tag">
              UNIVERSIDADE SYNTER
            </span>

            <h1 className="dig-marketing-title">
              Marketing de Fechaduras Mecânicas
            </h1>

            <p className="dig-marketing-description">
              Acesse imagens oficiais dos produtos Synter
              para utilizar em apresentações, propostas
              comerciais, redes sociais e materiais de
              divulgação.
            </p>
          </div>
        </section>

        <section className="videos-content">

          {/* FILTROS */}

          <div
            className="mec-marketing-filtros"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <input
              type="search"
              placeholder="Pesquisar produto..."
              aria-label="Pesquisar produto"
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setMostrarTodasImagens(false);
              }}
              style={{
                flex: "2 1 220px",
                padding: "12px",
                border: "1px solid #d4d4d4",
                borderRadius: "8px",
              }}
            />

            <select
              aria-label="Modelo"
              value={linha}
              onChange={(e) => {
                setLinha(e.target.value);
                setMostrarTodasImagens(false);
              }}
              style={{
                flex: "1 1 140px",
                padding: "12px",
                border: "1px solid #d4d4d4",
                borderRadius: "8px",
              }}
            >
              {LINHAS.map((item) => (
                <option key={item} value={item}>
                  {item === "Todas"
                    ? "Todos os modelos"
                    : item}
                </option>
              ))}
            </select>

            <select
              aria-label="Acabamento"
              value={acabamento}
              onChange={(e) => {
                setAcabamento(e.target.value);
                setMostrarTodasImagens(false);
              }}
              style={{
                flex: "1 1 140px",
                padding: "12px",
                border: "1px solid #d4d4d4",
                borderRadius: "8px",
              }}
            >
              {ACABAMENTOS.map((item) => (
                <option key={item} value={item}>
                  {item === "Todos"
                    ? "Todos os acabamentos"
                    : item}
                </option>
              ))}
            </select>

            <select
              aria-label="Aplicação"
              value={aplicacao}
              onChange={(e) => {
                setAplicacao(e.target.value);
                setMostrarTodasImagens(false);
              }}
              style={{
                flex: "1 1 140px",
                padding: "12px",
                border: "1px solid #d4d4d4",
                borderRadius: "8px",
              }}
            >
              {APLICACOES.map((item) => (
                <option key={item} value={item}>
                  {item === "Todas"
                    ? "Todas as aplicações"
                    : item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={limparFiltros}
              style={{
                padding: "12px 18px",
                border: "1px solid #d4d4d4",
                borderRadius: "8px",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Limpar filtros
            </button>
          </div>

          {/* GALERIA */}

          <section className="dm-gallery">
            <div className="dm-gallery-header">
              <h2>Imagens dos produtos</h2>

              <p>
                {imagensFiltradas.length}{" "}
                {imagensFiltradas.length === 1
                  ? "imagem disponível"
                  : "imagens disponíveis"}
              </p>
            </div>

            {imagensFiltradas.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 15px",
                }}
              >
                <h3>Nenhuma imagem encontrada</h3>

                <p>
                  Tente alterar a pesquisa ou os filtros.
                </p>
              </div>
            )}

            {/* VERSÃO DESKTOP */}

            <div className="dig-marketing-desktop">
              <div className="videos-grid dm-gallery-grid">
                {imagensFiltradas.map((item) => (
                  <ImagemCard
                    key={item.id}
                    item={item}
                    abrirImagem={setImagemAberta}
                  />
                ))}
              </div>
            </div>

            {/* VERSÃO MOBILE */}

            <div className="dig-marketing-mobile">
              <div className="dig-marketing-mobile-list">
                {imagensMobile.map((item) => (
                  <article
                    key={item.id}
                    className="video-card"
                  >
                    <button
                      type="button"
                      onClick={() => setImagemAberta(item)}
                      aria-label={`Visualizar ${item.titulo}`}
                      style={{
                        border: "none",
                        background: "#ffffff",
                        padding: 0,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.imagem}
                        alt={item.titulo}
                        className="video-preview"
                        loading="lazy"
                        style={{
                          objectFit: "contain",
                          background: "#ffffff",
                        }}
                      />
                    </button>

                    <div className="video-card-info">
                      <h3>{item.titulo}</h3>

                      <p>
                        {[
                          item.acabamento,
                          item.aplicacao,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>

                      <div className="video-card-botoes">
                        <a
                          href={item.imagem}
                          download={item.arquivo}
                          className="botao-assistir"
                        >
                          ↓ Baixar imagem
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {imagensFiltradas.length > LIMITE_MOBILE && (
                <button
                  type="button"
                  className="dig-marketing-more"
                  onClick={() =>
                    setMostrarTodasImagens(
                      !mostrarTodasImagens
                    )
                  }
                >
                  {mostrarTodasImagens
                    ? "Mostrar menos"
                    : `Ver mais ${
                        imagensFiltradas.length -
                        LIMITE_MOBILE
                      } imagens`}
                </button>
              )}
            </div>
          </section>
        </section>

        {/* VISUALIZAÇÃO AMPLIADA */}

        {imagemAberta && (
          <div
            onClick={() => setImagemAberta(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={imagemAberta.titulo}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setImagemAberta(null);
                }
              }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                color: "#222222",
              }}
            >
              <button
                type="button"
                autoFocus
                aria-label="Fechar imagem"
                onClick={() => setImagemAberta(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#222222",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

              <img
                src={imagemAberta.imagem}
                alt={imagemAberta.titulo}
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                }}
              />

              <h3>{imagemAberta.titulo}</h3>

              <a
                href={imagemAberta.imagem}
                download={imagemAberta.arquivo}
                className="botao-assistir"
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                }}
              >
                ↓ Baixar imagem original
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}