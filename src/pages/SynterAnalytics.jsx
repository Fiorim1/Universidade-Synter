
import {
  useCallback,
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
  Legend,
} from "recharts";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { supabase } from "../services/supabaseClient";

import "../styles/SynterAnalytics.css";

const CORES = [
  "#ffffff",
  "#a4a4ad",
  "#73737f",
  "#50505d",
  "#33333c",
];

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

function somarDias(data, quantidade) {
  const novo = new Date(`${data}T12:00:00`);
  novo.setDate(novo.getDate() + quantidade);

  return dataLocal(novo);
}

function calcularPeriodo(tipo, referencia) {
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
    const diaSemana = data.getDay();
    const deslocamento = (diaSemana + 6) % 7;

    const inicio = somarDias(
      referencia,
      -deslocamento
    );

    const fim = somarDias(inicio, 7);

    return {
      inicio,
      fim,
      titulo: "Semana selecionada",
    };
  }

  const inicio = dataLocal(
    new Date(ano, mes, 1)
  );

  const fim = dataLocal(
    new Date(ano, mes + 1, 1)
  );

  return {
    inicio,
    fim,
    titulo: data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
  };
}

function dataFormatada(data) {
  if (!data) return "-";

  const partes = data.split("-");

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function percentual(valor, total) {
  if (!total) return "—";

  return `${((valor / total) * 100).toFixed(1)}%`;
}

function CartaoIndicador({
  titulo,
  valor,
  descricao,
  icone,
}) {
  return (
    <div className="sa-kpi">
      <div className="sa-kpi-top">
        <span>{titulo}</span>
        <span className="sa-kpi-icon">
          {icone}
        </span>
      </div>

      <strong>{valor}</strong>

      <p>{descricao}</p>
    </div>
  );
}

function CardGrafico({
  titulo,
  descricao,
  children,
  destaque,
}) {
  return (
    <section
      className={`sa-chart-card ${
        destaque ? "sa-chart-wide" : ""
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

function EstadoVazio({ mensagem }) {
  return (
    <div className="sa-empty">
      <span className="sa-empty-icon">◎</span>
      <p>{mensagem}</p>
    </div>
  );
}

function ListaRanking({ dados, tituloVazio }) {
  if (!dados?.length) {
    return (
      <EstadoVazio mensagem={tituloVazio} />
    );
  }

  const maior = dados[0]?.total || 1;

  return (
    <div className="sa-ranking">
      {dados.slice(0, 6).map(
        (item, indice) => (
          <div
            className="sa-ranking-item"
            key={`${item.nome}-${indice}`}
          >
            <div className="sa-ranking-top">
              <span>
                <small>
                  {String(indice + 1).padStart(2, "0")}
                </small>

                {item.nome}
              </span>

              <strong>{item.total}</strong>
            </div>

            <div className="sa-progress">
              <div
                style={{
                  width: `${
                    (item.total / maior) * 100
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

const tooltipStyle = {
  background: "#1c1c20",
  border: "1px solid #39393f",
  borderRadius: 12,
  color: "#fff",
};

export default function SynterAnalytics() {
  const [tipoPeriodo, setTipoPeriodo] =
    useState("mes");

  const [referencia, setReferencia] =
    useState(dataLocal());

  const [dados, setDados] = useState(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const [atualizacao, setAtualizacao] =
    useState(0);

  const periodo = useMemo(
    () => calcularPeriodo(
      tipoPeriodo,
      referencia
    ),
    [tipoPeriodo, referencia]
  );

  const carregarDados = useCallback(
    async (signal) => {
      setCarregando(true);
      setErro("");

      try {
        const {
          data: { session },
          error: erroSessao,
        } = await supabase.auth.getSession();

        if (erroSessao || !session?.access_token) {
          throw new Error(
            "Sua sessão expirou. Faça login novamente."
          );
        }

        const parametros = new URLSearchParams({
          inicio: periodo.inicio,
          fim: periodo.fim,
        });

        const resposta = await fetch(
          `/api/synter-analytics?${parametros}`,
          {
            signal,
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

        let resultado;

        try {
          resultado = await resposta.json();
        } catch {
          throw new Error(
            "A API do Synter Analytics não respondeu corretamente."
          );
        }

        if (!resposta.ok) {
          throw new Error(
            resultado.error ||
              "Erro ao carregar os indicadores."
          );
        }

        if (!signal.aborted) {
          setDados(resultado);
        }

      } catch (error) {
        if (
          signal.aborted ||
          error.name === "AbortError"
        ) {
          return;
        }

        setDados(null);

        setErro(
          error.message ||
            "Não foi possível buscar os dados."
        );
      } finally {
        if (!signal.aborted) {
          setCarregando(false);
        }
      }
    },
    [periodo.inicio, periodo.fim]
  );

  useEffect(() => {
    const controller = new AbortController();

    carregarDados(controller.signal);

    return () => controller.abort();
  }, [carregarDados, atualizacao]);

  const indicadores = dados?.indicadores;

  const total = indicadores?.total ?? 0;

  const laudos = indicadores?.laudos || {};

  const procedentes =
    laudos.Procedente || 0;

  const improcedentes =
    laudos.Improcedente || 0;

  const comCobranca =
    laudos["Com cobrança"] || 0;

  const semLaudo =
    laudos["Sem laudo"] || 0;

  const laudosConcluidos =
    procedentes + improcedentes + comCobranca;

  const distribuicaoLaudos = [
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
      total: comCobranca,
    },
    {
      nome: "Sem laudo / não analisado",
      total: semLaudo,
    },
  ].filter((x) => x.total > 0);

  const problemas =
    indicadores?.problemas || [];

  const produtos =
    indicadores?.produtos || [];

  const duvidas =
    indicadores?.duvidas || [];

  const evolucao =
    indicadores?.porDia || [];

  const principalProblema =
    problemas[0] || null;

  const principalProduto =
    produtos[0] || null;

  const principalDuvida =
    duvidas[0] || null;

  const avisos = dados?.avisos;

  return (
    <div className="sa-page">
      <Header />

      <main className="sa-container">

        {/* ====================================
            CABEÇALHO
        ==================================== */}

        <div className="sa-header">
          <div>
            <span className="sa-eyebrow">
              UNIVERSIDADE SYNTER • INTELIGÊNCIA GERENCIAL
            </span>

            <h1>
              Synter <span>Analytics.</span>
            </h1>

            <p>
              Entenda os atendimentos, identifique
              problemas recorrentes e acompanhe os
              resultados do SAC e da Assistência Técnica.
            </p>
          </div>

          <div className="sa-header-mark">
            BI
          </div>
        </div>

        {/* ====================================
            FILTROS
        ==================================== */}

        <section className="sa-filters">
          <div className="sa-filter-buttons">
            {[
              ["semana", "Semanal"],
              ["mes", "Mensal"],
              ["ano", "Anual"],
            ].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                className={
                  tipoPeriodo === valor
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setTipoPeriodo(valor)
                }
              >
                {texto}
              </button>
            ))}
          </div>

          <div className="sa-filter-actions">
            <label className="sa-date-filter">
              <span>Data de referência</span>

              <input
                type="date"
                value={referencia}
                onChange={(event) =>
                  setReferencia(
                    event.target.value || dataLocal()
                  )
                }
              />
            </label>

            <button
              type="button"
              className="sa-refresh"
              onClick={() =>
                setAtualizacao((v) => v + 1)
              }
              disabled={carregando}
            >
              {carregando
                ? "Atualizando..."
                : "Atualizar dados"}
            </button>
          </div>
        </section>

        <div className="sa-period-caption">
          <span>
            {periodo.titulo} •{" "}
            {dataFormatada(periodo.inicio)} até{" "}
            {dataFormatada(
              somarDias(periodo.fim, -1)
            )}
          </span>

          <span>
            Fonte: Notion • Data de abertura
          </span>
        </div>

        {/* ====================================
            ERROS
        ==================================== */}

        {erro && (
          <div className="sa-error" role="alert">
            <strong>Não foi possível carregar o BI.</strong>
            <p>{erro}</p>
          </div>
        )}

        {carregando && (
          <div className="sa-loading">
            Consultando os atendimentos no Notion...
          </div>
        )}

        {/* ====================================
            CONTEÚDO DOS INDICADORES
        ==================================== */}

        {!carregando && indicadores && (
          <>
            {(
              avisos?.limiteRegistros ||
              avisos?.limiteAnalises ||
              avisos?.laudosPendentes > 0
            ) && (
              <div className="sa-notice">
                <strong>
                  Atenção à cobertura dos dados
                </strong>

                <p>
                  {avisos.limiteRegistros
                    ? "O limite de 200 chamados foi atingido. Os totais podem estar incompletos. "
                    : ""}

                  {avisos.limiteAnalises
                    ? "Somente os primeiros 60 chamados foram enviados para leitura detalhada dos laudos. "
                    : ""}

                  {avisos.laudosPendentes > 0
                    ? `${avisos.laudosPendentes} chamado(s) não tiveram o laudo verificado nesta consulta.`
                    : ""}
                </p>
              </div>
            )}

            {/* ====================================
                INDICADORES PRINCIPAIS
            ==================================== */}

            <div className="sa-kpi-grid">
              <CartaoIndicador
                titulo="Chamados registrados"
                valor={total}
                descricao="Atendimentos encontrados no período."
                icone="▦"
              />

              <CartaoIndicador
                titulo="Procedentes"
                valor={procedentes}
                descricao="Laudos que confirmaram procedência."
                icone="✓"
              />

              <CartaoIndicador
                titulo="Improcedentes"
                valor={improcedentes}
                descricao="Laudos classificados como improcedentes."
                icone="○"
              />

              <CartaoIndicador
                titulo="Sem laudo confirmado"
                valor={semLaudo}
                descricao="Inclui registros ainda não analisados."
                icone="◷"
              />
            </div>

            {/* ====================================
                RESUMO DESTAQUE
            ==================================== */}

            <section className="sa-summary">
              <div className="sa-summary-heading">
                <span className="sa-eyebrow">
                  RESUMO DO PERÍODO
                </span>

                <h2>
                  O que a gerência precisa saber?
                </h2>
              </div>

              <div className="sa-summary-grid">
                <div className="sa-summary-item">
                  <span>
                    01 • PRINCIPAL PROBLEMA
                  </span>

                  <strong>
                    {principalProblema?.nome ||
                      "Sem registros"}
                  </strong>

                  <p>
                    {principalProblema
                      ? `${principalProblema.total} chamado(s) relacionado(s).`
                      : "Ainda não existem dados para identificar o principal problema."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    02 • PRODUTO MAIS CITADO
                  </span>

                  <strong>
                    {principalProduto?.nome ||
                      "Sem registros"}
                  </strong>

                  <p>
                    {principalProduto
                      ? `${principalProduto.total} ocorrência(s) registradas.`
                      : "Nenhum produto identificado."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    03 • PRINCIPAL DÚVIDA
                  </span>

                  <strong>
                    {principalDuvida?.nome ||
                      "Não identificada"}
                  </strong>

                  <p>
                    {principalDuvida
                      ? `${principalDuvida.total} registro(s) reconhecido(s) como dúvida.`
                      : "Não foram identificadas dúvidas nos campos analisados."}
                  </p>
                </div>
              </div>

              <p className="sa-summary-disclaimer">
                As categorias são extraídas dos relatos
                e das classificações disponíveis.
                Identificar uma reclamação não significa
                confirmar um defeito de fabricação.
              </p>
            </section>

            {/* ====================================
                GRÁFICOS
            ==================================== */}

            <div className="sa-charts-grid">

              <CardGrafico
                titulo="Principais problemas"
                descricao="Veja quais situações aparecem mais nos atendimentos."
              >
                {problemas.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={295}
                  >
                    <BarChart
                      data={problemas.slice(0, 6)}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 18,
                        bottom: 5,
                        left: 15,
                      }}
                    >
                      <CartesianGrid
                        stroke="#29292e"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#888890"
                        fontSize={11}
                      />

                      <YAxis
                        type="category"
                        dataKey="nome"
                        width={125}
                        stroke="#aaaab1"
                        fontSize={10}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                      />

                      <Bar
                        dataKey="total"
                        name="Chamados"
                        fill="#e5e5e8"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EstadoVazio
                    mensagem="Não foram encontrados problemas neste período."
                  />
                )}
              </CardGrafico>

              <CardGrafico
                titulo="Resultado dos laudos"
                descricao="Distribuição entre procedentes, improcedentes, com cobrança e sem análise."
              >
                {distribuicaoLaudos.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={295}
                  >
                    <PieChart>
                      <Pie
                        data={distribuicaoLaudos}
                        dataKey="total"
                        nameKey="nome"
                        cx="50%"
                        cy="43%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={4}
                      >
                        {distribuicaoLaudos.map(
                          (_, indice) => (
                            <Cell
                              key={indice}
                              fill={
                                CORES[
                                  indice % CORES.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={tooltipStyle}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: 11,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EstadoVazio
                    mensagem="Nenhum laudo disponível."
                  />
                )}
              </CardGrafico>

              <CardGrafico
                titulo="Produtos mais reclamados"
                descricao="Ranking de modelos encontrados nos chamados."
              >
                <ListaRanking
                  dados={produtos}
                  tituloVazio="Nenhum produto encontrado."
                />
              </CardGrafico>

              <CardGrafico
                titulo="Dúvidas mais frequentes"
                descricao="Assuntos que podem exigir orientações, vídeos ou treinamentos."
              >
                <ListaRanking
                  dados={duvidas}
                  tituloVazio="Não foram identificadas dúvidas neste período."
                />
              </CardGrafico>

              <CardGrafico
                titulo="Evolução dos atendimentos"
                descricao="Quantidade de chamados por dia de abertura."
                destaque
              >
                {evolucao.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={280}
                  >
                    <LineChart
                      data={evolucao}
                      margin={{
                        top: 15,
                        right: 20,
                        bottom: 10,
                        left: -20,
                      }}
                    >
                      <CartesianGrid
                        stroke="#303036"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="nome"
                        stroke="#9999a0"
                        fontSize={10}
                        tickFormatter={(valor) =>
                          valor.slice(5)
                        }
                      />

                      <YAxis
                        stroke="#9999a0"
                        fontSize={11}
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                      />

                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Chamados"
                        stroke="#ffffff"
                        strokeWidth={3}
                        dot={{
                          fill: "#fff",
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EstadoVazio
                    mensagem="Sem registros para exibir a evolução."
                  />
                )}
              </CardGrafico>
            </div>

            {/* ====================================
                CONCLUSÃO GERENCIAL
            ==================================== */}

            <section className="sa-conclusion">
              <span className="sa-eyebrow">
                ANÁLISE GERENCIAL
              </span>

              <h2>
                Conclusão do período
              </h2>

              {total === 0 ? (
                <p>
                  Não foram encontrados chamados
                  ativos no período selecionado.
                  Verifique a data e se a conexão
                  possui acesso à base correta.
                </p>
              ) : (
                <>
                  <p>
                    Foram encontrados{" "}
                    <strong>{total} chamados</strong>.
                    O problema mais identificado foi{" "}
                    <strong>
                      {principalProblema?.nome ||
                        "não informado"}
                    </strong>,
                    e o produto mais citado foi{" "}
                    <strong>
                      {principalProduto?.nome ||
                        "não informado"}
                    </strong>.
                  </p>

                  <p>
                    Entre os laudos identificados,
                    houve{" "}
                    <strong>
                      {procedentes} procedente(s)
                    </strong>,
                    {" "}
                    <strong>
                      {improcedentes} improcedente(s)
                    </strong>
                    {" "}e{" "}
                    <strong>
                      {comCobranca} com cobrança
                    </strong>.
                  </p>

                  <p>
                    Foram registrados{" "}
                    <strong>
                      {laudosConcluidos}
                    </strong>{" "}
                    laudos classificados na amostra.
                    {semLaudo > 0
                      ? ` Há ${semLaudo} registro(s) sem laudo verificado nesta consulta.`
                      : ""}
                  </p>

                  <p>
                    Taxa de procedência entre os
                    laudos classificados:{" "}
                    <strong>
                      {percentual(
                        procedentes,
                        laudosConcluidos
                      )}
                    </strong>.
                  </p>
                </>
              )}

              <div className="sa-conclusion-foot">
                <span>
                  Base: Notion — Assistência Técnica
                </span>

                <span>
                  Atualizado:{" "}
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
