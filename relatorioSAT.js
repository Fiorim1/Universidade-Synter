import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";


// =====================================================
// VARIÁVEIS DE AMBIENTE
// =====================================================

dotenv.config({
  path: ".env.local",
});


// =====================================================
// NOTION
// =====================================================

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizar(texto = "") {

  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

}


// =====================================================
// BUSCAR TODOS OS CHAMADOS DO NOTION
// =====================================================

async function buscarTodosChamados() {

  let todosChamados = [];

  let cursor = undefined;


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


  return todosChamados;

}


// =====================================================
// PEGAR STATUS
// =====================================================

function obterStatus(chamado) {

  return (
    chamado.properties?.[
      "Status"
    ]?.status?.name || ""
  );

}


// =====================================================
// PEGAR ASSISTÊNCIA OU SUPORTE
// =====================================================

function obterAtendimento(chamado) {

  return (
    chamado.properties?.[
      "Assistência ou Suporte"
    ]?.select?.name || ""
  );

}


// =====================================================
// PEGAR TIPO DE PRODUTO
// =====================================================

function obterTipoProduto(chamado) {

  return (
    chamado.properties?.[
      "Tipo de produto"
    ]?.select?.name || ""
  );

}


// =====================================================
// PEGAR PARECER
// =====================================================

function obterParecer(chamado) {

  return (
    chamado.properties?.[
      "Parecer"
    ]?.select?.name || ""
  );

}


// =====================================================
// VERIFICAR SE PERTENCE AO MÊS
// =====================================================

function pertenceAoMes(
  chamado,
  ano,
  mes
) {

  const dataInicio =
    chamado.properties?.[
      "Data de início"
    ]?.date?.start;


  if (!dataInicio) {

    return false;

  }


  const [
    anoChamado,
    mesChamado
  ] =
    dataInicio.split("-");


  return (

    Number(anoChamado) === ano &&

    Number(mesChamado) === mes

  );

}


// =====================================================
// VERIFICAR SE ESTÁ FINALIZADO
// =====================================================

function estaFinalizado(chamado) {

  const status =
    normalizar(
      obterStatus(chamado)
    );


  return (
    status === "finalizado" ||
    status === "finalizada"
  );

}


// =====================================================
// CALCULAR ESTATÍSTICAS
// =====================================================

function calcularEstatisticas(chamados) {


  // ===================================================
  // ASSISTÊNCIAS ELETRÔNICAS
  //
  // CONTA TODOS DO MÊS
  // NÃO PRECISA ESTAR FINALIZADO
  // ===================================================

  const assistenciasEletronicas =
    chamados.filter(
      (chamado) => {

        const atendimento =
          normalizar(
            obterAtendimento(chamado)
          );


        const produto =
          normalizar(
            obterTipoProduto(chamado)
          );


        return (

          atendimento ===
            "assistencia tecnica" &&

          produto ===
            "eletronico"

        );

      }
    );


  // ===================================================
  // ASSISTÊNCIAS MECÂNICAS
  //
  // CONTA TODOS DO MÊS
  // INCLUSIVE EM ANDAMENTO
  // ===================================================

  const assistenciasMecanicas =
    chamados.filter(
      (chamado) => {

        const atendimento =
          normalizar(
            obterAtendimento(chamado)
          );


        const produto =
          normalizar(
            obterTipoProduto(chamado)
          );


        return (

          atendimento ===
            "assistencia tecnica" &&

          produto ===
            "mecanico"

        );

      }
    );


  // ===================================================
  // SUPORTES ELETRÔNICOS
  //
  // SOMENTE FINALIZADOS
  // ===================================================

  const suportesEletronicos =
    chamados.filter(
      (chamado) => {

        const atendimento =
          normalizar(
            obterAtendimento(chamado)
          );


        const produto =
          normalizar(
            obterTipoProduto(chamado)
          );


        return (

          estaFinalizado(chamado) &&

          atendimento ===
            "suporte tecnico" &&

          produto ===
            "eletronico"

        );

      }
    );


  // ===================================================
  // SUPORTES MECÂNICOS
  //
  // SOMENTE FINALIZADOS
  // ===================================================

  const suportesMecanicos =
    chamados.filter(
      (chamado) => {

        const atendimento =
          normalizar(
            obterAtendimento(chamado)
          );


        const produto =
          normalizar(
            obterTipoProduto(chamado)
          );


        return (

          estaFinalizado(chamado) &&

          atendimento ===
            "suporte tecnico" &&

          produto ===
            "mecanico"

        );

      }
    );


  // ===================================================
  // PARECERES PROCEDENTES
  //
  // CONTA TODOS DO MÊS QUE FOREM PROCEDENTES
  // NÃO PRECISA ESTAR FINALIZADO
  // ===================================================

  const pareceresProcedentes =
    chamados.filter(
      (chamado) => {

        const parecer =
          normalizar(
            obterParecer(chamado)
          );


        return (
          parecer ===
            "procedente"
        );

      }
    );


  // ===================================================
  // FINALIZADOS
  // ===================================================

  const finalizados =
    chamados.filter(
      (chamado) => {

        return estaFinalizado(
          chamado
        );

      }
    );


  // ===================================================
  // RETORNO
  // ===================================================

  return {

    total:
      chamados.length,


    finalizados:
      finalizados.length,


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


// =====================================================
// CARD
// =====================================================

function criarCard(
  titulo,
  valor
) {

  return `

    <div class="card">

      <div class="card-title">
        ${titulo}
      </div>

      <div class="card-value">
        ${valor}
      </div>

    </div>

  `;

}


// =====================================================
// CRIAR HTML
// =====================================================

function criarHTML({

  assistenciasEmAberto,

  dadosMesAtual,

  dadosMesAnterior,

  nomeMesAtual,

  nomeMesAnterior,

}) {

  return `

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
  Relatório SAT
</title>


<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}


html {
  background: #050505;
}


body {

  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% -10%,
      #171717 0%,
      #090909 32%,
      #050505 65%,
      #030303 100%
    );

  color: #ffffff;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

}


/* ==========================================
   CONTAINER
========================================== */

.container {

  width: 100%;

  max-width: 1200px;

  margin: 0 auto;

  padding: 50px;

}


/* ==========================================
   HERO
========================================== */

.hero {

  padding:
    60px 0;

}


.hero-small {

  color: #777777;

  font-size: 12px;

  letter-spacing: 2px;

  text-transform: uppercase;

  margin-bottom: 15px;

}


.hero h1 {

  font-size: 46px;

  margin-bottom: 15px;

}


.hero p {

  max-width: 600px;

  color: #888888;

  line-height: 1.6;

}


/* ==========================================
   CHAMADOS ABERTOS
========================================== */

.open-card {

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  padding: 30px;

  margin-bottom: 60px;

  background:
    #0d0d0d;

  border:
    1px solid #222222;

  border-radius: 16px;

}


.open-label {

  color: #777777;

  font-size: 12px;

  margin-bottom: 8px;

}


.open-title {

  font-size: 22px;

  font-weight: 600;

}


.open-number {

  font-size: 60px;

  font-weight: 700;

}


/* ==========================================
   MESES
========================================== */

.month {

  margin-bottom: 60px;

}


.month-header {

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  margin-bottom: 20px;

}


.month-title {

  font-size: 24px;

  font-weight: 700;

}


.month-type {

  color: #666666;

  font-size: 12px;

  text-transform: uppercase;

  letter-spacing: 1px;

}


/* ==========================================
   CARDS
========================================== */

.cards {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 15px;

}


.card {

  background:
    #0d0d0d;

  border:
    1px solid #222222;

  border-radius: 14px;

  padding: 25px;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

}


.card:hover {

  transform:
    translateY(-2px);

  border-color:
    #333333;

}


.card-title {

  color: #888888;

  font-size: 13px;

  margin-bottom: 15px;

}


.card-value {

  font-size: 36px;

  font-weight: 700;

}


/* ==========================================
   FOOTER
========================================== */

.footer {

  margin-top: 70px;

  padding-top: 30px;

  border-top:
    1px solid #202020;

  color: #555555;

  font-size: 11px;

}


/* ==========================================
   RESPONSIVO
========================================== */

@media(max-width: 700px) {

  .container {

    padding: 25px;

  }


  .cards {

    grid-template-columns:
      1fr;

  }


  .hero h1 {

    font-size: 34px;

  }


  .open-number {

    font-size: 45px;

  }

}

</style>

</head>


<body>


<div class="container">


  <!-- ========================================
       HERO
  ========================================= -->

  <section class="hero">

    <div class="hero-small">

      RELATÓRIO AUTOMÁTICO

    </div>


    <h1>

      Assistência Técnica

    </h1>


    <p>

      Acompanhamento dos chamados,
      assistências, suportes técnicos
      e pareceres registrados através
      do Notion.

    </p>

  </section>


  <!-- ========================================
       CHAMADOS EM ABERTO
  ========================================= -->

  <section class="open-card">

    <div>

      <div class="open-label">

        STATUS ATUAL

      </div>


      <div class="open-title">

        Chamados em aberto

      </div>

    </div>


    <div class="open-number">

      ${assistenciasEmAberto}

    </div>

  </section>


  <!-- ========================================
       MÊS ATUAL
  ========================================= -->

  <section class="month">

    <div class="month-header">


      <div class="month-title">

        ${nomeMesAtual}

      </div>


      <div class="month-type">

        Mês atual

      </div>


    </div>


    <div class="cards">


      ${criarCard(
        "Total de chamados",
        dadosMesAtual.total
      )}


      ${criarCard(
        "Assistências eletrônicas",
        dadosMesAtual.assistenciasEletronicas
      )}


      ${criarCard(
        "Assistências mecânicas",
        dadosMesAtual.assistenciasMecanicas
      )}


      ${criarCard(
        "Suportes eletrônicos",
        dadosMesAtual.suportesEletronicos
      )}


      ${criarCard(
        "Suportes mecânicos",
        dadosMesAtual.suportesMecanicos
      )}


      ${criarCard(
        "Pareceres procedentes",
        dadosMesAtual.pareceresProcedentes
      )}


    </div>

  </section>


  <!-- ========================================
       MÊS ANTERIOR
  ========================================= -->

  <section class="month">

    <div class="month-header">


      <div class="month-title">

        ${nomeMesAnterior}

      </div>


      <div class="month-type">

        Mês anterior

      </div>


    </div>


    <div class="cards">


      ${criarCard(
        "Total de chamados",
        dadosMesAnterior.total
      )}


      ${criarCard(
        "Assistências eletrônicas",
        dadosMesAnterior.assistenciasEletronicas
      )}


      ${criarCard(
        "Assistências mecânicas",
        dadosMesAnterior.assistenciasMecanicas
      )}


      ${criarCard(
        "Suportes eletrônicos",
        dadosMesAnterior.suportesEletronicos
      )}


      ${criarCard(
        "Suportes mecânicos",
        dadosMesAnterior.suportesMecanicos
      )}


      ${criarCard(
        "Pareceres procedentes",
        dadosMesAnterior.pareceresProcedentes
      )}


    </div>

  </section>


  <!-- ========================================
       FOOTER
  ========================================= -->

  <footer class="footer">

    Universidade Synter —
    Relatório gerado automaticamente
    através dos dados registrados no Notion.

  </footer>


</div>


</body>

</html>

`;

}


// =====================================================
// PRINCIPAL
// =====================================================

async function gerarRelatorio() {

  try {


    // =================================================
    // VALIDAR VARIÁVEIS
    // =================================================

    if (!process.env.NOTION_TOKEN) {

      throw new Error(
        "NOTION_TOKEN não encontrado no .env.local"
      );

    }


    if (
      !process.env.NOTION_DATA_SOURCE_ID
    ) {

      throw new Error(
        "NOTION_DATA_SOURCE_ID não encontrado no .env.local"
      );

    }


    // =================================================
    // BUSCAR NOTION
    // =================================================

    console.log(
      "\nBuscando chamados no Notion..."
    );


    const todosChamados =
      await buscarTodosChamados();


    console.log(
      `${todosChamados.length} chamados encontrados.`
    );


    // =================================================
    // DATA ATUAL
    // =================================================

    const hoje =
      new Date();


    const anoAtual =
      hoje.getFullYear();


    const mesAtual =
      hoje.getMonth() + 1;


    // =================================================
    // MÊS ANTERIOR
    // =================================================

    const dataMesAnterior =
      new Date(
        anoAtual,
        mesAtual - 2,
        1
      );


    const anoMesAnterior =
      dataMesAnterior
        .getFullYear();


    const mesAnterior =
      dataMesAnterior
        .getMonth() + 1;


    // =================================================
    // NOMES DOS MESES
    // =================================================

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
      nomesMeses[
        mesAtual - 1
      ];


    const nomeMesAnterior =
      nomesMeses[
        mesAnterior - 1
      ];


    // =================================================
    // CHAMADOS DO MÊS ATUAL
    //
    // USA DATA DE INÍCIO
    // =================================================

    const chamadosMesAtual =
      todosChamados.filter(
        (chamado) => {

          return pertenceAoMes(
            chamado,
            anoAtual,
            mesAtual
          );

        }
      );


    // =================================================
    // CHAMADOS DO MÊS ANTERIOR
    //
    // USA DATA DE INÍCIO
    // =================================================

    const chamadosMesAnterior =
      todosChamados.filter(
        (chamado) => {

          return pertenceAoMes(
            chamado,
            anoMesAnterior,
            mesAnterior
          );

        }
      );


    // =================================================
    // CHAMADOS EM ABERTO
    // =================================================

    const chamadosEmAberto =
      todosChamados.filter(
        (chamado) => {

          const status =
            normalizar(
              obterStatus(chamado)
            );


          if (!status) {

            return false;

          }


          return (

            status !== "finalizado" &&

            status !== "finalizada" &&

            status !== "erro" &&

            status !== "error"

          );

        }
      );


    // =================================================
    // CALCULAR ESTATÍSTICAS
    // =================================================

    const dadosMesAtual =
      calcularEstatisticas(
        chamadosMesAtual
      );


    const dadosMesAnterior =
      calcularEstatisticas(
        chamadosMesAnterior
      );


    // =================================================
    // CONFERÊNCIA NO TERMINAL
    // =================================================

    console.log(
      "\n================================"
    );

    console.log(
      `DADOS DE ${nomeMesAtual}`
    );

    console.log(
      "================================"
    );


    console.log(
      "Total de chamados:",
      dadosMesAtual.total
    );


    console.log(
      "Chamados finalizados:",
      dadosMesAtual.finalizados
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
      dadosMesAtual.pareceresProcedentes
    );


    console.log(
      "Chamados em aberto:",
      chamadosEmAberto.length
    );


    // =================================================
    // CONFERÊNCIA MÊS ANTERIOR
    // =================================================

    console.log(
      "\n================================"
    );

    console.log(
      `DADOS DE ${nomeMesAnterior}`
    );

    console.log(
      "================================"
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
      dadosMesAnterior.pareceresProcedentes
    );


    // =================================================
    // GERAR HTML
    // =================================================

    const html =
      criarHTML({

        assistenciasEmAberto:
          chamadosEmAberto.length,

        dadosMesAtual,

        dadosMesAnterior,

        nomeMesAtual,

        nomeMesAnterior,

      });


    // =================================================
    // CAMINHO
    // =================================================

    const caminho =
      path.resolve(
        process.cwd(),
        "relatorioSAT.html"
      );


    // =================================================
    // SALVAR
    // =================================================

    fs.writeFileSync(
      caminho,
      html,
      "utf8"
    );


    // =================================================
    // RESULTADO
    // =================================================

    console.log(
      "\n================================"
    );

    console.log(
      "RELATÓRIO GERADO COM SUCESSO"
    );

    console.log(
      "================================"
    );


    console.log(
      "\nArquivo:"
    );


    console.log(
      caminho
    );


  } catch (erro) {


    console.error(
      "\n================================"
    );

    console.error(
      "ERRO AO GERAR RELATÓRIO"
    );

    console.error(
      "================================"
    );


    console.error(
      erro
    );

  }

}


// =====================================================
// EXECUTAR
// =====================================================

gerarRelatorio();