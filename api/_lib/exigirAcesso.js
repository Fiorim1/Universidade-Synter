// api/_lib/exigirAcesso.js
//
// Valida, NO SERVIDOR, quem está chamando a API:
//
//   1. confirma que o token de sessão do Supabase é válido;
//   2. opcionalmente, confirma que o cargo do usuário (profiles.role)
//      está na lista de cargos permitidos.
//
// O cargo é sempre lido no banco, com o token do próprio usuário
// (a RLS continua valendo). Nada que venha do navegador decide acesso.
//
// Uso:
//   const acesso = await exigirAcesso(req, res, {
//     cargos: lerCargosPermitidos("SAT_CARGOS_PERMITIDOS"),
//   });
//   if (!acesso) return; // a resposta de erro já foi enviada

const MENSAGENS = {
  semSessao: "Sessão inválida ou expirada.",
  semPermissao: "Acesso não autorizado.",
  indisponivel: "Não foi possível validar o acesso no momento.",
};

function responderErro(res, status, mensagem, formatoErro) {
  if (formatoErro === "analytics") {
    res.status(status).json({ error: mensagem });
  } else {
    res.status(status).json({ sucesso: false, mensagem });
  }

  return null;
}

// Lê a lista de cargos de uma variável de ambiente (separados por vírgula).
// Aceita um nome ou uma lista de nomes; usa o primeiro que estiver preenchido.
// Sem nenhuma configurada, só o cargo "adm" é aceito (padrão seguro).
export function lerCargosPermitidos(variaveis, padrao = ["adm"]) {
  const nomes = Array.isArray(variaveis) ? variaveis : [variaveis];

  for (const nome of nomes) {
    const lista = String(process.env[nome] || "")
      .split(",")
      .map((cargo) => cargo.trim().toLowerCase())
      .filter(Boolean);

    if (lista.length > 0) return lista;
  }

  return padrao;
}

export async function exigirAcesso(
  req,
  res,
  { cargos = null, formatoErro = "sat" } = {}
) {
  try {
    const cabecalho = req.headers?.authorization || "";

    const token = cabecalho.startsWith("Bearer ")
      ? cabecalho.slice(7).trim()
      : "";

    if (!token) {
      return responderErro(res, 401, MENSAGENS.semSessao, formatoErro);
    }

    const url = (
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      ""
    ).replace(/\/$/, "");

    const chave =
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !chave) {
      console.error("exigirAcesso: configuração do Supabase ausente.");
      return responderErro(res, 503, MENSAGENS.indisponivel, formatoErro);
    }

    const cabecalhosSupabase = {
      apikey: chave,
      Authorization: `Bearer ${token}`,
    };

    // 1) O token é válido?
    const respostaUsuario = await fetch(`${url}/auth/v1/user`, {
      headers: cabecalhosSupabase,
    });

    if (respostaUsuario.status === 401 || respostaUsuario.status === 403) {
      return responderErro(res, 401, MENSAGENS.semSessao, formatoErro);
    }

    if (!respostaUsuario.ok) {
      return responderErro(res, 503, MENSAGENS.indisponivel, formatoErro);
    }

    const usuario = await respostaUsuario.json();

    if (!usuario?.id) {
      return responderErro(res, 401, MENSAGENS.semSessao, formatoErro);
    }

    // Só login exigido
    if (!Array.isArray(cargos) || cargos.length === 0) {
      return { usuario, cargo: null };
    }

    // 2) O cargo (lido no banco, com o token do próprio usuário) é permitido?
    const respostaPerfil = await fetch(
      `${url}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(usuario.id)}`,
      { headers: cabecalhosSupabase }
    );

    if (respostaPerfil.status >= 500) {
      return responderErro(res, 503, MENSAGENS.indisponivel, formatoErro);
    }

    if (!respostaPerfil.ok) {
      return responderErro(res, 403, MENSAGENS.semPermissao, formatoErro);
    }

    const linhas = await respostaPerfil.json();

    const cargo = String(linhas?.[0]?.role || "")
      .trim()
      .toLowerCase();

    const permitidos = cargos.map((item) => String(item).trim().toLowerCase());

    if (!cargo || !permitidos.includes(cargo)) {
      return responderErro(res, 403, MENSAGENS.semPermissao, formatoErro);
    }

    return { usuario, cargo };
  } catch (erro) {
    console.error("exigirAcesso: falha ao validar acesso:", erro?.message);
    return responderErro(res, 503, MENSAGENS.indisponivel, formatoErro);
  }
}