
const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";

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

const esperar = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function textoRico(itens) {
  return (itens || [])
    .map(
      (item) =>
        item.plain_text ||
        item.text?.content ||
        ""
    )
    .join("");
}

function valorCampo(campo) {
  if (!campo) return "";

  switch (campo.type) {
    case "title":
      return textoRico(campo.title);

    case "rich_text":
      return textoRico(campo.rich_text);

    case "select":
      return campo.select?.name || "";

    case "status":
      return campo.status?.name || "";

    case "multi_select":
      return (campo.multi_select || [])
        .map((item) => item.name)
        .join(", ");

    case "date":
      return campo.date?.start || "";

    case "number":
      return String(campo.number ?? "");

    case "formula":
      return String(
        campo.formula?.string ??
        campo.formula?.number ??
        ""
      );

    default:
      return "";
  }
}

function campo(properties, nomes) {
  const entradas = Object.entries(
    properties || {}
  );

  for (const nome of nomes) {
    const encontrado = entradas.find(
      ([chave]) =>
        normalizar(chave) ===
        normalizar(nome)
    );

    const valor = valorCampo(
      encontrado?.[1]
    );

    if (valor) return valor;
  }

  return "";
}

// ========================================
// CONSULTAS À API DO NOTION
// ========================================

async function requisitarNotion(
  caminho,
  options = {},
  tentativa = 0
) {
  const resposta = await fetch(
    `${API}${caminho}`,
    {
      ...options,
      headers: {
        Authorization:
          `Bearer ${process.env.NOTION_TOKEN}`,

        "Notion-Version": VERSION,

        "Content-Type": "application/json",
      },
    }
  );

  // Controle de limite de requisições

  if (
    resposta.status === 429 &&
    tentativa < 5
  ) {
    const segundos = Math.min(
      Number(
        resposta.headers.get(
          "retry-after"
        )
      ) || 2,
      15
    );

    await esperar(segundos * 1000);

    return requisitarNotion(
      caminho,
      options,
      tentativa + 1
    );
  }

  if (!resposta.ok) {
    const erro = await resposta.text();

    throw new Error(
      `Notion HTTP ${resposta.status}: ${
        erro.slice(0, 250)
      }`
    );
  }

  return resposta.json();
}

// ========================================
// AUTENTICAÇÃO DO USUÁRIO
// ========================================

async function verificarSessao(req) {
  const authorization =
    req.headers.authorization || "";

  const token = authorization.startsWith(
    "Bearer "
  )
    ? authorization.slice(7)
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
      "Configuração de autenticação ausente."
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
// EXTRAÇÃO DAS PROPRIEDADES DO CHAMADO
// ========================================

function resumirPagina(pagina) {
  const props = pagina.properties || {};

  return {
    id: pagina.id,

    data: (
      campo(props, [
        "Data de início",
        "Data de abertura",
        "Data do atendimento",
      ]) || pagina.created_time
    ).slice(0, 10),

    produto: campo(props, [
      "Produto (nome e/ou modelo)",
      "Nome do produto",
      "Modelo",
      "Produto",
    ]),

    tipo: campo(props, [
      "Tipo de produto",
      "Tipo do produto",
    ]),

    atendimento: campo(props, [
      "Assistência ou Suporte",
      "Tipo de assistência",
    ]),

    status: campo(props, [
      "Status",
      "Situação",
    ]),

    parecer: campo(props, [
      "Parecer",
      "Laudo",
      "Laudo da ocorrência",
    ]),

    relato: campo(props, [
      "Descrição da ocorrência (através do relato do cliente/usuario)",
      "Descrição da ocorrência",
      "Relato do cliente",
      "Problema relatado",
    ]),
  };
}

// ========================================
// LISTAR CHAMADOS DO NOTION
//
// A paginação permite que o frontend
// recupere todas as páginas da base.
// ========================================

async function listarPaginas(cursor) {
  const body = {
    page_size: 100,
  };

  if (cursor) {
    body.start_cursor = cursor;
  }

  const resposta = await requisitarNotion(
    `/data_sources/${DATA_SOURCE_ID}/query`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return {
    chamados: (resposta.results || [])
      .filter(
        (pagina) =>
          !pagina.archived &&
          !pagina.in_trash
      )
      .map(resumirPagina),

    has_more: Boolean(
      resposta.has_more
    ),

    next_cursor:
      resposta.next_cursor,
  };
}

// ========================================
// LER BLOCOS INTERNOS DOS CHAMADOS
//
// Inclui blocos aninhados e paginação.
// ========================================

async function lerBlocos(
  id,
  profundidade = 0,
  controle = { total: 0 }
) {
  if (profundidade > 6) {
    throw new Error(
      "O chamado contém blocos mais profundos que o limite de leitura."
    );
  }

  const encontrados = [];
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

    const resposta =
      await requisitarNotion(
        `/blocks/${id}/children?${params}`
      );

    for (
      const bloco of
      resposta.results || []
    ) {
      controle.total++;

      if (controle.total > 1200) {
        throw new Error(
          "O chamado ultrapassou o limite de segurança de 1200 blocos."
        );
      }

      encontrados.push(bloco);

      if (bloco.has_children) {
        const filhos = await lerBlocos(
          bloco.id,
          profundidade + 1,
          controle
        );

        encontrados.push(...filhos);
      }
    }

    cursor = resposta.next_cursor;

    if (!resposta.has_more) {
      break;
    }
  } while (cursor);

  return encontrados;
}

// ========================================
// CLASSIFICAÇÕES TÉCNICAS
// ========================================

function categoriaTecnica(texto) {
  const t = normalizar(texto);

  const regras = [
    [
      "Pilhas e alimentação",
      /pilhas|alimentacao|bateria/,
    ],
    [
      "Placa eletrônica",
      /falha eletronica|defeito de placa/,
    ],
    [
      "Funcionamento eletrônico",
      /comportamento anormal|falha de funcionamento/,
    ],
    [
      "Aplicativo e comunicação",
      /rede|comunicacao|aplicativo|infraestrutura/,
    ],
    [
      "Cadastro e configuração",
      /configuracao|cadastro|reset|credenciais/,
    ],
    [
      "Instalação inadequada",
      /instalacao inadequada|nao homologad/,
    ],
    [
      "Componentes mecânicos",
      /componentes mecanicos|componentes danificados|mecanismo de travamento|falha de funcionamento mecanico/,
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
      "Falha de fabricação",
      /defeito ou falha de fabricacao/,
    ],
    [
      "Dúvidas de utilização",
      /duvidas sobre funcionamento|documentacao|manual|informacao tecnica divergente/,
    ],
    [
      "Transferência de dispositivo",
      /vinculacao|desvinculacao|transferencia/,
    ],
    [
      "Falta de componentes",
      /falta de componentes|perda|substituicao de componentes/,
    ],
    [
      "Uso indevido",
      /uso indevido|fora das especificacoes/,
    ],
    [
      "Intervenção não autorizada",
      /intervencao|modificacao nao autorizada/,
    ],
    [
      "Incompatibilidade",
      /incompativeis|incompativel/,
    ],
  ];

  return (
    regras.find(
      ([, regex]) => regex.test(t)
    )?.[0] || null
  );
}

// ========================================
// IDENTIFICAR SINTOMAS RELATADOS
// ========================================

function sintomaRelatado(texto) {
  const t = normalizar(texto);

  if (!t) return null;

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
  texto,
  marcada = false
) {
  const t = normalizar(texto);

  if (
    !marcada &&
    !/duvida|como |orientacao|gostaria de saber|preciso saber|informacao/.test(
      t
    )
  ) {
    return null;
  }

  if (
    /aplicativo|wifi|conexao/.test(t)
  ) {
    return "Aplicativo e conectividade";
  }

  if (
    /reset|senha|cadastro|digital/.test(t)
  ) {
    return "Senha, cadastro e reset";
  }

  if (
    /garantia|nota fiscal/.test(t)
  ) {
    return "Garantia e documentação";
  }

  if (
    /instalacao|montagem/.test(t)
  ) {
    return "Instalação";
  }

  return "Uso e funcionamento";
}

// ========================================
// IDENTIFICAR LAUDO OFICIAL
// ========================================

function laudoOficial(texto) {
  const t = normalizar(texto);

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
// ANALISAR BLOCOS DO CHAMADO
// ========================================

function analisarConteudo(blocos) {
  let secao = "";

  const relato = [];
  const categorias = [];
  const duvidas = [];

  let laudo = null;

  for (const bloco of blocos) {
    const texto = textoRico(
      bloco[bloco.type]?.rich_text
    ).trim();

    const t = normalizar(texto);

    if (!t) continue;

    const tituloDeSecao =
      bloco.type.startsWith("heading") ||
      (
        texto.length < 90 &&
        bloco.type === "paragraph"
      );

    if (tituloDeSecao) {
      if (
        /relato da ocorrencia/.test(t)
      ) {
        secao = "relato";
        continue;
      }

      if (
        /analise tecnica/.test(t)
      ) {
        secao = "analise";
        continue;
      }

      if (
        /parecer tecnico/.test(t)
      ) {
        secao = "parecer";
        continue;
      }

      if (
        /laudo da ocorrencia/.test(t)
      ) {
        secao = "laudo";
        continue;
      }

      if (
        /pedidos de reposicao/.test(t)
      ) {
        secao = "reposicao";
        continue;
      }
    }

    if (secao === "relato") {
      relato.push(texto);
    }

    if (
      secao === "analise" &&
      bloco.type === "to_do" &&
      bloco.to_do?.checked === true
    ) {
      const categoria =
        categoriaTecnica(texto);

      if (
        categoria &&
        !categorias.includes(categoria)
      ) {
        categorias.push(categoria);
      }

      if (
        categoria ===
        "Dúvidas de utilização"
      ) {
        duvidas.push(
          "Uso e funcionamento"
        );
      }
    }

    if (
      secao === "laudo" &&
      bloco.type === "to_do" &&
      bloco.to_do?.checked === true
    ) {
      laudo =
        laudoOficial(texto) ||
        laudo;
    }
  }

  return {
    relatoInterno: relato.join(" "),
    categorias,
    duvidas,
    laudo,
  };
}

// ========================================
// VALIDAR ORIGEM DO CHAMADO
//
// CORREÇÃO:
// Compatibilidade com data_source_id
// e database_id do Notion.
// ========================================

async function validarOrigemChamado(
  pagina
) {
  const parentId =
    pagina.parent?.data_source_id ||
    pagina.parent?.database_id;

  // Página vinculada diretamente
  // à fonte de dados autorizada.

  if (parentId === DATA_SOURCE_ID) {
    return true;
  }

  // Recupera a fonte de dados para
  // identificar o banco correspondente.

  const fonte = await requisitarNotion(
    `/data_sources/${DATA_SOURCE_ID}`
  );

  const bancoDaFonte =
    fonte.parent?.database_id;

  // Permite a página somente quando
  // pertence ao banco autorizado.

  if (
    !bancoDaFonte ||
    parentId !== bancoDaFonte
  ) {
    throw new Error(
      "O chamado não pertence à base autorizada."
    );
  }

  return true;
}

// ========================================
// DETALHAR UM CHAMADO
//
// Consulta a página e todos os blocos
// internos para análise técnica.
// ========================================

async function detalharChamado(id) {
  // 1. Recuperar a página

  const pagina =
    await requisitarNotion(
      `/pages/${id}`
    );

  // 2. Validar origem

  await validarOrigemChamado(
    pagina
  );

  // 3. Recuperar propriedades

  const propriedades =
    resumirPagina(pagina);

  // 4. Ler todos os blocos

  const blocos = await lerBlocos(
    id
  );

  // 5. Analisar as informações

  const analise =
    analisarConteudo(blocos);

  // 6. Consolidar o relato

  const relatoCompleto = [
    propriedades.relato,
    analise.relatoInterno,
  ]
    .filter(Boolean)
    .join(" ");

  // 7. Identificar as categorias

  const categorias =
    analise.categorias.length
      ? analise.categorias
      : [];

  // 8. Identificar os sintomas

  const sintoma =
    sintomaRelatado(
      relatoCompleto
    );

  // 9. Identificar dúvidas

  const duvida =
    analise.duvidas[0] ||
    classificarDuvida(
      relatoCompleto,
      categorias.includes(
        "Dúvidas de utilização"
      )
    );

  // 10. Retornar informações
  // para o Synter Analytics

  return {
    id,

    ...propriedades,

    laudo:
      laudoOficial(
        propriedades.parecer
      ) ||
      analise.laudo,

    categorias,

    sintoma,

    duvida,

    classificacaoConfirmada:
      categorias.length > 0,

    leituraCompleta: true,
  };
}

// ========================================
// ENDPOINT PRINCIPAL
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

  // ====================================
  // MÉTODOS PERMITIDOS
  // ====================================

  if (
    !["GET", "POST"].includes(
      req.method
    )
  ) {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    // ==================================
    // CONFIGURAÇÃO DO NOTION
    // ==================================

    if (
      !process.env.NOTION_TOKEN ||
      !DATA_SOURCE_ID
    ) {
      return res.status(503).json({
        error:
          "Configure NOTION_TOKEN e NOTION_DATA_SOURCE_ID.",
      });
    }

    // ==================================
    // VALIDAR LOGIN
    // ==================================

    if (
      !(await verificarSessao(req))
    ) {
      return res.status(401).json({
        error:
          "Sessão inválida ou expirada.",
      });
    }

    // ==================================
    // GET
    //
    // LISTAR OS CHAMADOS
    // ==================================

    if (req.method === "GET") {
      const cursor =
        typeof req.query.cursor ===
        "string"
          ? req.query.cursor
          : undefined;

      const resultado =
        await listarPaginas(
          cursor
        );

      return res.status(200).json(
        resultado
      );
    }

    // ==================================
    // POST
    //
    // LER CHAMADOS INDIVIDUALMENTE
    // ==================================

    const ids = req.body?.ids;

    if (
      !Array.isArray(ids) ||
      ids.length < 1 ||
      ids.length > 4 ||
      ids.some(
        (id) =>
          typeof id !== "string" ||
          !/^[0-9a-f-]{32,36}$/i.test(
            id
          )
      )
    ) {
      return res.status(400).json({
        error:
          "Envie de 1 a 4 IDs válidos.",
      });
    }

    // ==================================
    // PROCESSAR TODOS OS IDs RECEBIDOS
    // ==================================

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
      } catch (error) {
        console.error(
          `Falha no chamado ${id}:`,
          error.message
        );

        resultados.push({
          id,

          sucesso: false,

          erro:
            "Não foi possível ler completamente este chamado.",
        });
      }
    }

    // ==================================
    // RETORNAR RESULTADOS
    // ==================================

    return res.status(200).json({
      resultados,
    });

  } catch (error) {
    console.error(
      "Synter Analytics:",
      error.message
    );

    return res.status(500).json({
      error:
        "Erro na consulta do Notion. Verifique os logs da Vercel.",
    });
  }
}
