
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/ComparadorFechaduras.css";

// ==========================================
// CATÁLOGO DE MODELOS SYNTER
// ==========================================
//
// Preencha os dados técnicos somente após
// confirmar as informações oficiais.
//
// Exemplo de cadastro:
//
// biometria: "Sim",
// aplicativo: "Synter Smart",
// alimentacao: "4 pilhas AA",
//
// Campos não preenchidos são exibidos como
// "A confirmar".
//
// Não são atribuídas especificações técnicas
// sem documentação de referência.
// ==========================================

const PRODUTOS = [
  {
    id: "syrius-s1",
    nome: "Syrius S1",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s1-pro",
    nome: "Syrius S1 Pro",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s2-pro",
    nome: "Syrius S2 Pro",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s2-pro-neo",
    nome: "Syrius S2 Pro Neo",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s2-max",
    nome: "Syrius S2 Max",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s3-pro",
    nome: "Syrius S3 Pro",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "syrius-s3-max",
    nome: "Syrius S3 Max",
    linha: "Syrius",
    categoria: "Digital",
  },
  {
    id: "venus-s2-pro",
    nome: "Venus S2 Pro",
    linha: "Venus",
    categoria: "Digital",
  },
  {
    id: "venus-s3-pro",
    nome: "Venus S3 Pro",
    linha: "Venus",
    categoria: "Digital",
  },
  {
    id: "mars-s2-pro",
    nome: "Mars S2 Pro",
    linha: "Mars",
    categoria: "Digital",
  },
  {
    id: "dallas-s2-pro",
    nome: "Dallas S2 Pro",
    linha: "Dallas",
    categoria: "Digital",
  },
  {
    id: "dallas-s3-pro",
    nome: "Dallas S3 Pro",
    linha: "Dallas",
    categoria: "Digital",
  },
  {
    id: "lyra-pro",
    nome: "Lyra Pro",
    linha: "Lyra",
    categoria: "Digital",
  },
  {
    id: "vega-face-id",
    nome: "Vega Face Id",
    linha: "Vega",
    categoria: "Digital",
  },
  {
    id: "eris-s2-face-id",
    nome: "Eris S2 Face Id",
    linha: "Eris",
    categoria: "Digital",
  },
  {
    id: "nexus-s1",
    nome: "Nexus S1",
    linha: "Nexus",
    categoria: "Digital",
  },
  {
    id: "domus-s1",
    nome: "Domus S1",
    linha: "Domus",
    categoria: "Digital",
  },
  {
    id: "stillus",
    nome: "Stillus",
    linha: "Stillus",
    categoria: "Mecânica",
  },
  {
    id: "navis",
    nome: "Navis",
    linha: "Navis",
    categoria: "Mecânica",
  },
  {
    id: "navis-ii",
    nome: "Navis II",
    linha: "Navis",
    categoria: "Mecânica",
  },
  {
    id: "glorian",
    nome: "Glorian",
    linha: "Glorian",
    categoria: "Mecânica",
  },
  {
    id: "gol",
    nome: "Gol",
    linha: "Gol",
    categoria: "Mecânica",
  },
  {
    id: "star",
    nome: "Star",
    linha: "Star",
    categoria: "Mecânica",
  },
  {
    id: "star-max",
    nome: "Star Max",
    linha: "Star",
    categoria: "Mecânica",
  },
  {
    id: "polo-max",
    nome: "Polo Max",
    linha: "Polo",
    categoria: "Mecânica",
  },
  {
    id: "marine",
    nome: "Marine",
    linha: "Marine",
    categoria: "Mecânica",
  },
  {
    id: "olympia",
    nome: "Olympia",
    linha: "Olympia",
    categoria: "Mecânica",
  },
  {
    id: "crispus-max",
    nome: "Crispus Max",
    linha: "Crispus",
    categoria: "Mecânica",
  },
  {
    id: "acqua-max",
    nome: "Acqua Max",
    linha: "Acqua",
    categoria: "Mecânica",
  },
];

// ==========================================
// CAMPOS DE COMPARAÇÃO
// ==========================================

const CAMPOS = [
  {
    grupo: "Informações gerais",
    campos: [
      { chave: "nome", titulo: "Modelo" },
      { chave: "linha", titulo: "Linha" },
      { chave: "categoria", titulo: "Categoria" },
      { chave: "aplicacao", titulo: "Aplicação" },
    ],
  },
  {
    grupo: "Métodos de acesso",
    campos: [
      { chave: "senha", titulo: "Senha numérica" },
      { chave: "biometria", titulo: "Biometria" },
      { chave: "cartao", titulo: "Cartão de acesso" },
      {
        chave: "reconhecimentoFacial",
        titulo: "Reconhecimento facial",
      },
      {
        chave: "chaveMecanica",
        titulo: "Chave mecânica",
      },
    ],
  },
  {
    grupo: "Conectividade e tecnologia",
    campos: [
      {
        chave: "aplicativo",
        titulo: "Aplicativo",
      },
      {
        chave: "bluetooth",
        titulo: "Bluetooth",
      },
      {
        chave: "gateway",
        titulo: "Compatibilidade com Gateway",
      },
      {
        chave: "acessoRemoto",
        titulo: "Acesso remoto",
      },
    ],
  },
  {
    grupo: "Características técnicas",
    campos: [
      {
        chave: "alimentacao",
        titulo: "Alimentação",
      },
      {
        chave: "autonomia",
        titulo: "Autonomia informada",
      },
      {
        chave: "espessuraPorta",
        titulo: "Espessura de porta",
      },
      {
        chave: "maquina",
        titulo: "Máquina",
      },
      {
        chave: "acabamentos",
        titulo: "Acabamentos",
      },
      {
        chave: "garantia",
        titulo: "Garantia",
      },
    ],
  },
];

// ==========================================
// NORMALIZAÇÃO PARA PESQUISA
// ==========================================

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// ==========================================
// ÍCONES
// ==========================================

function IconeCubo() {
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

function IconeComparar() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h15m-4-4 4 4-4 4" />
      <path d="M20 17H5m4-4-4 4 4 4" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ==========================================
// FORMATAR VALORES DA TABELA
// ==========================================

function formatarValor(produto, chave) {
  if (!produto) return "—";

  const valor = produto[chave];

  if (valor === true) return "Sim";
  if (valor === false) return "Não";

  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return "A confirmar";
  }

  return String(valor);
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function ComparadorFechaduras() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [categoria, setCategoria] =
    useState("Todas");

  const [selecionados, setSelecionados] =
    useState([
      "syrius-s2-pro-neo",
      "venus-s3-pro",
    ]);

  const produtosFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    return PRODUTOS.filter((produto) => {
      const correspondeCategoria =
        categoria === "Todas" ||
        produto.categoria === categoria;

      const correspondeBusca =
        normalizar(
          `${produto.nome} ${produto.linha}`
        ).includes(termo);

      return (
        correspondeCategoria &&
        correspondeBusca
      );
    });
  }, [pesquisa, categoria]);

  const produtosSelecionados = useMemo(() => {
    return selecionados
      .map((id) =>
        PRODUTOS.find((produto) =>
          produto.id === id
        )
      )
      .filter(Boolean);
  }, [selecionados]);

  const atingiuLimite =
    selecionados.length >= 3;

  // ========================================
  // SELECIONAR / REMOVER
  // ========================================

  function alternarProduto(id) {
    setSelecionados((anteriores) => {
      if (anteriores.includes(id)) {
        return anteriores.filter(
          (item) => item !== id
        );
      }

      if (anteriores.length >= 3) {
        return anteriores;
      }

      return [...anteriores, id];
    });
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="comparador-page">

      <Header />

      {/* ====================================
          HERO
      ==================================== */}

      <section className="comparador-hero">
        <div className="comparador-container comparador-hero-inner">

          <div className="comparador-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="comparador-eyebrow">
            <IconeCubo />
            <span>
              FERRAMENTAS COMERCIAIS
            </span>
          </div>

          <h1>
            Comparador de Fechaduras
          </h1>

          <p className="comparador-hero-description">
            Compare os modelos Synter lado a
            lado e consulte as características
            que fazem a diferença na escolha
            de cada produto.
          </p>

        </div>
      </section>

      {/* ====================================
          CONTEÚDO
      ==================================== */}

      <main className="comparador-container comparador-main">

        <div className="comparador-section-title">
          <span className="comparador-section-bar" />

          <div>
            <h2>SELECIONE OS PRODUTOS</h2>
            <p>
              Escolha até três fechaduras
              para comparar.
            </p>
          </div>
        </div>

        {/* ==================================
            FILTROS
        ================================== */}

        <div className="comparador-filtros">

          <input
            type="search"
            value={pesquisa}
            onChange={(evento) =>
              setPesquisa(evento.target.value)
            }
            placeholder="Pesquisar modelo ou linha..."
            aria-label="Pesquisar fechaduras"
          />

          <select
            value={categoria}
            onChange={(evento) =>
              setCategoria(evento.target.value)
            }
            aria-label="Filtrar categoria"
          >
            <option value="Todas">
              Todas as categorias
            </option>
            <option value="Digital">
              Digitais
            </option>
            <option value="Mecânica">
              Mecânicas
            </option>
          </select>

        </div>

        {/* ==================================
            CONTADOR
        ================================== */}

        <div className="comparador-contador">
          <span>
            {selecionados.length} de 3
            produtos selecionados
          </span>

          {selecionados.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setSelecionados([])
              }
            >
              Limpar seleção
            </button>
          )}
        </div>

        {/* ==================================
            CATÁLOGO
        ================================== */}

        {produtosFiltrados.length > 0 ? (
          <div className="comparador-produtos">

            {produtosFiltrados.map((produto) => {
              const selecionado =
                selecionados.includes(
                  produto.id
                );

              return (
                <button
                  key={produto.id}
                  type="button"
                  className={`comparador-produto ${
                    selecionado
                      ? "selecionado"
                      : ""
                  }`}
                  onClick={() =>
                    alternarProduto(
                      produto.id
                    )
                  }
                  disabled={
                    atingiuLimite &&
                    !selecionado
                  }
                  aria-pressed={selecionado}
                >
                  <span className="comparador-produto-icon">
                    <IconeComparar />
                  </span>

                  <span className="comparador-produto-info">
                    <strong>
                      {produto.nome}
                    </strong>

                    <small>
                      {produto.categoria}
                      {" • "}
                      Linha {produto.linha}
                    </small>
                  </span>

                  <span className={`comparador-produto-status ${
                    selecionado ? "ativo" : ""
                  }`}>
                    {selecionado
                      ? "Selecionado"
                      : "Adicionar"}
                  </span>
                </button>
              );
            })}

          </div>
        ) : (
          <div className="comparador-vazio">
            Nenhum modelo encontrado.
            Tente outra pesquisa.
          </div>
        )}

        {/* ==================================
            ÁREA DE COMPARAÇÃO
        ================================== */}

        <section className="comparador-resultado">

          <div className="comparador-section-title">
            <span className="comparador-section-bar" />

            <div>
              <h2>COMPARAÇÃO DE FECHADURAS</h2>
              <p>
                Veja as características
                dos modelos selecionados.
              </p>
            </div>
          </div>

          {produtosSelecionados.length >= 2 ? (
            <>
              <div className="comparador-tabela-rolagem">
                <table className="comparador-tabela">
                  <thead>
                    <tr>
                      <th scope="col">
                        CARACTERÍSTICAS
                      </th>

                      {produtosSelecionados.map(
                        (produto) => (
                          <th
                            scope="col"
                            key={produto.id}
                          >
                            <div className="comparador-tabela-produto">
                              <span className="comparador-tabela-categoria">
                                {produto.categoria}
                              </span>

                              <strong>
                                {produto.nome}
                              </strong>

                              <button
                                type="button"
                                onClick={() =>
                                  alternarProduto(
                                    produto.id
                                  )
                                }
                                aria-label={`Remover ${produto.nome} da comparação`}
                              >
                                <IconeFechar />
                                Remover
                              </button>
                            </div>
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {CAMPOS.map((grupo) => (
                      <FragmentoGrupo
                        key={grupo.grupo}
                        grupo={grupo}
                        produtos={
                          produtosSelecionados
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AVISO DE DADOS */}

              <div className="comparador-aviso">
                <strong>
                  Informações técnicas em atualização
                </strong>

                <p>
                  Os campos exibidos como
                  "A confirmar" ainda não possuem
                  dados oficiais cadastrados neste
                  comparador. Consulte os documentos
                  técnicos antes de informar uma
                  característica ao cliente.
                </p>
              </div>

              {/* LINKS ÚTEIS */}

              <div className="comparador-links">
                <Link to="/fichas-tecnicas">
                  Consultar fichas técnicas
                </Link>

                <Link to="/manuals">
                  Consultar manuais
                </Link>

                <Link to="/tabela-precos">
                  Consultar tabela de preços
                </Link>
              </div>
            </>
          ) : (
            <div className="comparador-instrucao">
              <span className="comparador-instrucao-icon">
                <IconeComparar />
              </span>

              <h3>
                Selecione pelo menos duas fechaduras
              </h3>

              <p>
                Adicione dois ou três modelos
                para visualizar a comparação.
              </p>
            </div>
          )}

        </section>
      </main>

      <Footer />

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

// ==========================================
// LINHAS DE COMPARAÇÃO
// ==========================================

function FragmentoGrupo({ grupo, produtos }) {
  return (
    <>
      <tr className="comparador-grupo">
        <th
          colSpan={produtos.length + 1}
          scope="colgroup"
        >
          {grupo.grupo}
        </th>
      </tr>

      {grupo.campos.map((campo) => (
        <tr key={campo.chave}>
          <th scope="row">
            {campo.titulo}
          </th>

          {produtos.map((produto) => {
            const valor = formatarValor(
              produto,
              campo.chave
            );

            return (
              <td
                key={produto.id}
                className={
                  valor === "A confirmar"
                    ? "comparador-pendente"
                    : ""
                }
              >
                {valor}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
