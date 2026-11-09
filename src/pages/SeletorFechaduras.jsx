
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/SeletorFechaduras.css";
import "../styles/SeletorFechadurasMobile.css";

// ==========================================
// CATÁLOGO INICIAL SYNTER
// ==========================================
// As informações técnicas específicas deverão
// ser acrescentadas após validação dos manuais.
// ==========================================

const PRODUTOS = [
  { nome: "Syrius S1", tipo: "digital" },
  { nome: "Syrius S1 Pro", tipo: "digital" },
  { nome: "Syrius S2 Pro", tipo: "digital" },
  { nome: "Syrius S2 Pro Neo", tipo: "digital" },
  { nome: "Syrius S2 Max", tipo: "digital" },
  { nome: "Syrius S3 Pro", tipo: "digital" },
  { nome: "Syrius S3 Max", tipo: "digital" },
  { nome: "Venus S2 Pro", tipo: "digital" },
  { nome: "Venus S3 Pro", tipo: "digital" },
  { nome: "Mars S2 Pro", tipo: "digital" },
  { nome: "Dallas S2 Pro", tipo: "digital" },
  { nome: "Dallas S3 Pro", tipo: "digital" },
  { nome: "Lyra Pro", tipo: "digital" },
  { nome: "Vega Face ID", tipo: "digital" },
  { nome: "Eris S2 Face ID", tipo: "digital" },
  { nome: "Nexus S1", tipo: "digital" },
  { nome: "Domus S1", tipo: "digital" },

  { nome: "Stillus", tipo: "mecanica" },
  { nome: "Navis", tipo: "mecanica" },
  { nome: "Navis II", tipo: "mecanica" },
  { nome: "Glorian", tipo: "mecanica" },
  { nome: "Gol", tipo: "mecanica" },
  { nome: "Star", tipo: "mecanica" },
  { nome: "Star Max", tipo: "mecanica" },
  { nome: "Polo Max", tipo: "mecanica" },
  { nome: "Marine", tipo: "mecanica" },
  { nome: "Marine II", tipo: "mecanica" },
  { nome: "Olympia", tipo: "mecanica" },
  { nome: "Crispus Max", tipo: "mecanica" },
  { nome: "Acqua Max", tipo: "mecanica" },
];

// ==========================================
// ETAPAS
// ==========================================

const ETAPAS = [
  {
    chave: "tipo",
    titulo: "Qual tipo de fechadura você procura?",
    descricao:
      "Escolha a categoria desejada para iniciar a seleção.",
    opcoes: [
      {
        valor: "digital",
        titulo: "Fechadura Digital",
        descricao:
          "Soluções com controle eletrônico de acesso.",
      },
      {
        valor: "mecanica",
        titulo: "Fechadura Mecânica",
        descricao:
          "Soluções com funcionamento mecânico.",
      },
      {
        valor: "indefinido",
        titulo: "Ainda não sei",
        descricao:
          "Quero conhecer as duas categorias.",
      },
    ],
  },
  {
    chave: "ambiente",
    titulo: "Onde a fechadura será instalada?",
    descricao:
      "O ambiente influencia os requisitos de resistência e conservação.",
    opcoes: [
      {
        valor: "interno",
        titulo: "Ambiente interno",
        descricao:
          "Quartos, escritórios e áreas internas.",
      },
      {
        valor: "externo-coberto",
        titulo: "Ambiente externo coberto",
        descricao:
          "Local protegido, sujeito às condições do ambiente.",
      },
      {
        valor: "externo-exposto",
        titulo: "Exposto ao tempo",
        descricao:
          "Sujeito à chuva, sol ou outras intempéries.",
      },
      {
        valor: "litoral",
        titulo: "Região litorânea",
        descricao:
          "Local sujeito à maresia e agentes corrosivos.",
      },
    ],
  },
  {
    chave: "finalidade",
    titulo: "Qual será a finalidade de uso?",
    descricao:
      "Informe a aplicação desejada para orientar a consulta técnica.",
    opcoes: [
      {
        valor: "residencial",
        titulo: "Residencial",
        descricao:
          "Casas, apartamentos e ambientes domésticos.",
      },
      {
        valor: "comercial",
        titulo: "Comercial",
        descricao:
          "Lojas, escritórios e estabelecimentos.",
      },
      {
        valor: "banheiro",
        titulo: "Banheiro",
        descricao:
          "Ambiente que pode exigir função específica.",
      },
      {
        valor: "outro",
        titulo: "Outra aplicação",
        descricao:
          "Situações que precisam de avaliação individual.",
      },
    ],
  },
  {
    chave: "prioridade",
    titulo: "O que é mais importante para o cliente?",
    descricao:
      "Escolha a principal preferência para registrar na consulta.",
    opcoes: [
      {
        valor: "praticidade",
        titulo: "Praticidade",
        descricao:
          "Facilidade na utilização diária.",
      },
      {
        valor: "tecnologia",
        titulo: "Tecnologia",
        descricao:
          "Interesse em recursos eletrônicos.",
      },
      {
        valor: "durabilidade",
        titulo: "Durabilidade",
        descricao:
          "Atenção à resistência e às condições de uso.",
      },
      {
        valor: "custo",
        titulo: "Custo-benefício",
        descricao:
          "Comparação entre características e valores.",
      },
    ],
  },
];

const VALOR_INICIAL = {
  tipo: "",
  ambiente: "",
  finalidade: "",
  prioridade: "",
};

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function nomeDaOpcao(chave, valor) {
  const etapa = ETAPAS.find(
    (item) => item.chave === chave
  );

  return (
    etapa?.opcoes.find(
      (opcao) => opcao.valor === valor
    )?.titulo || "Não informado"
  );
}

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

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function SeletorFechaduras() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [etapaAtual, setEtapaAtual] =
    useState(0);

  const [respostas, setRespostas] =
    useState(VALOR_INICIAL);

  const [mostrarResultado, setMostrarResultado] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [mostrarTodos, setMostrarTodos] =
    useState(false);

  const [linhaFiltro, setLinhaFiltro] = useState("todas");

  const etapa = ETAPAS[etapaAtual];

  const respostaAtual = respostas[etapa.chave];

  const progresso = mostrarResultado
    ? 100
    : ((etapaAtual + 1) / ETAPAS.length) * 100;

  // ========================================
  // FILTRAR CATÁLOGO PELA CATEGORIA
  // ========================================

  const linhasDisponiveis = useMemo(() => {
    const elegiveis = PRODUTOS.filter((produto) =>
      respostas.tipo === "indefinido" || produto.tipo === respostas.tipo
    );
    return [...new Set(elegiveis.map((produto) => produto.nome.split(" ")[0]))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [respostas.tipo]);

  const produtosCandidatos = useMemo(() => {
    const termo = pesquisa
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    return PRODUTOS.filter((produto) => {
      const atendeTipo =
        respostas.tipo === "indefinido" ||
        produto.tipo === respostas.tipo;

      const atendeLinha =
        linhaFiltro === "todas" ||
        produto.nome.split(" ")[0] === linhaFiltro;

      const nomeNormalizado = produto.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return (
        atendeTipo &&
        atendeLinha &&
        nomeNormalizado.includes(termo)
      );
    });
  }, [respostas.tipo, pesquisa, linhaFiltro]);

  const produtosExibidos = mostrarTodos
    ? produtosCandidatos
    : produtosCandidatos.slice(0, 8);

  const produtosMobileExibidos = mostrarTodos
    ? produtosCandidatos
    : produtosCandidatos.slice(0, 3);

  // ========================================
  // REGISTRAR RESPOSTA
  // ========================================

  function selecionar(valor) {
    setRespostas((anterior) => ({
      ...anterior,
      [etapa.chave]: valor,
    }));
  }

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  function avancar() {
    if (!respostaAtual) return;

    if (etapaAtual === ETAPAS.length - 1) {
      setMostrarResultado(true);
      return;
    }

    setEtapaAtual((atual) => atual + 1);
  }

  function voltar() {
    if (mostrarResultado) {
      setMostrarResultado(false);
      return;
    }

    setEtapaAtual((atual) =>
      Math.max(0, atual - 1)
    );
  }

  function reiniciar() {
    setRespostas({ ...VALOR_INICIAL });
    setEtapaAtual(0);
    setMostrarResultado(false);
    setPesquisa("");
    setMostrarTodos(false);
    setLinhaFiltro("todas");
  }

  return (
    <div className="sf-page">
      <Header />

      {/* ====================================
          HERO — PADRÃO SYNTER
      ==================================== */}

      <section className="sf-hero">
        <div className="sf-container sf-hero-inner">

          <div className="sf-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="sf-eyebrow">
            <IconeCubo />
            <span>FERRAMENTAS COMERCIAIS</span>
          </div>

          <h1>Seletor de Fechaduras</h1>

          <p className="sf-hero-description">
            Encontre modelos Synter para avaliar
            conforme as necessidades do cliente,
            com uma seleção simples e orientada.
          </p>
        </div>
      </section>

      {/* ====================================
          CONTEÚDO
      ==================================== */}

      <main className="sf-container sf-main">

        <div className="sf-section-heading">
          <span className="sf-section-bar" />

          <div>
            <h2>SELEÇÃO GUIADA</h2>
            <p>
              Responda às perguntas para iniciar
              a consulta de produtos.
            </p>
          </div>
        </div>

        <section className="sf-wizard">

          {/* PROGRESSO */}

          <div className="sf-progress-header">
            <span>
              {mostrarResultado
                ? "Seleção concluída"
                : `Etapa ${etapaAtual + 1} de ${ETAPAS.length}`}
            </span>

            <strong>
              {Math.round(progresso)}%
            </strong>
          </div>

          <div
            className="sf-progress-track"
            role="progressbar"
            aria-label="Progresso da seleção"
            aria-valuenow={progresso}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="sf-progress-fill"
              style={{
                width: `${progresso}%`,
              }}
            />
          </div>

          {!mostrarResultado ? (
            <>
              {/* PERGUNTA */}

              <div className="sf-question">
                <span className="sf-step-label">
                  PERGUNTA 0{etapaAtual + 1}
                </span>

                <h3>{etapa.titulo}</h3>
                <p>{etapa.descricao}</p>
              </div>

              {/* OPÇÕES */}

              <div className="sf-options">
                {etapa.opcoes.map((opcao) => {
                  const selecionada =
                    respostaAtual === opcao.valor;

                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      className={`sf-option ${
                        selecionada
                          ? "sf-option-selected"
                          : ""
                      }`}
                      onClick={() =>
                        selecionar(opcao.valor)
                      }
                      aria-pressed={selecionada}
                    >
                      <span className="sf-option-radio">
                        {selecionada && (
                          <span />
                        )}
                      </span>

                      <span className="sf-option-content">
                        <strong>
                          {opcao.titulo}
                        </strong>

                        <small>
                          {opcao.descricao}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* NAVEGAÇÃO */}

              <div className="sf-actions">
                <button
                  type="button"
                  className="sf-button sf-button-secondary"
                  onClick={voltar}
                  disabled={etapaAtual === 0}
                >
                  Voltar
                </button>

                <button
                  type="button"
                  className="sf-button sf-button-primary"
                  onClick={avancar}
                  disabled={!respostaAtual}
                >
                  {etapaAtual === ETAPAS.length - 1
                    ? "Ver modelos"
                    : "Continuar"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* =================================
                  RESULTADO
              ================================= */}

              <div className="sf-result-title">
                <span className="sf-step-label">
                  CONSULTA CONCLUÍDA
                </span>

                <h3>Modelos para avaliação</h3>

                <p>
                  Veja os produtos da categoria
                  selecionada e confirme as
                  especificações oficiais antes
                  de indicar um modelo ao cliente.
                </p>
              </div>

              {/* RESUMO */}

              <div className="sf-summary sf-summary-desktop">
                {ETAPAS.map((item) => (
                  <div key={item.chave} className="sf-summary-item">
                    <span>{item.chave === "tipo" ? "Tipo" : item.chave === "ambiente" ? "Ambiente" : item.chave === "finalidade" ? "Finalidade" : "Prioridade"}</span>
                    <strong>{nomeDaOpcao(item.chave, respostas[item.chave])}</strong>
                  </div>
                ))}
              </div>

              <details className="sf-mobile-details sf-summary-mobile">
                <summary>Ver respostas da seleção <span>4 critérios</span></summary>
                <div className="sf-mobile-summary-list">
                  {ETAPAS.map((item) => (
                    <div key={item.chave}>
                      <span>{item.chave === "tipo" ? "Tipo" : item.chave === "ambiente" ? "Ambiente" : item.chave === "finalidade" ? "Finalidade" : "Prioridade"}</span>
                      <strong>{nomeDaOpcao(item.chave, respostas[item.chave])}</strong>
                    </div>
                  ))}
                </div>
              </details>

              {/* INFORMAÇÃO DE SEGURANÇA */}

              <div className="sf-notice sf-notice-desktop">
                <strong>Verificação técnica necessária</strong>
                <p>
                  Esta versão seleciona produtos pela categoria. Ambiente,
                  finalidade e prioridade são registrados, mas ainda não
                  eliminam modelos por compatibilidade. Antes de recomendar
                  ou instalar, confirme as informações nos manuais e fichas
                  técnicas, especialmente para áreas externas e litorâneas.
                </p>
              </div>

              <details className="sf-mobile-details sf-notice-mobile">
                <summary>Verificação técnica necessária <span>Leia antes de indicar</span></summary>
                <p>
                  Esta versão seleciona produtos pela categoria. Ambiente,
                  finalidade e prioridade são registrados, mas ainda não
                  eliminam modelos por compatibilidade. Antes de recomendar
                  ou instalar, confirme as informações nos manuais e fichas
                  técnicas, especialmente para áreas externas e litorâneas.
                </p>
              </details>

              {/* PESQUISA */}

              <div className="sf-result-tools">
                <h4>
                  CATÁLOGO DE MODELOS
                </h4>

                <div className="sf-catalog-filters">
                  <input
                    type="search"
                    value={pesquisa}
                    onChange={(evento) => {
                      setPesquisa(evento.target.value);
                      setMostrarTodos(false);
                    }}
                    placeholder="Pesquisar modelo..."
                    aria-label="Pesquisar modelos"
                  />
                  <label className="sf-line-filter">
                    <span>Linha</span>
                    <select
                      value={linhaFiltro}
                      onChange={(evento) => {
                        setLinhaFiltro(evento.target.value);
                        setMostrarTodos(false);
                      }}
                    >
                      <option value="todas">Todas as linhas</option>
                      {linhasDisponiveis.map((linha) => (
                        <option key={linha} value={linha}>{linha}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="sf-filter-clear"
                    onClick={() => {
                      setPesquisa("");
                      setLinhaFiltro("todas");
                      setMostrarTodos(false);
                    }}
                  >Limpar</button>
                </div>
                <span className="sf-result-count">
                  {produtosCandidatos.length} modelos encontrados
                </span>
              </div>

              {/* PRODUTOS */}

              {produtosCandidatos.length > 0 ? (
                <>
                  <div className="sf-product-grid sf-product-grid-desktop">
                    {produtosExibidos.map(
                      (produto) => (
                        <article
                          key={produto.nome}
                          className="sf-product-card"
                        >
                          <span className="sf-product-icon">
                            <IconeCubo />
                          </span>

                          <span className="sf-product-info">
                            <small>
                              {produto.tipo === "digital"
                                ? "FECHADURA DIGITAL"
                                : "FECHADURA MECÂNICA"}
                            </small>

                            <strong>
                              {produto.nome}
                            </strong>

                            <span>
                              Consultar especificações
                            </span>
                          </span>
                        </article>
                      )
                    )}
                  </div>

                  <div className="sf-product-grid sf-product-grid-mobile">
                    {produtosMobileExibidos.map((produto) => (
                      <article key={produto.nome} className="sf-product-card">
                        <span className="sf-product-icon"><IconeCubo /></span>
                        <span className="sf-product-info">
                          <small>{produto.tipo === "digital" ? "FECHADURA DIGITAL" : "FECHADURA MECÂNICA"}</small>
                          <strong>{produto.nome}</strong>
                          <span>Consulte os documentos abaixo</span>
                        </span>
                      </article>
                    ))}
                  </div>

                  {produtosCandidatos.length > 8 && (
                    <button
                      type="button"
                      className="sf-show-more sf-show-more-desktop"
                      onClick={() =>
                        setMostrarTodos((atual) => !atual)
                      }
                    >
                      {mostrarTodos
                        ? "Mostrar menos"
                        : `Ver todos os ${produtosCandidatos.length} modelos`}
                    </button>
                  )}

                  {produtosCandidatos.length > 3 && (
                    <button
                      type="button"
                      className="sf-show-more sf-show-more-mobile"
                      onClick={() => setMostrarTodos((atual) => !atual)}
                    >
                      {mostrarTodos ? "Mostrar menos" : `Ver mais ${produtosCandidatos.length - 3} modelos`}
                    </button>
                  )}
                </>
              ) : (
                <div className="sf-empty">
                  Nenhum modelo encontrado para
                  a pesquisa informada.
                </div>
              )}

              {/* DOCUMENTAÇÃO */}

              <div className="sf-reference-links">
                <Link to="/fichas-tecnicas">
                  Fichas Técnicas
                </Link>

                <Link to="/manuals">
                  Manuais de Produtos
                </Link>

                <Link to="/tabela-precos">
                  Tabela de Preços
                </Link>
              </div>

              {/* VOLTAR / REINICIAR */}

              <div className="sf-actions">
                <button
                  type="button"
                  className="sf-button sf-button-secondary"
                  onClick={voltar}
                >
                  Alterar respostas
                </button>

                <button
                  type="button"
                  className="sf-button sf-button-primary"
                  onClick={reiniciar}
                >
                  Nova seleção
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />

      {/* PERFIL */}

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
