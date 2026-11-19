import { Client } from "@notionhq/client";
import PDFDocument from "pdfkit";
import { exigirAcesso, lerCargosPermitidos } from "../_lib/exigirAcesso.js";


// =====================================================
// NOTION
// =====================================================

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Formato aceito para o ID de uma página do Notion
const FORMATO_ID_NOTION =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const semTracos = (valor) =>
  String(valor || "").replace(/-/g, "").toLowerCase();


// =====================================================
// RICH TEXT PARA TEXTO
// =====================================================

function textoRichText(richText = []) {
  return richText
    .map((item) => item.plain_text || "")
    .join("");
}


// =====================================================
// OBTER VALOR DE PROPRIEDADE
// =====================================================

function obterValor(propriedade) {
  if (!propriedade) {
    return "";
  }

  switch (propriedade.type) {
    case "title":
      return textoRichText(
        propriedade.title
      );

    case "rich_text":
      return textoRichText(
        propriedade.rich_text
      );

    case "select":
      return propriedade.select?.name || "";

    case "status":
      return propriedade.status?.name || "";

    case "multi_select":
      return (
        propriedade.multi_select
          ?.map((item) => item.name)
          .join(", ") || ""
      );

    case "date":
      return propriedade.date?.start || "";

    case "phone_number":
      return propriedade.phone_number || "";

    case "email":
      return propriedade.email || "";

    case "url":
      return propriedade.url || "";

    case "number":
      return propriedade.number ?? "";

    case "checkbox":
      return propriedade.checkbox
        ? "Sim"
        : "Não";

    case "people":
      return (
        propriedade.people
          ?.map(
            (pessoa) =>
              pessoa.name ||
              pessoa.person?.email ||
              ""
          )
          .filter(Boolean)
          .join(", ") || ""
      );

    case "unique_id":
      if (
        propriedade.unique_id?.number ===
        undefined
      ) {
        return "";
      }

      return propriedade.unique_id.prefix
        ? `${propriedade.unique_id.prefix}${propriedade.unique_id.number}`
        : String(
            propriedade.unique_id.number
          );

    default:
      return "";
  }
}


// =====================================================
// TENTA VÁRIOS NOMES
// =====================================================

function obterPrimeiroValor(
  properties,
  nomes = []
) {
  for (const nome of nomes) {
    const valor =
      obterValor(
        properties[nome]
      );

    if (
      valor !== "" &&
      valor !== null &&
      valor !== undefined
    ) {
      return valor;
    }
  }

  return "";
}


// =====================================================
// NOME DO CLIENTE
// =====================================================

function obterNomeCliente(properties) {
  const propriedadeTitulo =
    Object
      .values(properties)
      .find(
        (propriedade) =>
          propriedade.type === "title"
      );

  return obterValor(
    propriedadeTitulo
  );
}


// =====================================================
// TEXTO DO BLOCO
// =====================================================

function obterTextoDoBloco(bloco) {
  const tipo =
    bloco.type;

  const dados =
    bloco[tipo];

  if (!dados) {
    return "";
  }

  if (dados.rich_text) {
    return textoRichText(
      dados.rich_text
    );
  }

  if (
    tipo === "child_page" ||
    tipo === "child_database"
  ) {
    return dados.title || "";
  }

  return "";
}


// =====================================================
// BUSCAR BLOCOS FILHOS
// =====================================================

async function buscarBlocosFilhos(
  blockId
) {
  let blocos = [];

  let cursor = undefined;

  do {
    const resposta =
      await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
        start_cursor: cursor,
      });

    blocos.push(
      ...resposta.results
    );

    cursor =
      resposta.has_more
        ? resposta.next_cursor
        : undefined;

  } while (cursor);

  return blocos;
}


// =====================================================
// LER CONTEÚDO COMPLETO
// =====================================================

async function lerConteudoChamado(
  pageId
) {
  const blocos =
    await buscarBlocosFilhos(
      pageId
    );

  const resultado = [];

  for (const bloco of blocos) {
    const texto =
      obterTextoDoBloco(
        bloco
      );

    if (texto) {
      resultado.push({
        id: bloco.id,
        tipo: bloco.type,
        texto,
      });
    }

    if (bloco.has_children) {
      const filhos =
        await lerConteudoChamado(
          bloco.id
        );

      resultado.push(
        ...filhos
      );
    }
  }

  return resultado;
}


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase();
}


// =====================================================
// EXTRAIR SEÇÃO DO CONTEÚDO
// =====================================================

function extrairSecao(
  conteudo,
  titulo
) {
  const tituloNormalizado =
    normalizarTexto(
      titulo
    );

  const indice =
    conteudo.findIndex(
      (item) => {
        const heading =
          item.tipo === "heading_1" ||
          item.tipo === "heading_2" ||
          item.tipo === "heading_3";

        return (
          heading &&
          normalizarTexto(
            item.texto
          ) === tituloNormalizado
        );
      }
    );

  if (indice === -1) {
    return "Não informado.";
  }

  const textos = [];

  for (
    let i = indice + 1;
    i < conteudo.length;
    i++
  ) {
    const item =
      conteudo[i];

    if (
      item.tipo === "heading_1" ||
      item.tipo === "heading_2" ||
      item.tipo === "heading_3"
    ) {
      break;
    }

    if (
      item.tipo === "callout"
    ) {
      continue;
    }

    if (
      item.texto?.trim()
    ) {
      textos.push(
        item.texto.trim()
      );
    }
  }

  return (
    textos.join("\n\n") ||
    "Não informado."
  );
}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {
  if (!data) {
    return "Não informada";
  }

  const dataLimpa =
    String(data)
      .substring(0, 10);

  const partes =
    dataLimpa.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return (
    `${partes[2]}/${partes[1]}/${partes[0]}`
  );
}


// =====================================================
// VERIFICAR ESPAÇO
// =====================================================

function verificarEspaco(
  doc,
  altura = 100
) {
  if (
    doc.y + altura >
    780
  ) {
    doc.addPage();

    doc.x = 50;
    doc.y = 50;
  }
}


// =====================================================
// REPOSICIONAR
// =====================================================

function reposicionarCursor(doc) {
  doc.x = 50;
}


// =====================================================
// TÍTULO DE SEÇÃO
// =====================================================

function tituloSecaoPDF(
  doc,
  titulo
) {
  verificarEspaco(
    doc,
    100
  );

  reposicionarCursor(
    doc
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#111111")
    .text(
      titulo.toUpperCase(),
      50,
      doc.y,
      {
        width: 495,
      }
    );

  doc.moveDown(0.45);

  const linhaY =
    doc.y;

  doc
    .strokeColor("#D9D9D9")
    .lineWidth(0.7)
    .moveTo(
      50,
      linhaY
    )
    .lineTo(
      545,
      linhaY
    )
    .stroke();

  doc.y =
    linhaY + 14;

  reposicionarCursor(
    doc
  );
}


// =====================================================
// CAMPO
// =====================================================

function campoPDF(
  doc,
  titulo,
  valor
) {
  verificarEspaco(
    doc,
    65
  );

  reposicionarCursor(
    doc
  );

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888888")
    .text(
      titulo.toUpperCase(),
      50,
      doc.y,
      {
        width: 495,
      }
    );

  doc.moveDown(0.25);

  reposicionarCursor(
    doc
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor("#161616")
    .text(
      String(
        valor ||
        "Não informado"
      ),
      50,
      doc.y,
      {
        width: 495,
        lineGap: 2,
      }
    );

  doc.moveDown(0.9);

  reposicionarCursor(
    doc
  );
}


// =====================================================
// TEXTO LONGO
// =====================================================

function textoLongoPDF(
  doc,
  texto
) {
  verificarEspaco(
    doc,
    120
  );

  reposicionarCursor(
    doc
  );

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#333333")
    .text(
      texto ||
      "Não informado.",
      50,
      doc.y,
      {
        width: 495,
        lineGap: 4,
        align: "left",
      }
    );

  doc.moveDown(1.6);

  reposicionarCursor(
    doc
  );
}


// =====================================================
// API PDF
// =====================================================

export default async function handler(
  req,
  res
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({
        sucesso: false,
        mensagem:
          "Método não permitido.",
      });
  }

  // Só usuários logados e com cargo autorizado acessam os chamados
  const acesso = await exigirAcesso(req, res, {
    cargos: lerCargosPermitidos("SAT_CARGOS_PERMITIDOS"),
  });

  if (!acesso) return;

  // Contém dados pessoais de clientes: nunca guardar em cache
  res.setHeader("Cache-Control", "no-store");

  try {
    const pageId =
      req.query.pageId;

    if (
      typeof pageId !== "string" ||
      !FORMATO_ID_NOTION.test(pageId)
    ) {
      return res
        .status(400)
        .json({
          sucesso: false,
          mensagem:
            "Chamado inválido ou não informado.",
        });
    }


    // =================================================
    // BUSCAR PÁGINA DO NOTION
    // =================================================

    const pagina =
      await notion.pages.retrieve({
        page_id: pageId,
      });

    // Só gera PDF de páginas que pertencem ao banco de chamados.
    // Sem isso, qualquer página que a integração do Notion enxerga
    // poderia ser lida informando o ID dela.
    const fonteEsperada = semTracos(
      process.env.NOTION_DATA_SOURCE_ID
    );

    const fontePagina = semTracos(
      pagina.parent?.data_source_id
    );

    if (!fonteEsperada || fontePagina !== fonteEsperada) {
      console.warn(
        "PDF recusado: página fora do banco de chamados. Tipo do pai:",
        pagina.parent?.type
      );

      return res
        .status(404)
        .json({
          sucesso: false,
          mensagem:
            "Chamado não encontrado.",
        });
    }

    const properties =
      pagina.properties;


    // =================================================
    // CONTEÚDO INTERNO
    // =================================================

    const conteudo =
      await lerConteudoChamado(
        pageId
      );


    // =================================================
    // DADOS
    // =================================================

    const idChamado =
      obterValor(
        properties["ID"]
      );


    const nomeCliente =
      obterNomeCliente(
        properties
      );


    const documento =
      obterPrimeiroValor(
        properties,
        [
          "Digite seu CNPJ ou CPF",
          "CPF ou CNPJ",
          "CPF/CNPJ",
          "CPF",
          "CNPJ",
        ]
      );


    const dataInicio =
      obterValor(
        properties[
          "Data de início"
        ]
      );


    const status =
      obterValor(
        properties["Status"]
      );


    const parecer =
      obterValor(
        properties["Parecer"]
      );


    const atendidoPor =
      obterPrimeiroValor(
        properties,
        [
          "Atendido por",
          "Responsável",
          "Tecnico",
          "Técnico",
        ]
      );


    const tipoProblema =
      obterValor(
        properties[
          "Tipo de problema"
        ]
      );


    const assistencia =
      obterPrimeiroValor(
        properties,
        [
          "Assistência ou Suporte",
          "Tipo de assistencia",
          "Tipo de assistência",
        ]
      );


    const telefone =
      obterValor(
        properties["Telefone"]
      );


    const localizacao =
      obterValor(
        properties["Localização"]
      );


    const tipoProduto =
      obterValor(
        properties[
          "Tipo de produto"
        ]
      );


    const produtoEletronico =
      obterPrimeiroValor(
        properties,
        [
          "Produto Eletronico",
          "Produto Eletrônico",
        ]
      );


    const produtoMecanico =
      obterPrimeiroValor(
        properties,
        [
          "Produto Mec",
          "Produto Mecanico",
          "Produto Mecânico",
        ]
      );


    const produto =
      produtoEletronico ||
      produtoMecanico ||
      "Não informado";


    // =================================================
    // DESCRIÇÕES
    // =================================================

    const descricaoProblema =
      extrairSecao(
        conteudo,
        "Descrição do problema"
      );


    const parecerTecnico =
      extrairSecao(
        conteudo,
        "Parecer técnico"
      );


    const descricaoSolucao =
      extrairSecao(
        conteudo,
        "Descrição da solução"
      );


    // =================================================
    // CRIAR PDF
    // =================================================

    const doc =
      new PDFDocument({
        size: "A4",

        margins: {
          top: 45,
          bottom: 45,
          left: 50,
          right: 50,
        },

        info: {
          Title:
            `Chamado SAT #${idChamado}`,

          Author:
            "Synter",

          Subject:
            "Relatório de Atendimento Técnico",
        },
      });


    // =================================================
    // CAPTURAR PDF EM MEMÓRIA
    // =================================================

    const chunks = [];

    doc.on(
      "data",
      (chunk) => {
        chunks.push(chunk);
      }
    );


    // =================================================
    // CABEÇALHO
    // =================================================

    doc
      .rect(
        0,
        0,
        595.28,
        125
      )
      .fill("#080808");


    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(27)
      .text(
        "synter",
        50,
        37,
        {
          width: 200,
        }
      );


    doc
      .fillColor("#A0A0A0")
      .font("Helvetica")
      .fontSize(8)
      .text(
        "ASSISTÊNCIA TÉCNICA",
        50,
        72,
        {
          width: 250,
          characterSpacing: 1.5,
        }
      );


    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        `CHAMADO #${idChamado || "—"}`,
        350,
        44,
        {
          width: 195,
          align: "right",
        }
      );


    doc
      .fillColor("#A0A0A0")
      .font("Helvetica")
      .fontSize(8)
      .text(
        formatarData(
          dataInicio
        ),
        350,
        66,
        {
          width: 195,
          align: "right",
        }
      );


    doc.x = 50;
    doc.y = 155;


    // =================================================
    // TÍTULO
    // =================================================

    doc
      .fillColor("#111111")
      .font("Helvetica-Bold")
      .fontSize(23)
      .text(
        "Relatório de Atendimento Técnico",
        50,
        doc.y,
        {
          width: 495,
        }
      );


    doc.moveDown(0.45);

    doc.x = 50;


    doc
      .fillColor("#777777")
      .font("Helvetica")
      .fontSize(10)
      .text(
        "Documento referente ao atendimento registrado pela equipe Synter.",
        50,
        doc.y,
        {
          width: 495,
        }
      );


    doc.moveDown(1.5);


    // =================================================
    // DADOS DO ATENDIMENTO
    // =================================================

    tituloSecaoPDF(
      doc,
      "Dados do atendimento"
    );


    campoPDF(
      doc,
      "Número do chamado",
      `#${idChamado || "—"}`
    );


    campoPDF(
      doc,
      "Data de início",
      formatarData(
        dataInicio
      )
    );


    campoPDF(
      doc,
      "Status",
      status
    );


    campoPDF(
      doc,
      "Parecer",
      parecer
    );


    campoPDF(
      doc,
      "Atendimento",
      assistencia
    );


    if (atendidoPor) {
      campoPDF(
        doc,
        "Atendido por",
        atendidoPor
      );
    }


    if (tipoProblema) {
      campoPDF(
        doc,
        "Tipo de problema",
        tipoProblema
      );
    }


    // =================================================
    // CLIENTE
    // =================================================

    tituloSecaoPDF(
      doc,
      "Dados do cliente"
    );


    campoPDF(
      doc,
      "Nome completo",
      nomeCliente
    );


    campoPDF(
      doc,
      "CPF / CNPJ",
      documento
    );


    campoPDF(
      doc,
      "Telefone",
      telefone
    );


    campoPDF(
      doc,
      "Localização",
      localizacao
    );


    // =================================================
    // PRODUTO
    // =================================================

    tituloSecaoPDF(
      doc,
      "Produto"
    );


    campoPDF(
      doc,
      "Produto",
      produto
    );


    campoPDF(
      doc,
      "Tipo de produto",
      tipoProduto
    );


    // =================================================
    // DESCRIÇÃO
    // =================================================

    tituloSecaoPDF(
      doc,
      "Descrição do problema"
    );


    textoLongoPDF(
      doc,
      descricaoProblema
    );


    // =================================================
    // PARECER TÉCNICO
    // =================================================

    tituloSecaoPDF(
      doc,
      "Parecer técnico"
    );


    textoLongoPDF(
      doc,
      parecerTecnico
    );


    // =================================================
    // SOLUÇÃO
    // =================================================

    tituloSecaoPDF(
      doc,
      "Solução ou encaminhamento"
    );


    textoLongoPDF(
      doc,
      descricaoSolucao
    );


    // =================================================
    // RODAPÉ
    // =================================================

    verificarEspaco(
      doc,
      80
    );


    doc.moveDown(1);


    const linhaRodape =
      doc.y;


    doc
      .strokeColor("#D8D8D8")
      .lineWidth(0.7)
      .moveTo(
        50,
        linhaRodape
      )
      .lineTo(
        545,
        linhaRodape
      )
      .stroke();


    doc.y =
      linhaRodape + 16;


    doc.x = 50;


    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#888888")
      .text(
        "Documento gerado automaticamente a partir do atendimento registrado no sistema de Assistência Técnica Synter.",
        50,
        doc.y,
        {
          width: 495,
          align: "center",
        }
      );


    // =================================================
    // FINALIZAR
    // =================================================

    doc.end();


    await new Promise(
      (resolve, reject) => {
        doc.on(
          "end",
          resolve
        );

        doc.on(
          "error",
          reject
        );
      }
    );


    const pdfBuffer =
      Buffer.concat(
        chunks
      );


    const nomeArquivo =
      `Chamado-SAT-${idChamado || "Synter"}.pdf`;


    res.setHeader(
      "Content-Type",
      "application/pdf"
    );


    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeArquivo}"`
    );


    return res
      .status(200)
      .send(pdfBuffer);


  } catch (erro) {
    console.error(
      "Erro ao gerar PDF:",
      erro
    );


    return res
      .status(500)
      .json({
        sucesso: false,

        mensagem:
          "Não foi possível gerar o PDF do chamado.",
      });
  }
}