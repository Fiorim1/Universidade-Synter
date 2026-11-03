
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

const DATA_SOURCE_ID =
  process.env.NOTION_DATA_SOURCE_ID;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const pausa = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function textoRico(itens = []) {
  return itens
    .map(
      (item) =>
        item.plain_text ??
        item.text?.content ??
        ""
    )
    .join("")
    .trim();
}

function valorPropriedade(prop) {
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

    case "date":
      return prop.date?.start || "";

    case "number":
      return String(prop.number ?? "");

    case "formula":
      return String(
        prop.formula?.string ??
        prop.formula?.number ??
        ""
      );

    case "url":
      return prop.url || "";

    default:
      return "";
  }
}

function obterCampo(props, nomes) {
  const entradas = Object.entries(props || {});

  for (const nome of nomes) {
    const entrada = entradas.find(
      ([chave]) =>
        normalizar(chave) === normalizar(nome)
    );

    const valor = valorPropriedade(entrada?.[1]);

    if (valor) return valor;
  }

  return "";
}

function valorUtil(valor) {
  const v = normalizar(valor);

  return (
    v &&
    ![
      "nao informado",
      "nao informada",
      "nenhum",
      "n/a",
      "-",
    ].includes(v)
  );
}

// ========================================
// REQUISIÇÕES À API DO NOTION
// ========================================

async function notion(
  caminho,
  opcoes = {},
  tentativa = 0
) {
  const resposta = await fetch(
    `${NOTION_API}${caminho}`,
    {
      ...opcoes,
      headers: {
        Authorization:
          `Bearer ${process.env.NOTION_TOKEN}`,

        "Notion-Version": NOTION_VERSION,

        "Content-Type": "application/json",
      },
    }
  );

  if (
    (
      resposta.status === 429 ||
      resposta.status >= 500
    ) &&
    tentativa < 4
  ) {
    const segundos = Math.min(
      Number(
        resposta.headers.get("retry-after")
      ) ||
        2 ** tentativa + 1,
      12
    );

    await pausa(segundos * 1000);

    return notion(
      caminho,
      opcoes,
      tentativa + 1
    );
  }

  if (!resposta.ok) {
    const erro = await resposta.text();

    throw new Error(
      `Notion HTTP ${resposta.status}: ${
        erro.slice(0, 200)
      }`
    );
  }

  return resposta.json();
}

// ========================================
// AUTENTICAÇÃO COM SUPABASE
// ========================================

async function validarLogin(req) {
  const cabecalho =
    req.headers.authorization || "";

  const token = cabecalho.startsWith("Bearer ")
    ? cabecalho.slice(7)
    : "";

  if (!token) return false;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const chave =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !chave) {
    throw new Error(
      "Configuração do Supabase ausente."
    );
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

// ========================================
// EXTRAIR CAMPOS REAIS DOS CHAMADOS
// ========================================

function extrairPropriedades(pagina) {
  const props = pagina.properties || {};

  // ----------------------------------------
  // TIPO DO PRODUTO
  // ----------------------------------------

  const tipo = obterCampo(props, [
    "Tipo de produto",
    "Tipo do produto",
  ]);

  // ----------------------------------------
  // PRODUTOS ELETRÔNICOS E MECÂNICOS
  // ----------------------------------------

  const eletronico = obterCampo(props, [
    "Produto Eletronico",
    "Produto Eletrônico",
  ]);

  const mecanico = obterCampo(props, [
    "Produto Mec",
    "Produto Mecânico",
    "Produto Mecanico",
  ]);

  const generico = obterCampo(props, [
    "Produto (nome e/ou modelo)",
    "Nome do produto",
    "Modelo",
    "Produto",
  ]);

  // Seleciona prioritariamente o campo
  // correspondente ao tipo de produto.

  const principal =
    normalizar(tipo).includes("eletronico")
      ? eletronico
      : normalizar(tipo).includes("mecanico")
        ? mecanico
        : eletronico || mecanico;

  // Ignora "Não Informado" no ranking.

  const produto =
    [
      principal,
      generico,
      eletronico,
      mecanico,
    ].find(valorUtil) || null;

  // ----------------------------------------
  // TIPO DE PROBLEMA
  // ----------------------------------------

  const tipoProblema = obterCampo(props, [
    "Tipo de problema",
    "Tipo do problema",
  ]);

  // ----------------------------------------
  // CONSOLIDAR DADOS
  // ----------------------------------------

  return {
    id: pagina.id,

    data: (
      obterCampo(props, [
        "Data de início",
        "Data de abertura",
        "Data do atendimento",
      ]) ||
      pagina.created_time ||
      ""
    ).slice(0, 10),

    dataConclusao: obterCampo(props, [
      "Data de conclusão",
      "Data de finalização",
    ]),

    produto,

    tipo: tipo || null,

    atendimento:
      obterCampo(props, [
        "Assistência ou Suporte",
        "Tipo de assistência",
        "Tipo de assistencia",
      ]) || null,

    status:
      obterCampo(props, [
        "Status",
        "Situação",
      ]) || null,

    parecer:
      obterCampo(props, [
        "Parecer",
        "Laudo",
        "Laudo da ocorrência",
      ]) || null,

    tipoProblema:
      valorUtil(tipoProblema)
        ? tipoProblema
        : null,

    responsavel:
      obterCampo(props, [
        "Atendido por",
        "Responsável",
        "Responsavel",
      ]) || null,

    relato:
      obterCampo(props, [
        "Descrição da ocorrência (através do relato do cliente/usuario)",
        "Descrição da ocorrência",
        "Descrição do problema",
        "Relato do cliente",
        "Problema relatado",
      ]) || "",
  };
}

// ========================================
// LISTAR CHAMADOS
// MANTÉM A PAGINAÇÃO EXISTENTE
// ========================================

async function listarPaginas(cursor) {
  const corpo = {
    page_size: 100,
  };

  if (cursor) {
    corpo.start_cursor = cursor;
  }

  const dados = await notion(
    `/data_sources/${DATA_SOURCE_ID}/query`,
    {
      method: "POST",
      body: JSON.stringify(corpo),
    }
  );

  return {
    chamados: (dados.results || [])
      .filter(
        (pagina) =>
          !pagina.archived &&
          !pagina.in_trash
      )
      .map(extrairPropriedades),

    has_more: Boolean(dados.has_more),

    next_cursor: dados.next_cursor,
  };
}

// ========================================
// VALIDAR ORIGEM DO CHAMADO
// ========================================

async function verificarOrigem(pagina) {
  const pai =
    pagina.parent?.data_source_id ||
    pagina.parent?.database_id;

  if (pai === DATA_SOURCE_ID) {
    return;
  }

  // Compatibilidade com o banco
  // associado à fonte de dados.

  const fonte = await notion(
    `/data_sources/${DATA_SOURCE_ID}`
  );

  if (
    !fonte.parent?.database_id ||
    pai !== fonte.parent.database_id
  ) {
    throw new Error(
      "Página fora da base de chamados autorizada."
    );
  }
}

// ========================================
// LER BLOCOS INTERNOS DO NOTION
// ========================================

async function lerBlocos(
  id,
  nivel = 0,
  controle = { quantidade: 0 }
) {
  if (nivel > 8) {
    throw new Error(
      "Profundidade de blocos superior ao limite de segurança."
    );
  }

  const saida = [];

  let cursor;

  do {
    const params = new URLSearchParams({
      page_size: "100",
    });

    if (cursor) {
      params.set(
        "start_cursor",
        cursor
      );
    }

    const dados = await notion(
      `/blocks/${id}/children?${params}`
    );

    for (const bloco of dados.results || []) {
      controle.quantidade++;

      if (controle.quantidade > 2000) {
        throw new Error(
          "Limite de blocos do chamado excedido."
        );
      }

      saida.push(bloco);

      if (bloco.has_children) {
        const filhos = await lerBlocos(
          bloco.id,
          nivel + 1,
          controle
        );

        saida.push(...filhos);
      }
    }

    cursor = dados.has_more
      ? dados.next_cursor
      : null;

    if (dados.has_more && !cursor) {
      throw new Error(
        "Paginação incompleta dos blocos."
      );
    }
  } while (cursor);

  return saida;
}

// ========================================
// TEXTO DE CADA BLOCO
// ========================================

function obterTextoBloco(bloco) {
  const conteudo =
    bloco[bloco.type] || {};

  return textoRico(
    conteudo.rich_text ||
    conteudo.title ||
    []
  );
}

// ========================================
// IDENTIFICAR SEÇÕES DO FORMULÁRIO
//
// - Descrição do problema
// - Parecer técnico
// - Descrição da solução
// - Análise técnica
// ========================================

function extrairSecoes(blocos) {
  const secoes = {
    problema: [],
    parecer: [],
    solucao: [],
    analise: [],
    outros: [],
  };

  const marcados = [];

  let secao = "outros";

  for (const bloco of blocos) {
    const texto = obterTextoBloco(bloco);
    const t = normalizar(texto);

    if (!t) continue;

    const titulo =
      bloco.type.startsWith("heading") ||
      (
        bloco.type === "paragraph" &&
        texto.length < 90
      );

    if (titulo) {
      if (
        /^(descricao do problema|relato da ocorrencia)$/.test(t)
      ) {
        secao = "problema";
        continue;
      }

      if (/^parecer tecnico$/.test(t)) {
        secao = "parecer";
        continue;
      }

      if (
        /^(descricao da solucao|solucao|registro de solucao)$/.test(t)
      ) {
        secao = "solucao";
        continue;
      }

      if (/^analise tecnica$/.test(t)) {
        secao = "analise";
        continue;
      }

      if (
        /^(pedidos de reposicao|identificacao|dados do cliente)$/.test(t)
      ) {
        secao = "outros";
        continue;
      }
    }

    // Identificar caixas marcadas
    // em formulários do Notion.

    if (
      bloco.type === "to_do" &&
      bloco.to_do?.checked
    ) {
      marcados.push({
        texto,
        secao,
      });
    }

    // Ignorar textos instrutivos.

    if (
      /^descreva abaixo (o problema|o parecer tecnico|a solucao)/.test(t)
    ) {
      continue;
    }

    secoes[secao].push(texto);
  }

  return {
    relato:
      secoes.problema
        .join(" ")
        .trim(),

    parecerTecnico:
      secoes.parecer
        .join(" ")
        .trim(),

    solucao:
      secoes.solucao
        .join(" ")
        .trim(),

    analise:
      secoes.analise
        .join(" ")
        .trim(),

    marcados,
  };
}

// ========================================
// CLASSIFICAÇÕES TÉCNICAS COMPLEMENTARES
// ========================================

function categoriaDoTexto(texto) {
  const t = normalizar(texto);

  const regras = [
    [
      "Pilhas e alimentação",
      /pilha|bateria|alimentacao/,
    ],
    [
      "Placa eletrônica",
      /falha eletronica|defeito de placa/,
    ],
    [
      "Aplicativo e comunicação",
      /rede|comunicacao|aplicativo|infraestrutura/,
    ],
    [
      "Cadastro e configuração",
      /configuracao|cadastro|credenciais|reset/,
    ],
    [
      "Instalação inadequada",
      /instalacao inadequada|nao homologad/,
    ],
    [
      "Componentes mecânicos",
      /componentes mecanicos|componentes danificados|travamento/,
    ],
    [
      "Oxidação e corrosão",
      /oxidacao|corrosao|umidade/,
    ],
    [
      "Desgaste e manutenção",
      /desgaste|limpeza|manutencao/,
    ],
    [
      "Dúvidas de utilização",
      /duvidas sobre funcionamento|informacao tecnica divergente/,
    ],
    [
      "Transferência de dispositivo",
      /vinculacao|desvinculacao|transferencia/,
    ],
    [
      "Uso indevido",
      /uso indevido|fora das especificacoes/,
    ],
    [
      "Falha de fabricação",
      /defeito ou falha de fabricacao/,
    ],
  ];

  return (
    regras.find(
      ([, regex]) => regex.test(t)
    )?.[0] || null
  );
}

// ========================================
// SINTOMAS RELATADOS PELO CLIENTE
// ========================================

function sintomaRelatado(texto) {
  const t = normalizar(texto);

  const regras = [
    [
      "Placa, tela ou biometria",
      /placa|biometr|sensor|display|tela|leitor/,
    ],
    [
      "Pilhas e alimentação",
      /pilha|bateria|usb|consumo|carga|energia/,
    ],
    [
      "Aplicativo e comunicação",
      /aplicativo|bluetooth|wi.?fi|conexao/,
    ],
    [
      "Senhas e configuração",
      /senha|cadastro|reset|configuracao/,
    ],
    [
      "Maçaneta ou mecanismo",
      /macaneta|quebr|trinco|travamento|motor|mecanismo/,
    ],
    [
      "Instalação",
      /instalacao|montagem|inversao|reversao/,
    ],
    [
      "Oxidação e corrosão",
      /oxidacao|corrosao|ferrugem/,
    ],
  ];

  return (
    regras.find(
      ([, regex]) => regex.test(t)
    )?.[0] || null
  );
}

// ========================================
// IDENTIFICAR DÚVIDAS
// ========================================

function classificarDuvida(
  tipoProblema,
  relato
) {
  const tipo = normalizar(tipoProblema);
  const texto = normalizar(relato);

  const conjunto = `${tipo} ${texto}`;

  const ehOrientacao =
    /duvida|orientacao|informacao|como (se |fazer|realizar|trocar|cadastrar|configurar)|se informar|gostaria de saber|preciso saber/.test(
      conjunto
    );

  if (!ehOrientacao) {
    return null;
  }

  if (
    /pilha|bateria|troca de pilha/.test(
      conjunto
    )
  ) {
    return "Troca de pilhas";
  }

  if (
    /app|aplicativo|wifi|conexao/.test(
      conjunto
    )
  ) {
    return "Aplicativo e conectividade";
  }

  if (
    /senha|reset|cadastro|digital/.test(
      conjunto
    )
  ) {
    return "Cadastro, senha e reset";
  }

  if (
    /garantia|nota fiscal/.test(
      conjunto
    )
  ) {
    return "Garantia e documentação";
  }

  if (
    /instalacao|montagem/.test(
      conjunto
    )
  ) {
    return "Instalação";
  }

  return "Funcionamento e utilização";
}

// ========================================
// NORMALIZAÇÃO DOS LAUDOS
// ========================================

function laudoOficial(valor) {
  const t = normalizar(valor);

  if (t === "procedente") {
    return "Procedente";
  }

  if (t === "improcedente") {
    return "Improcedente";
  }

  if (t === "com cobranca") {
    return "Com cobrança";
  }

  return null;
}

// ========================================
// LER UM CHAMADO INDIVIDUALMENTE
// ========================================

async function detalharChamado(id) {
  // Recuperar página original do Notion.

  const pagina = await notion(
    `/pages/${id}`
  );

  // Validar origem da página.

  await verificarOrigem(pagina);

  // Ler propriedades reais.

  const base = extrairPropriedades(pagina);

  // Ler todos os blocos disponíveis.

  const blocos = await lerBlocos(id);

  // Identificar textos do formulário.

  const secoes = extrairSecoes(blocos);

  // Consolidar o relato do cliente.

  const relatoCompleto = [
    base.relato,
    secoes.relato,
  ]
    .filter(Boolean)
    .join(" ");

  // ====================================
  // CLASSIFICAÇÃO PRINCIPAL
  //
  // Prioridade: Tipo de problema no Notion.
  // ====================================

  const categorias = [];

  if (base.tipoProblema) {
    categorias.push(
      base.tipoProblema
    );
  }

  // Classificações complementares
  // marcadas na análise técnica.

  for (const marcado of secoes.marcados) {
    if (
      marcado.secao !== "analise"
    ) {
      continue;
    }

    const categoria =
      categoriaDoTexto(
        marcado.texto
      );

    if (
      categoria &&
      !categorias.includes(categoria)
    ) {
      categorias.push(categoria);
    }
  }

  // ====================================
  // PARECER
  // ====================================

  const laudoMarcado =
    secoes.marcados
      .filter(
        (item) =>
          item.secao === "parecer" ||
          item.secao === "analise"
      )
      .map(
        (item) =>
          laudoOficial(item.texto)
      )
      .find(Boolean);

  // ====================================
  // RETORNAR ANÁLISE PARA O FRONTEND
  // ====================================

  return {
    ...base,

    relato: relatoCompleto,

    parecerTecnico:
      secoes.parecerTecnico,

    solucao:
      secoes.solucao,

    categorias,

    sintoma:
      sintomaRelatado(
        relatoCompleto
      ),

    duvida:
      classificarDuvida(
        base.tipoProblema,
        relatoCompleto
      ),

    laudo:
      laudoOficial(base.parecer) ||
      laudoMarcado ||
      null,

    classificacaoConfirmada:
      categorias.length > 0,

    leituraCompleta: true,
  };
}

// ========================================
// ENDPOINT PRINCIPAL
//
// GET  = LISTAR CHAMADOS
// POST = ANALISAR CHAMADOS INDIVIDUAIS
// ========================================

export default async function handler(
  req,
  res
) {
  res.setHeader(
    "Cache-Control",
    "private, no-store"
  );

  res.setHeader(
    "Vary",
    "Authorization"
  );

  if (
    !["GET", "POST"].includes(req.method)
  ) {
    res.setHeader(
      "Allow",
      "GET, POST"
    );

    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    // Verificar configuração.

    if (
      !process.env.NOTION_TOKEN ||
      !DATA_SOURCE_ID
    ) {
      return res.status(503).json({
        error:
          "Configure NOTION_TOKEN e NOTION_DATA_SOURCE_ID.",
      });
    }

    // Verificar usuário autenticado.

    if (!(await validarLogin(req))) {
      return res.status(401).json({
        error:
          "Sessão inválida ou expirada.",
      });
    }

    // ====================================
    // GET — LISTAGEM
    // ====================================

    if (req.method === "GET") {
      const cursor =
        typeof req.query?.cursor ===
        "string"
          ? req.query.cursor
          : undefined;

      const resultado =
        await listarPaginas(cursor);

      return res.status(200).json(
        resultado
      );
    }

    // ====================================
    // POST — LEITURA DETALHADA
    // ====================================

    const ids = req.body?.ids;

    if (
      !Array.isArray(ids) ||
      ids.length < 1 ||
      ids.length > 4 ||
      new Set(ids).size !== ids.length ||
      ids.some(
        (id) =>
          typeof id !== "string" ||
          !/^(?:[0-9a-f]{32}|[0-9a-f-]{36})$/i.test(
            id
          )
      )
    ) {
      return res.status(400).json({
        error:
          "Envie de 1 a 4 IDs distintos e válidos.",
      });
    }

    // Ler cada chamado separadamente.

    const resultados = [];

    for (const id of ids) {
      try {
        const chamado =
          await detalharChamado(id);

        resultados.push({
          id,
          sucesso: true,
          chamado,
        });
      } catch (erro) {
        console.error(
          `Falha de leitura do chamado ${id}: ${erro.message}`
        );

        resultados.push({
          id,
          sucesso: false,
          erro:
            "Não foi possível ler completamente este chamado.",
        });
      }
    }

    return res.status(200).json({
      resultados,
    });

  } catch (erro) {
    console.error(
      "Synter Analytics:",
      erro.message
    );

    return res.status(500).json({
      error:
        "Falha na consulta do Notion. Verifique os logs da Vercel.",
    });
  }
}
