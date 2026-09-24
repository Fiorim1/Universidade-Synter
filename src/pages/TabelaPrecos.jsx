import { useMemo, useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import tabelaPrecosData from "../data/tabelaPrecosData";

import "../styles/TabelaPrecos.css";

function TabelaPrecos() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");

  // =====================================================
  // NORMALIZA TEXTO PARA PESQUISA
  // =====================================================

  function normalizarTexto(texto = "") {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // =====================================================
  // FILTRA AS CATEGORIAS E PRODUTOS
  // =====================================================

  const categoriasFiltradas = useMemo(() => {
    const textoPesquisa = normalizarTexto(pesquisa);

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
        const linhasFiltradas = categoria.linhas.filter((linha) => {
          if (!textoPesquisa) {
            return true;
          }

          const conteudoLinha = normalizarTexto(linha.join(" "));
          const tituloCategoria = normalizarTexto(categoria.titulo);

          return (
            conteudoLinha.includes(textoPesquisa) ||
            tituloCategoria.includes(textoPesquisa)
          );
        });

        return {
          ...categoria,
          linhas: linhasFiltradas,
        };
      })
      .filter((categoria) => categoria.linhas.length > 0);
  }, [pesquisa, categoriaSelecionada]);

  // =====================================================
  // TOTAL DE PRODUTOS VISÍVEIS
  // =====================================================

  const totalResultados = useMemo(() => {
    return categoriasFiltradas.reduce((total, categoria) => {
      return total + categoria.linhas.length;
    }, 0);
  }, [categoriasFiltradas]);

  // =====================================================
  // LIMPAR FILTROS
  // =====================================================

  function limparFiltros() {
    setPesquisa("");
    setCategoriaSelecionada("todos");
  }

  return (
    <div className="tabela-precos-page">
      {/* ===================================== */}
      {/* HEADER                                */}
      {/* ===================================== */}

      <Header />

      {/* ===================================== */}
      {/* HERO                                  */}
      {/* ===================================== */}

      <section className="tabela-precos-hero-area">
        <div className="tabela-precos-profile">
          <UserProfileButton onClick={() => setProfileOpen(true)} />
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

      {/* ===================================== */}
      {/* CONTEÚDO PRINCIPAL                    */}
      {/* ===================================== */}

      <main className="tabela-precos-content">
        {/* =================================== */}
        {/* CABEÇALHO                           */}
        {/* =================================== */}

        <section className="tabela-precos-topo">
          <div className="tabela-precos-titulo-area">
            <div className="tabela-precos-section-title">
              <div className="tabela-precos-section-bar"></div>

              <h4>TABELA DE PREÇOS</h4>
            </div>

            <div className="tabela-precos-info">
              <span>{tabelaPrecosData.titulo}</span>

              <small>
                Atualizada em {tabelaPrecosData.atualizacao}
              </small>
            </div>
          </div>

          <div className="tabela-precos-total">
            <span>{totalResultados}</span>
            <small>resultados</small>
          </div>
        </section>

        {/* =================================== */}
        {/* ÁREA DE PESQUISA                    */}
        {/* =================================== */}

        <section className="tabela-precos-filtros">
          <div className="tabela-precos-pesquisa">
            <span className="tabela-precos-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Pesquisar produto, modelo ou referência..."
              value={pesquisa}
              onChange={(evento) => setPesquisa(evento.target.value)}
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

        {/* =================================== */}
        {/* CATEGORIAS                          */}
        {/* =================================== */}

        <section className="tabela-precos-categorias">
          <button
            type="button"
            className={
              categoriaSelecionada === "todos"
                ? "categoria-button categoria-button-active"
                : "categoria-button"
            }
            onClick={() => setCategoriaSelecionada("todos")}
          >
            Todos
          </button>

          {tabelaPrecosData.categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={
                categoriaSelecionada === categoria.id
                  ? "categoria-button categoria-button-active"
                  : "categoria-button"
              }
              onClick={() => setCategoriaSelecionada(categoria.id)}
            >
              {categoria.titulo}
            </button>
          ))}
        </section>

        {/* =================================== */}
        {/* RESULTADOS                          */}
        {/* =================================== */}

        {categoriaSelecionada !== "todos" && (
          <section className="tabela-precos-resultados">
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((categoria) => (
              <section
                key={categoria.id}
                className="tabela-precos-categoria"
              >
                {/* ========================= */}
                {/* TÍTULO DA CATEGORIA       */}
                {/* ========================= */}

                <div className="tabela-precos-categoria-header">
                  <div>
                    <div className="tabela-precos-categoria-titulo">
                      <div className="tabela-precos-section-bar"></div>

                      <h2>{categoria.titulo}</h2>
                    </div>

                    <p>
                      {categoria.linhas.length}{" "}
                      {categoria.linhas.length === 1
                        ? "item encontrado"
                        : "itens encontrados"}
                    </p>
                  </div>
                </div>

                {/* ========================= */}
                {/* TABELA                    */}
                {/* ========================= */}

                <div className="tabela-precos-table-wrapper">
                  <table className="tabela-precos-table">
                    <thead>
                      <tr>
                        {categoria.colunas.map((coluna, index) => (
                          <th key={`${categoria.id}-coluna-${index}`}>
                            {coluna}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {categoria.linhas.map((linha, linhaIndex) => (
                        <tr key={`${categoria.id}-linha-${linhaIndex}`}>
                          {linha.map((valor, colunaIndex) => (
                            <td
                              key={`${categoria.id}-${linhaIndex}-${colunaIndex}`}
                              className={
                                valor.toString().trim().startsWith("R$")
                                  ? "tabela-precos-valor"
                                  : ""
                              }
                            >
                              {valor}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ========================= */}
                {/* OBSERVAÇÕES               */}
                {/* ========================= */}

                {categoria.observacoes && categoria.observacoes.length > 0 && (
                  <div className="tabela-precos-observacoes">
                    <div className="tabela-precos-observacoes-title">
                      <span>!</span>
                      <h4>Informações importantes</h4>
                    </div>

                    <ul>
                      {categoria.observacoes.map((observacao, index) => (
                        <li key={`${categoria.id}-obs-${index}`}>
                          {observacao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))
          ) : (
            <div className="tabela-precos-vazio">
              <div className="tabela-precos-vazio-icon">⌕</div>

              <h3>Nenhum produto encontrado</h3>

              <p>
                Não encontramos produtos correspondentes à sua pesquisa.
              </p>

              <button type="button" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
            )}
          </section>
        )}
      </main>

      {/* ===================================== */}
      {/* FOOTER                                */}
      {/* ===================================== */}

      <Footer />

      {/* ===================================== */}
      {/* PERFIL                                */}
      {/* ==================================== */}

      {profileOpen && (
        <Profile onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}

export default TabelaPrecos;
