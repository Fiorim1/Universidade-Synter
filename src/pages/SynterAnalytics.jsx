
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
// RELATÓRIO GERENCIAL INTEGRADO AO NOTION
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

// ========================================
// AGRUPAMENTO DE DADOS
// ========================================

function agrupar(lista, campo) {
  const mapa = new Map();

  for (const item of lista) {
    const valores = Array.isArray(
      item[campo]
    )
      ? item[campo]
      : [item[campo]];

    // Evita contar a mesma categoria
    // duas vezes dentro do mesmo chamado.
    const unicos = new Set(
      valores
        .map((valor) =>
          String(valor || "").trim()
        )
        .filter(Boolean)
    );

    for (const nome of unicos) {
      mapa.set(
        nome,
        (mapa.get(nome) || 0) + 1
      );
    }
  }

  return Array.from(
    mapa.entries()
  )
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
// INDICADORES GERENCIAIS
// ========================================

function indicadoresDosChamados(chamados) {
  const laudos = {
    Procedente: 0,
    Improcedente: 0,
    "Com cobrança": 0,
    "Sem laudo": 0,
  };

  for (const chamado of chamados) {
    const chave =
      chamado.laudo &&
      Object.prototype.hasOwnProperty.call(
        laudos,
        chamado.laudo
      )
        ? chamado.laudo
        : "Sem laudo";

    laudos[chave]++;
  }

  return {
    total: chamados.length,

    laudos,

    produtos: agrupar(
      chamados,
      "produto"
    ),

    problemas: agrupar(
      chamados,
      "categorias"
    ),

    sintomas: agrupar(
      chamados,
      "sintoma"
    ),

    duvidas: agrupar(
      chamados,
      "duvida"
    ),

    tipos: agrupar(
      chamados,
      "tipo"
    ),

    modalidades: agrupar(
      chamados,
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
      produtos: chamados.filter(
        (c) => Boolean(c.produto)
      ).length,

      classificados: chamados.filter(
        (c) =>
          Array.isArray(c.categorias) &&
          c.categorias.length > 0
      ).length,

      comSintoma: chamados.filter(
        (c) => Boolean(c.sintoma)
      ).length,

      comLaudo: chamados.filter(
        (c) => Boolean(c.laudo)
      ).length,

      comDuvida: chamados.filter(
        (c) => Boolean(c.duvida)
      ).length,
    },
  };
}

// ========================================
// COMPONENTE — CARTÃO DE INDICADOR
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

// ========================================
// COMPONENTE — GRÁFICOS
// ========================================

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

// ========================================
// COMPONENTE — RANKING
// ========================================

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
// INTEGRAÇÃO COM API DO NOTION
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

  let dados;

  try {
    dados = await resposta.json();
  } catch {
    throw new Error(
      "A API do Synter Analytics não retornou uma resposta válida."
    );
  }

  if (!resposta.ok) {
    throw new Error(
      dados.error ||
      `Erro de comunicação (${resposta.status}).`
    );
  }

  return dados;
}

// ========================================
// LER UM LOTE COM NOVAS TENTATIVAS
//
// CORREÇÃO PRINCIPAL:
//
// 1. Detecta IDs ausentes na resposta.
// 2. Não duplica chamados já recebidos.
// 3. Retenta apenas os pendentes.
// 4. Devolve os IDs sem leitura.
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
      throw new DOMException(
        "Operação cancelada",
        "AbortError"
      );
    }

    try {
      const resposta = await chamarAPI(
        token,
        { ids: pendentes },
        signal
      );

      const resultados = Array.isArray(
        resposta.resultados
      )
        ? resposta.resultados
        : [];

      const solicitados =
        new Set(pendentes);

      const recebidos = new Set();

      const proximos = [];

      // ==================================
      // PROCESSAR RESPOSTAS RECEBIDAS
      // ==================================

      for (const item of resultados) {
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
          proximos.push(item.id);
        }
      }

      // ==================================
      // IDENTIFICAR IDs NÃO RETORNADOS
      //
      // ESTE ERA O PROBLEMA ORIGINAL.
      // ==================================

      for (const id of pendentes) {
        if (!recebidos.has(id)) {
          proximos.push(id);
        }
      }

      // ==================================
      // MANTER APENAS IDS NÃO CONCLUÍDOS
      // ==================================

      pendentes = [
        ...new Set(proximos),
      ].filter(
        (id) => !concluidos.has(id)
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
        "Erro na consulta do lote.";

      // Os IDs continuam pendentes
      // e serão enviados novamente.
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
// PÁGINA PRINCIPAL
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
    lidos: 0,
    falhas: 0,
  });

  // ========================================
  // PERÍODO SELECIONADO
  // ========================================

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
  // ANALISAR TODOS OS CHAMADOS
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
        lidos: 0,
        falhas: 0,
      });

      try {
        // ==================================
        // VALIDAR SESSÃO SUPABASE
        // ==================================

        const {
          data: { session },
          error: erroSessao,
        } =
          await supabase.auth.getSession();

        if (
          erroSessao ||
          !session?.access_token
        ) {
          throw new Error(
            "Sua sessão expirou. Entre novamente na Universidade Synter."
          );
        }

        const token =
          session.access_token;

        // ==================================
        // 1. RECUPERAR TODAS AS PÁGINAS
        // ==================================

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
              "O Notion retornou um cursor repetido. A listagem foi interrompida para evitar registros duplicados."
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
              "A API retornou uma lista de chamados inválida."
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

              todos.push(chamado);
            }
          }

          temMais = Boolean(
            resposta.has_more
          );

          cursor =
            resposta.next_cursor;

          setProgresso({
            etapa:
              `${todos.length} chamados localizados na base do Notion...`,
            total: 0,
            lidos: 0,
            falhas: 0,
          });

          if (
            temMais &&
            !cursor
          ) {
            throw new Error(
              "A listagem do Notion veio incompleta. O servidor não retornou o cursor da próxima página."
            );
          }
        }

        // ==================================
        // 2. FILTRAR O PERÍODO
        // ==================================

        const selecionados =
          todos.filter(
            (chamado) =>
              typeof chamado.data ===
                "string" &&
              chamado.data >=
                periodo.inicio &&
              chamado.data <
                periodo.fim
          );

        // ==================================
        // 3. PROCESSAR TODOS OS REGISTROS
        // ==================================

        const completos =
          new Map();

        const falhas =
          new Set();

        setProgresso({
          etapa:
            "Iniciando leitura individual dos chamados...",
          total:
            selecionados.length,
          lidos: 0,
          falhas: 0,
        });

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
              indice +
                TAMANHO_LOTE
            );

          const resultado =
            await processarLote({
              token,
              lote,
              signal,
            });

          // ==================================
          // INSERIR CHAMADOS SEM DUPLICAR
          // ==================================

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

          // ==================================
          // REGISTRAR FALHAS
          // ==================================

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

          // ==================================
          // ATUALIZAR PROGRESSO
          // ==================================

          setProgresso({
            etapa:
              "Lendo relatos, análises técnicas, dúvidas e pareceres...",
            total:
              selecionados.length,
            lidos:
              completos.size,
            falhas:
              falhas.size,
          });
        }

        if (signal.aborted) return;

        // ==================================
        // 4. CONFERIR INTEGRIDADE
        // ==================================

        const idsSelecionados =
          new Set(
            selecionados.map(
              (item) =>
                item.id
            )
          );

        // Caso alguma resposta
        // inesperada deixe um ID
        // sem conclusão e sem falha,
        // ele será incluído nas falhas.

        for (
          const id of
          idsSelecionados
        ) {
          if (
            !completos.has(id)
          ) {
            falhas.add(id);
          }
        }

        // ==================================
        // 5. CALCULAR INDICADORES
        // ==================================

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
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setErro(
          error.message ||
          "Falha na leitura dos chamados."
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
  // DADOS PARA O PAINEL
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

  const sintomas =
    indicadores?.sintomas || [];

  const produtos =
    indicadores?.produtos || [];

  const duvidas =
    indicadores?.duvidas || [];

  const evolucao =
    indicadores?.porDia || [];

  const cobertura =
    indicadores?.cobertura || {};

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

  const podeConcluir =
    dados?.completo === true;

  const laudosConcluidos =
    procedentes +
    improcedentes +
    cobranca;

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
              Análise gerencial dos
              atendimentos, diagnósticos
              técnicos, dúvidas e pareceres
              registrados no Notion.
            </p>
          </div>
        </header>

        {/* ====================================
            FILTROS
        ==================================== */}

        <section className="sa-filters">
          <div className="sa-filter-buttons">
            {[
              [
                "semana",
                "Semanal",
              ],
              [
                "mes",
                "Mensal",
              ],
              [
                "ano",
                "Anual",
              ],
            ].map(
              ([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  className={
                    periodoTipo ===
                    valor
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriodoTipo(
                      valor
                    )
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
                onChange={(
                  event
                ) =>
                  setReferencia(
                    event.target.value ||
                    dataLocal()
                  )
                }
              />
            </label>

            <button
              className="sa-refresh"
              type="button"
              disabled={
                carregando
              }
              onClick={() =>
                setAtualizar(
                  (valor) =>
                    valor + 1
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
            Fonte: Notion •
            Data de início
          </span>
        </div>

        {/* ====================================
            CARREGAMENTO
        ==================================== */}

        {carregando && (
          <div className="sa-notice">
            <strong>
              Análise técnica em andamento
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
                          (progresso.lidos +
                            progresso.falhas) /
                          progresso.total
                        ) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <p>
                  {
                    progresso.lidos
                  }{" "}
                  de{" "}
                  {
                    progresso.total
                  }{" "}
                  chamados lidos.
                  {progresso.falhas > 0 &&
                    ` ${progresso.falhas} falha(s) identificada(s).`}
                </p>
              </>
            )}
          </div>
        )}

        {/* ====================================
            ERRO
        ==================================== */}

        {erro && (
          <div
            className="sa-error"
            role="alert"
          >
            <strong>
              Falha ao consultar o Notion
            </strong>

            <p>
              {erro}
            </p>

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
            RELATÓRIO
        ==================================== */}

        {!carregando &&
          dados && (
            <>

              {/* ====================================
                  INTEGRIDADE
              ==================================== */}

              <section className="sa-summary">
                <span className="sa-eyebrow">
                  INTEGRIDADE DA ANÁLISE
                </span>

                <h2>
                  Conferência dos registros
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
                      Chamados lidos
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
                    ? "Todos os chamados encontrados para o período foram lidos individualmente pela integração."
                    : "A leitura não foi concluída integralmente. Os indicadores apresentados são parciais e não devem ser utilizados como fechamento oficial."}
                </p>

                {!podeConcluir && (
                  <button
                    className="sa-refresh"
                    type="button"
                    onClick={() =>
                      setAtualizar(
                        (v) =>
                          v + 1
                      )
                    }
                  >
                    Reprocessar chamados
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
                  descricao="Registros lidos integralmente."
                />

                <Cartao
                  titulo="Procedentes"
                  valor={procedentes}
                  descricao="Pareceres classificados como procedentes."
                />

                <Cartao
                  titulo="Improcedentes"
                  valor={improcedentes}
                  descricao="Pareceres classificados como improcedentes."
                />

                <Cartao
                  titulo="Sem laudo"
                  valor={semLaudo}
                  descricao="Registros lidos sem parecer final identificado."
                />
              </div>

              {/* ====================================
                  RESUMO EXECUTIVO
              ==================================== */}

              <section className="sa-summary">
                <div className="sa-summary-heading">
                  <span className="sa-eyebrow">
                    ANÁLISE DE QUALIDADE E ATENDIMENTO
                  </span>

                  <h2>
                    Resumo Executivo do Período
                  </h2>

                  <p className="sa-executive-description">
                    Principais resultados
                    obtidos a partir da
                    análise individual
                    dos chamados técnicos.
                  </p>
                </div>

                <div className="sa-summary-grid">

                  <div className="sa-summary-item">
                    <span>
                      PRINCIPAL CLASSIFICAÇÃO TÉCNICA
                    </span>

                    <strong>
                      {problemas[0]?.nome ||
                        "Sem classificação registrada"}
                    </strong>

                    <p>
                      {problemas[0]
                        ? `${problemas[0].total} chamado(s) com esta classificação.`
                        : "Não foi encontrada uma categoria técnica marcada nos registros analisados."}
                    </p>
                  </div>

                  <div className="sa-summary-item">
                    <span>
                      PRODUTO COM MAIS OCORRÊNCIAS
                    </span>

                    <strong>
                      {produtos[0]?.nome ||
                        "Modelo não disponível"}
                    </strong>

                    <p>
                      {produtos[0]
                        ? `${produtos[0].total} ocorrência(s) envolvendo este modelo.`
                        : "O nome dos modelos não foi identificado nos chamados."}
                    </p>
                  </div>

                  <div className="sa-summary-item">
                    <span>
                      PRINCIPAL DÚVIDA IDENTIFICADA
                    </span>

                    <strong>
                      {duvidas[0]?.nome ||
                        "Sem dúvida classificada"}
                    </strong>

                    <p>
                      {duvidas[0]
                        ? `${duvidas[0].total} atendimento(s) relacionado(s).`
                        : "Não foi possível estabelecer uma dúvida mais recorrente."}
                    </p>
                  </div>
                </div>

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
                      Categorias técnicas marcadas
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
              </section>

              {/* ====================================
                  GRÁFICOS
              ==================================== */}

              <div className="sa-charts-grid">

                {/* PROBLEMAS */}

                <BlocoGrafico
                  titulo="Principais classificações técnicas"
                  descricao="Categorias selecionadas pela equipe técnica nos chamados."
                >
                  {problemas.length ? (
                    <ResponsiveContainer
                      width="100%"
                      height={320}
                    >
                      <BarChart
                        data={problemas.slice(0, 8)}
                        layout="vertical"
                        margin={{
                          left: 10,
                          right: 15,
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
                        Nenhuma categoria técnica marcada foi encontrada.
                      </p>
                    </div>
                  )}
                </BlocoGrafico>

                {/* LAUDOS */}

                <BlocoGrafico
                  titulo="Resultado dos pareceres"
                  descricao="Procedentes, improcedentes, com cobrança e sem laudo."
                >
                  {laudosGrafico.length ? (
                    <ResponsiveContainer
                      width="100%"
                      height={320}
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
                  descricao="Ranking por modelo registrado nos chamados."
                >
                  <Ranking
                    dados={produtos}
                    vazio="Nenhum modelo foi identificado nos registros analisados."
                  />
                </BlocoGrafico>

                {/* SINTOMAS */}

                <BlocoGrafico
                  titulo="Sintomas mais relatados"
                  descricao="Problemas descritos pelos clientes, independentemente do laudo final."
                >
                  <Ranking
                    dados={sintomas}
                    vazio="Nenhum sintoma pôde ser identificado nos relatos."
                  />
                </BlocoGrafico>

                {/* DÚVIDAS */}

                <BlocoGrafico
                  titulo="Dúvidas mais recorrentes"
                  descricao="Assuntos que exigiram orientações de uso ou configuração."
                >
                  <Ranking
                    dados={duvidas}
                    vazio="Nenhuma dúvida foi identificada nos registros analisados."
                  />
                </BlocoGrafico>

                {/* STATUS */}

                <BlocoGrafico
                  titulo="Situação dos atendimentos"
                  descricao="Distribuição dos status registrados no Notion."
                >
                  <Ranking
                    dados={indicadores.status}
                    vazio="Nenhum status registrado."
                  />
                </BlocoGrafico>

                {/* EVOLUÇÃO */}

                <BlocoGrafico
                  titulo="Evolução dos chamados"
                  descricao="Quantidade de atendimentos por data de início."
                  amplo
                >
                  {evolucao.length ? (
                    <ResponsiveContainer
                      width="100%"
                      height={280}
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
                          tickFormatter={(v) =>
                            v.slice(5)
                          }
                        />

                        <YAxis
                          allowDecimals={false}
                          stroke="#a0a0a8"
                        />

                        <Tooltip
                          contentStyle={estiloTooltip}
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
                        Sem registros de datas.
                      </p>
                    </div>
                  )}
                </BlocoGrafico>
              </div>

              {/* ====================================
                  CONCLUSÃO GERENCIAL
              ==================================== */}

              <section className="sa-conclusion">
                <span className="sa-eyebrow">
                  DIAGNÓSTICO GERENCIAL
                </span>

                <h2>
                  Conclusão e Recomendações do Período
                </h2>

                {!podeConcluir ? (
                  <p>
                    A análise do período está
                    incompleta. Foram encontrados{" "}
                    <strong>
                      {dados.totalEsperado}
                    </strong>{" "}
                    chamados, dos quais{" "}
                    <strong>
                      {dados.totalLido}
                    </strong>{" "}
                    foram lidos integralmente.
                    Existem{" "}
                    <strong>
                      {dados.falhas.length}
                    </strong>{" "}
                    chamado(s) pendentes de leitura.
                    O relatório não deve ser
                    considerado definitivo até
                    que essas falhas sejam resolvidas.
                  </p>
                ) : total === 0 ? (
                  <p>
                    Nenhum chamado foi encontrado
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
                        {cobertura.classificados || 0}
                      </strong>{" "}
                      possuem classificação técnica
                      marcada no Notion.
                    </p>

                    {problemas[0] && (
                      <p>
                        A classificação técnica
                        mais frequente foi{" "}
                        <strong>
                          {problemas[0].nome}
                        </strong>,
                        presente em{" "}
                        <strong>
                          {problemas[0].total}
                        </strong>{" "}
                        chamado(s).
                      </p>
                    )}

                    {produtos[0] && (
                      <p>
                        O produto mais citado foi{" "}
                        <strong>
                          {produtos[0].nome}
                        </strong>,
                        com{" "}
                        <strong>
                          {produtos[0].total}
                        </strong>{" "}
                        ocorrência(s).
                      </p>
                    )}

                    {duvidas[0] && (
                      <p>
                        A dúvida mais recorrente
                        foi relacionada a{" "}
                        <strong>
                          {duvidas[0].nome}
                        </strong>,
                        identificada em{" "}
                        <strong>
                          {duvidas[0].total}
                        </strong>{" "}
                        atendimento(s).
                      </p>
                    )}

                    <p>
                      Quanto aos pareceres,
                      foram identificados{" "}
                      <strong>
                        {procedentes} procedente(s)
                      </strong>,
                      {" "}
                      <strong>
                        {improcedentes} improcedente(s)
                      </strong>,
                      {" "}
                      <strong>
                        {cobranca} com cobrança
                      </strong>
                      {" "}e{" "}
                      <strong>
                        {semLaudo} sem laudo identificado
                      </strong>.
                    </p>

                    <p>
                      A taxa de procedência entre
                      os pareceres classificados
                      foi de{" "}
                      <strong>
                        {percentual(
                          procedentes,
                          laudosConcluidos
                        )}
                      </strong>.
                    </p>

                    {(cobertura.classificados || 0) <
                      total && (
                      <p>
                        <strong>
                          Recomendação gerencial:
                        </strong>{" "}
                        revisar os atendimentos
                        sem classificação técnica
                        identificada, garantindo
                        maior precisão aos indicadores
                        de qualidade dos produtos.
                      </p>
                    )}

                    {problemas[0] && (
                      <p>
                        Recomenda-se também
                        acompanhar a recorrência
                        da categoria{" "}
                        <strong>
                          {problemas[0].nome}
                        </strong>,
                        verificando os modelos
                        envolvidos, as evidências
                        técnicas e os laudos
                        antes de estabelecer
                        ações corretivas.
                      </p>
                    )}
                  </>
                )}

                <div className="sa-conclusion-foot">
                  <span>
                    Fonte: Notion — Chamados Synter
                  </span>

                  <span>
                    Atualizado em{" "}
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
