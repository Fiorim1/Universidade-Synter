
import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import tabelaPrecosData from "../data/tabelaPrecosData";
import synterImagensMap from "../data/synterImagensMap.json";

import "../styles/TabelaPrecos.css";
import "../styles/TabelaPrecosHero.css";

// ==========================================
// UNIVERSIDADE SYNTER — TABELA DE PREÇOS
// ==========================================

// As imagens ficam em public/synter-produtos.
// O mapeamento utiliza a categoria e a posição
// original da linha, preservando as associações
// entre produtos e imagens.

function normalizarTexto(valor = "") {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function encontrarImagemProduto(categoriaId, indice) {
  const chave = `${categoriaId}:${indice}`;
  const arquivo = synterImagensMap[chave];

  if (!arquivo) return null;

  return `/synter-produtos/${encodeURIComponent(arquivo)}`;
}

function obterColunaClasse(coluna) {
  return normalizarTexto(coluna) === "linha"
    ? "coluna-linha-mobile"
    : "";
}

// ==========================================
// ÍCONE GEOMÉTRICO — PADRÃO SYNTER
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

// ==========================================
// IMAGEM DO PRODUTO
// ==========================================

function ImagemProduto({
  imagem,
  alt,
  ampliada = false,
}) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [imagem]);

  if (!imagem || falhou) {
    return ampliada ? (
      <div className="produto-sem-imagem">
        <span>◇</span>
        <p>Imagem não disponível</p>
      </div>
    ) : (
      <span
        title="Imagem não disponível"
        style={{
          color: "#999",
          fontSize: 11,
        }}
      >
        —
      </span>
    );
  }

  return (
    <img
      src={imagem}
      alt={alt}
      loading={ampliada ? "eager" : "lazy"}
      onError={() => setFalhou(true)}
      className={
        ampliada
          ? "produto-modal-imagem"
          : "tabela-precos-produto-imagem"
      }
      style={
        ampliada
          ? undefined
          : {
              width: 66,
              height: 56,
              objectFit: "contain",
              display: "block",
              margin: "auto",
            }
      }
    />
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function TabelaPrecos() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState("todos");

  const [
    produtoSelecionado,
    setProdutoSelecionado,
  ] = useState(null);

  // ========================================
  // FILTRAR PRODUTOS
  // ========================================

  const categoriasFiltradas = useMemo(() => {
    const busca = normalizarTexto(pesquisa);

    return tabelaPrecosData.categorias
      .filter((categoria) => {
        return (
          categoriaSelecionada === "todos" ||
          categoria.id === categoriaSelecionada
        );
      })
      .map((categoria) => {
        // Preservar o índice original é importante
        // para localizar a imagem correta.

        const produtos = categoria.linhas
          .map((linha, indiceOriginal) => ({
            linha,
            indiceOriginal,
            imagem: encontrarImagemProduto(
              categoria.id,
              indiceOriginal
            ),
          }))
          .filter((produto) => {
            if (!busca) return true;

            const textoLinha = normalizarTexto(
              produto.linha.join(" ")
            );

            const tituloCategoria = normalizarTexto(
              categoria.titulo
            );

            return (
              textoLinha.includes(busca) ||
              tituloCategoria.includes(busca)
            );
          });

        return {
          ...categoria,
          produtos,
        };
      })
      .filter((categoria) => {
        return categoria.produtos.length > 0;
      });
  }, [pesquisa, categoriaSelecionada]);

  // ========================================
  // QUANTIDADE DE RESULTADOS
  // ========================================

  const totalResultados = useMemo(() => {
    return categoriasFiltradas.reduce(
      (total, categoria) =>
        total + categoria.produtos.length,
      0
    );
  }, [categoriasFiltradas]);

  // ========================================
  // CATEGORIA SELECIONADA
  // ========================================

  const nomeCategoriaSelecionada = useMemo(() => {
    if (categoriaSelecionada === "todos") {
      return "Todos";
    }

    const categoria =
      tabelaPrecosData.categorias.find(
        (item) =>
          item.id === categoriaSelecionada
      );

    return categoria?.titulo || "";
  }, [categoriaSelecionada]);

  // ========================================
  // AÇÕES
  // ========================================

  function limparFiltros() {
    setPesquisa("");
    setCategoriaSelecionada("todos");
  }

  function abrirProduto(categoria, produto) {
    setProdutoSelecionado({
      categoria,
      linha: produto.linha,
      imagem: produto.imagem,
      indiceOriginal: produto.indiceOriginal,
    });
  }

  function fecharProduto() {
    setProdutoSelecionado(null);
  }

  // Fechar visualização usando ESC.

  useEffect(() => {
    if (!produtoSelecionado) return;

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") {
        fecharProduto();
      }
    }

    window.addEventListener(
      "keydown",
      aoPressionarTecla
    );

    return () => {
      window.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [produtoSelecionado]);

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="tabela-precos-page">
      <Header />

      {/* =====================================
          HERO — PADRÃO PERGUNTAS FREQUENTES
      ===================================== */}

      <section className="tp-faq-hero">
        <div className="tp-faq-hero-container">

          {/* PERFIL */}

          <div className="tp-faq-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          {/* IDENTIFICAÇÃO SUPERIOR */}

          <div className="tp-faq-eyebrow">
            <IconeSynter />
            <span>CONSULTA COMERCIAL</span>
          </div>

          {/* TÍTULO */}

          <h1 className="tp-faq-title">
            Tabela de Preços
          </h1>

          {/* DESCRIÇÃO */}

          <p className="tp-faq-description">
            Consulte produtos, referências,
            acabamentos e valores da linha
            Synter de forma rápida e organizada.
          </p>

        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main className="tabela-precos-content">

        {/* ===================================
            CABEÇALHO
        ==================================== */}

        <section className="tabela-precos-topo">
          <div className="tabela-precos-titulo-area">

            <div className="tabela-precos-section-title">
              <div className="tabela-precos-section-bar" />

              <h4>TABELA DE PREÇOS</h4>
            </div>

            <div className="tabela-precos-info">
              <span>
                {tabelaPrecosData.titulo}
              </span>

              <small>
                Atualizada em{" "}
                {tabelaPrecosData.atualizacao}
              </small>
            </div>

          </div>

          <div className="tabela-precos-total">
            <span>{totalResultados}</span>
            <small>resultados</small>
          </div>
        </section>

        {/* ===================================
            PESQUISA
        ==================================== */}

        <section className="tabela-precos-filtros">
          <div className="tabela-precos-pesquisa">

            <span className="tabela-precos-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Pesquisar produto, modelo ou referência..."
              value={pesquisa}
              onChange={(evento) =>
                setPesquisa(evento.target.value)
              }
              aria-label="Pesquisar produtos"
            />

            {pesquisa && (
              <button
                type="button"
                className="tabela-precos-limpar-pesquisa"
                onClick={() => setPesquisa("")}
                aria-label="Limpar pesquisa"
              >
                ×
              </button>
            )}

          </div>
        </section>

        {/* ===================================
            CATEGORIAS
        ==================================== */}

        <section className="tabela-precos-categorias">

          <button
            type="button"
            className={
              categoriaSelecionada === "todos"
                ? "categoria-button categoria-button-active"
                : "categoria-button"
            }
            onClick={() =>
              setCategoriaSelecionada("todos")
            }
          >
            Todos
          </button>

          {tabelaPrecosData.categorias.map(
            (categoria) => (
              <button
                type="button"
                key={categoria.id}
                className={
                  categoriaSelecionada === categoria.id
                    ? "categoria-button categoria-button-active"
                    : "categoria-button"
                }
                onClick={() =>
                  setCategoriaSelecionada(
                    categoria.id
                  )
                }
              >
                {categoria.titulo}
              </button>
            )
          )}

        </section>

        {/* ===================================
            IDENTIFICAÇÃO DOS RESULTADOS
        ==================================== */}

        {categoriasFiltradas.length > 0 && (
          <section className="tabela-precos-categoria">

            <div className="tabela-precos-categoria-header">
              <div>

                <div className="tabela-precos-categoria-titulo">
                  <div className="tabela-precos-section-bar" />

                  <h2>
                    {nomeCategoriaSelecionada}
                  </h2>
                </div>

                <p>
                  {totalResultados}{" "}
                  {totalResultados === 1
                    ? "item encontrado"
                    : "itens encontrados"}
                </p>

              </div>
            </div>

          </section>
        )}

        {/* ===================================
            RESULTADOS
        ==================================== */}

        <section className="tabela-precos-resultados">

          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map(
              (categoria) => (
                <section
                  key={categoria.id}
                  className="tabela-precos-categoria"
                >

                  {/* TABELA */}

                  <div className="tabela-precos-table-wrapper">
                    <table className="tabela-precos-table">

                      <thead>
                        <tr>

                          {/* COLUNA DE IMAGEM */}

                          <th
                            className="tabela-coluna-imagem"
                            style={{
                              minWidth: 90,
                              textAlign: "center",
                            }}
                          >
                            Imagem
                          </th>

                          {/* DEMAIS COLUNAS */}

                          {categoria.colunas.map(
                            (coluna, indice) => (
                              <th
                                key={`${categoria.id}-coluna-${indice}`}
                                className={obterColunaClasse(
                                  coluna
                                )}
                              >
                                {coluna}
                              </th>
                            )
                          )}

                        </tr>
                      </thead>

                      <tbody>

                        {categoria.produtos.map(
                          (produto) => (
                            <tr
                              key={`${categoria.id}-${produto.indiceOriginal}`}
                              className="tabela-precos-produto-linha"
                              onClick={() =>
                                abrirProduto(
                                  categoria,
                                  produto
                                )
                              }
                              onKeyDown={(evento) => {
                                if (
                                  evento.key === "Enter" ||
                                  evento.key === " "
                                ) {
                                  evento.preventDefault();
                                  abrirProduto(
                                    categoria,
                                    produto
                                  );
                                }
                              }}
                              tabIndex={0}
                              title="Clique para visualizar o produto"
                              style={{
                                cursor: "pointer",
                              }}
                            >

                              {/* IMAGEM */}

                              <td
                                className="tabela-coluna-imagem"
                                style={{
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                }}
                              >
                                <ImagemProduto
                                  imagem={produto.imagem}
                                  alt={
                                    produto.linha[1] ||
                                    produto.linha[0] ||
                                    "Produto Synter"
                                  }
                                />
                              </td>

                              {/* INFORMAÇÕES ORIGINAIS */}

                              {produto.linha.map(
                                (valor, indice) => {
                                  const nomeColuna =
                                    categoria.colunas[indice];

                                  const ehValor =
                                    String(valor ?? "")
                                      .trim()
                                      .startsWith("R$");

                                  const ehColunaLinha =
                                    normalizarTexto(
                                      nomeColuna
                                    ) === "linha";

                                  const classe = [
                                    ehValor
                                      ? "tabela-precos-valor"
                                      : "",

                                    ehColunaLinha
                                      ? "coluna-linha-mobile"
                                      : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ");

                                  return (
                                    <td
                                      key={`${categoria.id}-${produto.indiceOriginal}-${indice}`}
                                      className={classe}
                                    >
                                      {valor}
                                    </td>
                                  );
                                }
                              )}

                            </tr>
                          )
                        )}

                      </tbody>
                    </table>
                  </div>

                  {/* =================================
                      OBSERVAÇÕES
                  ================================== */}

                  {categoria.observacoes?.length > 0 && (
                    <div className="tabela-precos-observacoes">

                      <div className="tabela-precos-observacoes-title">
                        <span>!</span>

                        <h4>
                          Informações importantes
                        </h4>
                      </div>

                      <ul>
                        {categoria.observacoes.map(
                          (observacao, indice) => (
                            <li
                              key={`${categoria.id}-obs-${indice}`}
                            >
                              {observacao}
                            </li>
                          )
                        )}
                      </ul>

                    </div>
                  )}

                </section>
              )
            )
          ) : (
            <div className="tabela-precos-vazio">

              <div className="tabela-precos-vazio-icon">
                ⌕
              </div>

              <h3>Nenhum produto encontrado</h3>

              <p>
                Não encontramos produtos correspondentes
                à sua pesquisa.
              </p>

              <button
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>

            </div>
          )}

        </section>
      </main>

      {/* =====================================
          MODAL DE VISUALIZAÇÃO DO PRODUTO
      ===================================== */}

      {produtoSelecionado && (
        <div
          className="produto-modal-fundo"
          onClick={fecharProduto}
          role="presentation"
        >
          <div
            className="produto-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização do produto Synter"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            {/* FECHAR */}

            <button
              type="button"
              className="produto-modal-fechar"
              onClick={fecharProduto}
              aria-label="Fechar"
            >
              ×
            </button>

            {/* IMAGEM AMPLIADA */}

            <div className="produto-modal-imagem-area">
              <ImagemProduto
                imagem={produtoSelecionado.imagem}
                alt={`Produto ${
                  produtoSelecionado.linha[1] ||
                  produtoSelecionado.linha[0]
                }`}
                ampliada
              />
            </div>

            {/* DADOS DO PRODUTO */}

            <div className="produto-modal-conteudo">

              <span className="produto-modal-categoria">
                {produtoSelecionado.categoria.titulo}
              </span>

              <h2>
                Visualização do Produto
              </h2>

              <div className="produto-modal-dados">

                {produtoSelecionado.linha.map(
                  (valor, indice) => (
                    <div
                      className="produto-modal-dado"
                      key={indice}
                    >
                      <span>
                        {
                          produtoSelecionado.categoria
                            .colunas[indice]
                        }
                      </span>

                      <strong>
                        {valor}
                      </strong>
                    </div>
                  )
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />

      {/* =====================================
          PERFIL DO USUÁRIO
      ===================================== */}

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

export default TabelaPrecos;
