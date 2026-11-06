
import { createClient } from "@supabase/supabase-js";

// ==========================================
// CONFIGURAÇÕES DO SERVIDOR
// ==========================================

const URL_SUPABASE =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const CHAVE_PUBLICA_SUPABASE =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

// Esta chave fica exclusivamente na Vercel.
// Não é enviada para o navegador.

const CHAVE_GEOAPIFY =
  process.env.GEOAPIFY_API_KEY;

// ==========================================
// FUNÇÃO SERVERLESS
// ==========================================

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  // Somente requisições POST

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      erro: "Método não permitido.",
    });
  }

  // Verificar configurações

  if (
    !CHAVE_GEOAPIFY ||
    !URL_SUPABASE ||
    !CHAVE_PUBLICA_SUPABASE
  ) {
    console.error(
      "Configuração ausente em /api/geocodificar"
    );

    return res.status(503).json({
      erro:
        "Serviço de localização não configurado no servidor.",
    });
  }

  // ========================================
  // VALIDAR SESSÃO DO USUÁRIO
  // ========================================

  const bearer =
    req.headers.authorization || "";

  const token = bearer.startsWith("Bearer ")
    ? bearer.slice(7)
    : "";

  if (!token || token.length > 4096) {
    return res.status(401).json({
      erro:
        "Entre na sua conta para fazer a consulta.",
    });
  }

  try {
    const supabase = createClient(
      URL_SUPABASE,
      CHAVE_PUBLICA_SUPABASE,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: usuario,
      error: erroUsuario,
    } = await supabase.auth.getUser(token);

    if (erroUsuario || !usuario?.user?.id) {
      return res.status(401).json({
        erro:
          "Sessão inválida. Entre novamente.",
      });
    }

    // ======================================
    // RECEBER ENDEREÇO OU CIDADE
    // ======================================

    const corpo =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    const endereco =
      typeof corpo.endereco === "string"
        ? corpo.endereco.trim()
        : "";

    const cidade =
      typeof corpo.cidade === "string"
        ? corpo.cidade.trim()
        : "";

    const uf =
      typeof corpo.uf === "string"
        ? corpo.uf.trim().toUpperCase()
        : "";

    let texto;
    let limite;

    // Busca de cidade para o cadastro ADM

    if (cidade || uf) {
      if (
        cidade.length < 2 ||
        cidade.length > 120 ||
        !/^[A-Z]{2}$/.test(uf)
      ) {
        return res.status(400).json({
          erro: "Cidade ou UF inválida.",
        });
      }

      texto = `${cidade}, ${uf}, Brasil`;
      limite = "5";
    } else {
      // Busca de endereço do usuário

      if (
        endereco.length < 3 ||
        endereco.length > 240
      ) {
        return res.status(400).json({
          erro: "Informe um endereço válido.",
        });
      }

      texto = `${endereco}, Brasil`;
      limite = "1";
    }

    // ======================================
    // CONSULTAR GEOAPIFY
    // ======================================

    const parametros = new URLSearchParams({
      text: texto,
      format: "json",
      filter: "countrycode:br",
      lang: "pt",
      limit: limite,
      apiKey: CHAVE_GEOAPIFY,
    });

    const resposta = await fetch(
      "https://api.geoapify.com/v1/geocode/search?" +
        parametros.toString(),
      {
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!resposta.ok) {
      console.error(
        "Geoapify HTTP",
        resposta.status
      );

      return res.status(502).json({
        erro:
          "Não foi possível consultar a localização neste momento.",
      });
    }

    const dados = await resposta.json();

    const resultados = Array.isArray(
      dados.results
    )
      ? dados.results
      : [];

    // Retornar somente dados necessários.
    // Nunca retornar a chave da Geoapify.

    return res.status(200).json({
      results: resultados.map((item) => ({
        lat: item.lat,
        lon: item.lon,
        formatted: item.formatted,
        result_type: item.result_type,
        state_code: item.state_code,
        rank: {
          match_type:
            item.rank?.match_type,
        },
      })),
    });
  } catch (erro) {
    console.error(
      "Falha na geocodificação:",
      erro?.message
    );

    return res.status(500).json({
      erro:
        "Falha ao processar a localização. Tente novamente.",
    });
  }
}
