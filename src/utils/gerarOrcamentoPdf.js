// =========================================================
// GERADOR DE ORÇAMENTO SYNTER
// =========================================================
//
// Não utiliza bibliotecas externas.
// O documento é montado em HTML A4 e abre o diálogo
// nativo do navegador para "Salvar como PDF".
//
// Segurança:
// todo texto vindo do orçamento é escapado antes
// de ser inserido no HTML.
// =========================================================


function escaparHtml(valor = "") {

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function formatarMoeda(valor) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(
    Number(valor || 0)
  );

}


function formatarDataHora(valor) {

  if (!valor) {
    return "-";
  }


  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(
    new Date(valor)
  );

}


function formatarDataEntrega(valor) {

  if (!valor) {
    return "-";
  }


  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone: "UTC"
    }
  ).format(
    new Date(
      `${valor}T00:00:00Z`
    )
  );

}


function formatarStatus(status) {

  const nomes = {
    rascunho: "Rascunho",
    enviado: "Enviado para análise",
    aprovado: "Aprovado",
    recusado: "Recusado",
    cancelado: "Cancelado"
  };


  return nomes[status] || status || "-";

}


function limparNomeArquivo(valor = "") {

  return String(valor)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-zA-Z0-9-_ ]/g,
      ""
    )
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);

}


export function gerarOrcamentoPdf({
  orcamento,
  itens
}) {

  if (!orcamento) {

    throw new Error(
      "Orçamento não informado."
    );

  }


  if (
    !Array.isArray(itens) ||
    itens.length === 0
  ) {

    throw new Error(
      "O orçamento precisa ter pelo menos um produto."
    );

  }


  const subtotalProdutos =
    itens.reduce(
      (total, item) =>
        total +
        Number(
          item.subtotal || 0
        ),
      0
    );


  const frete =
    Number(
      orcamento.frete || 0
    );


  const totalGeral =
    subtotalProdutos +
    frete;


  const linhasProdutos =
    itens
      .map(
        (item, index) => {

          const complemento =
            [
              item.variacao_produto,
              item.tipo_preco
            ]
              .filter(Boolean)
              .map(escaparHtml)
              .join(" • ");


          return `
            <tr>
              <td class="center">
                ${index + 1}
              </td>

              <td>
                <strong>
                  ${escaparHtml(
                    item.nome_produto
                  )}
                </strong>

                ${
                  complemento
                    ? `
                      <div class="product-detail">
                        ${complemento}
                      </div>
                    `
                    : ""
                }
              </td>

              <td class="code">
                ${escaparHtml(
                  item.codigo_produto
                )}
              </td>

              <td class="center">
                ${escaparHtml(
                  item.quantidade
                )}
              </td>

              <td class="right">
                ${escaparHtml(
                  formatarMoeda(
                    item.preco_unitario
                  )
                )}
              </td>

              <td class="right total-cell">
                ${escaparHtml(
                  formatarMoeda(
                    item.subtotal
                  )
                )}
              </td>
            </tr>
          `;

        }
      )
      .join("");


  const numeroCurto =
    String(
      orcamento.id || ""
    )
      .split("-")[0]
      .toUpperCase();


  const nomeArquivo =
    `Orcamento-Synter-${
      limparNomeArquivo(
        orcamento.cliente_nome ||
        numeroCurto ||
        "Cliente"
      )
    }`;


  const html = `
    <!DOCTYPE html>

    <html lang="pt-BR">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${escaparHtml(nomeArquivo)}
        </title>


        <style>

          * {
            box-sizing: border-box;
          }


          html,
          body {
            margin: 0;

            padding: 0;

            background: #efefef;

            color: #171717;

            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }


          body {
            padding:
              24px;
          }


          .toolbar {
            width:
              min(
                210mm,
                100%
              );

            margin:
              0 auto
              14px;

            display: flex;

            align-items: center;
            justify-content: space-between;

            gap: 12px;

            padding:
              12px 14px;

            border:
              1px solid #d4d4d4;

            border-radius: 8px;

            background: #ffffff;
          }


          .toolbar p {
            margin: 0;

            color: #666666;

            font-size: 12px;
          }


          .toolbar button {
            min-height: 38px;

            padding:
              0 16px;

            border: none;

            border-radius: 7px;

            background: #111111;

            color: #ffffff;

            font-size: 12px;
            font-weight: 700;

            cursor: pointer;
          }


          .sheet {
            width: 210mm;

            min-height: 297mm;

            margin: 0 auto;

            padding:
              15mm 15mm
              14mm;

            background: #ffffff;

            box-shadow:
              0 14px 45px
              rgba(0, 0, 0, 0.13);
          }


          .topline {
            height: 5px;

            margin-bottom: 17px;

            background: #111111;
          }


          .header {
            display: flex;

            align-items: flex-start;
            justify-content: space-between;

            gap: 30px;

            padding-bottom: 20px;

            border-bottom:
              1px solid #d9d9d9;
          }


          .brand {
            font-size: 34px;
            font-weight: 900;

            letter-spacing: 5px;

            line-height: 1;
          }


          .brand-subtitle {
            margin-top: 8px;

            color: #727272;

            font-size: 9px;
            font-weight: 700;

            letter-spacing: 2px;

            text-transform: uppercase;
          }


          .document-info {
            text-align: right;
          }


          .document-info h1 {
            margin: 0;

            font-size: 23px;
            font-weight: 800;

            letter-spacing: -0.5px;
          }


          .document-number {
            margin-top: 7px;

            color: #555555;

            font-size: 10px;
          }


          .status {
            display: inline-block;

            margin-top: 10px;

            padding:
              6px 10px;

            border:
              1px solid #bdbdbd;

            border-radius: 100px;

            color: #333333;

            font-size: 8px;
            font-weight: 800;

            letter-spacing: 0.8px;

            text-transform: uppercase;
          }


          .meta-row {
            display: grid;

            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );

            gap: 10px;

            margin-top: 17px;
          }


          .meta-card,
          .client-card,
          .sale-card,
          .notes-card {
            border:
              1px solid #dddddd;

            border-radius: 7px;

            background: #ffffff;
          }


          .meta-card {
            padding:
              10px 11px;
          }


          .label {
            display: block;

            margin-bottom: 5px;

            color: #787878;

            font-size: 7px;
            font-weight: 800;

            letter-spacing: 1px;

            text-transform: uppercase;
          }


          .value {
            color: #222222;

            font-size: 10px;
            font-weight: 700;

            line-height: 1.45;

            word-break: break-word;
          }


          .section {
            margin-top: 20px;
          }


          .section-title {
            display: flex;

            align-items: center;

            gap: 8px;

            margin-bottom: 10px;

            color: #202020;

            font-size: 9px;
            font-weight: 900;

            letter-spacing: 1.4px;

            text-transform: uppercase;
          }


          .section-title::before {
            content: "";

            width: 3px;
            height: 14px;

            background: #111111;
          }


          .client-grid {
            display: grid;

            grid-template-columns:
              2fr 1fr;

            gap: 9px;
          }


          .client-card {
            padding:
              11px 12px;
          }


          .sale-grid {
            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 9px;
          }


          .sale-card {
            padding:
              11px 12px;
          }


          .notes-card {
            margin-top: 9px;

            padding:
              11px 12px;
          }


          .notes-card p {
            margin: 0;

            color: #484848;

            font-size: 9px;

            line-height: 1.55;

            white-space: pre-wrap;
          }


          table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;

            border:
              1px solid #d7d7d7;
          }


          thead {
            display:
              table-header-group;

            background: #151515;

            color: #ffffff;
          }


          th {
            padding:
              8px 7px;

            font-size: 7px;
            font-weight: 800;

            letter-spacing: 0.6px;

            text-align: left;

            text-transform: uppercase;
          }


          td {
            padding:
              9px 7px;

            border-bottom:
              1px solid #e4e4e4;

            color: #2d2d2d;

            font-size: 8.2px;

            line-height: 1.35;

            vertical-align: top;
          }


          tbody tr:last-child td {
            border-bottom: none;
          }


          tr {
            break-inside:
              avoid;

            page-break-inside:
              avoid;
          }


          th:nth-child(1),
          td:nth-child(1) {
            width: 7%;
          }


          th:nth-child(2),
          td:nth-child(2) {
            width: 32%;
          }


          th:nth-child(3),
          td:nth-child(3) {
            width: 18%;
          }


          th:nth-child(4),
          td:nth-child(4) {
            width: 10%;
          }


          th:nth-child(5),
          td:nth-child(5) {
            width: 16%;
          }


          th:nth-child(6),
          td:nth-child(6) {
            width: 17%;
          }


          .center {
            text-align: center;
          }


          .right {
            text-align: right;
          }


          .code {
            color: #555555;

            font-family:
              "Courier New",
              monospace;

            font-size: 7.7px;
          }


          .product-detail {
            margin-top: 4px;

            color: #777777;

            font-size: 7.2px;
          }


          .total-cell {
            font-weight: 800;
          }


          .totals {
            width: 270px;

            margin:
              14px 0 0
              auto;
          }


          .total-row {
            display: flex;

            align-items: center;
            justify-content: space-between;

            gap: 20px;

            padding:
              7px 0;

            border-bottom:
              1px solid #e5e5e5;
          }


          .total-row span {
            color: #6e6e6e;

            font-size: 8px;
            font-weight: 700;

            text-transform: uppercase;
          }


          .total-row strong {
            font-size: 10px;
          }


          .total-row.grand {
            margin-top: 4px;

            padding:
              10px 11px;

            border: none;

            border-radius: 6px;

            background: #111111;

            color: #ffffff;
          }


          .total-row.grand span {
            color: #cfcfcf;
          }


          .total-row.grand strong {
            color: #ffffff;

            font-size: 14px;
          }


          .footer {
            margin-top: 24px;

            padding-top: 12px;

            display: flex;

            align-items: flex-end;
            justify-content: space-between;

            gap: 20px;

            border-top:
              1px solid #d8d8d8;
          }


          .footer p {
            margin: 0;

            max-width: 500px;

            color: #7a7a7a;

            font-size: 7.5px;

            line-height: 1.55;
          }


          .footer .synter {
            color: #222222;

            font-size: 9px;
            font-weight: 900;

            letter-spacing: 2px;
          }


          @page {
            size: A4;

            margin: 0;
          }


          @media print {

            html,
            body {
              background: #ffffff;
            }


            body {
              padding: 0;
            }


            .toolbar {
              display: none;
            }


            .sheet {
              width: 210mm;

              min-height: 297mm;

              margin: 0;

              box-shadow: none;
            }

          }

        </style>

      </head>


      <body>

        <div class="toolbar">

          <p>
            Na janela de impressão, selecione
            <strong>Salvar como PDF</strong>.
          </p>

        </div>


        <main class="sheet">

          <div class="topline"></div>


          <header class="header">

            <div>

              <div class="brand">
                SYNTER
              </div>

              <div class="brand-subtitle">
                Soluções em Acesso
              </div>

            </div>


            <div class="document-info">

              <h1>
                ORÇAMENTO COMERCIAL
              </h1>

              <div class="document-number">
                Nº ${escaparHtml(
                  numeroCurto || "-"
                )}
              </div>

              <div class="status">
                ${escaparHtml(
                  formatarStatus(
                    orcamento.status
                  )
                )}
              </div>

            </div>

          </header>


          <div class="meta-row">

            <div class="meta-card">

              <span class="label">
                Criado em
              </span>

              <div class="value">
                ${escaparHtml(
                  formatarDataHora(
                    orcamento.created_at
                  )
                )}
              </div>

            </div>


            <div class="meta-card">

              <span class="label">
                Data de entrega
              </span>

              <div class="value">
                ${escaparHtml(
                  formatarDataEntrega(
                    orcamento.data_entrega
                  )
                )}
              </div>

            </div>


            <div class="meta-card">

              <span class="label">
                Itens
              </span>

              <div class="value">
                ${escaparHtml(
                  itens.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.quantidade || 0
                      ),
                    0
                  )
                )}
              </div>

            </div>

          </div>


          <section class="section">

            <div class="section-title">
              Dados do cliente
            </div>


            <div class="client-grid">

              <div class="client-card">

                <span class="label">
                  Cliente / Razão Social
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.cliente_nome ||
                    "-"
                  )}
                </div>

              </div>


              <div class="client-card">

                <span class="label">
                  CPF / CNPJ
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.cliente_documento ||
                    "-"
                  )}
                </div>

              </div>


              <div class="client-card">

                <span class="label">
                  Telefone
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.cliente_telefone ||
                    "-"
                  )}
                </div>

              </div>


              <div class="client-card">

                <span class="label">
                  E-mail
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.cliente_email ||
                    "-"
                  )}
                </div>

              </div>

            </div>

          </section>


          <section class="section">

            <div class="section-title">
              Venda e entrega
            </div>


            <div class="sale-grid">

              <div class="sale-card">

                <span class="label">
                  Condição de pagamento
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.condicao_pagamento ||
                    "-"
                  )}
                </div>

              </div>


              <div class="sale-card">

                <span class="label">
                  Local de entrega
                </span>

                <div class="value">
                  ${escaparHtml(
                    orcamento.local_entrega ||
                    "-"
                  )}
                </div>

              </div>

            </div>


            ${
              orcamento.observacoes_venda
                ? `
                  <div class="notes-card">

                    <span class="label">
                      Observações adicionais sobre a venda
                    </span>

                    <p>
                      ${escaparHtml(
                        orcamento.observacoes_venda
                      )}
                    </p>

                  </div>
                `
                : ""
            }


            ${
              orcamento.observacoes
                ? `
                  <div class="notes-card">

                    <span class="label">
                      Observações gerais
                    </span>

                    <p>
                      ${escaparHtml(
                        orcamento.observacoes
                      )}
                    </p>

                  </div>
                `
                : ""
            }

          </section>


          <section class="section">

            <div class="section-title">
              Produtos
            </div>


            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Referência</th>
                  <th>Qtd.</th>
                  <th class="right">Valor unit.</th>
                  <th class="right">Subtotal</th>
                </tr>

              </thead>


              <tbody>

                ${linhasProdutos}

              </tbody>

            </table>


            <div class="totals">

              <div class="total-row">

                <span>
                  Produtos
                </span>

                <strong>
                  ${escaparHtml(
                    formatarMoeda(
                      subtotalProdutos
                    )
                  )}
                </strong>

              </div>


              <div class="total-row">

                <span>
                  Frete
                </span>

                <strong>
                  ${escaparHtml(
                    formatarMoeda(
                      frete
                    )
                  )}
                </strong>

              </div>


              <div class="total-row grand">

                <span>
                  Total
                </span>

                <strong>
                  ${escaparHtml(
                    formatarMoeda(
                      totalGeral
                    )
                  )}
                </strong>

              </div>

            </div>

          </section>


          <footer class="footer">

            <p>
              Este documento foi gerado eletronicamente
              pelo sistema comercial Synter com base nos
              dados registrados no orçamento.
            </p>

            <div class="synter">
              SYNTER
            </div>

          </footer>

        </main>

      </body>

    </html>
  `;


  // =====================================================
  // IMPRESSÃO / SALVAR COMO PDF
  // =====================================================
  //
  // Usa iframe invisível para evitar bloqueio de pop-up.
  // =====================================================


  const iframe =
    document.createElement("iframe");


  iframe.setAttribute(
    "title",
    "Orçamento Synter"
  );


  iframe.style.position =
    "fixed";

  iframe.style.right =
    "0";

  iframe.style.bottom =
    "0";

  iframe.style.width =
    "0";

  iframe.style.height =
    "0";

  iframe.style.border =
    "0";

  iframe.style.opacity =
    "0";

  iframe.style.pointerEvents =
    "none";


  document.body.appendChild(
    iframe
  );


  const documento =
    iframe.contentWindow?.document;


  if (!documento) {

    iframe.remove();

    throw new Error(
      "Não foi possível preparar o orçamento para impressão."
    );

  }


  documento.open();

  documento.write(html);

  documento.close();


  const imprimir = () => {

    try {

      const janelaImpressao =
        iframe.contentWindow;


      if (!janelaImpressao) {

        throw new Error(
          "Janela de impressão indisponível."
        );

      }


      janelaImpressao.focus();

      janelaImpressao.print();


      window.setTimeout(
        () => {

          iframe.remove();

        },
        1500
      );

    }
    catch (error) {

      iframe.remove();

      console.error(
        "Erro ao abrir impressão:",
        error
      );

    }

  };


  window.setTimeout(
    imprimir,
    350
  );

}