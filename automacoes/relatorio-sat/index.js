require("dotenv").config();

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

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
  const assistenciasEletronicas = chamados.filter((chamado) => {
    const atendimento =
      chamado.properties["Assistência ou Suporte"]
        ?.select?.name || "";

    const tipoProduto =
      chamado.properties["Tipo de produto"]
        ?.select?.name || "";

    return (
      normalizar(atendimento) === "assistencia tecnica" &&
      normalizar(tipoProduto) === "eletronico"
    );
  });

  const assistenciasMecanicas = chamados.filter((chamado) => {
    const atendimento =
      chamado.properties["Assistência ou Suporte"]
        ?.select?.name || "";

    const tipoProduto =
      chamado.properties["Tipo de produto"]
        ?.select?.name || "";

    return (
      normalizar(atendimento) === "assistencia tecnica" &&
      normalizar(tipoProduto) === "mecanico"
    );
  });

  const suportesEletronicos = chamados.filter((chamado) => {
    const atendimento =
      chamado.properties["Assistência ou Suporte"]
        ?.select?.name || "";

    const tipoProduto =
      chamado.properties["Tipo de produto"]
        ?.select?.name || "";

    return (
      normalizar(atendimento) === "suporte tecnico" &&
      normalizar(tipoProduto) === "eletronico"
    );
  });

  const suportesMecanicos = chamados.filter((chamado) => {
    const atendimento =
      chamado.properties["Assistência ou Suporte"]
        ?.select?.name || "";

    const tipoProduto =
      chamado.properties["Tipo de produto"]
        ?.select?.name || "";

    return (
      normalizar(atendimento) === "suporte tecnico" &&
      normalizar(tipoProduto) === "mecanico"
    );
  });

  const pareceresProcedentes = chamados.filter((chamado) => {
    const parecer =
      chamado.properties["Parecer"]
        ?.select?.name || "";

    return normalizar(parecer) === "procedente";
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
// COMPONENTE DE CARD
// ==========================================

function criarCard(icone, titulo, valor) {
  return `
    <div class="card">

      <div class="card-icon">
        ${icone}
      </div>

      <div class="card-content">

        <div class="card-label">
          ${titulo}
        </div>

        <div class="card-value">
          ${valor}
        </div>

      </div>

    </div>
  `;
}

// ==========================================
// HTML DO RELATÓRIO
// ==========================================

function criarRelatorioHTML({
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
    Relatório SAT - Universidade Synter
  </title>

  <!-- BIBLIOTECA PARA GERAR O PDF -->
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js">
  </script>

  <style>

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      background: #050505;
    }

    body {
      min-height: 100vh;

      font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;

      background:
        radial-gradient(
          circle at 50% -10%,
          #171717 0%,
          #090909 32%,
          #050505 65%,
          #030303 100%
        );

      color: #ffffff;
    }

    /* ======================================
       BOTÃO PDF
    ====================================== */

    .acoes {
      position: fixed;

      top: 25px;
      right: 25px;

      z-index: 9999;
    }

    .btn-pdf {
      display: flex;
      align-items: center;
      gap: 10px;

      padding: 13px 20px;

      background: #ffffff;
      color: #050505;

      border: none;
      border-radius: 9px;

      font-size: 13px;
      font-weight: 700;

      cursor: pointer;

      box-shadow:
        0 8px 30px
        rgba(0, 0, 0, 0.30);

      transition: 0.2s;
    }

    .btn-pdf:hover {
      background: #e6e6e6;

      transform:
        translateY(-2px);
    }

    .btn-pdf:disabled {
      opacity: 0.6;

      cursor: not-allowed;

      transform: none;
    }

    /* ======================================
       RELATÓRIO
    ====================================== */

    .page {
      width: 100%;
      min-height: 100vh;

      background:
        radial-gradient(
          circle at 50% -10%,
          #171717 0%,
          #090909 32%,
          #050505 65%,
          #030303 100%
        );
    }

    .container {
      width: 100%;
      max-width: 1180px;

      margin: 0 auto;
      padding: 0 48px 80px;
    }

    /* ======================================
       HEADER
    ====================================== */

    .header {
      height: 92px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border-bottom:
        1px solid #1d1d1d;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-symbol {
      position: relative;

      width: 26px;
      height: 31px;
    }

    .brand-symbol span {
      position: absolute;

      width: 9px;
      height: 9px;

      background: #ffffff;

      border-radius: 2px;
    }

    .brand-symbol span:nth-child(1) {
      top: 0;
      left: 8px;
    }

    .brand-symbol span:nth-child(2) {
      top: 8px;
      left: 0;
    }

    .brand-symbol span:nth-child(3) {
      top: 8px;
      left: 16px;
    }

    .brand-symbol span:nth-child(4) {
      top: 16px;
      left: 8px;
    }

    .brand-symbol span:nth-child(5) {
      top: 24px;
      left: 0;
    }

    .brand-name {
      font-size: 28px;
      font-weight: 700;

      letter-spacing: -1px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;

      color: #777777;

      font-size: 11px;
      font-weight: 600;

      letter-spacing: 1.7px;

      text-transform: uppercase;
    }

    .header-dot {
      width: 6px;
      height: 6px;

      background: #ffffff;

      border-radius: 50%;
    }

    /* ======================================
       HERO
    ====================================== */

    .hero {
      padding:
        72px 0
        62px;

      border-bottom:
        1px solid #1b1b1b;
    }

    .eyebrow {
      display: flex;
      align-items: center;

      gap: 12px;

      color: #a3a3a3;

      font-size: 12px;
      font-weight: 600;

      letter-spacing: 2.8px;

      text-transform: uppercase;
    }

    .eyebrow-icon {
      width: 30px;
      height: 30px;

      display: flex;
      align-items: center;
      justify-content: center;

      border:
        1px solid #4a4a4a;

      border-radius: 7px;

      font-size: 14px;

      color: #ffffff;
    }

    .hero h1 {
      max-width: 780px;

      margin-top: 24px;

      font-size: 58px;
      font-weight: 700;

      line-height: 1.03;

      letter-spacing: -2.5px;
    }

    .hero p {
      max-width: 650px;

      margin-top: 22px;

      color: #8c8c8c;

      font-size: 16px;

      line-height: 1.7;
    }

    /* ======================================
       SEÇÕES
    ====================================== */

    .section {
      padding-top: 45px;
    }

    .section-title {
      display: flex;
      align-items: center;

      gap: 11px;

      margin-bottom: 23px;

      font-size: 12px;
      font-weight: 700;

      letter-spacing: 2.3px;

      text-transform: uppercase;
    }

    .section-line {
      width: 3px;
      height: 19px;

      background: #ffffff;

      border-radius: 3px;
    }

    /* ======================================
       ASSISTÊNCIAS ABERTAS
    ====================================== */

    .open-card {
      min-height: 180px;

      padding:
        35px 42px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border:
        1px solid #292929;

      border-radius: 15px;

      background:
        linear-gradient(
          145deg,
          #111111,
          #080808
        );

      box-shadow:
        inset 0 1px 0
        rgba(255,255,255,0.025);

      break-inside: avoid;

      page-break-inside: avoid;
    }

    .open-small {
      color: #727272;

      font-size: 11px;
      font-weight: 700;

      letter-spacing: 1.6px;

      text-transform: uppercase;
    }

    .open-title {
      margin-top: 11px;

      font-size: 25px;
      font-weight: 700;
    }

    .open-description {
      margin-top: 8px;

      color: #696969;

      font-size: 12px;
    }

    .open-number {
      min-width: 120px;

      text-align: right;

      font-size: 72px;
      font-weight: 700;

      line-height: 1;

      letter-spacing: -3px;
    }

    /* ======================================
       MÊS
    ====================================== */

    .month {
      padding-top: 55px;
    }

    .month-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 20px;
    }

    .month-title {
      font-size: 14px;
      font-weight: 700;

      letter-spacing: 2px;

      text-transform: uppercase;
    }

    .month-type {
      color: #666666;

      font-size: 11px;
      font-weight: 600;

      letter-spacing: 1.5px;

      text-transform: uppercase;
    }

    /* ======================================
       GRID
    ====================================== */

    .cards-grid {
      display: grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap: 14px;
    }

    .card {
      min-height: 148px;

      padding: 22px;

      display: flex;
      flex-direction: column;
      justify-content: space-between;

      border:
        1px solid #282828;

      border-radius: 13px;

      background:
        linear-gradient(
          145deg,
          #0e0e0e,
          #080808
        );

      box-shadow:
        inset 0 1px 0
        rgba(255,255,255,0.018);

      break-inside: avoid;

      page-break-inside: avoid;
    }

    .card-icon {
      width: 38px;
      height: 38px;

      display: flex;
      align-items: center;
      justify-content: center;

      border:
        1px solid #3b3b3b;

      border-radius: 50%;

      color: #ffffff;

      font-size: 15px;
      font-weight: 600;
    }

    .card-content {
      margin-top: 20px;
    }

    .card-label {
      color: #8e8e8e;

      font-size: 12px;

      line-height: 1.35;
    }

    .card-value {
      margin-top: 5px;

      font-size: 31px;
      font-weight: 700;

      letter-spacing: -1px;
    }

    /* ======================================
       PARECER
    ====================================== */

    .parecer-card {
      grid-column:
        span 3;

      min-height: 115px;

      padding:
        24px 27px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border:
        1px solid #292929;

      border-radius: 13px;

      background: #0b0b0b;

      break-inside: avoid;

      page-break-inside: avoid;
    }

    .parecer-left {
      display: flex;
      align-items: center;

      gap: 17px;
    }

    .parecer-icon {
      width: 42px;
      height: 42px;

      display: flex;
      align-items: center;
      justify-content: center;

      border:
        1px solid #3b3b3b;

      border-radius: 50%;

      font-size: 15px;
    }

    .parecer-title {
      font-size: 15px;
      font-weight: 700;
    }

    .parecer-description {
      margin-top: 5px;

      color: #676767;

      font-size: 11px;
    }

    .parecer-value {
      font-size: 29px;
      font-weight: 700;

      letter-spacing: -1px;
    }

    /* ======================================
       DIVISOR
    ====================================== */

    .divider {
      margin-top: 55px;

      border: 0;

      border-top:
        1px solid #1b1b1b;
    }

    /* ======================================
       FOOTER
    ====================================== */

    .footer {
      margin-top: 70px;

      padding-top: 28px;

      display: flex;
      justify-content: space-between;

      gap: 30px;

      border-top:
        1px solid #1c1c1c;

      color: #555555;

      font-size: 10px;

      letter-spacing: 0.3px;
    }

    /* ======================================
       RESPONSIVO
    ====================================== */

    @media (max-width: 850px) {

      .container {
        padding:
          0 25px
          60px;
      }

      .hero h1 {
        font-size: 44px;
      }

      .cards-grid {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .parecer-card {
        grid-column:
          span 2;
      }

    }

    @media (max-width: 550px) {

      .container {
        padding:
          0 18px
          45px;
      }

      .header {
        height: 75px;
      }

      .brand-name {
        font-size: 23px;
      }

      .header-right {
        display: none;
      }

      .hero {
        padding:
          50px 0;
      }

      .hero h1 {
        font-size: 36px;
      }

      .open-card {
        padding: 25px;

        min-height: 150px;
      }

      .open-number {
        font-size: 54px;
      }

      .open-title {
        font-size: 20px;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .parecer-card {
        grid-column:
          span 1;

        align-items: flex-start;

        gap: 20px;

        flex-direction: column;
      }

      .parecer-value {
        padding-left: 59px;
      }

      .footer {
        flex-direction: column;
      }

    }

  </style>

</head>


<body>

<!-- =====================================
     BOTÃO PARA BAIXAR PDF
===================================== -->

<div class="acoes">

  <button
    id="btnPdf"
    class="btn-pdf"
    onclick="baixarPDF()"
  >
    ↓ Baixar PDF
  </button>

</div>


<!-- =====================================
     ÁREA QUE SERÁ TRANSFORMADA EM PDF
===================================== -->

<div
  class="page"
  id="relatorioPdf"
>

  <div class="container">


    <!-- HEADER -->

    <header class="header">

      <div class="brand">

        <div class="brand-symbol">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="brand-name">
          synter
        </div>

      </div>


      <div class="header-right">

        <div class="header-dot"></div>

        Universidade Synter

      </div>

    </header>


    <!-- HERO -->

    <section class="hero">

      <div class="eyebrow">

        <div class="eyebrow-icon">
          ◇
        </div>

        Plataforma de conhecimento

      </div>


      <h1>
        Relatório de
        Assistência Técnica
      </h1>


      <p>
        Acompanhamento dos chamados,
        assistências, suportes técnicos
        e pareceres registrados pela equipe
        através do Notion.
      </p>

    </section>


    <!-- VISÃO GERAL -->

    <section class="section">

      <div class="section-title">

        <div class="section-line"></div>

        Visão geral

      </div>


      <div class="open-card">

        <div>

          <div class="open-small">
            Status atual
          </div>

          <div class="open-title">
            Assistências em aberto
          </div>

          <div class="open-description">
            Chamados que ainda não foram
            finalizados pela equipe técnica
          </div>

        </div>


        <div class="open-number">
          ${assistenciasEmAberto}
        </div>

      </div>

    </section>


    <!-- MÊS ATUAL -->

    <section class="month">

      <div class="month-header">

        <div class="month-title">
          ${nomeMesAtual}
        </div>

        <div class="month-type">
          Mês atual
        </div>

      </div>


      <div class="cards-grid">

        ${criarCard(
          "#",
          "Total de chamados",
          dadosMesAtual.total
        )}

        ${criarCard(
          "⚡",
          "Assistências eletrônicas",
          dadosMesAtual.assistenciasEletronicas
        )}

        ${criarCard(
          "⚙",
          "Assistências mecânicas",
          dadosMesAtual.assistenciasMecanicas
        )}

        ${criarCard(
          "⌁",
          "Suportes eletrônicos",
          dadosMesAtual.suportesEletronicos
        )}

        ${criarCard(
          "◇",
          "Suportes mecânicos",
          dadosMesAtual.suportesMecanicos
        )}


        <div class="parecer-card">

          <div class="parecer-left">

            <div class="parecer-icon">
              ✓
            </div>

            <div>

              <div class="parecer-title">
                Pareceres procedentes
              </div>

              <div class="parecer-description">
                Chamados considerados procedentes
                durante ${nomeMesAtual.toLowerCase()}
              </div>

            </div>

          </div>


          <div class="parecer-value">

            ${dadosMesAtual.pareceresProcedentes}
            de
            ${dadosMesAtual.total}

          </div>

        </div>

      </div>

    </section>


    <hr class="divider">


    <!-- MÊS ANTERIOR -->

    <section class="month">

      <div class="month-header">

        <div class="month-title">
          ${nomeMesAnterior}
        </div>

        <div class="month-type">
          Mês anterior
        </div>

      </div>


      <div class="cards-grid">

        ${criarCard(
          "#",
          "Total de chamados",
          dadosMesAnterior.total
        )}

        ${criarCard(
          "⚡",
          "Assistências eletrônicas",
          dadosMesAnterior.assistenciasEletronicas
        )}

        ${criarCard(
          "⚙",
          "Assistências mecânicas",
          dadosMesAnterior.assistenciasMecanicas
        )}

        ${criarCard(
          "⌁",
          "Suportes eletrônicos",
          dadosMesAnterior.suportesEletronicos
        )}

        ${criarCard(
          "◇",
          "Suportes mecânicos",
          dadosMesAnterior.suportesMecanicos
        )}


        <div class="parecer-card">

          <div class="parecer-left">

            <div class="parecer-icon">
              ✓
            </div>

            <div>

              <div class="parecer-title">
                Pareceres procedentes
              </div>

              <div class="parecer-description">
                Chamados considerados procedentes
                durante ${nomeMesAnterior.toLowerCase()}
              </div>

            </div>

          </div>


          <div class="parecer-value">

            ${dadosMesAnterior.pareceresProcedentes}
            de
            ${dadosMesAnterior.total}

          </div>

        </div>

      </div>

    </section>


    <!-- FOOTER -->

    <footer class="footer">

      <div>
        Universidade Synter
      </div>

      <div>
        Relatório gerado automaticamente
        através dos dados registrados no Notion
      </div>

    </footer>


  </div>

</div>


<!-- =====================================
     FUNÇÃO PARA GERAR O PDF
===================================== -->

<script>

async function baixarPDF() {

  const botao =
    document.getElementById("btnPdf");

  const relatorio =
    document.getElementById("relatorioPdf");

  if (!window.html2pdf) {

    alert(
      "Não foi possível carregar o gerador de PDF. Verifique sua conexão com a internet."
    );

    return;
  }


  botao.disabled = true;

  botao.innerHTML =
    "Gerando PDF...";


  const opcoes = {

    margin: [
      5,
      5,
      5,
      5
    ],

    filename:
      "Relatorio-SAT-${nomeMesAtual}.pdf",

    image: {
      type: "jpeg",
      quality: 0.98
    },

    html2canvas: {

      scale: 2,

      useCORS: true,

      backgroundColor:
        "#050505",

      logging: false
    },

    jsPDF: {

      unit: "mm",

      format: "a4",

      orientation:
        "portrait"
    },

    pagebreak: {

      mode: [
        "avoid-all",
        "css",
        "legacy"
      ],

      avoid: [
        ".card",
        ".open-card",
        ".parecer-card",
        ".month-header"
      ]
    }

  };


  try {

    await html2pdf()
      .set(opcoes)
      .from(relatorio)
      .save();

  } catch (erro) {

    console.error(erro);

    alert(
      "Ocorreu um erro ao gerar o PDF."
    );

  } finally {

    botao.disabled = false;

    botao.innerHTML =
      "↓ Baixar PDF";

  }

}

</script>


</body>

</html>
`;
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

    // ==========================================
    // DATA ATUAL
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
    // ESTATÍSTICAS
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
    // CRIA HTML
    // ==========================================

    const html =
      criarRelatorioHTML({

        assistenciasEmAberto:
          assistenciasEmAberto.length,

        dadosMesAtual,

        dadosMesAnterior,

        nomeMesAtual,

        nomeMesAnterior,
      });

    // ==========================================
    // SALVA RELATÓRIO
    // ==========================================

    const caminhoRelatorio =
      path.join(
        __dirname,
        "relatorio.html"
      );

    fs.writeFileSync(
      caminhoRelatorio,
      html,
      "utf8"
    );

    // ==========================================
    // TERMINAL
    // ==========================================

    console.log(
      "\nRelatório HTML gerado com sucesso!"
    );

    console.log(
      `Arquivo: ${caminhoRelatorio}`
    );

    console.log(
      "\n--- DADOS GERADOS ---"
    );

    console.log(
      "Assistências em aberto:",
      assistenciasEmAberto.length
    );

    console.log(
      `${nomeMesAtual}:`,
      dadosMesAtual.total,
      "chamados"
    );

    console.log(
      `${nomeMesAnterior}:`,
      dadosMesAnterior.total,
      "chamados"
    );

  } catch (erro) {
    console.error(
      "Erro ao gerar relatório:"
    );

    console.error(
      erro.message
    );
  }
}

buscarTodosChamados();