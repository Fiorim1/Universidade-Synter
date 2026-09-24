import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";


// ==========================================
// CAMINHOS
// ==========================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);


// ==========================================
// VARIÁVEIS DE AMBIENTE
// ==========================================

dotenv.config({
  path: path.join(
    __dirname,
    "..",
    ".env.local"
  )
});


// ==========================================
// EXPRESS
// ==========================================

const app = express();

const PORT =
  process.env.SAT_PORT || 3001;


app.use(cors());

app.use(express.json());


// ==========================================
// NOTION
// ==========================================

const notion =
  new Client({
    auth:
      process.env.NOTION_TOKEN
  });


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

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


// ==========================================
// SOMENTE NÚMEROS
// ==========================================

function somenteNumeros(valor = "") {

  return String(valor)
    .replace(/\D/g, "");

}


// ==========================================
// TRANSFORMA RICH TEXT EM TEXTO
// ==========================================

function textoRichText(
  richText = []
) {

  return richText
    .map(
      (item) =>
        item.plain_text || ""
    )
    .join("");

}


// ==========================================
// OBTER VALOR DE PROPRIEDADE DO NOTION
// ==========================================

function obterValor(
  propriedade
) {

  if (!propriedade) {

    return "";

  }


  switch (
    propriedade.type
  ) {


    case "title":

      return textoRichText(
        propriedade.title
      );


    case "rich_text":

      return textoRichText(
        propriedade.rich_text
      );


    case "select":

      return (
        propriedade.select
          ?.name || ""
      );


    case "status":

      return (
        propriedade.status
          ?.name || ""
      );


    case "multi_select":

      return (
        propriedade.multi_select
          ?.map(
            (item) =>
              item.name
          )
          .join(", ") || ""
      );


    case "date":

      return (
        propriedade.date
          ?.start || ""
      );


    case "phone_number":

      return (
        propriedade.phone_number ||
        ""
      );


    case "email":

      return (
        propriedade.email ||
        ""
      );


    case "url":

      return (
        propriedade.url ||
        ""
      );


    case "number":

      return (
        propriedade.number ??
        ""
      );


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
              pessoa.person
                ?.email ||
              ""
          )
          .filter(Boolean)
          .join(", ") || ""
      );


    case "unique_id":

      if (
        propriedade.unique_id
          ?.number === undefined
      ) {

        return "";

      }


      return propriedade
        .unique_id
        .prefix

        ? `${propriedade.unique_id.prefix}${propriedade.unique_id.number}`

        : String(
            propriedade
              .unique_id
              .number
          );


    default:

      return "";

  }

}


// ==========================================
// TENTA VÁRIOS NOMES DE PROPRIEDADE
// ==========================================

function obterPrimeiroValor(
  properties,
  nomes = []
) {

  for (
    const nome
    of nomes
  ) {

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


// ==========================================
// NOME DO CLIENTE
// ==========================================

function obterNomeCliente(
  properties
) {

  const propriedadeTitulo =
    Object
      .values(properties)
      .find(
        (propriedade) =>
          propriedade.type ===
          "title"
      );


  return obterValor(
    propriedadeTitulo
  );

}


// ==========================================
// BUSCAR TODOS OS CHAMADOS
// ==========================================

async function buscarTodosChamados() {

  let chamados = [];

  let cursor = undefined;


  do {

    const resposta =
      await notion
        .dataSources
        .query({

          data_source_id:
            process.env
              .NOTION_DATA_SOURCE_ID,

          page_size:
            100,

          start_cursor:
            cursor

        });


    chamados.push(
      ...resposta.results
    );


    cursor =
      resposta.has_more

        ? resposta.next_cursor

        : undefined;


  } while (cursor);


  return chamados;

}


// ==========================================
// TEXTO DE UM BLOCO
// ==========================================

function obterTextoDoBloco(
  bloco
) {

  const tipo =
    bloco.type;


  const dados =
    bloco[tipo];


  if (!dados) {

    return "";

  }


  if (
    dados.rich_text
  ) {

    return textoRichText(
      dados.rich_text
    );

  }


  if (
    tipo === "child_page" ||
    tipo === "child_database"
  ) {

    return (
      dados.title || ""
    );

  }


  return "";

}


// ==========================================
// BUSCAR BLOCOS FILHOS
// ==========================================

async function buscarBlocosFilhos(
  blockId
) {

  let blocos = [];

  let cursor = undefined;


  do {

    const resposta =
      await notion
        .blocks
        .children
        .list({

          block_id:
            blockId,

          page_size:
            100,

          start_cursor:
            cursor

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


// ==========================================
// LER CONTEÚDO COMPLETO DO CHAMADO
// ==========================================

async function lerConteudoChamado(
  pageId
) {

  const blocos =
    await buscarBlocosFilhos(
      pageId
    );


  const resultado = [];


  for (
    const bloco
    of blocos
  ) {

    const texto =
      obterTextoDoBloco(
        bloco
      );


    if (texto) {

      resultado.push({

        id:
          bloco.id,

        tipo:
          bloco.type,

        texto

      });

    }


    if (
      bloco.has_children
    ) {

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


// ==========================================
// EXTRAIR UMA SEÇÃO
// ==========================================

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
          ) ===
            tituloNormalizado
        );

      }
    );


  if (
    indice === -1
  ) {

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


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(
  data
) {

  if (!data) {

    return "Não informada";

  }


  const dataLimpa =
    String(data)
      .substring(0, 10);


  const partes =
    dataLimpa.split("-");


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return (
    `${partes[2]}/${partes[1]}/${partes[0]}`
  );

}


// ==========================================
// REPOSICIONAR CURSOR
// ==========================================

function reposicionarCursor(
  doc
) {

  doc.x = 50;

}


// ==========================================
// VERIFICAR ESPAÇO NO PDF
// ==========================================

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


// ==========================================
// TÍTULO DE SEÇÃO
// ==========================================

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
        width: 495
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


// ==========================================
// CAMPO DO PDF
// ==========================================

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
        width: 495
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
        lineGap: 2
      }
    );


  doc.moveDown(0.9);


  reposicionarCursor(
    doc
  );

}


// ==========================================
// TEXTO LONGO
// ==========================================

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
        align: "left"
      }
    );


  doc.moveDown(1.6);


  reposicionarCursor(
    doc
  );

}


// ==========================================
// STATUS DA API
// ==========================================

app.get(
  "/apiSAT/status",
  (req, res) => {

    res.json({

      sucesso:
        true,

      mensagem:
        "API SAT funcionando"

    });

  }
);


// ==========================================
// BUSCAR CHAMADOS
// ==========================================

app.get(
  "/apiSAT/buscar",
  async (req, res) => {

    try {

      const pesquisa =
        req.query.q?.trim();


      if (
        !pesquisa
      ) {

        return res
          .status(400)
          .json({

            sucesso:
              false,

            mensagem:
              "Informe CPF, CNPJ ou nome completo."

          });

      }


      const todosChamados =
        await buscarTodosChamados();


      const pesquisaTexto =
        normalizarTexto(
          pesquisa
        );


      const pesquisaDocumento =
        somenteNumeros(
          pesquisa
        );


      const encontrados =
        todosChamados.filter(
          (chamado) => {

            const properties =
              chamado.properties;


            const nome =
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
                  "CNPJ"
                ]
              );


            const nomeIgual =
              normalizarTexto(
                nome
              ) ===
              pesquisaTexto;


            const documentoIgual =
              pesquisaDocumento.length >= 11 &&
              somenteNumeros(
                documento
              ) ===
                pesquisaDocumento;


            return (
              nomeIgual ||
              documentoIgual
            );

          }
        );


      const chamados =
        encontrados.map(
          (chamado) => {

            const properties =
              chamado.properties;


            return {

              notionPageId:
                chamado.id,


              id:
                obterValor(
                  properties[
                    "ID"
                  ]
                ),


              nome:
                obterNomeCliente(
                  properties
                ),


              dataInicio:
                obterValor(
                  properties[
                    "Data de início"
                  ]
                ),


              status:
                obterValor(
                  properties[
                    "Status"
                  ]
                )

            };

          }
        );


      return res.json({

        sucesso:
          true,

        quantidade:
          chamados.length,

        chamados

      });


    } catch (erro) {

      console.error(
        "Erro ao buscar chamados:",
        erro
      );


      return res
        .status(500)
        .json({

          sucesso:
            false,

          mensagem:
            "Não foi possível consultar os chamados."

        });

    }

  }
);


// ==========================================
// GERAR PDF
// ==========================================

app.get(
  "/apiSAT/pdf/:pageId",
  async (req, res) => {

    try {

      const pageId =
        req.params.pageId;


      if (
        !pageId
      ) {

        return res
          .status(400)
          .json({

            sucesso:
              false,

            mensagem:
              "Chamado não informado."

          });

      }


      // ======================================
      // BUSCA A PÁGINA
      // ======================================

      const pagina =
        await notion
          .pages
          .retrieve({

            page_id:
              pageId

          });


      const properties =
        pagina.properties;


      // ======================================
      // CONTEÚDO INTERNO
      // ======================================

      const conteudo =
        await lerConteudoChamado(
          pageId
        );


      // ======================================
      // DADOS DO CHAMADO
      // ======================================

      const idChamado =
        obterValor(
          properties[
            "ID"
          ]
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
            "CNPJ"
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
          properties[
            "Status"
          ]
        );


      const parecer =
        obterValor(
          properties[
            "Parecer"
          ]
        );


      const atendidoPor =
        obterPrimeiroValor(
          properties,
          [
            "Atendido por",
            "Responsável",
            "Tecnico",
            "Técnico"
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
            "Tipo de assistência"
          ]
        );


      const telefone =
        obterValor(
          properties[
            "Telefone"
          ]
        );


      const localizacao =
        obterValor(
          properties[
            "Localização"
          ]
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
            "Produto Eletrônico"
          ]
        );


      const produtoMecanico =
        obterPrimeiroValor(
          properties,
          [
            "Produto Mec",
            "Produto Mecanico",
            "Produto Mecânico"
          ]
        );


      const produto =
        produtoEletronico ||
        produtoMecanico ||
        "Não informado";


      // ======================================
      // DESCRIÇÕES
      // ======================================

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


      // ======================================
      // CRIAR DOCUMENTO
      // ======================================

      const doc =
        new PDFDocument({

          size:
            "A4",

          margins: {

            top:
              45,

            bottom:
              45,

            left:
              50,

            right:
              50

          },

          info: {

            Title:
              `Chamado SAT #${idChamado}`,

            Author:
              "Synter",

            Subject:
              "Relatório de Atendimento Técnico"

          }

        });


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


      doc.pipe(
        res
      );


      // ======================================
      // CABEÇALHO
      // ======================================

      doc
        .rect(
          0,
          0,
          595.28,
          125
        )
        .fill(
          "#080808"
        );


      // LOGO / NOME

      doc
        .fillColor(
          "#ffffff"
        )
        .font(
          "Helvetica-Bold"
        )
        .fontSize(
          27
        )
        .text(
          "synter",
          50,
          37,
          {
            width:
              200
          }
        );


      doc
        .fillColor(
          "#A0A0A0"
        )
        .font(
          "Helvetica"
        )
        .fontSize(
          8
        )
        .text(
          "ASSISTÊNCIA TÉCNICA",
          50,
          72,
          {
            width:
              250,
            characterSpacing:
              1.5
          }
        );


      // CHAMADO

      doc
        .fillColor(
          "#ffffff"
        )
        .font(
          "Helvetica-Bold"
        )
        .fontSize(
          11
        )
        .text(
          `CHAMADO #${idChamado || "—"}`,
          350,
          44,
          {
            width:
              195,
            align:
              "right"
          }
        );


      // DATA

      doc
        .fillColor(
          "#A0A0A0"
        )
        .font(
          "Helvetica"
        )
        .fontSize(
          8
        )
        .text(
          formatarData(
            dataInicio
          ),
          350,
          66,
          {
            width:
              195,
            align:
              "right"
          }
        );


      // ======================================
      // MUITO IMPORTANTE:
      // REPOSICIONA O CURSOR
      // ======================================

      doc.x = 50;

      doc.y = 155;


      // ======================================
      // TÍTULO DO DOCUMENTO
      // ======================================

      doc
        .fillColor(
          "#111111"
        )
        .font(
          "Helvetica-Bold"
        )
        .fontSize(
          23
        )
        .text(
          "Relatório de Atendimento Técnico",
          50,
          doc.y,
          {
            width:
              495
          }
        );


      doc.moveDown(
        0.45
      );


      doc.x = 50;


      doc
        .fillColor(
          "#777777"
        )
        .font(
          "Helvetica"
        )
        .fontSize(
          10
        )
        .text(
          "Documento referente ao atendimento registrado pela equipe Synter.",
          50,
          doc.y,
          {
            width:
              495
          }
        );


      doc.moveDown(
        1.5
      );


      // ======================================
      // DADOS DO ATENDIMENTO
      // ======================================

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


      if (
        atendidoPor
      ) {

        campoPDF(
          doc,
          "Atendido por",
          atendidoPor
        );

      }


      if (
        tipoProblema
      ) {

        campoPDF(
          doc,
          "Tipo de problema",
          tipoProblema
        );

      }


      // ======================================
      // DADOS DO CLIENTE
      // ======================================

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


      // ======================================
      // PRODUTO
      // ======================================

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


      // ======================================
      // DESCRIÇÃO DO PROBLEMA
      // ======================================

      tituloSecaoPDF(
        doc,
        "Descrição do problema"
      );


      textoLongoPDF(
        doc,
        descricaoProblema
      );


      // ======================================
      // PARECER TÉCNICO
      // ======================================

      tituloSecaoPDF(
        doc,
        "Parecer técnico"
      );


      textoLongoPDF(
        doc,
        parecerTecnico
      );


      // ======================================
      // SOLUÇÃO
      // ======================================

      tituloSecaoPDF(
        doc,
        "Solução ou encaminhamento"
      );


      textoLongoPDF(
        doc,
        descricaoSolucao
      );


      // ======================================
      // RODAPÉ
      // ======================================

      verificarEspaco(
        doc,
        80
      );


      doc.moveDown(
        1
      );


      const linhaRodape =
        doc.y;


      doc
        .strokeColor(
          "#D8D8D8"
        )
        .lineWidth(
          0.7
        )
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
        .font(
          "Helvetica"
        )
        .fontSize(
          8
        )
        .fillColor(
          "#888888"
        )
        .text(
          "Documento gerado automaticamente a partir do atendimento registrado no sistema de Assistência Técnica Synter.",
          50,
          doc.y,
          {
            width:
              495,
            align:
              "center"
          }
        );


      // ======================================
      // FINALIZA PDF
      // ======================================

      doc.end();


    } catch (erro) {

      console.error(
        "Erro ao gerar PDF:",
        erro
      );


      if (
        !res.headersSent
      ) {

        return res
          .status(500)
          .json({

            sucesso:
              false,

            mensagem:
              "Não foi possível gerar o PDF do chamado."

          });

      }

    }

  }
);


// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      " API SAT - UNIVERSIDADE SYNTER"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `API SAT rodando em http://localhost:${PORT}`
    );

    console.log("");

  }
);