import { useMemo, useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import tabelaPrecosData from "../data/tabelaPrecosData";

import "../styles/TabelaPrecos.css";


// =====================================================
// CARREGA AUTOMATICAMENTE AS IMAGENS DOS PRODUTOS
// =====================================================

const imagensProdutos = import.meta.glob(
  "../assets/produtos/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  }
);


function TabelaPrecos() {

  const [profileOpen, setProfileOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState("");

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("todos");


  // =====================================================
  // MODAL DO PRODUTO
  // =====================================================

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);


  // =====================================================
  // NORMALIZA TEXTO
  // =====================================================

  function normalizarTexto(texto = "") {

    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }


  // =====================================================
  // NORMALIZA PARA COMPARAR IMAGEM
  // =====================================================

  function normalizarArquivo(texto = "") {

    return normalizarTexto(texto)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/g, "");
  }


  // =====================================================
  // PROCURA IMAGEM DO PRODUTO
  // =====================================================

  function encontrarImagemProduto(linha) {

    const valoresLinha = linha.map((valor) =>
      normalizarArquivo(valor)
    );

    const arquivos = Object.entries(imagensProdutos);

    for (const [caminho, imagem] of arquivos) {

      const nomeArquivo =
        caminho.split("/").pop() || "";

      const nomeNormalizado =
        normalizarArquivo(nomeArquivo);


      const encontrou = valoresLinha.some((valor) => {

        if (!valor || valor.length < 3) {
          return false;
        }

        return (
          nomeNormalizado.includes(valor) ||
          valor.includes(nomeNormalizado)
        );
      });


      if (encontrou) {
        return imagem;
      }
    }

    return null;
  }


  // =====================================================
  // ABRIR PRODUTO
  // =====================================================

  function abrirProduto(categoria, linha) {

    const imagem =
      encontrarImagemProduto(linha);

    setProdutoSelecionado({
      categoria,
      linha,
      imagem,
    });
  }


  // =====================================================
  // FECHAR PRODUTO
  // =====================================================

  function fecharProduto() {

    setProdutoSelecionado(null);
  }


  // =====================================================
  // FILTRA CATEGORIAS E PRODUTOS
  // =====================================================

  const categoriasFiltradas = useMemo(() => {

    const textoPesquisa =
      normalizarTexto(pesquisa);


    return tabelaPrecosData.categorias

      .filter((categoria) => {

        if (
          categoriaSelecionada !== "todos" &&
          categoria.id !== categoriaSelecionada
        ) {

          return false;
        }

        return true;
      })

      .map((categoria) => {

        const linhasFiltradas =
          categoria.linhas.filter((linha) => {

            if (!textoPesquisa) {
              return true;
            }


            const conteudoLinha =
              normalizarTexto(
                linha.join(" ")
              );


            const tituloCategoria =
              normalizarTexto(
                categoria.titulo
              );


            return (
              conteudoLinha.includes(
                textoPesquisa
              ) ||
              tituloCategoria.includes(
                textoPesquisa
              )
            );
          });


        return {
          ...categoria,
          linhas: linhasFiltradas,
        };
      })

      .filter((categoria) => {
        return categoria.linhas.length > 0;
      });

  }, [pesquisa, categoriaSelecionada]);


  // =====================================================
  // TOTAL DE PRODUTOS
  // =====================================================

  const totalResultados = useMemo(() => {

    return categoriasFiltradas.reduce(
      (total, categoria) => {

        return (
          total +
          categoria.linhas.length
        );
      },
      0
    );

  }, [categoriasFiltradas]);


  // =====================================================
  // NOME DA CATEGORIA
  // =====================================================

  const nomeCategoriaSelecionada =
    useMemo(() => {

      if (
        categoriaSelecionada === "todos"
      ) {

        return "Todos";
      }


      const categoria =
        tabelaPrecosData.categorias.find(
          (item) =>
            item.id ===
            categoriaSelecionada
        );


      return categoria?.titulo || "";

    }, [categoriaSelecionada]);


  // =====================================================
  // LIMPAR FILTROS
  // =====================================================

  function limparFiltros() {

    setPesquisa("");

    setCategoriaSelecionada("todos");
  }


  return (

    <div className="tabela-precos-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <Header />


      {/* =====================================
          HERO
      ====================================== */}

      <section className="tabela-precos-hero-area">

        <div className="tabela-precos-profile">

          <UserProfileButton
            onClick={() =>
              setProfileOpen(true)
            }
          />

        </div>


        <div className="tabela-precos-hero-content">

          <Hero
            variant="dashboard"
            one="Consulta Comercial"
            two="Tabela de Preços"
            three="Consulte produtos, referências, acabamentos e valores da linha Synter de forma rápida e organizada."
          />

        </div>

      </section>


      {/* =====================================
          CONTEÚDO
      ====================================== */}

      <main className="tabela-precos-content">


        {/* ===================================
            CABEÇALHO
        ==================================== */}

        <section className="tabela-precos-topo">

          <div className="tabela-precos-titulo-area">

            <div className="tabela-precos-section-title">

              <div className="tabela-precos-section-bar"></div>

              <h4>
                TABELA DE PREÇOS
              </h4>

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

            <span>
              {totalResultados}
            </span>

            <small>
              resultados
            </small>

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
                setPesquisa(
                  evento.target.value
                )
              }
            />


            {pesquisa && (

              <button
                type="button"
                className="tabela-precos-limpar-pesquisa"
                onClick={() =>
                  setPesquisa("")
                }
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
              categoriaSelecionada ===
              "todos"

                ? "categoria-button categoria-button-active"

                : "categoria-button"
            }

            onClick={() =>
              setCategoriaSelecionada(
                "todos"
              )
            }
          >
            Todos
          </button>


          {tabelaPrecosData.categorias.map(
            (categoria) => (

              <button
                key={categoria.id}
                type="button"

                className={
                  categoriaSelecionada ===
                  categoria.id

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
            IDENTIFICAÇÃO
        ==================================== */}

        {categoriasFiltradas.length > 0 && (

          <section className="tabela-precos-categoria">

            <div className="tabela-precos-categoria-header">

              <div>

                <div className="tabela-precos-categoria-titulo">

                  <div className="tabela-precos-section-bar"></div>

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


                  {/* =============================
                      TABELA
                  ============================== */}

                  <div className="tabela-precos-table-wrapper">

                    <table className="tabela-precos-table">


                      <thead>

                        <tr>

                          {categoria.colunas.map(
                            (coluna, index) => {

                              const ehColunaLinha =
                                String(coluna)
                                  .trim()
                                  .toLowerCase() ===
                                "linha";


                              return (

                                <th
                                  key={`${categoria.id}-coluna-${index}`}

                                  className={
                                    ehColunaLinha
                                      ? "coluna-linha-mobile"
                                      : ""
                                  }
                                >

                                  {coluna}

                                </th>

                              );
                            }
                          )}

                        </tr>

                      </thead>


                      <tbody>

                        {categoria.linhas.map(
                          (linha, linhaIndex) => (

                            <tr
                              key={`${categoria.id}-linha-${linhaIndex}`}

                              className="tabela-precos-produto-linha"

                              onClick={() =>
                                abrirProduto(
                                  categoria,
                                  linha
                                )
                              }

                              title="Clique para visualizar o produto"
                            >

                              {linha.map(
                                (
                                  valor,
                                  colunaIndex
                                ) => {

                                  const nomeColuna =
                                    categoria
                                      .colunas[
                                        colunaIndex
                                      ];


                                  const ehColunaLinha =
                                    String(
                                      nomeColuna
                                    )
                                      .trim()
                                      .toLowerCase() ===
                                    "linha";


                                  const ehValor =
                                    valor
                                      .toString()
                                      .trim()
                                      .startsWith(
                                        "R$"
                                      );


                                  return (

                                    <td
                                      key={`${categoria.id}-${linhaIndex}-${colunaIndex}`}

                                      className={[

                                        ehValor
                                          ? "tabela-precos-valor"
                                          : "",

                                        ehColunaLinha
                                          ? "coluna-linha-mobile"
                                          : "",

                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(" ")}
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


                  {/* =============================
                      OBSERVAÇÕES
                  ============================== */}

                  {categoria.observacoes &&
                    categoria.observacoes.length >
                      0 && (

                      <div className="tabela-precos-observacoes">

                        <div className="tabela-precos-observacoes-title">

                          <span>
                            !
                          </span>

                          <h4>
                            Informações importantes
                          </h4>

                        </div>


                        <ul>

                          {categoria.observacoes.map(
                            (
                              observacao,
                              index
                            ) => (

                              <li
                                key={`${categoria.id}-obs-${index}`}
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


              <h3>
                Nenhum produto encontrado
              </h3>


              <p>
                Não encontramos produtos correspondentes à sua pesquisa.
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
          MODAL DO PRODUTO
      ====================================== */}

      {produtoSelecionado && (

        <div
          className="produto-modal-fundo"
          onClick={fecharProduto}
        >

          <div
            className="produto-modal"
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


            {/* IMAGEM */}

            <div className="produto-modal-imagem-area">

              {produtoSelecionado.imagem ? (

                <img
                  src={
                    produtoSelecionado.imagem
                  }
                  alt="Produto"
                  className="produto-modal-imagem"
                />

              ) : (

                <div className="produto-sem-imagem">

                  <span>
                    ◇
                  </span>

                  <p>
                    Imagem não disponível
                  </p>

                </div>

              )}

            </div>


            {/* INFORMAÇÕES */}

            <div className="produto-modal-conteudo">

              <span className="produto-modal-categoria">

                {
                  produtoSelecionado
                    .categoria.titulo
                }

              </span>


              <h2>
                Visualização do Produto
              </h2>


              <div className="produto-modal-dados">

                {produtoSelecionado.linha.map(
                  (valor, index) => (

                    <div
                      className="produto-modal-dado"
                      key={index}
                    >

                      <span>

                        {
                          produtoSelecionado
                            .categoria
                            .colunas[index]
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
      ====================================== */}

      <Footer />


      {/* =====================================
          PERFIL
      ====================================== */}

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