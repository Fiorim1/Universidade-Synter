require("dotenv").config();

const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ==========================================
// NORMALIZA TEXTOS
// ==========================================

function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// ==========================================
// CALCULA AS ESTATÍSTICAS DE UM MÊS
// ==========================================

function calcularEstatisticas(chamados) {
  const assistenciasEletronicas =
    chamados.filter((chamado) => {
      const atendimento =
        chamado.properties[
          "Assistência ou Suporte"
        ]?.select?.name || "";

      const tipoProduto =
        chamado.properties[
          "Tipo de produto"
        ]?.select?.name || "";

      return (
        normalizar(atendimento) ===
          "assistencia tecnica" &&
        normalizar(tipoProduto) ===
          "eletronico"
      );
    });

  const assistenciasMecanicas =
    chamados.filter((chamado) => {
      const atendimento =
        chamado.properties[
          "Assistência ou Suporte"
        ]?.select?.name || "";

      const tipoProduto =
        chamado.properties[
          "Tipo de produto"
        ]?.select?.name || "";

      return (
        normalizar(atendimento) ===
          "assistencia tecnica" &&
        normalizar(tipoProduto) ===
          "mecanico"
      );
    });

  const suportesEletronicos =
    chamados.filter((chamado) => {
      const atendimento =
        chamado.properties[
          "Assistência ou Suporte"
        ]?.select?.name || "";

      const tipoProduto =
        chamado.properties[
          "Tipo de produto"
        ]?.select?.name || "";

      return (
        normalizar(atendimento) ===
          "suporte tecnico" &&
        normalizar(tipoProduto) ===
          "eletronico"
      );
    });

  const suportesMecanicos =
    chamados.filter((chamado) => {
      const atendimento =
        chamado.properties[
          "Assistência ou Suporte"
        ]?.select?.name || "";

      const tipoProduto =
        chamado.properties[
          "Tipo de produto"
        ]?.select?.name || "";

      return (
        normalizar(atendimento) ===
          "suporte tecnico" &&
        normalizar(tipoProduto) ===
          "mecanico"
      );
    });

  const pareceresProcedentes =
    chamados.filter((chamado) => {
      const parecer =
        chamado.properties[
          "Parecer"
        ]?.select?.name || "";

      return (
        normalizar(parecer) ===
        "procedente"
      );
    });

  return {
    total: chamados.length,

    assistenciasEletronicas:
      assistenciasEletronicas.length,

    assistenciasMecanicas:
      assistenciasMecanicas.length,

    suportesEletronicos:
      suportesEletronicos.length,

    suportesMecanicos:
      suportesMecanicos.length,

    pareceresProcedentes:
      pareceresProcedentes.length,
  };
}

// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================

async function buscarTodosChamados() {
  try {
    let todosChamados = [];
    let cursor = undefined;

    // ==========================================
    // BUSCA TODOS OS CHAMADOS DO NOTION
    // ==========================================

    do {
      const resposta =
        await notion.dataSources.query({
          data_source_id:
            process.env.NOTION_DATA_SOURCE_ID,

          page_size: 100,

          start_cursor: cursor,
        });

      todosChamados.push(
        ...resposta.results
      );

      cursor =
        resposta.has_more
          ? resposta.next_cursor
          : undefined;

    } while (cursor);

    console.log(
      "Total geral de chamados:",
      todosChamados.length
    );

    // ==========================================
    // MÊS ATUAL
    // ==========================================

    const hoje = new Date();

    const anoAtual =
      hoje.getFullYear();

    const mesAtual =
      hoje.getMonth() + 1;

    // ==========================================
    // MÊS ANTERIOR
    // ==========================================

    const dataMesAnterior =
      new Date(
        anoAtual,
        mesAtual - 2,
        1
      );

    const anoMesAnterior =
      dataMesAnterior.getFullYear();

    const mesAnterior =
      dataMesAnterior.getMonth() + 1;

    // ==========================================
    // NOMES DOS MESES
    // ==========================================

    const nomesMeses = [
      "JANEIRO",
      "FEVEREIRO",
      "MARÇO",
      "ABRIL",
      "MAIO",
      "JUNHO",
      "JULHO",
      "AGOSTO",
      "SETEMBRO",
      "OUTUBRO",
      "NOVEMBRO",
      "DEZEMBRO",
    ];

    const nomeMesAtual =
      nomesMeses[mesAtual - 1];

    const nomeMesAnterior =
      nomesMeses[mesAnterior - 1];

    // ==========================================
    // CHAMADOS DO MÊS ATUAL
    // ==========================================

    const chamadosMesAtual =
      todosChamados.filter((chamado) => {
        const dataInicio =
          chamado.properties[
            "Data de início"
          ]?.date?.start;

        if (!dataInicio) {
          return false;
        }

        const [ano, mes] =
          dataInicio.split("-");

        return (
          Number(ano) === anoAtual &&
          Number(mes) === mesAtual
        );
      });

    // ==========================================
    // CHAMADOS DO MÊS ANTERIOR
    // ==========================================

    const chamadosMesAnterior =
      todosChamados.filter((chamado) => {
        const dataInicio =
          chamado.properties[
            "Data de início"
          ]?.date?.start;

        if (!dataInicio) {
          return false;
        }

        const [ano, mes] =
          dataInicio.split("-");

        return (
          Number(ano) ===
            anoMesAnterior &&
          Number(mes) ===
            mesAnterior
        );
      });

    // ==========================================
    // ASSISTÊNCIAS EM ABERTO
    // ==========================================

    const assistenciasEmAberto =
      todosChamados.filter((chamado) => {
        const status =
          chamado.properties[
            "Status"
          ]?.status?.name || "";

        const statusNormalizado =
          normalizar(status);

        return (
          statusNormalizado !==
            "finalizado" &&
          statusNormalizado !==
            "error"
        );
      });

    // ==========================================
    // CALCULA OS DOIS MESES
    // ==========================================

    const dadosMesAtual =
      calcularEstatisticas(
        chamadosMesAtual
      );

    const dadosMesAnterior =
      calcularEstatisticas(
        chamadosMesAnterior
      );

    // ==========================================
    // RELATÓRIO DO MÊS ATUAL
    // ==========================================

    console.log(
      `\n--- MÊS ATUAL (${nomeMesAtual}) ---`
    );

    console.log(
      "Assistências em aberto:",
      assistenciasEmAberto.length
    );

    console.log(
      "Total de chamados:",
      dadosMesAtual.total
    );

    console.log(
      "Assistências eletrônicas:",
      dadosMesAtual.assistenciasEletronicas
    );

    console.log(
      "Assistências mecânicas:",
      dadosMesAtual.assistenciasMecanicas
    );

    console.log(
      "Suportes eletrônicos:",
      dadosMesAtual.suportesEletronicos
    );

    console.log(
      "Suportes mecânicos:",
      dadosMesAtual.suportesMecanicos
    );

    console.log(
      "Pareceres procedentes:",
      `${dadosMesAtual.pareceresProcedentes} de ${dadosMesAtual.total}`
    );

    // ==========================================
    // RELATÓRIO DO MÊS ANTERIOR
    // ==========================================

    console.log(
      `\n--- MÊS ANTERIOR (${nomeMesAnterior}) ---`
    );

    console.log(
      "Total de chamados:",
      dadosMesAnterior.total
    );

    console.log(
      "Assistências eletrônicas:",
      dadosMesAnterior.assistenciasEletronicas
    );

    console.log(
      "Assistências mecânicas:",
      dadosMesAnterior.assistenciasMecanicas
    );

    console.log(
      "Suportes eletrônicos:",
      dadosMesAnterior.suportesEletronicos
    );

    console.log(
      "Suportes mecânicos:",
      dadosMesAnterior.suportesMecanicos
    );

    console.log(
      "Pareceres procedentes:",
      `${dadosMesAnterior.pareceresProcedentes} de ${dadosMesAnterior.total}`
    );

  } catch (erro) {
    console.error(
      "Erro ao buscar os chamados:"
    );

    console.error(
      erro.message
    );
  }
}

buscarTodosChamados();