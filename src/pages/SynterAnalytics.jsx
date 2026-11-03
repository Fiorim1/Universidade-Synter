
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";

import "../styles/SynterAnalytics.css";

// ========================================
// SYNTER ANALYTICS
// RELATÓRIO GERENCIAL DE ATENDIMENTOS
// INTEGRADO AO NOTION
// ========================================

const CORES = [
  "#ffffff",
  "#bcbcc4",
  "#81818b",
  "#51515c",
];

const TAMANHO_LOTE = 4;
const MAX_TENTATIVAS = 3;

// ========================================
// DATAS
// ========================================

function dataLocal(data = new Date()) {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function somarDias(valor, quantidade) {
  const data = new Date(
    `${valor}T12:00:00`
  );

  data.setDate(
    data.getDate() + quantidade
  );

  return dataLocal(data);
}

function obterPeriodo(tipo, referencia) {
  const data = new Date(
    `${referencia}T12:00:00`
  );

  const ano = data.getFullYear();
  const mes = data.getMonth();

  if (tipo === "ano") {
    return {
      inicio: `${ano}-01-01`,
      fim: `${ano + 1}-01-01`,
      titulo: `Ano de ${ano}`,
    };
  }

  if (tipo === "semana") {
    const deslocamento =
      (data.getDay() + 6) % 7;

    const inicio = somarDias(
      referencia,
      -deslocamento
    );

    return {
      inicio,
      fim: somarDias(inicio, 7),
      titulo: "Análise semanal",
    };
  }

  return {
    inicio: dataLocal(
      new Date(ano, mes, 1)
    ),

    fim: dataLocal(
      new Date(ano, mes + 1, 1)
    ),

    titulo: data.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    ),
  };
}

function formatarData(valor) {
  if (!valor) return "-";

  const [ano, mes, dia] =
    valor.split("-");

  return `${dia}/${mes}/${ano}`;
}

function percentual(valor, total) {
  if (!total) return "—";

  return `${(
    (valor / total) *
    100
  ).toFixed(1)}%`;
}

function diferencaDias(inicio, fim) {
  if (
    !inicio ||
    !fim ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      inicio.slice(0, 10)
    ) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      fim.slice(0, 10)
    )
  ) {
    return null;
  }

  const a = Date.parse(
    `${inicio.slice(0, 10)}T00:00:00Z`
  );

  const b = Date.parse(
    `${fim.slice(0, 10)}T00:00:00Z`
  );

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    b < a
  ) {
    return null;
  }

  return Math.round(
    (b - a) / 86400000
  );
}

// ========================================
// NORMALIZAÇÃO E AGRUPAMENTO
// ========================================

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function agrupar(lista, campo) {
  const mapa = new Map();

  for (const item of lista) {
    const bruto = item[campo];

    const valores = Array.isArray(bruto)
      ? bruto
      : [bruto];

    // Um chamado conta apenas uma vez
    // por categoria ou modelo.

    const unicos = new Set(
      valores
        .map((valor) =>
          String(valor ?? "").trim()
        )
        .filter((valor) => {
          const texto = normalizar(valor);

          return (
            texto &&
            ![
              "nao informado",
              "nao informada",
              "n/a",
              "-",
            ].includes(texto)
          );
        })
    );

    for (const nome of unicos) {
      mapa.set(
        nome,
        (mapa.get(nome) || 0) + 1
      );
    }
  }

  return [...mapa.entries()]
    .map(([nome, total]) => ({
      nome,
      total,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.nome.localeCompare(b.nome)
    );
}

// ========================================
// CALCULAR INDICADORES DOS CHAMADOS
// ========================================

function indicadoresDosChamados(chamados) {
  const laudos = {
    Procedente: 0,
    Improcedente: 0,
    "Com cobrança": 0,
    "Sem laudo": 0,
  };

  let finalizados = 0;
  let pendentes = 0;

  const temposResolucao = [];

  for (const chamado of chamados) {
    // ------------------------------------
    // PROCEDÊNCIA
    // ------------------------------------

    const laudo = normalizar(
      chamado.laudo
    );

    if (laudo === "procedente") {
      laudos.Procedente++;
    } else if (
      laudo === "improcedente"
    ) {
      laudos.Improcedente++;
    } else if (
      laudo === "com cobranca"
    ) {
      laudos["Com cobrança"]++;
    } else {
      laudos["Sem laudo"]++;
    }

    // ------------------------------------
    // STATUS
    // ------------------------------------

    const status = normalizar(
      chamado.status
    );

    const encerrado =
      /finalizad|concluid|encerrad|resolvid/.test(
        status
      );

    if (encerrado) {
      finalizados++;
    } else {
      pendentes++;
    }

    // ------------------------------------
    // TEMPO DE RESOLUÇÃO
    //
    // Calculado em dias corridos
    // pelas datas de início e conclusão.
    // ------------------------------------

    if (encerrado) {
      const dias = diferencaDias(
        chamado.data,
        chamado.dataConclusao
      );

      if (dias !== null) {
        temposResolucao.push(dias);
      }
    }
  }

  const mediaResolucao =
    temposResolucao.length > 0
      ? temposResolucao.reduce(
          (soma, dias) =>
            soma + dias,
          0
        ) / temposResolucao.length
      : null;

  const comProduto = chamados.filter(
    (item) =>
      Boolean(item.produto) &&
      normalizar(item.produto) !==
        "nao informado"
  ).length;

  const classificados = chamados.filter(
    (item) =>
      Array.isArray(item.categorias) &&
      item.categorias.length > 0
  ).length;

  const comDuvida = chamados.filter(
    (item) => Boolean(item.duvida)
  ).length;

  const comLaudo =
    laudos.Procedente +
    laudos.Improcedente +
    laudos["Com cobrança"];

  return {
    total: chamados.length,

    laudos,

    finalizados,
    pendentes,

    mediaResolucao,

    temposCalculados:
      temposResolucao.length,

    produtos: agrupar(
      chamados,
      "produto"
    ),

    problemas: agrupar(
      chamados,
      "categorias"
    ),

    tiposProblema: agrupar(
      chamados,
      "tipoProblema"
    ),

    sintomas: agrupar(
      chamados,
      "sintoma"
    ),

    duvidas: agrupar(
      chamados,
      "duvida"
    ),

    responsaveis: agrupar(
      chamados,
      "responsavel"
    ),

    tipos: agrupar(
      chamados,
      "tipo"
    ),

    modalidades: agrupar(
      chamados.map((chamado) => {
        const tipo = normalizar(chamado.atendimento);

        return {
          ...chamado,
          atendimento:
            tipo === "assistencia tecnica"
              ? "Assistência técnica"
              : tipo === "suporte tecnico"
                ? "Suporte técnico"
                : chamado.atendimento,
        };
      }),
      "atendimento"
    ),

    status: agrupar(
      chamados,
      "status"
    ),

    porDia: agrupar(
      chamados,
      "data"
    ).sort(
      (a, b) =>
        a.nome.localeCompare(b.nome)
    ),

    cobertura: {
      produtos: comProduto,

      classificados,

      comDuvida,

      comLaudo,

      comSintoma: chamados.filter(
        (c) => Boolean(c.sintoma)
      ).length,

      comResponsavel: chamados.filter(
        (c) => Boolean(c.responsavel)
      ).length,

      comRelato: chamados.filter(
        (c) => Boolean(c.relato)
      ).length,

      comSolucao: chamados.filter(
        (c) => Boolean(c.solucao)
      ).length,
    },
  };
}

// ========================================
// COMPONENTES DO PAINEL
// ========================================

function Cartao({
  titulo,
  valor,
  descricao,
}) {
  return (
    <div className="sa-kpi">
      <div className="sa-kpi-top">
        <span>{titulo}</span>

        <span className="sa-kpi-icon">
          ◈
        </span>
      </div>

      <strong>{valor}</strong>

      <p>{descricao}</p>
    </div>
  );
}

function BlocoGrafico({
  titulo,
  descricao,
  children,
  amplo = false,
}) {
  return (
    <section
      className={`sa-chart-card ${
        amplo ? "sa-chart-wide" : ""
      }`}
    >
      <div className="sa-chart-header">
        <h2>{titulo}</h2>
        <p>{descricao}</p>
      </div>

      <div className="sa-chart-content">
        {children}
      </div>
    </section>
  );
}

function Ranking({
  dados = [],
  vazio,
}) {
  if (!dados.length) {
    return (
      <div className="sa-empty">
        <p>{vazio}</p>
      </div>
    );
  }

  const maior = dados[0].total || 1;

  return (
    <div className="sa-ranking">
      {dados.slice(0, 8).map(
        (item, indice) => (
          <div
            className="sa-ranking-item"
            key={`${item.nome}-${indice}`}
          >
            <div className="sa-ranking-top">
              <span>
                <small>
                  {String(
                    indice + 1
                  ).padStart(2, "0")}
                </small>

                {item.nome}
              </span>

              <strong>
                {item.total}
              </strong>
            </div>

            <div className="sa-progress">
              <div
                style={{
                  width: `${
                    (item.total / maior) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

const estiloTooltip = {
  background: "#17171b",
  border: "1px solid #393940",
  borderRadius: 12,
  color: "#ffffff",
};

// ========================================
// COMUNICAÇÃO COM API EXISTENTE
// ========================================

async function chamarAPI(
  token,
  options = {},
  signal
) {
  const params = new URLSearchParams();

  if (options.cursor) {
    params.set(
      "cursor",
      options.cursor
    );
  }

  const endpoint =
    "/api/synter-analytics" +
    (params.toString()
      ? `?${params.toString()}`
      : "");

  const resposta = await fetch(
    endpoint,
    {
      method: options.ids
        ? "POST"
        : "GET",

      signal,

      headers: {
        Authorization:
          `Bearer ${token}`,

        ...(options.ids
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
      },

      ...(options.ids
        ? {
            body: JSON.stringify({
              ids: options.ids,
            }),
          }
        : {}),
    }
  );

  let resultado;

  try {
    resultado = await resposta.json();
  } catch {
    throw new Error(
      "A API não retornou uma resposta JSON válida."
    );
  }

  if (!resposta.ok) {
    throw new Error(
      resultado.error ||
        `Erro HTTP ${resposta.status}.`
    );
  }

  return resultado;
}

// ========================================
// PROCESSAR CHAMADOS EM LOTES
//
// Garante:
// - Nenhum ID ignorado
// - Sem chamados duplicados
// - Novas tentativas por falha
// ========================================

async function processarLote({
  token,
  lote,
  signal,
}) {
  const concluidos = new Map();

  let pendentes = [
    ...new Set(
      lote.map((item) => item.id)
    ),
  ];

  let ultimoErro = "";

  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS &&
    pendentes.length > 0;
    tentativa++
  ) {
    if (signal.aborted) {
      return {
        concluidos: [],
        falhas: pendentes,
        ultimoErro: "Cancelado",
      };
    }

    try {
      const resposta = await chamarAPI(
        token,
        { ids: pendentes },
        signal
      );

      if (
        !Array.isArray(
          resposta.resultados
        )
      ) {
        throw new Error(
          "A API não retornou a lista de resultados."
        );
      }

      const solicitados =
        new Set(pendentes);

      const recebidos =
        new Set();

      const proximos = [];

      for (
        const item of
        resposta.resultados
      ) {
        if (
          !item?.id ||
          !solicitados.has(item.id) ||
          recebidos.has(item.id)
        ) {
          continue;
        }

        recebidos.add(item.id);

        if (
          item.sucesso === true &&
          item.chamado?.id === item.id &&
          item.chamado?.leituraCompleta === true
        ) {
          concluidos.set(
            item.id,
            item.chamado
          );
        } else {
          proximos.push(
            item.id
          );
        }
      }

      // Também tenta novamente
      // IDs ausentes da resposta.

      for (const id of pendentes) {
        if (!recebidos.has(id)) {
          proximos.push(id);
        }
      }

      pendentes = [
        ...new Set(proximos),
      ].filter(
        (id) =>
          !concluidos.has(id)
      );

    } catch (error) {
      if (
        signal.aborted ||
        error.name === "AbortError"
      ) {
        throw error;
      }

      ultimoErro =
        error.message ||
        "Falha na leitura do lote.";

      console.error(
        `Tentativa ${tentativa}/${MAX_TENTATIVAS}:`,
        ultimoErro
      );
    }
  }

  return {
    concluidos: [
      ...concluidos.values(),
    ],

    falhas: pendentes,

    ultimoErro,
  };
}

// ========================================
// SYNTER ANALYTICS — COMPONENTE PRINCIPAL
// ========================================

export default function SynterAnalytics() {
  const [
    periodoTipo,
    setPeriodoTipo,
  ] = useState("mes");

  const [
    referencia,
    setReferencia,
  ] = useState(dataLocal());

  const [
    atualizar,
    setAtualizar,
  ] = useState(0);

  const [
    dados,
    setDados,
  ] = useState(null);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    progresso,
    setProgresso,
  ] = useState({
    etapa: "",
    total: 0,
    processados: 0,
    lidos: 0,
    falhas: 0,
  });

  const periodo = useMemo(
    () =>
      obterPeriodo(
        periodoTipo,
        referencia
      ),
    [
      periodoTipo,
      referencia,
    ]
  );

  // ========================================
  // CONSULTA TODOS OS CHAMADOS
  // ========================================

  useEffect(() => {
    const controller =
      new AbortController();

    const signal =
      controller.signal;

    async function iniciarAnalise() {
      setCarregando(true);
      setErro("");
      setDados(null);

      setProgresso({
        etapa:
          "Conectando ao Notion...",
        total: 0,
        processados: 0,
        lidos: 0,
        falhas: 0,
      });

      try {
        // ------------------------------------
        // VALIDAR SESSÃO
        // ------------------------------------

        const {
          data: { session },
          error: erroSessao,
        } = await supabase.auth.getSession();

        if (
          erroSessao ||
          !session?.access_token
        ) {
          throw new Error(
            "Sua sessão expirou. Faça login novamente."
          );
        }

        const token =
          session.access_token;

        // ------------------------------------
        // LISTAR TODAS AS PÁGINAS
        // ------------------------------------

        const todos = [];
        const idsEncontrados =
          new Set();

        const cursoresConsultados =
          new Set();

        let cursor;
        let temMais = true;

        while (temMais) {
          if (signal.aborted) return;

          if (
            cursor &&
            cursoresConsultados.has(
              cursor
            )
          ) {
            throw new Error(
              "O Notion retornou uma paginação repetida."
            );
          }

          if (cursor) {
            cursoresConsultados.add(
              cursor
            );
          }

          const resposta =
            await chamarAPI(
              token,
              { cursor },
              signal
            );

          if (
            !Array.isArray(
              resposta.chamados
            )
          ) {
            throw new Error(
              "A listagem de chamados retornou um formato inválido."
            );
          }

          for (
            const chamado of
            resposta.chamados
          ) {
            if (
              chamado?.id &&
              !idsEncontrados.has(
                chamado.id
              )
            ) {
              idsEncontrados.add(
                chamado.id
              );

              todos.push(
                chamado
              );
            }
          }

          temMais = Boolean(
            resposta.has_more
          );

          cursor =
            resposta.next_cursor;

          if (
            temMais &&
            !cursor
          ) {
            throw new Error(
              "Paginação incompleta do Notion."
            );
          }

          setProgresso({
            etapa:
              `${todos.length} chamados localizados na base...`,
            total: 0,
            processados: 0,
            lidos: 0,
            falhas: 0,
          });
        }

        // ------------------------------------
        // FILTRAR O PERÍODO
        // ------------------------------------

        const selecionados =
          todos.filter(
            (chamado) =>
              typeof chamado.data === "string" &&
              chamado.data >= periodo.inicio &&
              chamado.data < periodo.fim
          );

        // ------------------------------------
        // LER CADA CHAMADO
        // ------------------------------------

        const completos =
          new Map();

        const falhas =
          new Set();

        for (
          let indice = 0;
          indice <
            selecionados.length;
          indice +=
            TAMANHO_LOTE
        ) {
          if (signal.aborted) return;

          const lote =
            selecionados.slice(
              indice,
              indice + TAMANHO_LOTE
            );

          const resultado =
            await processarLote({
              token,
              lote,
              signal,
            });

          for (
            const chamado of
            resultado.concluidos
          ) {
            completos.set(
              chamado.id,
              chamado
            );

            falhas.delete(
              chamado.id
            );
          }

          for (
            const id of
            resultado.falhas
          ) {
            if (
              !completos.has(id)
            ) {
              falhas.add(id);
            }
          }

          setProgresso({
            etapa:
              "Analisando relatos, produtos, categorias e pareceres...",
            total:
              selecionados.length,

            processados:
              indice + lote.length,

            lidos:
              completos.size,

            falhas:
              falhas.size,
          });
        }

        if (signal.aborted) return;

        // ------------------------------------
        // CONFERÊNCIA FINAL DOS IDS
        // ------------------------------------

        for (
          const chamado of
          selecionados
        ) {
          if (
            !completos.has(
              chamado.id
            )
          ) {
            falhas.add(
              chamado.id
            );
          }
        }

        const chamadosCompletos =
          [...completos.values()];

        const indicadores =
          indicadoresDosChamados(
            chamadosCompletos
          );

        const completo =
          completos.size ===
            selecionados.length &&
          falhas.size === 0;

        setDados({
          indicadores,

          totalEsperado:
            selecionados.length,

          totalLido:
            completos.size,

          falhas:
            [...falhas],

          completo,

          atualizadoEm:
            new Date().toISOString(),
        });

      } catch (error) {
        if (
          signal.aborted ||
          error.name === "AbortError"
        ) {
          return;
        }

        setErro(
          error.message ||
          "Não foi possível consultar os chamados."
        );
      } finally {
        if (!signal.aborted) {
          setCarregando(false);
        }
      }
    }

    iniciarAnalise();

    return () =>
      controller.abort();

  }, [
    periodo.inicio,
    periodo.fim,
    atualizar,
  ]);

  // ========================================
  // INDICADORES EXIBIDOS
  // ========================================

  const indicadores =
    dados?.indicadores;

  const total =
    indicadores?.total || 0;

  const laudos =
    indicadores?.laudos || {};

  const procedentes =
    laudos.Procedente || 0;

  const improcedentes =
    laudos.Improcedente || 0;

  const cobranca =
    laudos["Com cobrança"] || 0;

  const semLaudo =
    laudos["Sem laudo"] || 0;

  const problemas =
    indicadores?.problemas || [];

  const produtos =
    indicadores?.produtos || [];

  const duvidas =
    indicadores?.duvidas || [];

  const sintomas =
    indicadores?.sintomas || [];

  const responsaveis =
    indicadores?.responsaveis || [];

  const evolucao =
    indicadores?.porDia || [];

  const cobertura =
    indicadores?.cobertura || {};

  const finalizados =
    indicadores?.finalizados || 0;

  const pendentes =
    indicadores?.pendentes || 0;

  const mediaResolucao =
    indicadores?.mediaResolucao;

  const podeConcluir =
    dados?.completo === true;

  const laudosConcluidos =
    procedentes +
    improcedentes +
    cobranca;

  const principalProblema =
    problemas[0];

  const principalProduto =
    produtos[0];

  const principalDuvida =
    duvidas[0];

  const laudosGrafico = [
    {
      nome: "Procedentes",
      total: procedentes,
    },
    {
      nome: "Improcedentes",
      total: improcedentes,
    },
    {
      nome: "Com cobrança",
      total: cobranca,
    },
    {
      nome: "Sem laudo",
      total: semLaudo,
    },
  ].filter(
    (item) =>
      item.total > 0
  );

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="sa-page">
      <Header />

      <main className="sa-container">

        {/* ====================================
            CABEÇALHO
        ==================================== */}

        <header className="sa-header">
          <div>
            <span className="sa-eyebrow">
              UNIVERSIDADE SYNTER / INTELIGÊNCIA GERENCIAL
            </span>

            <h1>
              Synter{" "}
              <span>
                Analytics.
              </span>
            </h1>

            <p>
              Indicadores estratégicos de qualidade,
              desempenho do SAC e análise completa
              dos atendimentos técnicos registrados
              na plataforma Notion.
            </p>
          </div>
        </header>

        {/* ====================================
            FILTROS
        ==================================== */}

        <section className="sa-filters">
          <div className="sa-filter-buttons">
            {[
              ["semana", "Semanal"],
              ["mes", "Mensal"],
              ["ano", "Anual"],
            ].map(
              ([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  className={
                    periodoTipo === valor
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriodoTipo(valor)
                  }
                >
                  {texto}
                </button>
              )
            )}
          </div>

          <div className="sa-filter-actions">
            <label className="sa-date-filter">
              <span>
                Data de referência
              </span>

              <input
                type="date"
                value={referencia}
                onChange={(event) =>
                  setReferencia(
                    event.target.value ||
                    dataLocal()
                  )
                }
              />
            </label>

            <button
              type="button"
              className="sa-refresh"
              disabled={carregando}
              onClick={() =>
                setAtualizar(
                  (v) => v + 1
                )
              }
            >
              {carregando
                ? "Analisando..."
                : "Atualizar análise"}
            </button>
          </div>
        </section>

        <div className="sa-period-caption">
          <span>
            {periodo.titulo}
            {" • "}
            {formatarData(
              periodo.inicio
            )}
            {" até "}
            {formatarData(
              somarDias(
                periodo.fim,
                -1
              )
            )}
          </span>

          <span>
            Fonte oficial: Notion
          </span>
        </div>

        {/* ====================================
            CARREGAMENTO
        ==================================== */}

        {carregando && (
          <div className="sa-notice">
            <strong>
              Análise dos chamados em andamento
            </strong>

            <p>
              {progresso.etapa}
            </p>

            {progresso.total > 0 && (
              <>
                <div className="sa-progress">
                  <div
                    style={{
                      width: `${
                        (
                          progresso.processados /
                          progresso.total
                        ) * 100
                      }%`,
                    }}
                  />
                </div>

                <p>
                  {progresso.lidos} de{" "}
                  {progresso.total} chamados
                  lidos com sucesso.
                  {progresso.falhas > 0 &&
                    ` ${progresso.falhas} com falha de leitura.`}
                </p>
              </>
            )}
          </div>
        )}

        {/* ====================================
            ERROS
        ==================================== */}

        {erro && (
          <div
            className="sa-error"
            role="alert"
          >
            <strong>
              Não foi possível carregar o relatório.
            </strong>

            <p>{erro}</p>

            <button
              type="button"
              className="sa-refresh"
              onClick={() =>
                setAtualizar(
                  (v) => v + 1
                )
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* ====================================
            RESULTADOS
        ==================================== */}

        {!carregando && dados && (
          <>

            {/* ====================================
                INTEGRIDADE DA ANÁLISE
            ==================================== */}

            <section className="sa-summary">
              <span className="sa-eyebrow">
                CONTROLE DE INTEGRIDADE
              </span>

              <h2>
                Conferência dos Registros
              </h2>

              <div className="sa-data-coverage">
                <div>
                  <span>
                    Chamados encontrados
                  </span>

                  <strong>
                    {dados.totalEsperado}
                  </strong>
                </div>

                <div>
                  <span>
                    Chamados analisados
                  </span>

                  <strong>
                    {dados.totalLido}
                  </strong>
                </div>

                <div>
                  <span>
                    Falhas de leitura
                  </span>

                  <strong>
                    {dados.falhas.length}
                  </strong>
                </div>
              </div>

              <p className="sa-summary-disclaimer">
                {podeConcluir
                  ? "Todos os chamados do período foram consultados individualmente. A disponibilidade das informações depende do preenchimento dos campos no Notion."
                  : "Existem chamados que não puderam ser lidos. Os indicadores abaixo são parciais e não devem ser utilizados como fechamento gerencial definitivo."}
              </p>

              {!podeConcluir && (
                <button
                  type="button"
                  className="sa-refresh"
                  onClick={() =>
                    setAtualizar(
                      (v) => v + 1
                    )
                  }
                >
                  Reprocessar análise
                </button>
              )}
            </section>

            {/* ====================================
                INDICADORES PRINCIPAIS
            ==================================== */}

            <div className="sa-kpi-grid">
              <Cartao
                titulo="Chamados analisados"
                valor={total}
                descricao="Registros consultados no período."
              />

              <Cartao
                titulo="Atendimentos finalizados"
                valor={finalizados}
                descricao="Chamados com status de conclusão."
              />

              <Cartao
                titulo="Atendimentos não finalizados"
                valor={pendentes}
                descricao="Inclui registros sem status reconhecido."
              />

              <Cartao
                titulo="Tempo médio de resolução"
                valor={
                  mediaResolucao === null ||
                  mediaResolucao === undefined
                    ? "—"
                    : `${mediaResolucao.toFixed(1)} dias`
                }
                descricao={`Dias corridos com datas válidas (${indicadores.temposCalculados} chamados).`}
              />

              <Cartao
                titulo="Laudos procedentes"
                valor={procedentes}
                descricao="Procedência registrada no Notion."
              />

              <Cartao
                titulo="Laudos improcedentes"
                valor={improcedentes}
                descricao="Improcedência registrada no Notion."
              />

              <Cartao
                titulo="Com cobrança"
                valor={cobranca}
                descricao="Chamados com esse parecer registrado."
              />

              <Cartao
                titulo="Sem laudo identificado"
                valor={semLaudo}
                descricao="Sem parecer final reconhecido."
              />
            </div>

            {/* ====================================
                RESUMO EXECUTIVO
            ==================================== */}

            <section className="sa-summary">
              <div className="sa-summary-heading">
                <span className="sa-eyebrow">
                  VISÃO ESTRATÉGICA DE QUALIDADE E ATENDIMENTO
                </span>

                <h2>
                  Resumo Executivo do Período
                </h2>

                <p className="sa-executive-description">
                  Indicadores consolidados dos
                  atendimentos, principais
                  ocorrências e oportunidades
                  de melhoria identificadas.
                </p>
              </div>

              <div className="sa-summary-grid">
                <div className="sa-summary-item">
                  <span>
                    01 / PROBLEMA MAIS RECORRENTE
                  </span>

                  <strong>
                    {principalProblema?.nome ||
                      "Classificação indisponível"}
                  </strong>

                  <p>
                    {principalProblema
                      ? `${principalProblema.total} atendimento(s) classificados nesta categoria.`
                      : "Nenhum problema foi classificado nos registros lidos."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    02 / PRODUTO MAIS CITADO
                  </span>

                  <strong>
                    {principalProduto?.nome ||
                      "Modelo não identificado"}
                  </strong>

                  <p>
                    {principalProduto
                      ? `${principalProduto.total} chamado(s) envolvendo este produto.`
                      : "Os registros não apresentaram modelos identificáveis."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    03 / DÚVIDA MAIS FREQUENTE
                  </span>

                  <strong>
                    {principalDuvida?.nome ||
                      "Sem dúvida identificada"}
                  </strong>

                  <p>
                    {principalDuvida
                      ? `${principalDuvida.total} atendimento(s) relacionados a esta dúvida.`
                      : "Não foram reconhecidas dúvidas suficientes para um ranking."}
                  </p>
                </div>
              </div>

              {/* COBERTURA DOS DADOS */}

              <div className="sa-data-coverage">
                <div>
                  <span>
                    Modelos identificados
                  </span>

                  <strong>
                    {cobertura.produtos || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>

                <div>
                  <span>
                    Problemas classificados
                  </span>

                  <strong>
                    {cobertura.classificados || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>

                <div>
                  <span>
                    Pareceres identificados
                  </span>

                  <strong>
                    {cobertura.comLaudo || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>
              </div>

              <p className="sa-summary-disclaimer">
                Os rankings de problemas representam
                os tipos de ocorrência registrados.
                Eles não equivalem automaticamente
                a defeitos de fabricação confirmados.
              </p>
            </section>

            {/* ====================================
                GRÁFICOS
            ==================================== */}

            <div className="sa-charts-grid">

              {/* PRINCIPAIS PROBLEMAS */}

              <BlocoGrafico
                titulo="Principais tipos de problema"
                descricao="Ranking baseado nas classificações registradas no Notion."
              >
                {problemas.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={330}
                  >
                    <BarChart
                      data={problemas.slice(0, 8)}
                      layout="vertical"
                      margin={{
                        left: 10,
                        right: 20,
                      }}
                    >
                      <CartesianGrid
                        stroke="#29292e"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#a0a0a8"
                        fontSize={11}
                      />

                      <YAxis
                        type="category"
                        dataKey="nome"
                        width={145}
                        stroke="#b0b0ba"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={estiloTooltip}
                      />

                      <Bar
                        dataKey="total"
                        name="Chamados"
                        fill="#ffffff"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="sa-empty">
                    <p>
                      Nenhuma classificação de problema
                      foi identificada no período.
                    </p>
                  </div>
                )}
              </BlocoGrafico>

              {/* PROCEDÊNCIA */}

              <BlocoGrafico
                titulo="Procedência dos atendimentos"
                descricao="Distribuição dos pareceres oficiais registrados."
              >
                {laudosGrafico.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={330}
                  >
                    <PieChart>
                      <Pie
                        data={laudosGrafico}
                        dataKey="total"
                        nameKey="nome"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {laudosGrafico.map(
                          (_, indice) => (
                            <Cell
                              key={indice}
                              fill={
                                CORES[
                                  indice %
                                  CORES.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={estiloTooltip}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="sa-empty">
                    <p>
                      Nenhum parecer disponível.
                    </p>
                  </div>
                )}
              </BlocoGrafico>

              {/* PRODUTOS */}

              <BlocoGrafico
                titulo="Produtos mais citados"
                descricao="Modelos com maior número de atendimentos."
              >
                <Ranking
                  dados={produtos}
                  vazio="Nenhum modelo identificado."
                />
              </BlocoGrafico>

              {/* DÚVIDAS */}

              <BlocoGrafico
                titulo="Dúvidas mais frequentes"
                descricao="Principais solicitações de orientação dos clientes."
              >
                <Ranking
                  dados={duvidas}
                  vazio="Nenhuma dúvida identificada."
                />
              </BlocoGrafico>

              {/* SINTOMAS */}

              <BlocoGrafico
                titulo="Sintomas relatados"
                descricao="Problemas descritos pelos clientes, independentemente do laudo final."
              >
                <Ranking
                  dados={sintomas}
                  vazio="Nenhum sintoma identificado."
                />
              </BlocoGrafico>

              {/* RESPONSÁVEIS */}

              <BlocoGrafico
                titulo="Atendimentos por responsável"
                descricao="Quantidade de chamados associados a cada atendente."
              >
                <Ranking
                  dados={responsaveis}
                  vazio="Nenhum responsável identificado."
                />
              </BlocoGrafico>

              {/* STATUS */}

              <BlocoGrafico
                titulo="Situação dos atendimentos"
                descricao="Distribuição dos status cadastrados no Notion."
              >
                <Ranking
                  dados={
                    indicadores.status || []
                  }
                  vazio="Nenhum status disponível."
                />
              </BlocoGrafico>

              {/* MODALIDADES */}

              <BlocoGrafico
                titulo="Tipos de atendimento"
                descricao="Distribuição entre assistência e suporte técnico."
              >
                <Ranking
                  dados={
                    indicadores.modalidades || []
                  }
                  vazio="Nenhum tipo de atendimento identificado."
                />
              </BlocoGrafico>

              {/* EVOLUÇÃO */}

              <BlocoGrafico
                titulo="Evolução dos atendimentos"
                descricao="Quantidade de chamados por data de abertura."
                amplo
              >
                {evolucao.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={290}
                  >
                    <LineChart
                      data={evolucao}
                    >
                      <CartesianGrid
                        stroke="#303036"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="nome"
                        stroke="#a0a0a8"
                        fontSize={10}
                        tickFormatter={(valor) =>
                          formatarData(valor).slice(0, 5)
                        }
                      />

                      <YAxis
                        allowDecimals={false}
                        stroke="#a0a0a8"
                      />

                      <Tooltip
                        contentStyle={estiloTooltip}
                        labelFormatter={(valor) => formatarData(valor)}
                        formatter={(valor) => [valor, "Chamados"]}
                      />

                      <Line
                        dataKey="total"
                        name="Chamados"
                        stroke="#ffffff"
                        strokeWidth={3}
                        dot={{
                          fill: "#ffffff",
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="sa-empty">
                    <p>
                      Sem dados para o gráfico.
                    </p>
                  </div>
                )}
              </BlocoGrafico>
            </div>

            {/* ====================================
                DIAGNÓSTICO GERENCIAL
            ==================================== */}

            <section className="sa-conclusion">
              <span className="sa-eyebrow">
                CONSOLIDAÇÃO EXECUTIVA
              </span>

              <h2>
                Diagnóstico do Período
              </h2>

              {!podeConcluir ? (
                <p>
                  A análise está incompleta.
                  Foram encontrados{" "}
                  <strong>
                    {dados.totalEsperado}
                  </strong>{" "}
                  chamados, sendo{" "}
                  <strong>
                    {dados.totalLido}
                  </strong>{" "}
                  lidos com sucesso e{" "}
                  <strong>
                    {dados.falhas.length}
                  </strong>{" "}
                  com falha de leitura.
                  Os resultados apresentados
                  são parciais e não devem
                  ser considerados o
                  fechamento oficial.
                </p>
              ) : total === 0 ? (
                <p>
                  Não foram identificados chamados
                  no período selecionado.
                </p>
              ) : (
                <>
                  <p>
                    No período analisado,
                    foram consultados
                    individualmente{" "}
                    <strong>
                      {total} chamados
                    </strong>.
                    {" "}Desses,{" "}
                    <strong>
                      {finalizados}
                    </strong>{" "}
                    possuem status de conclusão
                    e{" "}
                    <strong>
                      {pendentes}
                    </strong>{" "}
                    não possuem status de
                    conclusão reconhecido.
                  </p>

                  {principalProblema && (
                    <p>
                      O tipo de problema mais
                      recorrente foi{" "}
                      <strong>
                        {principalProblema.nome}
                      </strong>,
                      registrado em{" "}
                      <strong>
                        {principalProblema.total}
                      </strong>{" "}
                      chamado(s).
                    </p>
                  )}

                  {principalProduto && (
                    <p>
                      O produto mais citado
                      foi{" "}
                      <strong>
                        {principalProduto.nome}
                      </strong>,
                      com{" "}
                      <strong>
                        {principalProduto.total}
                      </strong>{" "}
                      ocorrência(s) registradas.
                    </p>
                  )}

                  {principalDuvida && (
                    <p>
                      A principal dúvida
                      identificada foi{" "}
                      <strong>
                        {principalDuvida.nome}
                      </strong>,
                      com{" "}
                      <strong>
                        {principalDuvida.total}
                      </strong>{" "}
                      atendimento(s).
                    </p>
                  )}

                  <p>
                    Quanto à procedência,
                    foram encontrados{" "}
                    <strong>
                      {procedentes} laudos procedentes
                    </strong>,
                    {" "}
                    <strong>
                      {improcedentes} improcedentes
                    </strong>,
                    {" "}
                    <strong>
                      {cobranca} com cobrança
                    </strong>{" "}
                    e{" "}
                    <strong>
                      {semLaudo} sem parecer identificado
                    </strong>.
                  </p>

                  <p>
                    A taxa de procedência
                    entre os laudos classificados
                    foi de{" "}
                    <strong>
                      {percentual(
                        procedentes,
                        laudosConcluidos
                      )}
                    </strong>.
                  </p>

                  {mediaResolucao !== null &&
                    mediaResolucao !== undefined && (
                    <p>
                      O tempo médio entre
                      abertura e conclusão
                      foi de{" "}
                      <strong>
                        {mediaResolucao.toFixed(1)}
                        {" "}dias corridos
                      </strong>,
                      considerando{" "}
                      <strong>
                        {indicadores.temposCalculados}
                      </strong>{" "}
                      chamados com datas válidas.
                    </p>
                  )}

                </>
              )}

              <div className="sa-conclusion-foot">
                <span>
                  Fonte: Notion — Chamados Synter
                </span>

                <span>
                  Atualização:{" "}
                  {new Date(
                    dados.atualizadoEm
                  ).toLocaleString("pt-BR")}
                </span>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
