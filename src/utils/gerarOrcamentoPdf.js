
import html2pdf from "html2pdf.js";
import tabelaPrecosData from "../data/tabelaPrecosData";

// =====================================================
// GERADOR DE ORÇAMENTO SYNTER
// Impressão + PDF para compartilhamento
// =====================================================

// Busca a logo oficial dentro de src/assets.
// Aceita PNG, JPG, JPEG, WEBP ou SVG.

const arquivosLogoSynter = import.meta.glob(
  "../assets/logo-synter-pdf.{png,jpg,jpeg,webp,svg}",
  {
    eager: true,
    import: "default",
    query: "?url",
  }
);

const logoSynterPdf =
  Object.values(arquivosLogoSynter)[0] || "";

// =====================================================
// DADOS DA EMPRESA
// =====================================================

const EMPRESA = {
  razaoSocial: "SYNTER INDUSTRIA E COMERCIO LTDA",
  nomeFantasia: "SYNTER",
  cnpj: "82.996.216/0001-13",
  endereco: "Rod. Gabriel Arns, 5572",
  bairro: "Saturno",
  cidade: "Forquilhinha",
  uf: "SC",
  cep: "88850-000",
  telefone: "(48) 3941-1192",
  email: "contato@synter.com.br",
  logo: logoSynterPdf,
};

// =====================================================
// IMAGENS DOS PRODUTOS
// =====================================================

const imagensProdutosPdf = import.meta.glob(
  "../assets/produtos/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  }
);

// =====================================================
// SEGURANÇA E FORMATAÇÃO
// =====================================================

function escaparHtml(valor = "") {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizar(valor = "") {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/g, "");
}

function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function quantidade(valor) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(Number(valor || 0));
}

function dataBR(valor) {
  if (!valor) return "-";

  const texto = String(valor);

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleDateString("pt-BR");
}

function dataHoraBR(valor) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR");
}

function nomeSeguro(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

function primeiroValor(objeto, chaves, padrao = "-") {
  for (const chave of chaves) {
    const valor = objeto?.[chave];

    if (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {
      return valor;
    }
  }

  return padrao;
}

function valorNumerico(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function numeroOrcamento(orcamento) {
  const numero = primeiroValor(
    orcamento,
    ["numero", "numero_orcamento", "orcamento_numero"],
    ""
  );

  if (numero) return String(numero);

  return (
    String(orcamento?.id || "")
      .split("-")[0]
      .toUpperCase() || "-"
  );
}

function prepararUrl(valor) {
  const url = String(valor || "").trim();

  if (!url) return "";

  if (/^data:image\//i.test(url)) return url;

  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return "";
  }
}

// =====================================================
// IDENTIFICAÇÃO DE PRODUTOS
// =====================================================

function encontrarLinhaTabela(item) {
  if (!item) return null;

  const categorias = Array.isArray(
    tabelaPrecosData?.categorias
  )
    ? tabelaPrecosData.categorias
    : [];

  const codigo = normalizar(item.codigo_produto);
  const nome = normalizar(item.nome_produto);
  const variacao = normalizar(item.variacao_produto);

  let melhor = null;
  let pontuacaoMelhor = -1;

  for (const categoria of categorias) {
    const linhas = Array.isArray(categoria?.linhas)
      ? categoria.linhas
      : [];

    for (const linha of linhas) {
      if (!Array.isArray(linha)) continue;

      const valores = linha
        .map(normalizar)
        .filter(Boolean);

      if (codigo.length >= 4) {
        const corresponde = valores.some(
          (valor) =>
            valor === codigo ||
            (valor.length >= 4 &&
              (valor.includes(codigo) ||
                codigo.includes(valor)))
        );

        if (corresponde) {
          return { categoria, linha };
        }
      }

      let pontos = 0;

      if (
        nome.length >= 4 &&
        valores.some(
          (valor) =>
            valor.length >= 4 &&
            (valor.includes(nome) || nome.includes(valor))
        )
      ) {
        pontos += 4;
      }

      if (
        variacao.length >= 3 &&
        valores.some(
          (valor) =>
            valor.length >= 3 &&
            (valor.includes(variacao) ||
              variacao.includes(valor))
        )
      ) {
        pontos += 2;
      }

      if (pontos >= 4 && pontos > pontuacaoMelhor) {
        pontuacaoMelhor = pontos;
        melhor = { categoria, linha };
      }
    }
  }

  return melhor;
}

// =====================================================
// IMAGENS DOS PRODUTOS
// =====================================================

function encontrarImagemProduto(item) {
  if (!item) return "";

  const direta =
    item.imagem_url ||
    item.image_url ||
    item.imagem ||
    item.foto_url;

  if (direta) return prepararUrl(direta);

  const correspondencia = encontrarLinhaTabela(item);

  const codigo = normalizar(item.codigo_produto);

  const valoresBase = [
    item.codigo_produto,
    item.nome_produto,
    item.variacao_produto,
    item.tipo_preco,
    ...(correspondencia?.linha || []),
  ];

  const valores = [
    ...new Set(
      valoresBase
        .map(normalizar)
        .filter((valor) => valor.length >= 3)
    ),
  ];

  let melhorImagem = "";
  let melhorPontuacao = 0;

  for (const [caminho, imagem] of Object.entries(
    imagensProdutosPdf
  )) {
    const arquivo = caminho.split("/").pop() || "";
    const chave = normalizar(arquivo);

    if (!chave) continue;

    if (
      codigo.length >= 4 &&
      (chave === codigo ||
        chave.includes(codigo) ||
        codigo.includes(chave))
    ) {
      return prepararUrl(imagem);
    }

    let pontos = 0;

    for (const valor of valores) {
      if (chave === valor) {
        pontos = Math.max(pontos, 1000 + valor.length);
      } else if (chave.includes(valor)) {
        pontos = Math.max(pontos, 100 + valor.length);
      } else if (valor.includes(chave)) {
        pontos = Math.max(pontos, 50 + chave.length);
      }
    }

    if (pontos > melhorPontuacao) {
      melhorPontuacao = pontos;
      melhorImagem = imagem;
    }
  }

  return prepararUrl(melhorImagem);
}

// =====================================================
// COMPONENTES HTML
// =====================================================

function campo(titulo, valor) {
  return `
    <div class="data-line">
      <strong>${escaparHtml(titulo)}</strong>
      <span>${escaparHtml(valor ?? "-")}</span>
    </div>
  `;
}

function campoComercial(titulo, valor) {
  return `
    <div class="commercial-line">
      <strong>${escaparHtml(titulo)}</strong>
      <span>${escaparHtml(valor ?? "-")}</span>
    </div>
  `;
}

function linhaTotal(titulo, valor, destaque = false) {
  return `
    <div class="total-line ${destaque ? "grand" : ""}">
      <span>${escaparHtml(titulo)}</span>
      <span>${moeda(valor)}</span>
    </div>
  `;
}

// =====================================================
// ESTILOS DO DOCUMENTO
// =====================================================

const ESTILOS = `
  * {
    box-sizing: border-box;
  }

  .sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 12mm 13mm;
    background: #ffffff;
    color: #111111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    line-height: 1.35;
    box-sizing: border-box;
  }

  .sheet * {
    box-sizing: border-box;
  }

  .company-header {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr) 135px;
    gap: 14px;
    align-items: start;
    padding-bottom: 12px;
    border-bottom: 2px solid #222222;
  }

  .brand-box {
    min-height: 55px;
    display: flex;
    align-items: flex-start;
  }

  .brand-logo {
    display: block;
    width: 115px;
    max-height: 65px;
    object-fit: contain;
    object-position: left center;
  }

  .brand-fallback {
    display: none;
  }

  .brand-box.no-logo .brand-logo {
    display: none;
  }

  .brand-box.no-logo .brand-fallback {
    display: block;
  }

  .brand {
    font-size: 21px;
    font-weight: 900;
    letter-spacing: 1.5px;
    color: #111111;
  }

  .brand-subtitle {
    margin-top: 3px;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: #555555;
  }

  .company-data,
  .document-data {
    min-width: 0;
  }

  .company-name {
    margin: 0 0 5px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1.25;
  }

  .company-line {
    margin: 2px 0;
    color: #252525;
    font-size: 7.5px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .company-line strong {
    font-weight: 800;
  }

  .company-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 10px;
    margin-top: 5px;
  }

  .company-contact-grid .full {
    grid-column: 1 / -1;
  }

  .document-title {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .document-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 6px;
    margin: 4px 0;
    font-size: 7.5px;
  }

  .document-row span:first-child {
    font-weight: 800;
  }

  .document-row span:last-child {
    text-align: right;
    font-weight: 600;
  }

  .section {
    margin-top: 13px;
  }

  .section-title {
    margin: 0 0 7px;
    padding-bottom: 4px;
    border-bottom: 1px solid #555555;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .billing-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4px 22px;
  }

  .billing-column {
    min-width: 0;
  }

  .data-line {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 8px;
    min-height: 14px;
    align-items: start;
    font-size: 7.5px;
    line-height: 1.4;
  }

  .data-line strong {
    font-weight: 800;
  }

  .data-line span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .products-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .products-table thead {
    border-bottom: 1px solid #555555;
  }

  .products-table th {
    padding: 5px 4px;
    font-size: 7px;
    font-weight: 800;
    text-align: left;
  }

  .products-table td {
    padding: 7px 4px;
    border-bottom: 1px solid #d2d2d2;
    color: #202020;
    font-size: 7.3px;
    line-height: 1.4;
    vertical-align: middle;
  }

  .products-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
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
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    background: #ffffff;
  }

  .product-image {
    display: block;
    width: 48px;
    height: 48px;
    object-fit: contain;
    object-position: center;
  }

  .product-image-placeholder {
    border: 1px solid #dddddd;
    color: #999999;
    font-size: 6px;
    text-align: center;
  }

  .product-code {
    color: #363636;
    font-family: "Courier New", monospace;
    font-size: 6.8px;
    overflow-wrap: anywhere;
  }

  .product-description strong {
    font-size: 7.5px;
    font-weight: 800;
  }

  .product-detail {
    margin-top: 3px;
    color: #696969;
    font-size: 6.5px;
  }

  .number-cell {
    text-align: right !important;
    white-space: nowrap;
  }

  .product-total {
    font-weight: 800;
  }

  .products-summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 245px;
    gap: 16px;
    margin-top: 10px;
    break-inside: avoid;
  }

  .products-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 18px;
    padding-top: 5px;
    font-size: 7px;
  }

  .products-meta strong {
    font-weight: 800;
  }

  .totals {
    width: 100%;
  }

  .total-line {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 75px;
    gap: 10px;
    padding: 4px 0;
    font-size: 7.5px;
  }

  .total-line span:first-child {
    text-align: right;
  }

  .total-line span:last-child {
    text-align: right;
    font-weight: 700;
  }

  .total-line.grand {
    margin-top: 4px;
    padding-top: 7px;
    border-top: 1.5px solid #333333;
    font-size: 8px;
    font-weight: 900;
  }

  .commercial-lines {
    width: 100%;
  }

  .commercial-line {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 8px;
    min-height: 16px;
    padding: 2px 0;
    font-size: 7.5px;
    line-height: 1.4;
    break-inside: avoid;
  }

  .commercial-line strong {
    font-weight: 800;
  }

  .commercial-observation {
    margin-top: 7px;
    padding-top: 7px;
    border-top: 1px solid #d2d2d2;
    break-inside: avoid;
  }

  .commercial-observation strong {
    font-size: 9px;
    font-weight: 800;
  }

  .commercial-observation p {
    margin: 4px 0 0;
    color: #272727;
    font-size: 7.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .document-footer {
    margin-top: 18px;
    padding-top: 10px;
    border-top: 1px solid #bbbbbb;
    text-align: center;
    color: #363636;
    font-size: 6.8px;
    font-weight: 700;
    line-height: 1.6;
    text-transform: uppercase;
  }

  .document-footer .print-date {
    margin-top: 3px;
  }

  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      box-shadow: none;
    }
  }
`;

// =====================================================
// MONTAR DOCUMENTO HTML
// =====================================================

function montarDocumentoOrcamento({ orcamento, itens }) {
  if (!orcamento) {
    throw new Error("Orçamento não informado.");
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error(
      "O orçamento precisa ter pelo menos um produto."
    );
  }

  const numero = numeroOrcamento(orcamento);

  const primeiroNome = String(
    orcamento.cliente_nome || "Cliente"
  )
    .trim()
    .split(/\s+/)[0];

  const nomeArquivo = `Orcamento-${nomeSeguro(
    primeiroNome
  )}-${nomeSeguro(numero)}`;

  const subtotalProdutos = itens.reduce((total, item) => {
    const subtotal =
      item.subtotal !== null &&
      item.subtotal !== undefined
        ? valorNumerico(item.subtotal)
        : valorNumerico(item.preco_unitario) *
          valorNumerico(item.quantidade);

    return total + subtotal;
  }, 0);

  const frete = valorNumerico(orcamento.frete);
  const totalGeral = subtotalProdutos + frete;

  const quantidadeTotal = itens.reduce(
    (total, item) =>
      total + valorNumerico(item.quantidade),
    0
  );

  const representante = primeiroValor(orcamento, [
    "representante_nome",
    "nome_representante",
    "created_by_name",
  ]);

  const validade = primeiroValor(
    orcamento,
    ["validade", "data_validade", "validade_orcamento"],
    ""
  );

  const clienteContato = primeiroValor(orcamento, [
    "cliente_contato",
    "contato",
  ]);

  const clienteCidade = primeiroValor(orcamento, [
    "cliente_cidade",
    "cidade",
  ]);

  const clienteEndereco = primeiroValor(orcamento, [
    "cliente_endereco",
    "endereco",
  ]);

  const clienteBairro = primeiroValor(orcamento, [
    "cliente_bairro",
    "bairro",
  ]);

  const clienteCep = primeiroValor(orcamento, [
    "cliente_cep",
    "cep",
  ]);

  const clienteUf = primeiroValor(orcamento, [
    "cliente_uf",
    "uf",
  ]);

  const clienteInscricao = primeiroValor(orcamento, [
    "cliente_inscricao_estadual",
    "inscricao_estadual",
    "cliente_ie",
    "ie",
  ]);

  // ===================================================
  // PRODUTOS
  // ===================================================

  const linhasProdutos = itens
    .map((item) => {
      const imagem = encontrarImagemProduto(item);

      const complemento = [
        item.variacao_produto,
        item.tipo_preco,
      ]
        .filter(Boolean)
        .map(escaparHtml)
        .join(" • ");

      const totalItem =
        item.subtotal !== null &&
        item.subtotal !== undefined
          ? valorNumerico(item.subtotal)
          : valorNumerico(item.preco_unitario) *
            valorNumerico(item.quantidade);

      return `
        <tr>
          <td class="product-image-cell">
            ${
              imagem
                ? `
                  <div class="product-image-wrapper">
                    <img
                      class="product-image"
                      src="${escaparHtml(imagem)}"
                      alt="${escaparHtml(
                        item.nome_produto || "Produto"
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
            ${escaparHtml(item.codigo_produto || "-")}
          </td>

          <td class="product-description">
            <strong>
              ${escaparHtml(item.nome_produto || "-")}
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
            ${quantidade(item.quantidade)}
          </td>

          <td class="number-cell">
            ${moeda(item.preco_unitario)}
          </td>

          <td class="number-cell product-total">
            ${moeda(totalItem)}
          </td>
        </tr>
      `;
    })
    .join("");

  // ===================================================
  // DOCUMENTO COMPLETO
  // ===================================================

  const conteudo = `
    <main class="sheet">

      <!-- CABEÇALHO SYNTER -->

      <header class="company-header">

        <div class="brand-box">
          ${
            EMPRESA.logo
              ? `
                <img
                  class="brand-logo"
                  src="${escaparHtml(EMPRESA.logo)}"
                  alt="Logo oficial Synter"
                  onerror="this.parentElement.classList.add('no-logo')"
                />
              `
              : ""
          }

          <div
            class="brand-fallback ${
              EMPRESA.logo ? "" : "logo-indisponivel"
            }"
            style="${
              EMPRESA.logo ? "" : "display:block;"
            }"
          >
            <div class="brand">SYNTER</div>
            <div class="brand-subtitle">
              SOLUÇÕES EM ACESSO
            </div>
          </div>
        </div>

        <!-- DADOS DA EMPRESA -->

        <div class="company-data">

          <h1 class="company-name">
            ${escaparHtml(EMPRESA.razaoSocial)}
          </h1>

          <div class="company-line">
            ${escaparHtml(EMPRESA.endereco)} -
            ${escaparHtml(EMPRESA.bairro)} -
            ${escaparHtml(EMPRESA.cidade)}
            (${escaparHtml(EMPRESA.uf)})
          </div>

          <div class="company-line">
            <strong>CEP:</strong>
            ${escaparHtml(EMPRESA.cep)}
          </div>

          <div class="company-contact-grid">

            <div class="company-line">
              <strong>CNPJ:</strong>
              ${escaparHtml(EMPRESA.cnpj)}
            </div>

            <div class="company-line">
              <strong>FONE:</strong>
              ${escaparHtml(EMPRESA.telefone)}
            </div>

            <div class="company-line full">
              <strong>E-mail:</strong>
              ${escaparHtml(EMPRESA.email)}
            </div>

          </div>

        </div>

        <!-- IDENTIFICAÇÃO DO ORÇAMENTO -->

        <div class="document-data">

          <div class="document-title">
            Orçamento: ${escaparHtml(numero)}
          </div>

          <div class="document-row">
            <span>Emissão:</span>
            <span>${dataBR(orcamento.created_at)}</span>
          </div>

          <div class="document-row">
            <span>Validade:</span>
            <span>${validade ? dataBR(validade) : "-"}</span>
          </div>

        </div>

      </header>

      <!-- DADOS DE FATURAMENTO -->

      <section class="section">

        <h2 class="section-title">
          Dados de Faturamento e Cobrança
        </h2>

        <div class="billing-grid">

          <div class="billing-column">

            ${campo(
              "Cliente",
              orcamento.cliente_nome || "-"
            )}

            ${campo("Contato", clienteContato)}

            ${campo("Cidade", clienteCidade)}

            ${campo("Endereço", clienteEndereco)}

            ${campo("Bairro", clienteBairro)}

            ${campo(
              "E-mail",
              orcamento.cliente_email || "-"
            )}

          </div>

          <div class="billing-column">

            ${campo(
              "Fone",
              orcamento.cliente_telefone || "-"
            )}

            ${campo("CEP", clienteCep)}

            ${campo("UF", clienteUf)}

            ${campo(
              "CPF/CNPJ",
              orcamento.cliente_documento || "-"
            )}

            ${campo("Insc. Est.", clienteInscricao)}

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
              <th>Imagem</th>
              <th>Cod.</th>
              <th>Descrição</th>
              <th class="number-cell">Qtde.</th>
              <th class="number-cell">Unit.</th>
              <th class="number-cell">Total</th>
            </tr>
          </thead>

          <tbody>
            ${linhasProdutos}
          </tbody>

        </table>

        <!-- TOTAIS -->

        <div class="products-summary">

          <div class="products-meta">
            <span>
              <strong>Itens:</strong>
              ${itens.length}
            </span>

            <span>
              <strong>Quantidade Total:</strong>
              ${quantidade(quantidadeTotal)}
            </span>
          </div>

          <div class="totals">

            ${linhaTotal(
              "Total dos Produtos (R$)",
              subtotalProdutos
            )}

            ${linhaTotal(
              "Valor do Frete (R$)",
              frete
            )}

            ${linhaTotal(
              "Total do Pedido (R$)",
              totalGeral,
              true
            )}

          </div>

        </div>

      </section>

      <!-- CONDIÇÕES COMERCIAIS -->

      <section class="section">

        <h2 class="section-title">
          Condições Comerciais
        </h2>

        <div class="commercial-lines">

          ${campoComercial(
            "Cond. Pagto:",
            orcamento.condicao_pagamento || "-"
          )}

          ${campoComercial(
            "Representante Comercial:",
            representante
          )}

          ${campoComercial(
            "Local de Entrega:",
            orcamento.local_entrega || "-"
          )}

          ${campoComercial(
            "Data de Entrega:",
            dataBR(orcamento.data_entrega)
          )}

          <!-- OBSERVAÇÕES -->

          <div class="commercial-observation">

            <strong>Observações:</strong>

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
                  <strong>Observação Padrão:</strong>
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
          ESTE DOCUMENTO NÃO É UM PEDIDO DE VENDA
          E SIM UMA SIMULAÇÃO DE CONDIÇÕES COMERCIAIS
          VIGENTES NESTA DATA
        </div>

        <div class="print-date">
          DATA E HORA DA IMPRESSÃO DO ORÇAMENTO:
          ${dataHoraBR(new Date())}
        </div>

      </footer>

    </main>
  `;

  return {
    conteudo,
    nomeArquivo,
  };
}

// =====================================================
// AGUARDAR RENDERIZAÇÃO
// =====================================================

async function aguardarImagens(container, limiteMs = 8000) {
  const imagens = Array.from(
    container.querySelectorAll("img")
  );

  const tarefas = imagens.map(
    (imagem) =>
      new Promise((resolve) => {
        if (imagem.complete) {
          resolve();
          return;
        }

        imagem.addEventListener("load", resolve, {
          once: true,
        });

        imagem.addEventListener("error", resolve, {
          once: true,
        });
      })
  );

  await Promise.race([
    Promise.all(tarefas),
    new Promise((resolve) =>
      window.setTimeout(resolve, limiteMs)
    ),
  ]);

  try {
    await document.fonts?.ready;
  } catch {
    // Utiliza as fontes disponíveis.
  }

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

// =====================================================
// CONVERTER IMAGEM PARA DATA URL
// =====================================================

async function imagemParaDataUrl(src) {
  if (!src) return "";

  if (/^data:image\//i.test(src)) {
    return src;
  }

  try {
    const resposta = await fetch(src, {
      mode: "cors",
      credentials: "same-origin",
    });

    if (!resposta.ok) {
      throw new Error("Falha ao carregar imagem.");
    }

    const blob = await resposta.blob();

    return await new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = reject;
      leitor.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

// =====================================================
// INCORPORAR IMAGENS
// =====================================================

async function incorporarImagens(container) {
  const imagens = Array.from(
    container.querySelectorAll("img")
  );

  await Promise.all(
    imagens.map(async (imagem) => {
      const src = imagem.getAttribute("src");

      if (!src) return;

      const url = prepararUrl(src);
      const dataUrl = await imagemParaDataUrl(url);

      if (dataUrl) {
        imagem.src = dataUrl;
      }
    })
  );
}

// =====================================================
// CRIAR CONTAINER TEMPORÁRIO PARA PDF
// =====================================================

function criarContainerPdf(conteudo) {
  const container = document.createElement("div");

  container.id = "synter-pdf-stage";

  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "210mm",
    margin: "0",
    padding: "0",
    background: "#ffffff",
    opacity: "1",
    visibility: "visible",
    zIndex: "2147483647",
    pointerEvents: "none",
    overflow: "visible",
  });

  const estilos = document.createElement("style");
  estilos.textContent = ESTILOS;

  container.appendChild(estilos);

  const area = document.createElement("div");
  area.innerHTML = conteudo;

  container.appendChild(area);

  document.body.appendChild(container);

  const folha = container.querySelector(".sheet");

  if (!folha) {
    container.remove();

    throw new Error(
      "Não foi possível montar a folha do orçamento."
    );
  }

  return {
    container,
    folha,
  };
}

// =====================================================
// GERAR PDF PARA COMPARTILHAMENTO
// =====================================================

export async function criarArquivoOrcamentoPdf({
  orcamento,
  itens,
}) {
  const { conteudo, nomeArquivo } =
    montarDocumentoOrcamento({
      orcamento,
      itens,
    });

  const { container, folha } =
    criarContainerPdf(conteudo);

  try {
    // Incorporar logo e imagens dos produtos.
    await incorporarImagens(folha);

    // Aguardar carregamento e renderização.
    await aguardarImagens(folha);

    // Evitar altura mínima desnecessária.
    folha.style.minHeight = "0";

    const largura = Math.ceil(
      folha.getBoundingClientRect().width
    );

    if (largura <= 0) {
      throw new Error(
        "O conteúdo do orçamento não possui largura válida."
      );
    }

    const opcoes = {
      margin: 0,

      filename: `${nomeArquivo}.pdf`,

      image: {
        type: "jpeg",
        quality: 0.98,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.max(
          document.documentElement.clientWidth,
          largura
        ),
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },

      pagebreak: {
        mode: ["css", "legacy"],
        avoid: [
          "tr",
          ".products-summary",
          ".commercial-line",
          ".commercial-observation",
        ],
      },
    };

    const worker = html2pdf()
      .set(opcoes)
      .from(folha)
      .toPdf();

    const pdf = await worker.get("pdf");

    const quantidadePaginas =
      pdf.internal.getNumberOfPages();

    if (!quantidadePaginas || quantidadePaginas < 1) {
      throw new Error(
        "O documento PDF não possui páginas válidas."
      );
    }

    const blob = pdf.output("blob");

    if (
      !(blob instanceof Blob) ||
      blob.size < 1000
    ) {
      throw new Error(
        "O arquivo PDF gerado está vazio ou inválido."
      );
    }

    return new File(
      [blob],
      `${nomeArquivo}.pdf`,
      {
        type: "application/pdf",
        lastModified: Date.now(),
      }
    );
  } catch (error) {
    console.error(
      "[Synter] Erro ao gerar arquivo PDF:",
      error
    );

    throw error;
  } finally {
    container.remove();
  }
}

// =====================================================
// IMPRESSÃO DO ORÇAMENTO
// =====================================================

export function gerarOrcamentoPdf({
  orcamento,
  itens,
}) {
  const { conteudo } = montarDocumentoOrcamento({
    orcamento,
    itens,
  });

  const iframe = document.createElement("iframe");

  iframe.setAttribute(
    "title",
    "Impressão do Orçamento Synter"
  );

  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    width: "210mm",
    height: "297mm",
    border: "0",
  });

  document.body.appendChild(iframe);

  const documento = iframe.contentWindow?.document;

  if (!documento) {
    iframe.remove();

    throw new Error(
      "Não foi possível preparar a impressão."
    );
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />

        <title>Orçamento Synter</title>

        <style>
          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          ${ESTILOS}
        </style>
      </head>

      <body>
        ${conteudo}
      </body>
    </html>
  `;

  documento.open();
  documento.write(html);
  documento.close();

  let iniciouImpressao = false;

  const imprimir = async () => {
    if (iniciouImpressao) return;

    iniciouImpressao = true;

    try {
      await aguardarImagens(documento.body, 5000);

      const janela = iframe.contentWindow;

      if (!janela) {
        throw new Error(
          "Janela de impressão indisponível."
        );
      }

      janela.focus();
      janela.print();

      window.setTimeout(() => {
        iframe.remove();
      }, 1500);
    } catch (error) {
      iframe.remove();

      console.error(
        "[Synter] Erro na impressão:",
        error
      );
    }
  };

  imprimir();
}
