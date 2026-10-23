// Filtro hierárquico da Synter; não altera dados do Supabase.
const clean = (v) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const text = (v) => String(v ?? "").trim();
const codigo = (p) => text(p.codigo).toUpperCase();

function funcao(p) {
  const v = clean([p.variacao, p.descricao].join(" "));
  if (v.includes("banheiro")) return "Banheiro";
  if (v.includes("interna")) return "Interna";
  if (v.includes("externa")) return "Externa";
  const c = codigo(p);
  if (/IB(?:IP|IE|PT|CR)/.test(c) || /XMQB/.test(c)) return "Banheiro";
  if (/II(?:IP|IE|PT|CR)/.test(c) || /XMQI/.test(c)) return "Interna";
  if (/IEZ1/.test(c) || /XMQE/.test(c)) return "Externa";
  return "";
}
function acabamento(p) {
  const v = clean([p.nome, p.variacao, p.descricao].join(" "));
  for (const nome of ["Escovado", "Polido", "Preto", "Cromado", "Inox", "Branco", "Dourado"])
    if (v.includes(clean(nome))) return nome;
  const c = codigo(p);
  if (/PT\//.test(c)) return "Preto";
  if (/IP\//.test(c)) return "Polido";
  if (/IE\//.test(c)) return "Escovado";
  if (/CR\//.test(c)) return "Cromado";
  return "";
}
function roseta(p) {
  const m = codigo(p).match(/(\d{2})(?=I(?:EZ1|I|B))/);
  return m ? `Roseta ${m[1]}` : "";
}
function maquina(p) {
  const m = codigo(p).match(/\/(\d{2})(?:[RQ])?$/);
  return m ? `${m[1]} mm` : "";
}
function dimensao(p) {
  const v = [p.variacao, p.descricao, p.nome].map(text).join(" ");
  const m = v.match(/\b(\d{2,3})\s*mm\b/i) || codigo(p).match(/\/(\d{2})(?:[RQ])?$/);
  return m ? `${m[1]} mm` : "";
}
function familia(p) {
  const c = clean(p.categoria);
  if (c.includes("digital")) return "Fechaduras Digitais";
  if (c.includes("macaneta") || c.includes("zamak") || c.includes("mecanica")) return "Fechaduras Mecânicas";
  if (c.includes("auxiliar")) return "Fechaduras Auxiliares";
  if (c.includes("componente") || c.includes("complemento")) return "Componentes e Complementos";
  if (c.includes("dobradica")) return "Dobradiças";
  if (c.includes("acessorio")) return "Acessórios";
  if (c.includes("expositor")) return "Expositores";
  return text(p.categoria) || "Outros Produtos";
}
function caracteristicas(p, fam) {
  if (fam === "Fechaduras Mecânicas") return [text(p.nome), roseta(p), funcao(p), acabamento(p), maquina(p)];
  if (fam === "Fechaduras Digitais") return [text(p.linha), text(p.nome), text(p.tipo_preco), acabamento(p), text(p.variacao)];
  return [text(p.linha), text(p.nome), funcao(p), acabamento(p), dimensao(p)];
}
export function prepararCatalogoHierarquico(catalogo) {
  return (catalogo || []).map(p => {
    const fam = familia(p);
    return {...p, _hierarquia: {
      familia: fam,
      grupo: text(p.categoria) || "Sem grupo",
      caracteristicas: caracteristicas(p, fam)
    }};
  });
}
export function titulosCaracteristicas(fam) {
  if (fam === "Fechaduras Mecânicas") return ["Modelo / Maçaneta", "Roseta", "Função", "Acabamento", "Máquina"];
  if (fam === "Fechaduras Digitais") return ["Linha", "Modelo", "Tipo de preço", "Acabamento", "Versão / Variação"];
  return ["Linha", "Modelo / Produto", "Função", "Acabamento", "Medida"];
}
export function opcoesOrdenadas(valores) {
  return [...new Set(valores.filter(Boolean))].sort((a,b) => a.localeCompare(b,"pt-BR",{numeric:true,sensitivity:"base"}));
}
