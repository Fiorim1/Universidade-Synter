
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

// Base já utilizada pela Synter no Notion
const DATA_SOURCE_PADRAO =
  "3c1d3a6a-2cde-8041-be39-000bd40b4445";

const MAX_CHAMADOS = 200;
const MAX_ANALISES = 60;

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function textoPropriedade(propriedade) {
  if (!propriedade) return "";

  if (propriedade.type === "title") {
    return (propriedade.title || [])
      .map((x) => x.plain_text || "")
      .join("");
  }

  if (propriedade.type === "rich_text") {
    return (propriedade.rich_text || [])
      .map((x) => x.plain_text || "")
      .join("");
  }

  if (propriedade.type === "select") {
    return propriedade.select?.name || "";
  }

  if (propriedade.type === "multi_select") {
    return (propriedade.multi_select || [])
      .map((x) => x.name)
      .join(", ");
  }

  if (propriedade.type === "number") {
    return String(propriedade.number ?? "");
  }

  return "";
}

function textoBloco(bloco) {
  const conteudo = bloco?.[bloco.type];

  return (conteudo?.rich_text || [])
    .map((x) => x.plain_text || "")
    .join("");
}

function identificarProblema(texto) {
  const valor = normalizar(texto);

  if (!valor) return "Não classificado";

  if (
    /biometr|digital nao|leitor|sensor|placa|display|tela/.test(
      valor
    )
  ) {
    return "Placa, tela e sensores";
  }

  if (
    /pilha|bateria|usb|alimentac|autonomia|carga/.test(
      valor
    )
  ) {
    return "Pilhas e alimentação";
  }

  if (
    /aplicativo|app|wifi|wi-fi|bluetooth|rede|conexao/.test(
      valor
    )
  ) {
    return "Aplicativo e comunicação";
  }

  if (
    /cadastro|senha|reset|configurac|credencia/.test(
      valor
    )
  ) {
    return "Cadastro e configuração";
  }

  if (
    /instalac|montagem|inversao|direcao/.test(
      valor
    )
  ) {
    return "Instalação";
  }

  if (
    /macaneta|quebrad|quebra|mecanism|travamento|motor/.test(
      valor
    )
  ) {
    return "Componentes mecânicos";
  }

  if (
    /oxidac|corros|umidade|desgaste/.test(
      valor
    )
  ) {
    return "Desgaste e corrosão";
  }

  if (/fabricac|fabrica|defeito/.test(valor)) {
    return "Possível falha de fabricação";
  }

  return "Outros problemas";
}

function identificarDuvida(texto) {
  const valor = normalizar(texto);

  if (
    !/duvida|como fazer|como configurar|como cadastrar|orientac|informac|gostaria de saber/.test(
      valor
    )
  ) {
    return null;
  }

  if (/app|aplicativo|wifi|rede/.test(valor)) {
    return "Aplicativo e conectividade";
  }

  if (/senha|cadastro|reset|digital/.test(valor)) {
    return "Cadastro, senha e reset";
  }

  if (/garantia|nota fiscal/.test(valor)) {
    return "Garantia";
  }

  if (/instalac|montagem/.test(valor)) {
    return "Instalação";
  }

  return "Funcionamento e orientações";
}

function nomeCategoriaAnalise(texto) {
  const v = normalizar(texto);

  if (!v) return null;

  if (
    v.includes("duvidas sobre funcionamento") ||
    v.includes("documentacao, manual")
  ) {
    return "Dúvidas e orientações";
  }

  if (
    v.includes("pilhas") ||
    v.includes("alimentacao")
  ) {
    return "Pilhas e alimentação";
  }

  if (
    v.includes("rede, comunicacao") ||
    v.includes("aplicativo")
  ) {
    return "Aplicativo e comunicação";
  }

  if (
    v.includes("configuracao") ||
    v.includes("cadastro") ||
    v.includes("credenciais")
  ) {
    return "Cadastro e configuração";
  }

  if (v.includes("instalacao")) {
    return "Instalação";
  }

  if (
    v.includes("componentes mecanicos") ||
    v.includes("motor") ||
    v.includes("travamento") ||
    v.includes("componentes danificados") ||
    v.includes("falha de funcionamento mecanico")
  ) {
    return "Componentes mecânicos";
  }

  if (
    v.includes("oxidacao") ||
    v.includes("corrosao") ||
    v.includes("desgaste")
  ) {
    return "Desgaste e corrosão";
  }

  if (
    v.includes("fabricacao") ||
    v.includes("falha eletronica") ||
    v.includes("defeito de placa")
  ) {
    return "Possível falha de fabricação";
  }

  return identificarProblema(texto);
}

function classificarLaudo(valor) {
  const v = normalizar(valor);

  if (v === "improcedente") return "Improcedente";
  if (v === "procedente") return "Procedente";
  if (v === "com cobranca") return "Com cobrança";

  return null;
}

async function validarSessao(req) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ")
    ? cabecalho.slice(7)
    : "";

  if (!token) return false;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configuração de autenticação do Supabase ausente."
    );
  }

  const resposta = await fetch(
    `${url.replace(/\/$/, "")}/auth/v1/user`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resposta.ok) return false;

  const usuario = await resposta.json();

  return Boolean(usuario?.id);
}

async function requisitarNotion(caminho, opcoes = {}, tentativa = 0) {
  const resposta = await fetch(`${NOTION_API}${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  });

  if (resposta.status === 429 && tentativa < 3) {
    const espera = Math.min(
      Number(resposta.headers.get("retry-after") || 2),
      10
    );

    await new Promise((resolve) =>
      setTimeout(resolve, espera * 1000)
    );

    return requisitarNotion(
      caminho,
      opcoes,
      tentativa + 1
    );
  }

  if (!resposta.ok) {
    let mensagem = `Notion HTTP ${resposta.status}`;

    try {
      const dados = await resposta.json();
      mensagem = dados.message || mensagem;
    } catch {
      // Preserva mensagem HTTP.
    }

    throw new Error(mensagem);
  }

  return resposta.json();
}

async function buscarChamados(inicio, fim) {
  const id =
    process.env.NOTION_DATA_SOURCE_ID ||
    DATA_SOURCE_PADRAO;

  const registros = [];
  let cursor;
  let temMais = false;

  do {
    const corpo = {
      page_size: 100,
      filter: {
        and: [
          {
            timestamp: "created_time",
            created_time: {
              on_or_after: inicio,
            },
          },
          {
            timestamp: "created_time",
            created_time: {
              before: fim,
            },
          },
        ],
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    };

    if (cursor) corpo.start_cursor = cursor;

    const resposta = await requisitarNotion(
      `/data_sources/${id}/query`,
      {
        method: "POST",
        body: JSON.stringify(corpo),
      }
    );

    // Registros arquivados ou na lixeira
    // não entram nos indicadores operacionais.
    const validos = (resposta.results || []).filter(
      (x) => !x.archived && !x.in_trash
    );

    registros.push(...validos);

    cursor = resposta.next_cursor;
    temMais = Boolean(resposta.has_more);

  } while (
    temMais &&
    cursor &&
    registros.length < MAX_CHAMADOS
  );

  return {
    registros: registros.slice(0, MAX_CHAMADOS),
    limitado: temMais,
  };
}

async function buscarBlocos(paginaId, profundidade = 0) {
  let cursor;
  const blocos = [];

  do {
    const query = new URLSearchParams({
      page_size: "100",
    });

    if (cursor) {
      query.set("start_cursor", cursor);
    }

    const resposta = await requisitarNotion(
      `/blocks/${paginaId}/children?${query.toString()}`
    );

    for (const bloco of resposta.results || []) {
      blocos.push(bloco);

      if (
        profundidade < 2 &&
        bloco.has_children &&
        [
          "callout",
          "toggle",
          "bulleted_list_item",
          "numbered_list_item",
        ].includes(bloco.type)
      ) {
        const filhos = await buscarBlocos(
          bloco.id,
          profundidade + 1
        );

        blocos.push(...filhos);
      }
    }

    cursor = resposta.next_cursor;
  } while (respostaHasCursor(cursor));

  return blocos;
}

function respostaHasCursor(cursor) {
  return Boolean(cursor);
}

function analisarBlocos(blocos) {
  let secao = "";
  let laudo = "Sem laudo";
  let problemaTecnico = null;
  let duvidaTecnica = null;

  for (const bloco of blocos) {
    const texto = textoBloco(bloco);
    const textoNormalizado = normalizar(texto);

    if (
      /analise tecnica/.test(textoNormalizado) &&
      (bloco.type.startsWith("heading") ||
        textoNormalizado.length < 70)
    ) {
      secao = "analise";
      continue;
    }

    if (
      /laudo da ocorrencia/.test(textoNormalizado) &&
      (bloco.type.startsWith("heading") ||
        textoNormalizado.length < 70)
    ) {
      secao = "laudo";
      continue;
    }

    if (
      /parecer tecnico/.test(textoNormalizado) &&
      bloco.type.startsWith("heading")
    ) {
      secao = "parecer";
      continue;
    }

    if (
      /pedidos de reposicao/.test(textoNormalizado) &&
      bloco.type.startsWith("heading")
    ) {
      secao = "reposicao";
      continue;
    }

    if (
      bloco.type !== "to_do" ||
      !bloco.to_do?.checked
    ) {
      continue;
    }

    if (secao === "analise") {
      const categoria = nomeCategoriaAnalise(texto);

      if (categoria === "Dúvidas e orientações") {
        duvidaTecnica = categoria;
      } else if (!problemaTecnico) {
        problemaTecnico = categoria;
      }
    }

    if (secao === "laudo") {
      const resultado = classificarLaudo(texto);

      if (resultado) laudo = resultado;
    }
  }

  return {
    laudo,
    problemaTecnico,
    duvidaTecnica,
  };
}

async function processarEmLotes(registros) {
  const resultados = [];
  let indice = 0;

  // Duas consultas simultâneas para respeitar
  // melhor os limites da API do Notion.
  async function trabalhador() {
    while (indice < registros.length) {
      const atual = registros[indice++];

      try {
        const blocos = await buscarBlocos(atual.id);

        resultados.push({
          id: atual.id,
          ...analisarBlocos(blocos),
          analisado: true,
        });
      } catch {
        resultados.push({
          id: atual.id,
          laudo: "Sem laudo",
          problemaTecnico: null,
          duvidaTecnica: null,
          analisado: false,
        });
      }
    }
  }

  await Promise.all([
    trabalhador(),
    trabalhador(),
  ]);

  return new Map(resultados.map((x) => [x.id, x]));
}

function agrupar(registros, chave) {
  const mapa = new Map();

  for (const item of registros) {
    const nome = item[chave] || "Não informado";

    mapa.set(nome, (mapa.get(nome) || 0) + 1);
  }

  return Array.from(mapa.entries())
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);
}

function extrairChamado(pagina, analise) {
  const propriedades = pagina.properties || {};

  const produto = textoPropriedade(
    propriedades["Produto (nome e/ou modelo)"]
  );

  const relato = textoPropriedade(
    propriedades[
      "Descrição da ocorrência (através do relato do cliente/usuario)"
    ]
  );

  const tipo = textoPropriedade(
    propriedades["Tipo do produto"]
  );

  const problema =
    analise?.problemaTecnico ||
    identificarProblema(relato);

  const duvida =
    analise?.duvidaTecnica ||
    identificarDuvida(relato);

  return {
    id: pagina.id,
    data: pagina.created_time,
    produto: produto || "Não informado",
    tipo: tipo || "Não informado",
    problema,
    duvida,
    laudo: analise?.laudo || "Sem laudo",
    laudoVerificado: Boolean(analise?.analisado),
  };
}

function agregar(chamados) {
  const laudos = {
    Procedente: 0,
    Improcedente: 0,
    "Com cobrança": 0,
    "Sem laudo": 0,
  };

  for (const chamado of chamados) {
    laudos[chamado.laudo]++;
  }

  const porDia = agrupar(
    chamados.map((x) => ({
      dia: x.data?.slice(0, 10) || "",
    })),
    "dia"
  );

  return {
    total: chamados.length,
    laudos,
    problemas: agrupar(chamados, "problema"),
    produtos: agrupar(chamados, "produto"),
    duvidas: agrupar(
      chamados.filter((x) => x.duvida),
      "duvida"
    ),
    tipos: agrupar(chamados, "tipo"),
    porDia: porDia.sort(
      (a, b) => a.nome.localeCompare(b.nome)
    ),
    analisados: chamados.filter(
      (x) => x.laudoVerificado
    ).length,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Authorization");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    if (!process.env.NOTION_TOKEN) {
      return res.status(503).json({
        error:
          "Configure NOTION_TOKEN nas variáveis de ambiente da Vercel.",
      });
    }

    const autenticado = await validarSessao(req);

    if (!autenticado) {
      return res.status(401).json({
        error: "Faça login para acessar o relatório.",
      });
    }

    const { inicio, fim } = req.query;

    const padraoData = /^\d{4}-\d{2}-\d{2}$/;

    if (
      typeof inicio !== "string" ||
      typeof fim !== "string" ||
      !padraoData.test(inicio) ||
      !padraoData.test(fim)
    ) {
      return res.status(400).json({
        error: "Informe um período válido.",
      });
    }

    const inicioDate = new Date(`${inicio}T00:00:00Z`);
    const fimDate = new Date(`${fim}T00:00:00Z`);

    const duracao =
      (fimDate - inicioDate) / 86400000;

    if (
      !Number.isFinite(duracao) ||
      duracao < 1 ||
      duracao > 370
    ) {
      return res.status(400).json({
        error: "O período deve ter entre 1 e 370 dias.",
      });
    }

    // Horário local de Santa Catarina.
    const inicioIso = `${inicio}T00:00:00-03:00`;
    const fimIso = `${fim}T00:00:00-03:00`;

    const resultado = await buscarChamados(
      inicioIso,
      fimIso
    );

    const registrosAnalisaveis =
      resultado.registros.slice(0, MAX_ANALISES);

    const analises = await processarEmLotes(
      registrosAnalisaveis
    );

    const chamados = resultado.registros.map(
      (pagina) =>
        extrairChamado(
          pagina,
          analises.get(pagina.id)
        )
    );

    const indicadores = agregar(chamados);

    return res.status(200).json({
      periodo: { inicio, fim },
      indicadores,
      atualizadoEm: new Date().toISOString(),
      avisos: {
        limiteRegistros: resultado.limitado,
        limiteAnalises:
          resultado.registros.length > MAX_ANALISES,
        laudosAnalisados: indicadores.analisados,
        laudosPendentes:
          chamados.length - indicadores.analisados,
        base:
          "Chamados de Assistências Técnicas e Suporte Técnico",
        criterioData: "Data de criação do chamado",
      },
    });

  } catch (error) {
    console.error(
      "Falha na integração Synter Analytics:",
      error.message
    );

    return res.status(500).json({
      error:
        "Não foi possível consultar os dados do Notion. Verifique a conexão e as permissões.",
    });
  }
}
