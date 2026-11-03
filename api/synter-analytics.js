
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

const DATA_SOURCE_ID =
  process.env.NOTION_DATA_SOURCE_ID ||
  "3c1d3a6a-2cde-8041-be39-000bd40b4445";

const MAX_REGISTROS = 200;
const MAX_DETALHAMENTOS = 100;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function textoRico(lista) {
  return (lista || [])
    .map((item) => item.plain_text || item.text?.content || "")
    .join("");
}

function textoPropriedade(prop) {
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return textoRico(prop.title);
    case "rich_text":
      return textoRico(prop.rich_text);
    case "select":
      return prop.select?.name || "";
    case "status":
      return prop.status?.name || "";
    case "multi_select":
      return (prop.multi_select || [])
        .map((item) => item.name)
        .join(", ");
    case "number":
      return String(prop.number ?? "");
    case "formula":
      return String(
        prop.formula?.string ??
        prop.formula?.number ??
        ""
      );
    default:
      return "";
  }
}

function obterPropriedade(propriedades, nomes) {
  const entradas = Object.entries(propriedades || {});

  for (const nome of nomes) {
    const entrada = entradas.find(
      ([chave]) => normalizar(chave) === normalizar(nome)
    );

    if (entrada) {
      const valor = textoPropriedade(entrada[1]);
      if (valor.trim()) return valor.trim();
    }
  }

  return "";
}

function textoBloco(bloco) {
  return textoRico(
    bloco?.[bloco.type]?.rich_text || []
  ).trim();
}

async function notion(path, options = {}, tentativa = 0) {
  const resposta = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  });

  if (resposta.status === 429 && tentativa < 4) {
    const segundos = Math.min(
      Number(resposta.headers.get("retry-after")) || 2,
      10
    );

    await sleep(segundos * 1000);

    return notion(path, options, tentativa + 1);
  }

  if (!resposta.ok) {
    let mensagem = `Notion HTTP ${resposta.status}`;

    try {
      const erro = await resposta.json();
      mensagem = erro.message || mensagem;
    } catch {
      // Mantém a descrição HTTP.
    }

    throw new Error(mensagem);
  }

  return resposta.json();
}

async function validarUsuario(req) {
  const authorization = req.headers.authorization || "";

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) return false;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const chave =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !chave) {
    throw new Error("Supabase não configurado no servidor.");
  }

  const resposta = await fetch(
    `${url.replace(/\/$/, "")}/auth/v1/user`,
    {
      headers: {
        apikey: chave,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resposta.ok) return false;

  const usuario = await resposta.json();

  return Boolean(usuario?.id);
}

async function listarChamados(inicio, fim) {
  const registros = [];
  let cursor = null;
  let hasMore = false;

  do {
    const body = {
      page_size: 100,
      filter: {
        and: [
          {
            timestamp: "created_time",
            created_time: { on_or_after: inicio },
          },
          {
            timestamp: "created_time",
            created_time: { before: fim },
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

    if (cursor) body.start_cursor = cursor;

    const resposta = await notion(
      `/data_sources/${DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    registros.push(
      ...(resposta.results || []).filter(
        (p) => !p.archived && !p.in_trash
      )
    );

    hasMore = Boolean(resposta.has_more);
    cursor = resposta.next_cursor;

  } while (
    hasMore &&
    cursor &&
    registros.length < MAX_REGISTROS
  );

  return {
    paginas: registros.slice(0, MAX_REGISTROS),
    limitado: hasMore,
  };
}

async function lerBlocos(id, profundidade = 0) {
  const encontrados = [];
  let cursor = null;

  do {
    const params = new URLSearchParams({
      page_size: "100",
    });

    if (cursor) {
      params.set("start_cursor", cursor);
    }

    const dados = await notion(
      `/blocks/${id}/children?${params.toString()}`
    );

    for (const bloco of dados.results || []) {
      encontrados.push(bloco);

      if (
        bloco.has_children &&
        profundidade < 3
      ) {
        const filhos = await lerBlocos(
          bloco.id,
          profundidade + 1
        );

        encontrados.push(...filhos);
      }
    }

    cursor = dados.next_cursor;

    if (!dados.has_more) break;
  } while (cursor);

  return encontrados;
}

function categoriaMarcada(texto) {
  const t = normalizar(texto);

  const regras = [
    ["Pilhas e alimentação", /pilhas|alimentacao|bateria/],
    ["Placa e componentes eletrônicos", /falha eletronica|defeito de placa/],
    ["Sensores e funcionamento", /falha de funcionamento|comportamento anormal/],
    ["Aplicativo e conectividade", /rede|comunicacao|aplicativo|infraestrutura/],
    ["Cadastro e configuração", /configuracao|cadastro|reset|credenciais/],
    ["Instalação", /instalacao inadequada|nao homologada/],
    ["Componentes mecânicos", /componentes mecanicos|componentes danificados|falha de funcionamento mecanico|mecanismo de travamento/],
    ["Oxidação e corrosão", /oxidacao|corrosao|umidade/],
    ["Desgaste e manutenção", /desgaste|limpeza|manutencao/],
    ["Fabricação", /defeito ou falha de fabricacao|defeito ou falha de fabricacao/],
    ["Dúvidas e orientações", /duvidas sobre funcionamento|documentacao|manual|informacao tecnica divergente/],
    ["Transferência de dispositivo", /vinculacao|desvinculacao|transferencia de dispositivo/],
    ["Componentes ausentes", /falta de componentes|perda|substituicao de componentes/],
    ["Uso indevido", /uso indevido|fora das especificacoes/],
    ["Intervenção não autorizada", /intervencao|modificacao nao autorizada/],
    ["Incompatibilidade", /incompativeis|incompativel/],
  ];

  return regras.find(([, regex]) => regex.test(t))?.[0] || null;
}

function classificarSintoma(texto) {
  const t = normalizar(texto);

  if (!t) return null;

  const regras = [
    ["Placa, tela e sensores", /placa|biometr|leitor|sensor|display|tela/],
    ["Pilhas e alimentação", /pilha|bateria|usb|carregador|consumo|energia|carga/],
    ["Aplicativo e conectividade", /aplicativo|bluetooth|wi.?fi|conexao|internet/],
    ["Cadastro e configuração", /senha|cadastro|reset|configurac|usuario/],
    ["Instalação", /instalac|montagem|reversao|inversao/],
    ["Componentes mecânicos", /macaneta|quebr|travamento|motor|mecanism|trinco/],
    ["Oxidação e corrosão", /oxidac|corros|ferrug|umidade/],
    ["Desgaste e manutenção", /desgaste|limpeza|lubrificac/],
  ];

  return regras.find(([, regex]) => regex.test(t))?.[0] || null;
}

function identificarDuvida(texto) {
  const t = normalizar(texto);

  if (!/duvida|como |orientac|informac|gostaria de saber|preciso saber/.test(t)) {
    return null;
  }

  if (/app|wifi|conexao/.test(t)) {
    return "Aplicativo e conectividade";
  }

  if (/senha|reset|cadastro|digital/.test(t)) {
    return "Senhas, cadastro e reset";
  }

  if (/garantia|nota fiscal/.test(t)) {
    return "Garantia e documentação";
  }

  if (/instalac|montagem/.test(t)) {
    return "Instalação";
  }

  return "Uso e funcionamento";
}

function identificarLaudo(texto) {
  const t = normalizar(texto);

  if (t === "procedente") return "Procedente";
  if (t === "improcedente") return "Improcedente";
  if (t === "com cobranca") return "Com cobrança";

  return null;
}

function extrairAnalise(blocos) {
  let secao = "";
  let categoria = null;
  let laudo = null;
  let duvida = null;

  const relatos = [];

  for (const bloco of blocos) {
    const texto = textoBloco(bloco);
    const t = normalizar(texto);

    if (!t) continue;

    if (
      /(?:^|\b)analise tecnica\b/.test(t) &&
      t.length < 100
    ) {
      secao = "analise";
      continue;
    }

    if (
      /(?:^|\b)laudo da ocorrencia\b/.test(t) &&
      t.length < 100
    ) {
      secao = "laudo";
      continue;
    }

    if (
      /(?:^|\b)relato da ocorrencia\b/.test(t) &&
      t.length < 100
    ) {
      secao = "relato";
      continue;
    }

    if (
      /parecer tecnico|pedidos de reposicao/.test(t) &&
      t.length < 100
    ) {
      secao = "outro";
      continue;
    }

    if (secao === "relato") {
      relatos.push(texto);
    }

    if (
      secao === "analise" &&
      bloco.type === "to_do" &&
      bloco.to_do?.checked
    ) {
      const resultado = categoriaMarcada(texto);

      if (resultado) {
        categoria = categoria || resultado;

        if (resultado === "Dúvidas e orientações") {
          duvida = identificarDuvida(
            relatos.join(" ")
          ) || "Uso e funcionamento";
        }
      }
    }

    if (
      secao === "laudo" &&
      bloco.type === "to_do" &&
      bloco.to_do?.checked
    ) {
      const resultado = identificarLaudo(texto);

      if (resultado) laudo = resultado;
    }
  }

  return {
    categoria,
    laudo,
    duvida,
    relatoInterno: relatos.join(" "),
  };
}

async function analisarPaginas(paginas) {
  const resultado = new Map();
  let indice = 0;

  async function worker() {
    while (indice < paginas.length) {
      const pagina = paginas[indice++];

      try {
        const blocos = await lerBlocos(pagina.id);

        resultado.set(pagina.id, {
          ...extrairAnalise(blocos),
          leituraOk: true,
        });
      } catch (error) {
        console.error(
          `Erro ao ler chamado ${pagina.id}:`,
          error.message
        );

        resultado.set(pagina.id, {
          leituraOk: false,
        });
      }
    }
  }

  await Promise.all([
    worker(),
    worker(),
  ]);

  return resultado;
}

function montarChamado(pagina, detalhes) {
  const props = pagina.properties || {};

  const produto = obterPropriedade(props, [
    "Produto (nome e/ou modelo)",
    "Produto",
    "Modelo",
    "Nome do produto",
  ]);

  const relato = obterPropriedade(props, [
    "Descrição da ocorrência (através do relato do cliente/usuario)",
    "Descrição da ocorrência",
    "Descrição do problema",
    "Relato do cliente",
  ]) || detalhes?.relatoInterno || "";

  const tipo = obterPropriedade(props, [
    "Tipo do produto",
    "Tipo de produto",
    "Categoria",
  ]);

  const categoria =
    detalhes?.categoria ||
    classificarSintoma(relato);

  const duvida =
    detalhes?.duvida ||
    identificarDuvida(relato);

  return {
    id: pagina.id,
    data: pagina.created_time,
    produto: produto || null,
    tipo: tipo || null,
    relato,
    problema: categoria,
    duvida,
    laudo: detalhes?.laudo || null,
    leituraOk: detalhes?.leituraOk === true,
  };
}

function ranking(lista, campo) {
  const contagem = new Map();

  for (const item of lista) {
    const nome = item[campo];

    if (!nome) continue;

    contagem.set(
      nome,
      (contagem.get(nome) || 0) + 1
    );
  }

  return [...contagem.entries()]
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

function indicadores(chamados) {
  const laudos = {
    Procedente: 0,
    Improcedente: 0,
    "Com cobrança": 0,
    "Sem laudo": 0,
  };

  for (const chamado of chamados) {
    const chave = chamado.laudo || "Sem laudo";
    laudos[chave]++;
  }

  const problemasIdentificados =
    chamados.filter((c) => c.problema);

  const produtosIdentificados =
    chamados.filter((c) => c.produto);

  const duvidasIdentificadas =
    chamados.filter((c) => c.duvida);

  const dias = chamados.map((c) => ({
    dia: c.data?.slice(0, 10),
  }));

  return {
    total: chamados.length,
    laudos,
    problemas: ranking(
      problemasIdentificados,
      "problema"
    ),
    produtos: ranking(
      produtosIdentificados,
      "produto"
    ),
    duvidas: ranking(
      duvidasIdentificadas,
      "duvida"
    ),
    tipos: ranking(chamados, "tipo"),
    porDia: ranking(dias, "dia")
      .map((item) => ({
        nome: item.nome,
        total: item.total,
      }))
      .sort(
        (a, b) =>
          a.nome.localeCompare(b.nome)
      ),

    cobertura: {
      produtosIdentificados:
        produtosIdentificados.length,

      problemasIdentificados:
        problemasIdentificados.length,

      duvidasIdentificadas:
        duvidasIdentificadas.length,

      paginasLidas:
        chamados.filter((c) => c.leituraOk).length,

      laudosClassificados:
        chamados.filter((c) => c.laudo).length,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    if (!process.env.NOTION_TOKEN) {
      return res.status(503).json({
        error: "NOTION_TOKEN não configurado.",
      });
    }

    if (!(await validarUsuario(req))) {
      return res.status(401).json({
        error: "Sessão inválida ou expirada.",
      });
    }

    const { inicio, fim } = req.query;

    const regexData = /^\d{4}-\d{2}-\d{2}$/;

    if (
      typeof inicio !== "string" ||
      typeof fim !== "string" ||
      !regexData.test(inicio) ||
      !regexData.test(fim)
    ) {
      return res.status(400).json({
        error: "Período inválido.",
      });
    }

    const duracao =
      (new Date(fim) - new Date(inicio)) / 86400000;

    if (
      !Number.isFinite(duracao) ||
      duracao < 1 ||
      duracao > 370
    ) {
      return res.status(400).json({
        error: "Período permitido: 1 a 370 dias.",
      });
    }

    const encontrados = await listarChamados(
      `${inicio}T00:00:00-03:00`,
      `${fim}T00:00:00-03:00`
    );

    const paginasParaAnalise =
      encontrados.paginas.slice(0, MAX_DETALHAMENTOS);

    const detalhes = await analisarPaginas(
      paginasParaAnalise
    );

    const chamados = encontrados.paginas.map(
      (pagina) =>
        montarChamado(
          pagina,
          detalhes.get(pagina.id)
        )
    );

    const resumo = indicadores(chamados);

    return res.status(200).json({
      periodo: { inicio, fim },
      indicadores: resumo,
      atualizadoEm: new Date().toISOString(),

      avisos: {
        base:
          "Chamados de Assistências Técnicas e Suporte Técnico",

        criterioData:
          "Data de criação do chamado",

        limiteRegistros:
          encontrados.limitado,

        limiteAnalises:
          encontrados.paginas.length >
          MAX_DETALHAMENTOS,

        laudosAnalisados:
          resumo.cobertura.paginasLidas,

        laudosPendentes:
          resumo.total -
          resumo.cobertura.laudosClassificados,

        leituraIncompleta:
          resumo.cobertura.paginasLidas <
          Math.min(
            resumo.total,
            MAX_DETALHAMENTOS
          ),
      },
    });

  } catch (error) {
    console.error(
      "Synter Analytics:",
      error.message
    );

    return res.status(500).json({
      error:
        "Erro ao consultar o Notion. Verifique o log da função na Vercel e as permissões de leitura.",
    });
  }
}
