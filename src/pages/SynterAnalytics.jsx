
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
  "#b0b0b8",
  "#85858e",
  "#5b5b65",
];

function dataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function somarDias(data, dias) {
  const d = new Date(`${data}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return dataLocal(d);
}

function obterPeriodo(tipo, referencia) {
  const d = new Date(`${referencia}T12:00:00`);

  const ano = d.getFullYear();
  const mes = d.getMonth();

  if (tipo === "ano") {
    return {
      inicio: `${ano}-01-01`,
      fim: `${ano + 1}-01-01`,
      titulo: `Ano de ${ano}`,
    };
  }

  if (tipo === "semana") {
    const deslocamento = (d.getDay() + 6) % 7;
    const inicio = somarDias(referencia, -deslocamento);

    return {
      inicio,
      fim: somarDias(inicio, 7),
      titulo: "Análise semanal",
    };
  }

  return {
    inicio: dataLocal(new Date(ano, mes, 1)),
    fim: dataLocal(new Date(ano, mes + 1, 1)),
    titulo: d.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
  };
}

function formatarData(valor) {
  if (!valor) return "-";

  const [ano, mes, dia] = valor.split("-");

  return `${dia}/${mes}/${ano}`;
}

function percentual(valor, total) {
  if (!total) return "—";

  return `${((valor / total) * 100).toFixed(1)}%`;
}

function CardIndicador({
  titulo,
  valor,
  descricao,
  icone,
}) {
  return (
    <div className="sa-kpi">
      <div className="sa-kpi-top">
        <span>{titulo}</span>
        <span className="sa-kpi-icon">{icone}</span>
      </div>

      <strong>{valor}</strong>
      <p>{descricao}</p>
    </div>
  );
}

function SecaoGrafico({
  titulo,
  descricao,
  children,
  amplo,
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

function SemDados({ mensagem }) {
  return (
    <div className="sa-empty">
      <span className="sa-empty-icon">◎</span>
      <p>{mensagem}</p>
    </div>
  );
}

function Ranking({ dados, mensagem }) {
  if (!dados.length) {
    return <SemDados mensagem={mensagem} />;
  }

  const maior = dados[0]?.total || 1;

  return (
    <div className="sa-ranking">
      {dados.slice(0, 6).map((item, index) => (
        <div
          className="sa-ranking-item"
          key={`${item.nome}-${index}`}
        >
          <div className="sa-ranking-top">
            <span>
              <small>{String(index + 1).padStart(2, "0")}</small>
              {item.nome}
            </span>

            <strong>{item.total}</strong>
          </div>

          <div className="sa-progress">
            <div
              style={{
                width: `${(item.total / maior) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const tooltipStyle = {
  background: "#1b1b20",
  border: "1px solid #393940",
  borderRadius: 12,
  color: "#ffffff",
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
    () => obterPeriodo(tipoPeriodo, referencia),
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
            "Sua sessão expirou. Entre novamente na plataforma."
          );
        }

        const query = new URLSearchParams({
          inicio: periodo.inicio,
          fim: periodo.fim,
        });

        const resposta = await fetch(
          `/api/synter-analytics?${query}`,
          {
            signal,
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            resultado.error ||
            "Falha ao consultar o Notion."
          );
        }

        if (!signal.aborted) {
          setDados(resultado);
        }
      } catch (error) {
        if (signal.aborted) return;

        setDados(null);
        setErro(
          error.message ||
          "Não foi possível carregar os dados."
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

  const total = indicadores?.total || 0;

  const laudos = indicadores?.laudos || {};

  const procedentes = laudos.Procedente || 0;
  const improcedentes = laudos.Improcedente || 0;
  const cobrancas = laudos["Com cobrança"] || 0;
  const semLaudo = laudos["Sem laudo"] || 0;

  const classificados =
    procedentes + improcedentes + cobrancas;

  const problemas = indicadores?.problemas || [];
  const produtos = indicadores?.produtos || [];
  const duvidas = indicadores?.duvidas || [];
  const evolucao = indicadores?.porDia || [];

  const cobertura = indicadores?.cobertura || {};

  const principalProblema = problemas[0];
  const principalProduto = produtos[0];
  const principalDuvida = duvidas[0];

  const laudosGrafico = [
    { nome: "Procedentes", total: procedentes },
    { nome: "Improcedentes", total: improcedentes },
    { nome: "Com cobrança", total: cobrancas },
    { nome: "Sem laudo", total: semLaudo },
  ].filter((item) => item.total > 0);

  const confiabilidadeLimitada =
    dados?.avisos?.limiteRegistros ||
    dados?.avisos?.limiteAnalises ||
    dados?.avisos?.leituraIncompleta;

  return (
    <div className="sa-page">
      <Header />

      <main className="sa-container">

        {/* ====================================
            CABEÇALHO EXECUTIVO
        ==================================== */}

        <header className="sa-header">
          <div>
            <span className="sa-eyebrow">
              UNIVERSIDADE SYNTER / INTELIGÊNCIA GERENCIAL
            </span>

            <h1>
              Synter <span>Analytics.</span>
            </h1>

            <p>
              Indicadores de qualidade, desempenho do SAC
              e análise das ocorrências de Assistência
              Técnica para apoiar decisões estratégicas.
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
            ].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                className={
                  tipoPeriodo === valor ? "active" : ""
                }
                onClick={() => setTipoPeriodo(valor)}
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
                setAtualizacao((valor) => valor + 1)
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
            {formatarData(periodo.inicio)} até{" "}
            {formatarData(somarDias(periodo.fim, -1))}
          </span>

          <span>
            Fonte oficial: Notion • Chamados técnicos
          </span>
        </div>

        {erro && (
          <div className="sa-error" role="alert">
            <strong>Não foi possível carregar os indicadores.</strong>
            <p>{erro}</p>
          </div>
        )}

        {carregando && (
          <div className="sa-loading">
            Analisando os registros de atendimento...
          </div>
        )}

        {!carregando && indicadores && (
          <>
            {confiabilidadeLimitada && (
              <div className="sa-notice">
                <strong>
                  Atenção: análise parcial dos registros
                </strong>

                <p>
                  {cobertura.paginasLidas || 0} de{" "}
                  {total} registros tiveram suas páginas
                  internas lidas com sucesso. Algumas
                  classificações podem não ter sido
                  identificadas. Consulte os logs da API
                  se o número de leituras for baixo.
                </p>
              </div>
            )}

            {/* ====================================
                INDICADORES
            ==================================== */}

            <div className="sa-kpi-grid">
              <CardIndicador
                titulo="Chamados registrados"
                valor={total}
                descricao="Total encontrado no período."
                icone="▦"
              />

              <CardIndicador
                titulo="Laudos procedentes"
                valor={procedentes}
                descricao="Ocorrências com procedência registrada."
                icone="✓"
              />

              <CardIndicador
                titulo="Laudos improcedentes"
                valor={improcedentes}
                descricao="Ocorrências com improcedência registrada."
                icone="○"
              />

              <CardIndicador
                titulo="Sem laudo identificado"
                valor={semLaudo}
                descricao="Inclui análises não concluídas ou não acessíveis."
                icone="◷"
              />
            </div>

            {/* ====================================
                RESUMO EXECUTIVO
            ==================================== */}

            <section className="sa-summary">
              <div className="sa-summary-heading">
                <span className="sa-eyebrow">
                  VISÃO EXECUTIVA DO PERÍODO
                </span>

                <h2>
                  Resumo Executivo de Qualidade e Atendimento
                </h2>

                <p className="sa-executive-description">
                  Síntese dos principais resultados,
                  ocorrências e pontos de atenção
                  identificados nos chamados.
                </p>
              </div>

              <div className="sa-summary-grid">
                <div className="sa-summary-item">
                  <span>
                    01 / OCORRÊNCIA MAIS FREQUENTE
                  </span>

                  <strong>
                    {principalProblema?.nome ||
                      "Análise pendente"}
                  </strong>

                  <p>
                    {principalProblema
                      ? `${principalProblema.total} ocorrência(s) nesta categoria.`
                      : "Nenhuma categoria técnica pôde ser identificada nos registros consultados."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    02 / PRODUTO COM MAIS REGISTROS
                  </span>

                  <strong>
                    {principalProduto?.nome ||
                      "Identificação pendente"}
                  </strong>

                  <p>
                    {principalProduto
                      ? `${principalProduto.total} chamado(s) relacionados a este modelo.`
                      : "Os modelos ainda não foram extraídos com sucesso dos chamados."}
                  </p>
                </div>

                <div className="sa-summary-item">
                  <span>
                    03 / DÚVIDA MAIS RECORRENTE
                  </span>

                  <strong>
                    {principalDuvida?.nome ||
                      "Sem classificação suficiente"}
                  </strong>

                  <p>
                    {principalDuvida
                      ? `${principalDuvida.total} dúvida(s) identificada(s).`
                      : "Ainda não é possível determinar qual dúvida é mais frequente."}
                  </p>
                </div>
              </div>

              {/* COBERTURA DOS DADOS */}

              <div className="sa-data-coverage">
                <div>
                  <span>Produtos identificados</span>
                  <strong>
                    {cobertura.produtosIdentificados || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>

                <div>
                  <span>Problemas classificados</span>
                  <strong>
                    {cobertura.problemasIdentificados || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>

                <div>
                  <span>Laudos identificados</span>
                  <strong>
                    {cobertura.laudosClassificados || 0}
                    {" / "}
                    {total}
                  </strong>
                </div>
              </div>

              <p className="sa-summary-disclaimer">
                A ocorrência mais frequente representa
                os sintomas ou categorias registradas,
                não necessariamente um defeito de
                fabricação confirmado.
              </p>
            </section>

            {/* ====================================
                GRÁFICOS
            ==================================== */}

            <div className="sa-charts-grid">
              <SecaoGrafico
                titulo="Principais problemas registrados"
                descricao="Categorias técnicas mais recorrentes nos chamados analisados."
              >
                {problemas.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart
                      data={problemas.slice(0, 6)}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        bottom: 5,
                        left: 5,
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
                        width={145}
                        stroke="#b2b2ba"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                      />

                      <Bar
                        dataKey="total"
                        name="Ocorrências"
                        fill="#eeeeef"
                        radius={[0, 7, 7, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <SemDados mensagem="Não foi possível identificar categorias de problemas neste período." />
                )}
              </SecaoGrafico>

              <SecaoGrafico
                titulo="Procedência dos atendimentos"
                descricao="Resultado dos laudos técnicos registrados."
              >
                {laudosGrafico.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={laudosGrafico}
                        dataKey="total"
                        nameKey="nome"
                        cx="50%"
                        cy="43%"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {laudosGrafico.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CORES[index % CORES.length]
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
                  <SemDados mensagem="Não existem laudos disponíveis." />
                )}
              </SecaoGrafico>

              <SecaoGrafico
                titulo="Produtos com mais reclamações"
                descricao="Ranking dos modelos mais citados no período."
              >
                <Ranking
                  dados={produtos}
                  mensagem="Os nomes dos produtos não foram identificados."
                />
              </SecaoGrafico>

              <SecaoGrafico
                titulo="Dúvidas mais frequentes"
                descricao="Assuntos que podem exigir orientações ou materiais de treinamento."
              >
                <Ranking
                  dados={duvidas}
                  mensagem="Ainda não há dúvidas suficientemente identificadas para gerar um ranking."
                />
              </SecaoGrafico>

              <SecaoGrafico
                titulo="Evolução do volume de atendimentos"
                descricao="Quantidade de registros por data de abertura."
                amplo
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
                        tickFormatter={(v) =>
                          v.slice(5)
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
                          fill: "#ffffff",
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <SemDados mensagem="Não existem registros para o gráfico de evolução." />
                )}
              </SecaoGrafico>
            </div>

            {/* ====================================
                CONCLUSÃO EXECUTIVA
            ==================================== */}

            <section className="sa-conclusion">
              <span className="sa-eyebrow">
                CONSOLIDAÇÃO GERENCIAL
              </span>

              <h2>
                Diagnóstico e Considerações do Período
              </h2>

              {total === 0 ? (
                <p>
                  Não foram localizados chamados ativos
                  para o período selecionado. Verifique
                  se a base e o intervalo de datas
                  correspondem aos atendimentos desejados.
                </p>
              ) : (
                <>
                  <p>
                    No período analisado, foram
                    registrados <strong>{total} atendimentos</strong>.
                    {" "}Desses,{" "}
                    <strong>
                      {cobertura.problemasIdentificados || 0}
                    </strong>{" "}
                    possuem categoria de problema
                    identificada e{" "}
                    <strong>
                      {cobertura.produtosIdentificados || 0}
                    </strong>{" "}
                    possuem produto identificado.
                  </p>

                  {principalProblema && (
                    <p>
                      A categoria de maior recorrência
                      entre os registros classificados foi{" "}
                      <strong>
                        {principalProblema.nome}
                      </strong>,
                      com{" "}
                      <strong>
                        {principalProblema.total} ocorrência(s)
                      </strong>.
                    </p>
                  )}

                  {principalProduto && (
                    <p>
                      O modelo mais citado foi{" "}
                      <strong>
                        {principalProduto.nome}
                      </strong>,
                      presente em{" "}
                      <strong>
                        {principalProduto.total} chamado(s)
                      </strong>.
                    </p>
                  )}

                  <p>
                    Em relação aos laudos, foram
                    identificados{" "}
                    <strong>{procedentes} procedentes</strong>,
                    {" "}
                    <strong>
                      {improcedentes} improcedentes
                    </strong>
                    {" "}e{" "}
                    <strong>
                      {cobrancas} com cobrança
                    </strong>.
                    {" "}Outros{" "}
                    <strong>
                      {semLaudo} registros
                    </strong>{" "}
                    permanecem sem classificação de
                    laudo identificada na consulta.
                  </p>

                  {classificados > 0 ? (
                    <p>
                      A taxa de procedência entre os
                      laudos classificados foi de{" "}
                      <strong>
                        {percentual(
                          procedentes,
                          classificados
                        )}
                      </strong>.
                    </p>
                  ) : (
                    <p>
                      A taxa de procedência ainda
                      não pode ser calculada porque
                      nenhum laudo foi identificado.
                    </p>
                  )}

                  {cobertura.problemasIdentificados <
                    total && (
                    <p>
                      <strong>
                        Ponto de atenção:
                      </strong>{" "}
                      há registros sem categoria
                      técnica identificada. Antes
                      de tomar decisões sobre a
                      qualidade dos produtos, é
                      recomendável concluir a análise
                      dessas ocorrências.
                    </p>
                  )}
                </>
              )}

              <div className="sa-conclusion-foot">
                <span>
                  Fonte: Notion — Assistência Técnica Synter
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
