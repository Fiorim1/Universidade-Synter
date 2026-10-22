import html2pdf from "html2pdf.js";
import tabelaPrecosData from "../data/tabelaPrecosData";


// =========================================================
// GERADOR DE ORÇAMENTO SYNTER
// =========================================================
//
// 1. Dados da empresa
// 2. Dados de faturamento e cobrança
// 3. Produtos com imagens
// 4. Condições comerciais
//
// gerarOrcamentoPdf():
// mantém o funcionamento atual de impressão.
//
// criarArquivoOrcamentoPdf():
// cria um arquivo PDF real para compartilhamento.
//
// Nome do arquivo:
// Orcamento-PrimeiroNome-NumeroOrcamento.pdf
// =========================================================


// =========================================================
// IMAGENS DOS PRODUTOS
// =========================================================

const imagensProdutosPdf =
  import.meta.glob(
    "../assets/produtos/*.{png,jpg,jpeg,webp}",
    {
      eager: true,
      import: "default"
    }
  );


// =========================================================
// SEGURANÇA
// =========================================================

function escaparHtml(
  valor = ""
) {

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// =========================================================
// NORMALIZAÇÃO
// =========================================================

function normalizarChaveProduto(
  valor = ""
) {

  return String(valor)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /\.[^/.]+$/,
      ""
    )
    .replace(
      /[^a-z0-9]/g,
      ""
    );

}


// =========================================================
// FORMATADORES
// =========================================================

function formatarNumeroMoeda(
  valor
) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(
    Number(
      valor || 0
    )
  );

}


function formatarQuantidade(
  valor
) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }
  ).format(
    Number(
      valor || 0
    )
  );

}


function formatarData(
  valor
) {

  if (!valor) {
    return "-";
  }


  const data =
    new Date(
      valor
    );


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return "-";

  }


  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(
    data
  );

}


function formatarDataHora(
  valor
) {

  if (!valor) {
    return "-";
  }


  const data =
    new Date(
      valor
    );


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

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
    data
  );

}


function formatarDataEntrega(
  valor
) {

  if (!valor) {
    return "-";
  }


  const texto =
    String(
      valor
    );


  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ) {

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
      }
    ).format(
      new Date(
        `${texto}T00:00:00Z`
      )
    );

  }


  return formatarData(
    valor
  );

}


// =========================================================
// NOME DO ARQUIVO
// =========================================================

function limparNomeArquivo(
  valor = ""
) {

  return String(
    valor
  )
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
    .replace(
      /\s+/g,
      "-"
    )
    .slice(
      0,
      70
    );

}


// =========================================================
// PEGAR PRIMEIRO VALOR DISPONÍVEL
// =========================================================

function primeiroValor(
  objeto,
  chaves,
  fallback = "-"
) {

  for (
    const chave of
    chaves
  ) {

    const valor =
      objeto?.[chave];


    if (
      valor !== null &&
      valor !== undefined &&
      String(
        valor
      ).trim() !== ""
    ) {

      return valor;

    }

  }


  return fallback;

}


// =========================================================
// NÚMERO DO ORÇAMENTO
// =========================================================

function numeroOrcamento(
  orcamento
) {

  const numeroInformado =
    primeiroValor(
      orcamento,
      [
        "numero",
        "numero_orcamento",
        "orcamento_numero"
      ],
      ""
    );


  if (
    numeroInformado
  ) {

    return String(
      numeroInformado
    );

  }


  return (
    String(
      orcamento?.id ||
      ""
    )
      .split("-")[0]
      .toUpperCase() ||
    "-"
  );

}


// =========================================================
// ENCONTRAR PRODUTO NA TABELA
// =========================================================

function encontrarLinhaTabelaPdf(
  item
) {

  if (
    !item
  ) {

    return null;

  }


  const categorias =
    Array.isArray(
      tabelaPrecosData?.categorias
    )
      ? tabelaPrecosData.categorias
      : [];


  const codigo =
    normalizarChaveProduto(
      item.codigo_produto
    );


  const nome =
    normalizarChaveProduto(
      item.nome_produto
    );


  const variacao =
    normalizarChaveProduto(
      item.variacao_produto
    );


  let melhorCandidato =
    null;


  let melhorPontuacao =
    -1;


  for (
    const categoria of
    categorias
  ) {

    const linhas =
      Array.isArray(
        categoria?.linhas
      )
        ? categoria.linhas
        : [];


    for (
      const linha of
      linhas
    ) {

      if (
        !Array.isArray(
          linha
        )
      ) {

        continue;

      }


      const valores =
        linha
          .map(
            normalizarChaveProduto
          )
          .filter(
            Boolean
          );


      if (
        codigo.length >=
        4
      ) {

        const encontrouCodigo =
          valores.some(
            (
              valor
            ) =>
              valor === codigo ||
              (
                valor.length >=
                4 &&
                (
                  valor.includes(
                    codigo
                  ) ||
                  codigo.includes(
                    valor
                  )
                )
              )
          );


        if (
          encontrouCodigo
        ) {

          return {
            categoria,
            linha
          };

        }

      }


      let pontuacao =
        0;


      if (
        nome.length >=
        4
      ) {

        const encontrouNome =
          valores.some(
            (
              valor
            ) =>
              valor.length >=
              4 &&
              (
                valor.includes(
                  nome
                ) ||
                nome.includes(
                  valor
                )
              )
          );


        if (
          encontrouNome
        ) {

          pontuacao +=
            4;

        }

      }


      if (
        variacao.length >=
        3
      ) {

        const encontrouVariacao =
          valores.some(
            (
              valor
            ) =>
              valor.length >=
              3 &&
              (
                valor.includes(
                  variacao
                ) ||
                variacao.includes(
                  valor
                )
              )
          );


        if (
          encontrouVariacao
        ) {

          pontuacao +=
            2;

        }

      }


      if (
        pontuacao >
        melhorPontuacao &&
        pontuacao >=
        4
      ) {

        melhorPontuacao =
          pontuacao;


        melhorCandidato = {
          categoria,
          linha
        };

      }

    }

  }


  return melhorCandidato;

}


// =========================================================
// ENCONTRAR IMAGEM DO PRODUTO
// =========================================================

function encontrarImagemItemPdf(
  item
) {

  if (
    !item
  ) {

    return "";

  }


  const imagemDireta =
    item.imagem_url ||
    item.image_url ||
    item.imagem ||
    item.foto_url;


  if (
    imagemDireta
  ) {

    return String(
      imagemDireta
    );

  }


  const correspondencia =
    encontrarLinhaTabelaPdf(
      item
    );


  const codigo =
    normalizarChaveProduto(
      item.codigo_produto
    );


  const valoresBase = [

    item.codigo_produto,

    item.nome_produto,

    item.variacao_produto,

    item.tipo_preco,

    ...(
      Array.isArray(
        correspondencia?.linha
      )
        ? correspondencia.linha
        : []
    )

  ];


  const valoresNormalizados =
    [
      ...new Set(
        valoresBase
          .map(
            normalizarChaveProduto
          )
          .filter(
            (
              valor
            ) =>
              valor.length >=
              3
          )
      )
    ];


  let melhorImagem =
    "";


  let melhorPontuacao =
    -1;


  for (
    const [
      caminho,
      imagem
    ] of
    Object.entries(
      imagensProdutosPdf
    )
  ) {

    const nomeArquivo =
      caminho
        .split("/")
        .pop() ||
      "";


    const nomeNormalizado =
      normalizarChaveProduto(
        nomeArquivo
      );


    if (
      !nomeNormalizado
    ) {

      continue;

    }


    if (
      codigo.length >=
      4 &&
      (
        nomeNormalizado ===
        codigo ||
        nomeNormalizado.includes(
          codigo
        ) ||
        codigo.includes(
          nomeNormalizado
        )
      )
    ) {

      return imagem;

    }


    let pontuacao =
      0;


    for (
      const valor of
      valoresNormalizados
    ) {

      if (
        nomeNormalizado ===
        valor
      ) {

        pontuacao =
          Math.max(
            pontuacao,
            1000 +
            valor.length
          );

      }
      else if (
        nomeNormalizado.includes(
          valor
        )
      ) {

        pontuacao =
          Math.max(
            pontuacao,
            100 +
            valor.length
          );

      }
      else if (
        valor.includes(
          nomeNormalizado
        )
      ) {

        pontuacao =
          Math.max(
            pontuacao,
            50 +
            nomeNormalizado.length
          );

      }

    }


    if (
      pontuacao >
      melhorPontuacao
    ) {

      melhorPontuacao =
        pontuacao;


      melhorImagem =
        imagem;

    }

  }


  return melhorPontuacao > 0
    ? melhorImagem
    : "";

}


// =========================================================
// PREPARAR URL DA IMAGEM
// =========================================================

function prepararUrlImagemPdf(
  valor
) {

  const url =
    String(
      valor ||
      ""
    ).trim();


  if (
    !url
  ) {

    return "";

  }


  if (
    /^data:image\//i.test(
      url
    )
  ) {

    return url;

  }


  if (
    /^https?:\/\//i.test(
      url
    )
  ) {

    return url;

  }


  try {

    return new URL(
      url,
      window.location.origin
    ).href;

  }
  catch {

    return "";

  }

}


// =========================================================
// VALIDAR ORÇAMENTO
// =========================================================

function validarDados({
  orcamento,
  itens
}) {

  if (
    !orcamento
  ) {

    throw new Error(
      "Orçamento não informado."
    );

  }


  if (
    !Array.isArray(
      itens
    ) ||
    itens.length ===
    0
  ) {

    throw new Error(
      "O orçamento precisa ter pelo menos um produto."
    );

  }

}


// =========================================================
// MONTAR DOCUMENTO
// =========================================================

function montarDocumentoOrcamento({
  orcamento,
  itens
}) {

  validarDados({
    orcamento,
    itens
  });


  // =====================================================
  // TOTAIS
  // =====================================================

  const subtotalProdutos =
    itens.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.subtotal ||
          (
            Number(
              item.preco_unitario ||
              0
            ) *
            Number(
              item.quantidade ||
              0
            )
          )
        ),
      0
    );


  const frete =
    Number(
      orcamento.frete ||
      0
    );


  const totalGeral =
    subtotalProdutos +
    frete;


  const quantidadeTotal =
    itens.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantidade ||
          0
        ),
      0
    );


  // =====================================================
  // IDENTIFICAÇÃO
  // =====================================================

  const numero =
    numeroOrcamento(
      orcamento
    );


  // =====================================================
  // PRIMEIRO NOME DO CLIENTE
  // =====================================================

  const primeiroNomeCliente =
    String(
      orcamento.cliente_nome ||
      "Cliente"
    )
      .trim()
      .split(
        /\s+/
      )[0];


  // =====================================================
  // NOME FINAL DO PDF
  // =====================================================
  //
  // Exemplo:
  //
  // Gabriel Esteves
  // Orçamento 002066
  //
  // Resultado:
  // Orcamento-Gabriel-002066.pdf
  //
  // =====================================================

  const nomeArquivo =
    `Orcamento-${
      limparNomeArquivo(
        primeiroNomeCliente
      )
    }-${
      limparNomeArquivo(
        numero
      )
    }`;


  // =====================================================
  // CLIENTE
  // =====================================================

  const clienteContato =
    primeiroValor(
      orcamento,
      [
        "cliente_contato",
        "contato"
      ]
    );


  const clienteCidade =
    primeiroValor(
      orcamento,
      [
        "cliente_cidade",
        "cidade"
      ]
    );


  const clienteEndereco =
    primeiroValor(
      orcamento,
      [
        "cliente_endereco",
        "endereco"
      ]
    );


  const clienteBairro =
    primeiroValor(
      orcamento,
      [
        "cliente_bairro",
        "bairro"
      ]
    );


  const clienteCep =
    primeiroValor(
      orcamento,
      [
        "cliente_cep",
        "cep"
      ]
    );


  const clienteUf =
    primeiroValor(
      orcamento,
      [
        "cliente_uf",
        "uf"
      ]
    );


  const clienteInscricao =
    primeiroValor(
      orcamento,
      [
        "cliente_inscricao_estadual",
        "inscricao_estadual",
        "cliente_ie",
        "ie"
      ]
    );


  const representante =
    primeiroValor(
      orcamento,
      [
        "representante_nome",
        "nome_representante",
        "created_by_name"
      ]
    );


  const validade =
    primeiroValor(
      orcamento,
      [
        "validade",
        "data_validade",
        "validade_orcamento"
      ],
      ""
    );


  // =====================================================
  // PRODUTOS
  // =====================================================

  const linhasProdutos =
    itens
      .map(
        (
          item
        ) => {

          const imagem =
            prepararUrlImagemPdf(
              encontrarImagemItemPdf(
                item
              )
            );


          const complemento =
            [
              item.variacao_produto,
              item.tipo_preco
            ]
              .filter(
                Boolean
              )
              .map(
                escaparHtml
              )
              .join(
                " • "
              );


          const subtotalItem =
            Number(
              item.subtotal ||
              (
                Number(
                  item.preco_unitario ||
                  0
                ) *
                Number(
                  item.quantidade ||
                  0
                )
              )
            );


          return `
            <tr>

              <td class="product-image-cell">

                ${
                  imagem
                    ? `

                      <div class="product-image-wrapper">

                        <img
                          class="product-image"
                          src="${escaparHtml(
                            imagem
                          )}"
                          alt="${escaparHtml(
                            item.nome_produto ||
                            "Produto"
                          )}"
                        />

                      </div>

                    `
                    : `

                      <div class="product-image-placeholder">

                        Sem imagem

                      </div>

                    `
                }

              </td>


              <td class="product-code">

                ${escaparHtml(
                  item.codigo_produto ||
                  "-"
                )}

              </td>


              <td class="product-description">

                <strong>

                  ${escaparHtml(
                    item.nome_produto ||
                    "-"
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


              <td class="number-cell">

                ${escaparHtml(
                  formatarQuantidade(
                    item.quantidade
                  )
                )}

              </td>


              <td class="number-cell">

                ${escaparHtml(
                  formatarNumeroMoeda(
                    item.preco_unitario
                  )
                )}

              </td>


              <td class="number-cell product-total">

                ${escaparHtml(
                  formatarNumeroMoeda(
                    subtotalItem
                  )
                )}

              </td>

            </tr>
          `;

        }
      )
      .join(
        ""
      );


  // =====================================================
  // HTML DO DOCUMENTO
  // =====================================================

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

          ${escaparHtml(
            nomeArquivo
          )}

        </title>


        <style>

          * {
            box-sizing: border-box;
          }


          html,
          body {

            margin: 0;

            padding: 0;

            background:
              #ffffff;

            color:
              #111111;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

          }


          body {
            padding: 0;
          }


          .sheet {

            width:
              210mm;

            min-height:
              297mm;

            margin:
              0 auto;

            padding:
              12mm
              13mm;

            background:
              #ffffff;

          }



          /* ======================================== */
          /* EMPRESA                                  */
          /* ======================================== */

          .company-header {

            display:
              grid;

            grid-template-columns:
              100px
              minmax(0, 1fr)
              175px;

            gap:
              14px;

            align-items:
              start;

            padding-bottom:
              10px;

            border-bottom:
              1.5px solid
              #454545;

          }


          .brand-box {
            padding-top: 2px;
          }


          .brand {

            color:
              #111111;

            font-size:
              20px;

            font-weight:
              900;

            letter-spacing:
              1.5px;

          }


          .brand-subtitle {

            margin-top:
              3px;

            color:
              #555555;

            font-size:
              7px;

            font-weight:
              700;

            letter-spacing:
              0.6px;

          }


          .company-data,
          .document-data {
            min-width: 0;
          }


          .company-name {

            margin:
              0
              0
              4px;

            font-size:
              11px;

            font-weight:
              800;

            text-transform:
              uppercase;

          }


          .company-line {

            margin:
              1px
              0;

            color:
              #252525;

            font-size:
              7.5px;

            line-height:
              1.3;

          }


          .company-contact-grid {

            display:
              grid;

            grid-template-columns:
              1.15fr
              0.85fr;

            gap:
              2px
              14px;

            margin-top:
              4px;

          }


          .document-title {

            margin:
              0
              0
              7px;

            font-size:
              10px;

            font-weight:
              800;

          }


          .document-row {

            display:
              grid;

            grid-template-columns:
              54px
              minmax(0, 1fr);

            gap:
              6px;

            margin:
              3px
              0;

            font-size:
              7.5px;

          }


          .document-row span:first-child {
            font-weight: 700;
          }


          .document-row span:last-child {

            text-align:
              right;

            font-weight:
              600;

          }



          /* ======================================== */
          /* SEÇÕES                                   */
          /* ======================================== */

          .section {
            margin-top: 10px;
          }


          .section-title {

            margin:
              0
              0
              5px;

            padding-bottom:
              3px;

            border-bottom:
              1px solid
              #555555;

            font-size:
              10px;

            font-weight:
              900;

            text-transform:
              uppercase;

          }



          /* ======================================== */
          /* FATURAMENTO                              */
          /* ======================================== */

          .billing-grid {

            display:
              grid;

            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);

            gap:
              4px
              22px;

          }


          .billing-column {
            min-width: 0;
          }


          .data-line {

            display:
              grid;

            grid-template-columns:
              72px
              minmax(0, 1fr);

            gap:
              8px;

            min-height:
              14px;

            align-items:
              start;

            font-size:
              7.5px;

            line-height:
              1.35;

          }


          .data-label {
            font-weight: 800;
          }


          .data-value {

            min-width:
              0;

            word-break:
              break-word;

          }



          /* ======================================== */
          /* PRODUTOS                                 */
          /* ======================================== */

          .products-table {

            width:
              100%;

            border-collapse:
              collapse;

            table-layout:
              fixed;

          }


          .products-table thead {

            border-bottom:
              1px solid
              #555555;

          }


          .products-table th {

            padding:
              4px;

            color:
              #222222;

            font-size:
              6.8px;

            font-weight:
              800;

            text-align:
              left;

            vertical-align:
              middle;

          }


          .products-table td {

            padding:
              6px
              4px;

            border-bottom:
              1px solid
              #d2d2d2;

            color:
              #202020;

            font-size:
              7.2px;

            line-height:
              1.25;

            vertical-align:
              middle;

          }


          .products-table tr {

            break-inside:
              avoid;

            page-break-inside:
              avoid;

          }


          .products-table th:nth-child(1),
          .products-table td:nth-child(1) {
            width: 13%;
          }


          .products-table th:nth-child(2),
          .products-table td:nth-child(2) {
            width: 15%;
          }


          .products-table th:nth-child(3),
          .products-table td:nth-child(3) {
            width: 40%;
          }


          .products-table th:nth-child(4),
          .products-table td:nth-child(4) {
            width: 9%;
          }


          .products-table th:nth-child(5),
          .products-table td:nth-child(5) {
            width: 11%;
          }


          .products-table th:nth-child(6),
          .products-table td:nth-child(6) {
            width: 12%;
          }


          .product-image-cell {
            text-align: center;
          }


          .product-image-wrapper,
          .product-image-placeholder {

            width:
              48px;

            height:
              48px;

            display:
              flex;

            justify-content:
              center;

            align-items:
              center;

            margin:
              0 auto;

            background:
              #ffffff;

          }


          .product-image {

            display:
              block;

            width:
              48px;

            height:
              48px;

            max-width:
              48px;

            max-height:
              48px;

            object-fit:
              contain;

            object-position:
              center;

          }


          .product-image-placeholder {

            border:
              1px solid
              #dddddd;

            color:
              #9a9a9a;

            font-size:
              6px;

            text-align:
              center;

          }


          .product-code {

            color:
              #363636;

            font-family:
              "Courier New",
              monospace;

            font-size:
              6.8px;

            word-break:
              break-word;

          }


          .product-description strong {

            font-size:
              7.3px;

            font-weight:
              700;

          }


          .product-detail {

            margin-top:
              2px;

            color:
              #696969;

            font-size:
              6.5px;

          }


          .number-cell {

            text-align:
              right;

            white-space:
              nowrap;

          }


          .product-total {
            font-weight: 800;
          }



          /* ======================================== */
          /* TOTAIS                                   */
          /* ======================================== */

          .products-summary {

            display:
              grid;

            grid-template-columns:
              minmax(0, 1fr)
              275px;

            gap:
              16px;

            margin-top:
              6px;

          }


          .products-meta {

            display:
              flex;

            align-items:
              flex-start;

            gap:
              26px;

            padding-top:
              4px;

            color:
              #303030;

            font-size:
              7px;

          }


          .products-meta strong {
            font-weight: 800;
          }


          .totals {
            width: 100%;
          }


          .total-line {

            display:
              grid;

            grid-template-columns:
              minmax(0, 1fr)
              85px;

            gap:
              10px;

            padding:
              3px
              0;

            font-size:
              7.3px;

          }


          .total-line span:first-child {
            text-align: right;
          }


          .total-line span:last-child {

            text-align:
              right;

            font-weight:
              700;

          }


          .total-line.grand {

            margin-top:
              2px;

            padding-top:
              5px;

            border-top:
              1px solid
              #555555;

            font-size:
              7.7px;

            font-weight:
              900;

          }



          /* ======================================== */
          /* CONDIÇÕES COMERCIAIS                     */
          /* ======================================== */

          .commercial-lines {
            width: 100%;
          }


          .commercial-line {

            display:
              grid;

            grid-template-columns:
              120px
              minmax(0, 1fr);

            gap:
              8px;

            min-height:
              15px;

            padding:
              1px
              0;

            font-size:
              7.5px;

            line-height:
              1.35;

          }


          .commercial-line strong {
            font-weight: 800;
          }


          .commercial-observation {

            margin-top:
              4px;

            padding-top:
              4px;

            border-top:
              1px solid
              #d2d2d2;

          }


          .commercial-observation p {

            margin:
              2px
              0
              0;

            color:
              #272727;

            font-size:
              7.2px;

            line-height:
              1.4;

            white-space:
              pre-wrap;

          }



          /* ======================================== */
          /* RODAPÉ                                   */
          /* ======================================== */

          .document-footer {

            margin-top:
              16px;

            padding-top:
              9px;

            border-top:
              1px solid
              #bbbbbb;

            text-align:
              center;

            color:
              #363636;

            font-size:
              6.8px;

            font-weight:
              700;

            line-height:
              1.45;

            text-transform:
              uppercase;

          }


          .document-footer .print-date {
            margin-top: 2px;
          }


          @page {

            size:
              A4;

            margin:
              0;

          }


          @media print {

            html,
            body {
              background: #ffffff;
            }


            .sheet {

              width:
                210mm;

              min-height:
                297mm;

              margin:
                0;

              box-shadow:
                none;

            }

          }

        </style>

      </head>


      <body>


        <main class="sheet">


          <!-- EMPRESA -->

          <header class="company-header">


            <div class="brand-box">

              <div class="brand">
                SYNTER
              </div>

              <div class="brand-subtitle">
                SOLUÇÕES EM ACESSO
              </div>

            </div>


            <div class="company-data">


              <h1 class="company-name">

                LA ROSS FECHADURAS E FERRAGENS LTDA.

              </h1>


              <div class="company-line">

                Rod. Gabriel Arns, 5572 - Centro - Forquilhinha (SC)

              </div>


              <div class="company-line">

                CEP: 88850-000

              </div>


              <div class="company-contact-grid">


                <div class="company-line">

                  <strong>
                    CNPJ:
                  </strong>

                  15.442.567/0001-95

                </div>


                <div class="company-line">

                  <strong>
                    FONE:
                  </strong>

                  (48) 3941-1100

                </div>


                <div class="company-line">

                  <strong>
                    E-mail:
                  </strong>

                  atendimento@synter.com.br

                </div>


                <div class="company-line">

                  <strong>
                    I.E.:
                  </strong>

                  256705895

                </div>


                <div class="company-line">

                  <strong>
                    WhatsApp:
                  </strong>

                  (48) 9932-0492

                </div>


              </div>


            </div>


            <div class="document-data">


              <div class="document-title">

                Orçamento:

                ${escaparHtml(
                  numero
                )}

              </div>


              <div class="document-row">

                <span>
                  Emissão:
                </span>

                <span>

                  ${escaparHtml(
                    formatarData(
                      orcamento.created_at
                    )
                  )}

                </span>

              </div>


              <div class="document-row">

                <span>
                  Validade:
                </span>

                <span>

                  ${escaparHtml(
                    validade
                      ? formatarDataEntrega(
                          validade
                        )
                      : "-"
                  )}

                </span>

              </div>


            </div>


          </header>



          <!-- FATURAMENTO -->

          <section class="section">


            <h2 class="section-title">

              Dados de Faturamento e Cobrança

            </h2>


            <div class="billing-grid">


              <div class="billing-column">


                <div class="data-line">

                  <span class="data-label">
                    Cliente
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      orcamento.cliente_nome ||
                      "-"
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    Contato
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteContato
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    Cidade
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteCidade
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    Endereço
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteEndereco
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    Bairro
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteBairro
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    E-mail
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      orcamento.cliente_email ||
                      "-"
                    )}

                  </span>

                </div>


              </div>


              <div class="billing-column">


                <div class="data-line">

                  <span class="data-label">
                    Fone
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      orcamento.cliente_telefone ||
                      "-"
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    CEP
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteCep
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    UF
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteUf
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    CPF/CNPJ
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      orcamento.cliente_documento ||
                      "-"
                    )}

                  </span>

                </div>


                <div class="data-line">

                  <span class="data-label">
                    Insc. Est.
                  </span>

                  <span class="data-value">

                    ${escaparHtml(
                      clienteInscricao
                    )}

                  </span>

                </div>


              </div>


            </div>


          </section>



          <!-- PRODUTOS -->

          <section class="section">


            <h2 class="section-title">
              Produtos
            </h2>


            <table class="products-table">


              <thead>

                <tr>

                  <th>
                    Imagem
                  </th>

                  <th>
                    Cod.
                  </th>

                  <th>
                    Descrição
                  </th>

                  <th class="number-cell">
                    Qtde.
                  </th>

                  <th class="number-cell">
                    Unit.
                  </th>

                  <th class="number-cell">
                    Total
                  </th>

                </tr>

              </thead>


              <tbody>

                ${linhasProdutos}

              </tbody>


            </table>


            <div class="products-summary">


              <div class="products-meta">


                <span>

                  <strong>
                    Itens:
                  </strong>

                  ${escaparHtml(
                    itens.length
                  )}

                </span>


                <span>

                  <strong>
                    Quantidade Total:
                  </strong>

                  ${escaparHtml(
                    formatarQuantidade(
                      quantidadeTotal
                    )
                  )}

                </span>


              </div>


              <div class="totals">


                <div class="total-line">

                  <span>
                    Total dos Produtos (R$)
                  </span>

                  <span>

                    ${escaparHtml(
                      formatarNumeroMoeda(
                        subtotalProdutos
                      )
                    )}

                  </span>

                </div>


                <div class="total-line">

                  <span>
                    Valor do Frete (R$)
                  </span>

                  <span>

                    ${escaparHtml(
                      formatarNumeroMoeda(
                        frete
                      )
                    )}

                  </span>

                </div>


                <div class="total-line grand">

                  <span>
                    Total do Pedido (R$)
                  </span>

                  <span>

                    ${escaparHtml(
                      formatarNumeroMoeda(
                        totalGeral
                      )
                    )}

                  </span>

                </div>


              </div>


            </div>


          </section>



          <!-- CONDIÇÕES -->

          <section class="section">


            <h2 class="section-title">

              Condições Comerciais

            </h2>


            <div class="commercial-lines">


              <div class="commercial-line">

                <strong>
                  Cond. Pagto:
                </strong>

                <span>

                  ${escaparHtml(
                    orcamento.condicao_pagamento ||
                    "-"
                  )}

                </span>

              </div>


              <div class="commercial-line">

                <strong>
                  Representante Comercial:
                </strong>

                <span>

                  ${escaparHtml(
                    representante
                  )}

                </span>

              </div>


              <div class="commercial-line">

                <strong>
                  Local de Entrega:
                </strong>

                <span>

                  ${escaparHtml(
                    orcamento.local_entrega ||
                    "-"
                  )}

                </span>

              </div>


              <div class="commercial-line">

                <strong>
                  Data de Entrega:
                </strong>

                <span>

                  ${escaparHtml(
                    formatarDataEntrega(
                      orcamento.data_entrega
                    )
                  )}

                </span>

              </div>


              <div class="commercial-observation">

                <strong>
                  Observações:
                </strong>

                <p>${escaparHtml(
                  orcamento.observacoes_venda ||
                  orcamento.observacoes ||
                  "-"
                )}</p>

              </div>


              ${
                orcamento.observacoes_venda &&
                orcamento.observacoes
                  ? `

                    <div class="commercial-observation">

                      <strong>
                        Observação Padrão:
                      </strong>

                      <p>${escaparHtml(
                        orcamento.observacoes
                      )}</p>

                    </div>

                  `
                  : ""
              }


            </div>


          </section>



          <!-- RODAPÉ -->

          <footer class="document-footer">


            <div>

              ESTE DOCUMENTO NÃO É UM PEDIDO DE VENDA E SIM UMA SIMULAÇÃO
              DE CONDIÇÕES COMERCIAIS VIGENTES NESTA DATA

            </div>


            <div class="print-date">

              DATA E HORA DA IMPRESSÃO DO ORÇAMENTO:

              ${escaparHtml(
                formatarDataHora(
                  new Date()
                )
              )}

            </div>


          </footer>


        </main>


      </body>


    </html>
  `;


  return {
    html,
    nomeArquivo
  };

}


// =========================================================
// CRIAR IFRAME TEMPORÁRIO
// =========================================================

function criarIframeDocumento(
  html
) {

  const iframe =
    document.createElement(
      "iframe"
    );


  iframe.setAttribute(
    "title",
    "Orçamento Synter"
  );


  iframe.setAttribute(
    "aria-hidden",
    "true"
  );


  iframe.style.position =
    "fixed";


  iframe.style.left =
    "-10000px";


  iframe.style.top =
    "0";


  iframe.style.width =
    "210mm";


  iframe.style.height =
    "297mm";


  iframe.style.border =
    "0";


  iframe.style.opacity =
    "0";


  iframe.style.pointerEvents =
    "none";


  iframe.style.zIndex =
    "-1";


  document.body.appendChild(
    iframe
  );


  const documento =
    iframe.contentWindow
      ?.document;


  if (
    !documento
  ) {

    iframe.remove();


    throw new Error(
      "Não foi possível preparar o orçamento."
    );

  }


  documento.open();


  documento.write(
    html
  );


  documento.close();


  return {
    iframe,
    documento
  };

}


// =========================================================
// AGUARDAR DOCUMENTO E IMAGENS
// =========================================================

function aguardarCarregamentoDocumento(
  documento,
  limiteMs = 4000
) {

  return new Promise(
    (
      resolve
    ) => {

      let finalizado =
        false;


      const concluir =
        () => {

          if (
            finalizado
          ) {

            return;

          }


          finalizado =
            true;


          resolve();

        };


      const verificar =
        async () => {

          try {

            if (
              documento.fonts
                ?.ready
            ) {

              await documento
                .fonts
                .ready;

            }

          }
          catch {

            // Mantém fonte padrão.

          }


          const imagens =
            Array.from(
              documento.images ||
              []
            );


          if (
            imagens.length ===
            0
          ) {

            concluir();

            return;

          }


          const pendentes =
            imagens.filter(
              (
                imagem
              ) =>
                !imagem.complete
            );


          if (
            pendentes.length ===
            0
          ) {

            concluir();

            return;

          }


          let restantes =
            pendentes.length;


          const finalizarImagem =
            () => {

              restantes -=
                1;


              if (
                restantes <=
                0
              ) {

                concluir();

              }

            };


          pendentes.forEach(
            (
              imagem
            ) => {

              imagem.addEventListener(
                "load",
                finalizarImagem,
                {
                  once: true
                }
              );


              imagem.addEventListener(
                "error",
                finalizarImagem,
                {
                  once: true
                }
              );

            }
          );

        };


      window.setTimeout(
        concluir,
        limiteMs
      );


      window.setTimeout(
        verificar,
        100
      );

    }
  );

}


// =========================================================
// CRIAR ARQUIVO PDF REAL
// =========================================================

export async function criarArquivoOrcamentoPdf({
  orcamento,
  itens
}) {

  const {
    html,
    nomeArquivo
  } =
    montarDocumentoOrcamento({
      orcamento,
      itens
    });


  const {
    iframe,
    documento
  } =
    criarIframeDocumento(
      html
    );


  try {

    await aguardarCarregamentoDocumento(
      documento,
      5000
    );


    const elemento =
      documento.querySelector(
        ".sheet"
      );


    if (
      !elemento
    ) {

      throw new Error(
        "Não foi possível localizar o conteúdo do orçamento."
      );

    }


    const opcoes = {

      margin:
        0,


      filename:
        `${nomeArquivo}.pdf`,


      image: {

        type:
          "jpeg",

        quality:
          0.98

      },


      html2canvas: {

        scale:
          2,

        useCORS:
          true,

        allowTaint:
          false,

        logging:
          false,

        backgroundColor:
          "#ffffff",

        scrollX:
          0,

        scrollY:
          0

      },


      jsPDF: {

        unit:
          "mm",

        format:
          "a4",

        orientation:
          "portrait"

      },


      pagebreak: {

        mode: [
          "css",
          "legacy"
        ],

        avoid: [
          "tr",
          ".products-summary",
          ".commercial-line",
          ".commercial-observation"
        ]

      }

    };


    const worker =
      html2pdf()
        .set(
          opcoes
        )
        .from(
          elemento
        )
        .toPdf();


    const pdf =
      await worker.get(
        "pdf"
      );


    const blob =
      pdf.output(
        "blob"
      );


    if (
      !(
        blob instanceof
        Blob
      )
    ) {

      throw new Error(
        "Não foi possível gerar o arquivo PDF."
      );

    }


    const arquivo =
      new File(
        [
          blob
        ],
        `${nomeArquivo}.pdf`,
        {
          type:
            "application/pdf",

          lastModified:
            Date.now()
        }
      );


    return arquivo;

  }
  finally {

    iframe.remove();

  }

}


// =========================================================
// IMPRESSÃO DO PDF
// =========================================================

export function gerarOrcamentoPdf({
  orcamento,
  itens
}) {

  const {
    html
  } =
    montarDocumentoOrcamento({
      orcamento,
      itens
    });


  const {
    iframe,
    documento
  } =
    criarIframeDocumento(
      html
    );


  let impressaoIniciada =
    false;


  const imprimir =
    () => {

      if (
        impressaoIniciada
      ) {

        return;

      }


      impressaoIniciada =
        true;


      try {

        const janelaImpressao =
          iframe.contentWindow;


        if (
          !janelaImpressao
        ) {

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
      catch (
        error
      ) {

        iframe.remove();


        console.error(
          "Erro ao abrir impressão:",
          error
        );

      }

    };


  aguardarCarregamentoDocumento(
    documento,
    2500
  )
    .then(
      () => {

        window.setTimeout(
          imprimir,
          200
        );

      }
    )
    .catch(
      () => {

        imprimir();

      }
    );

}