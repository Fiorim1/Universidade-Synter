import html2pdf from "html2pdf.js";
import logoSynterPreta from "../assets/logo-synter-pdf.png";

// Documento gerado a partir de uma visita finalizada.

const limpar = (valor) =>
  String(valor ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function formatarData(valor) {
  const s = String(valor || "");

  return /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
    : s || "-";
}

function linha(rotulo, valor) {
  return `
    <div class="linha">
      <span class="rotulo">${limpar(rotulo)}</span>
      <span>${limpar(valor)}</span>
    </div>
  `;
}

function assinatura(src, titulo, nome) {
  // Data URL de imagem com SOMENTE caracteres base64 até o fim:
  // impede que o valor feche o atributo src e injete HTML.
  if (
    !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(
      src || ""
    )
  ) {
    throw new Error(
      `A assinatura ${titulo.toLowerCase()} não está disponível.`
    );
  }

  return `
    <div class="assinatura">
      <img
        src="${limpar(src)}"
        alt="${limpar(titulo)}"
      />

      <div class="nome">
        ${limpar(nome)}
      </div>

      <strong>${limpar(titulo)}</strong>
    </div>
  `;
}

// ========================================
// GERAR E BAIXAR PDF
// ========================================

export async function baixarVisitaTecnicaPdf(visita) {
  if (!visita?.numero_atendimento || !visita?.id) {
    throw new Error(
      "Visita técnica inválida para gerar o PDF."
    );
  }

  const raiz = document.createElement("div");

  raiz.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 210mm;
    margin: 0;
    padding: 0;
    background: #ffffff;
    z-index: -100;
    pointer-events: none;
  `;

  raiz.innerHTML = `
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      .vt-impressao {
        width: 210mm;
        padding: 12mm 14mm 12mm;
        color: #151515;
        background: #ffffff;
        font: 11px/1.45 Arial, Helvetica, sans-serif;
        box-sizing: border-box;
      }

      .vt-impressao * {
        box-sizing: border-box;
      }

      .vt-impressao .topo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #222222;
        padding-bottom: 10px;
        margin-bottom: 12px;
        gap: 20px;
      }

      .vt-impressao .logo-box {
        display: flex;
        align-items: center;
      }

      .vt-impressao .logo-img {
        width: 135px;
        height: auto;
        display: block;
        object-fit: contain;
      }

      .vt-impressao .titulo {
        text-align: right;
      }

      .vt-impressao .titulo h1 {
        font-size: 18px;
        line-height: 1.2;
        margin: 0 0 3px;
      }

      .vt-impressao .titulo p {
        margin: 0;
        color: #555555;
        font-size: 10px;
      }

      .vt-impressao .numero {
        margin: 10px 0 14px;
        padding: 9px 12px;
        border: 1px solid #777777;
        font-size: 12px;
        font-weight: 800;
      }

      .vt-impressao h2 {
        font-size: 12px;
        margin: 14px 0 7px;
        padding: 6px 9px;
        background: #e8e8e8;
        text-transform: uppercase;
        break-after: avoid;
      }

      .vt-impressao .grade {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 14px;
      }

      .vt-impressao .linha {
        display: flex;
        gap: 5px;
        padding: 5px 0;
        border-bottom: 1px solid #dddddd;
        overflow-wrap: anywhere;
      }

      .vt-impressao .rotulo {
        font-weight: 700;
        min-width: max-content;
      }

      .vt-impressao .inteira {
        grid-column: 1 / -1;
      }

      .vt-impressao .relato {
        border: 1px solid #bbbbbb;
        padding: 12px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        min-height: 80px;
        font-size: 11px;
      }

      .vt-impressao .assinaturas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 10px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .vt-impressao .assinatura {
        min-width: 0;
        text-align: center;
        border: 1px solid #dddddd;
        padding: 10px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .vt-impressao .assinatura img {
        width: 100%;
        height: 82px;
        object-fit: contain;
        display: block;
      }

      .vt-impressao .assinatura .nome {
        border-top: 1px solid #555555;
        margin-top: 4px;
        padding-top: 5px;
        font-size: 11px;
      }

      .vt-impressao .assinatura strong {
        font-size: 10px;
      }

      .vt-impressao .rodape {
        margin-top: 18px;
        border-top: 1px solid #aaaaaa;
        padding-top: 7px;
        color: #555555;
        font-size: 9px;
        text-align: center;
      }

      .vt-impressao .grupo {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    </style>

    <main class="vt-impressao">

      <header class="topo">
        <div class="logo-box">
          <img
            src="${logoSynterPreta}"
            alt="Logo Synter"
            class="logo-img"
          />
        </div>

        <div class="titulo">
          <h1>Formulário de Visita Técnica</h1>
          <p>Produtos Digitais e Mecânicos</p>
        </div>
      </header>

      <div class="numero">
        Nº ATENDIMENTO:
        ${limpar(visita.numero_atendimento)}
      </div>

      <!-- EMPRESA -->
      <section class="grupo">
        <h2>1. Identificação da Empresa</h2>

        <div class="grade">
          ${linha(
            "Razão social:",
            "Synter Indústria e Comércio Ltda"
          )}

          ${linha(
            "CNPJ:",
            "82.996.216/0001-13"
          )}

          ${linha(
            "Telefone:",
            "(48) 3941-1192"
          )}

          ${linha(
            "E-mail:",
            "assistencia@synter.com.br"
          )}

          <div class="inteira">
            ${linha(
              "Endereço:",
              "Rodovia Gabriel Arns, 5572 - Forquilhinha/SC - CEP 88850-000"
            )}
          </div>
        </div>
      </section>

      <!-- CLIENTE -->
      <section class="grupo">
        <h2>2. Identificação do Cliente</h2>

        <div class="grade">
          ${linha(
            "Nome / Razão social:",
            visita.cliente_nome
          )}

          ${linha(
            "CPF / CNPJ:",
            visita.cliente_documento
          )}

          ${linha(
            "Telefone:",
            visita.cliente_telefone
          )}

          ${linha(
            "E-mail:",
            visita.cliente_email
          )}

          <div class="inteira">
            ${linha(
              "Endereço:",
              visita.cliente_endereco
            )}
          </div>
        </div>
      </section>

      <!-- VISITA -->
      <section class="grupo">
        <h2>3. Dados da Visita</h2>

        <div class="grade">
          ${linha(
            "Data:",
            formatarData(visita.data_visita)
          )}

          ${linha(
            "Técnico responsável:",
            visita.tecnico_nome
          )}

          ${linha(
            "Início:",
            visita.inicio
          )}

          ${linha(
            "Término:",
            visita.termino || "-"
          )}
        </div>
      </section>

      <!-- RELATÓRIO -->
      <section class="grupo">
        <h2>4. Relatório Técnico</h2>

        <div class="relato">
          ${limpar(visita.relato_tecnico)}
        </div>
      </section>

      <!-- ASSINATURAS -->
      <section class="grupo">
        <h2>5. Assinaturas</h2>

        <div class="assinaturas">
          ${assinatura(
            visita.assinatura_cliente,
            "Assinatura do cliente",
            visita.cliente_nome
          )}

          ${assinatura(
            visita.assinatura_tecnico,
            "Assinatura do técnico",
            visita.tecnico_nome
          )}
        </div>
      </section>

      <footer class="rodape">
        Documento gerado pela Universidade Synter a partir
        do atendimento registrado em sistema. Referência:
        ${limpar(visita.numero_atendimento)}.
      </footer>

    </main>
  `;

  document.body.appendChild(raiz);

  try {
    const imagens = Array.from(
      raiz.querySelectorAll("img")
    );

    await Promise.all(
      imagens.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, {
                once: true,
              });

              img.addEventListener("error", resolve, {
                once: true,
              });
            })
      )
    );

    const nomeSeguro = String(
      visita.numero_atendimento
    ).replace(/[^a-zA-Z0-9_-]/g, "");

    await html2pdf()
      .set({
        margin: 0,
        filename: `Visita-Tecnica-${nomeSeguro}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".grupo", ".assinaturas", ".assinatura"],
        },
      })
      .from(raiz.querySelector(".vt-impressao"))
      .save();
  } finally {
    raiz.remove();
  }
}