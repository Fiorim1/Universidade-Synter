import { Client } from "@notionhq/client";
import { exigirAcesso, lerCargosPermitidos } from "../_lib/exigirAcesso.js";
import { limitarUso } from "../_lib/limitarUso.js";


// =====================================================
// NOTION
// =====================================================

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}


// =====================================================
// SOMENTE NÚMEROS
// =====================================================

function somenteNumeros(valor = "") {
  return String(valor).replace(/\D/g, "");
}


// =====================================================
// RICH TEXT PARA TEXTO
// =====================================================

function textoRichText(richText = []) {
  return richText
    .map((item) => item.plain_text || "")
    .join("");
}


// =====================================================
// OBTER VALOR DE UMA PROPRIEDADE DO NOTION
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
// TENTA VÁRIOS NOMES DE PROPRIEDADE
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
// BUSCAR TODOS OS CHAMADOS
// =====================================================

async function buscarTodosChamados() {

  let chamados = [];

  let cursor = undefined;


  do {

    const resposta =
      await notion.dataSources.query({

        data_source_id:
          process.env.NOTION_DATA_SOURCE_ID,

        page_size: 100,

        start_cursor: cursor,

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


// =====================================================
// API
// =====================================================

export default async function handler(req, res) {

  // Aceita somente GET
  if (req.method !== "GET") {

    return res.status(405).json({
      sucesso: false,
      mensagem: "Método não permitido.",
    });

  }


  // Só usuários logados e com cargo autorizado acessam os chamados
  const acesso = await exigirAcesso(req, res, {
    cargos: lerCargosPermitidos("SAT_CARGOS_PERMITIDOS"),
  });

  if (!acesso) return;

  // Limite de consultas por usuário (evita varredura de dados de clientes)
  const dentroDoLimite = await limitarUso(res, {
    tipo: "busca",
    identificador: acesso.usuario.id,
  });

  if (!dentroDoLimite) return;

  // Contém dados pessoais de clientes: nunca guardar em cache
  res.setHeader("Cache-Control", "no-store");

  try {

    // Aceita somente um texto simples. Se vier repetido na URL
    // (?q=a&q=b) ele chega como lista e é tratado como inválido.
    const pesquisaBruta = req.query.q;

    const pesquisa =
      typeof pesquisaBruta === "string"
        ? pesquisaBruta
            .replace(/[\u0000-\u001f\u007f]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : "";


    // =================================================
    // VALIDA PESQUISA
    // =================================================

    if (!pesquisa) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "Informe CPF, CNPJ ou nome completo.",

      });

    }

    if (pesquisa.length < 3 || pesquisa.length > 120) {

      return res.status(400).json({

        sucesso: false,

        mensagem:
          "A pesquisa deve ter entre 3 e 120 caracteres.",

      });

    }


    // =================================================
    // BUSCA TODOS OS CHAMADOS
    // =================================================

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


    // =================================================
    // FILTRA OS RESULTADOS
    // =================================================

    const encontrados =
      todosChamados.filter(
        (chamado) => {

          const properties =
            chamado.properties;


          // NOME

          const nome =
            obterNomeCliente(
              properties
            );


          // CPF / CNPJ

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


          // COMPARAÇÃO DO NOME

          const nomeIgual =
            normalizarTexto(
              nome
            ) === pesquisaTexto;


          // COMPARAÇÃO CPF/CNPJ

          const documentoIgual =
            pesquisaDocumento.length >= 11 &&
            somenteNumeros(
              documento
            ) === pesquisaDocumento;


          return (
            nomeIgual ||
            documentoIgual
          );

        }
      );


    // =================================================
    // FORMATA RETORNO
    // =================================================

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
                properties["ID"]
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
              ),

          };

        }
      );


    // =================================================
    // RESPOSTA
    // =================================================

    return res.status(200).json({

      sucesso: true,

      quantidade:
        chamados.length,

      chamados,

    });


  } catch (erro) {

    console.error(
      "Erro ao buscar chamados:",
      erro
    );


    return res.status(500).json({

      sucesso: false,

      mensagem:
        "Não foi possível consultar os chamados.",

    });

  }

}