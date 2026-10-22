import tabelaPrecosData from "../data/tabelaPrecosData";
import synterImagensMap from "../data/synterImagensMap.json";

// Fonte única para todas as fotos dos produtos Synter.
const BASE_IMAGENS = `${import.meta.env.BASE_URL || "/"}synter-produtos/`;

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function tokens(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function pontuarDescricao(a, b) {
  const aa = normalizar(a);
  const bb = normalizar(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 100;
  if (aa.length >= 5 && bb.length >= 5 &&
      (aa.includes(bb) || bb.includes(aa))) return 45;
  const tsA = new Set(tokens(a));
  const tsB = new Set(tokens(b));
  const comuns = [...tsA].filter((t) => tsB.has(t));
  return Math.min(30, comuns.length * 6);
}

// Procura SOMENTE linhas que possuem foto associada no JSON.
// Código tem prioridade, enquanto modelo, função, acabamento e linha
// resolvem casos de referências repetidas.
export function localizarProdutoSynter(produto) {
  if (!produto) return null;
  const codigo = normalizar(produto.codigo ?? produto.codigo_produto ?? produto.referencia);
  const nome = produto.nome ?? produto.nome_produto ?? "";
  const categoriaProduto = normalizar(produto.categoria ?? "");
  const linhaProduto = normalizar(produto.linha ?? "");
  const complementos = [produto.variacao, produto.variacao_produto,
    produto.descricao, produto.tipo_preco].filter(Boolean).join(" ");
  let melhor = null;
  let melhorPontuacao = -Infinity;

  for (const categoria of tabelaPrecosData.categorias || []) {
    for (const [indice, linha] of (categoria.linhas || []).entries()) {
      const arquivo = synterImagensMap[`${categoria.id}:${indice}`];
      if (!arquivo || !Array.isArray(linha)) continue;
      const colunas = categoria.colunas || [];
      const referencias = linha.filter((_, i) => /refer[eê]ncia|c[oó]digo/i.test(colunas[i] || ""));
      const referenciasNormalizadas = referencias.map(normalizar);
      const codigoExato = codigo.length >= 4 && referenciasNormalizadas.includes(codigo);
      const valores = linha.map(normalizar);
      const outroCodigoExato = codigo.length >= 4 && valores.includes(codigo);
      // Não mostrar fotos por mera coincidência de nomes genéricos.
      if (!codigoExato && !outroCodigoExato) continue;
      let pontos = codigoExato ? 1000 : 800;
      const tituloCategoria = normalizar(categoria.titulo);
      if (categoriaProduto && (categoriaProduto === tituloCategoria ||
          tituloCategoria.includes(categoriaProduto) || categoriaProduto.includes(tituloCategoria))) pontos += 50;
      const descricaoLinha = linha.filter((_, i) => !/pre[cç]o/i.test(colunas[i] || "")).join(" ");
      pontos += pontuarDescricao(nome, descricaoLinha);
      pontos += pontuarDescricao(complementos, descricaoLinha) * 0.5;
      if (linhaProduto && normalizar(linha[0]) === linhaProduto) pontos += 20;
      // Modelo é particularmente importante para versões digitais
      // que usam a mesma referência (WIFI / BLUE).
      const posModelo = colunas.findIndex((c) => /modelo|ma[cç]aneta/i.test(c));
      if (posModelo >= 0) pontos += pontuarDescricao(nome, linha[posModelo]) * 2;
      if (pontos > melhorPontuacao) {
        melhorPontuacao = pontos;
        melhor = {categoria, linha, indice, arquivo,
          imagem: `${BASE_IMAGENS}${encodeURIComponent(arquivo)}`};
      }
    }
  }
  return melhor;
}

export function encontrarImagemSynter(produto) {
  return localizarProdutoSynter(produto)?.imagem || null;
}
