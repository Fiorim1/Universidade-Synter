
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ======================================================
// SYNTER — CORREÇÃO DE IMAGENS DO PDF
// ======================================================
// Atualiza o gerador de orçamentos para utilizar
// o mesmo sistema de imagens da Tabela de Preços.
//
// Preserva:
// - Layout do PDF
// - Logo e dados da Synter
// - Cálculos e condições comerciais
// - Impressão
// - Compartilhamento
//
// Cria backup antes de modificar o arquivo.
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raizProjeto = path.resolve(__dirname, "..");

const caminhoPdf = path.join(
  raizProjeto,
  "src",
  "utils",
  "gerarOrcamentoPdf.js"
);

const caminhoImagens = path.join(
  raizProjeto,
  "src",
  "utils",
  "imagensProdutosSynter.js"
);

const caminhoMapa = path.join(
  raizProjeto,
  "src",
  "data",
  "synterImagensMap.json"
);

const caminhoPastaImagens = path.join(
  raizProjeto,
  "public",
  "synter-produtos"
);

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function verificarArquivo(caminho, descricao) {
  if (!fs.existsSync(caminho)) {
    throw new Error(
      `${descricao} não encontrado:\n${caminho}`
    );
  }
}

function encontrarFimFuncao(codigo, inicio) {
  const abertura = codigo.indexOf("{", inicio);

  if (abertura === -1) {
    throw new Error(
      "Não foi possível localizar a abertura da função."
    );
  }

  let profundidade = 0;
  let aspas = null;
  let comentarioLinha = false;
  let comentarioBloco = false;

  for (let i = abertura; i < codigo.length; i++) {
    const atual = codigo[i];
    const proximo = codigo[i + 1];
    const anterior = codigo[i - 1];

    if (comentarioLinha) {
      if (atual === "\n") {
        comentarioLinha = false;
      }
      continue;
    }

    if (comentarioBloco) {
      if (atual === "*" && proximo === "/") {
        comentarioBloco = false;
        i++;
      }
      continue;
    }

    if (aspas) {
      if (atual === aspas && anterior !== "\\") {
        aspas = null;
      }
      continue;
    }

    if (atual === "/" && proximo === "/") {
      comentarioLinha = true;
      i++;
      continue;
    }

    if (atual === "/" && proximo === "*") {
      comentarioBloco = true;
      i++;
      continue;
    }

    if (
      atual === "'" ||
      atual === '"' ||
      atual === "`"
    ) {
      aspas = atual;
      continue;
    }

    if (atual === "{") {
      profundidade++;
    }

    if (atual === "}") {
      profundidade--;

      if (profundidade === 0) {
        return i + 1;
      }
    }
  }

  throw new Error(
    "Não foi possível identificar o fim da função."
  );
}

function substituirFuncao(
  codigo,
  nomeFuncao,
  novaFuncao
) {
  const assinatura = new RegExp(
    `function\\s+${nomeFuncao}\\s*\\(`
  );

  const correspondencia = assinatura.exec(codigo);

  if (!correspondencia) {
    throw new Error(
      `Função ${nomeFuncao} não encontrada.`
    );
  }

  const inicio = correspondencia.index;

  const fim = encontrarFimFuncao(
    codigo,
    inicio
  );

  return (
    codigo.slice(0, inicio) +
    novaFuncao.trim() +
    codigo.slice(fim)
  );
}

// ======================================================
// CORREÇÃO PRINCIPAL
// ======================================================

function executarCorrecao() {
  console.log("");
  console.log("========================================");
  console.log(" SYNTER — CORREÇÃO DE IMAGENS DO PDF");
  console.log("========================================");
  console.log("");

  verificarArquivo(
    caminhoPdf,
    "Gerador de PDF"
  );

  verificarArquivo(
    caminhoImagens,
    "Utilitário de imagens Synter"
  );

  verificarArquivo(
    caminhoMapa,
    "Mapeamento de imagens"
  );

  verificarArquivo(
    caminhoPastaImagens,
    "Pasta das imagens dos produtos"
  );

  let codigo = fs.readFileSync(
    caminhoPdf,
    "utf8"
  );

  // ====================================================
  // EVITAR APLICAÇÃO DUPLICADA
  // ====================================================

  if (
    codigo.includes(
      'import { encontrarImagemSynter } from "./imagensProdutosSynter";'
    )
  ) {
    console.log(
      "O gerador de PDF já possui a integração."
    );
    console.log(
      "Nenhuma alteração foi necessária."
    );
    return;
  }

  // ====================================================
  // VALIDAR ESTRUTURA ORIGINAL
  // ====================================================

  if (
    !codigo.includes(
      'import tabelaPrecosData from "../data/tabelaPrecosData";'
    )
  ) {
    throw new Error(
      "A estrutura do gerador de PDF é diferente da versão esperada."
    );
  }

  if (
    !codigo.includes(
      "function encontrarImagemProduto(item)"
    )
  ) {
    throw new Error(
      "A função de imagens original não foi encontrada."
    );
  }

  // ====================================================
  // BACKUP
  // ====================================================

  const dataBackup = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const caminhoBackup =
    `${caminhoPdf}.backup-${dataBackup}`;

  fs.copyFileSync(
    caminhoPdf,
    caminhoBackup
  );

  console.log(
    "Backup criado:"
  );

  console.log(
    caminhoBackup
  );

  console.log("");

  // ====================================================
  // NOVO IMPORT
  // ====================================================

  codigo = codigo.replace(
    'import tabelaPrecosData from "../data/tabelaPrecosData";',
    'import { encontrarImagemSynter } from "./imagensProdutosSynter";'
  );

  // ====================================================
  // REMOVER BUSCA ANTIGA DE IMAGENS
  // ====================================================

  codigo = codigo.replace(
    /\/\/ Imagens dos produtos\.\s*const imagensProdutos = import\.meta\.glob\([\s\S]*?\);\s*/,
    ""
  );

  // ====================================================
  // REMOVER BUSCA ANTIGA NA TABELA
  // ====================================================

  codigo = substituirFuncao(
    codigo,
    "encontrarLinhaTabela",
    `
    function encontrarLinhaTabela(item) {
      return null;
    }
    `
  );

  // ====================================================
  // SUBSTITUIR LOCALIZADOR DE IMAGENS
  // ====================================================

  const novaFuncaoImagem = `
    function encontrarImagemProduto(item) {
      if (!item) {
        return "";
      }

      const imagemDireta =
        item.imagem_url ||
        item.image_url ||
        item.imagem ||
        item.foto_url;

      if (imagemDireta) {
        return prepararUrl(imagemDireta);
      }

      const imagemSynter =
        encontrarImagemSynter(item);

      return prepararUrl(imagemSynter);
    }
  `;

  codigo = substituirFuncao(
    codigo,
    "encontrarImagemProduto",
    novaFuncaoImagem
  );

  // ====================================================
  // VALIDAR RESULTADO
  // ====================================================

  if (
    !codigo.includes(
      'import { encontrarImagemSynter } from "./imagensProdutosSynter";'
    )
  ) {
    throw new Error(
      "Não foi possível adicionar o import de imagens."
    );
  }

  if (
    !codigo.includes(
      "encontrarImagemSynter(item)"
    )
  ) {
    throw new Error(
      "A nova função de imagens não foi aplicada."
    );
  }

  // ====================================================
  // SALVAR
  // ====================================================

  fs.writeFileSync(
    caminhoPdf,
    codigo,
    "utf8"
  );

  console.log(
    "Gerador de PDF atualizado com sucesso!"
  );

  console.log("");
  console.log(
    "Arquivo modificado:"
  );
  console.log(
    caminhoPdf
  );

  console.log("");
  console.log(
    "As imagens agora utilizam:"
  );
  console.log(
    "src/data/synterImagensMap.json"
  );

  console.log("");
  console.log(
    "Próximo passo: npm run build"
  );
  console.log("");
}

// ======================================================
// EXECUÇÃO
// ======================================================

try {
  executarCorrecao();
} catch (erro) {
  console.error("");
  console.error(
    "ERRO NA CORREÇÃO:"
  );
  console.error(
    erro.message
  );
  console.error("");

  process.exitCode = 1;
}
