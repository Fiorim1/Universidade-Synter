
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

const CHAVE_GEOAPIFY =
  process.env.GEOAPIFY_API_KEY;

// ==========================================
// PADRONIZAÇÃO DE TEXTO
// ==========================================

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ==========================================
// IDENTIFICAR PESQUISAS POR BAIRRO OU RUA
// ==========================================

const PREFIXO_LOGRADOURO =
  /^(bairro|b\.|rua|r\.|avenida|av\.|travessa|tv\.|alameda|estrada|rodovia|servidao|loteamento|praca|viela)\s/i;

const TIPOS_BAIRRO = new Set([
  "suburb",
  "district",
  "neighbourhood",
  "neighborhood",
  "quarter",
]);

// ==========================================
// EXTRAIR CIDADE DO TEXTO
// ==========================================

function analisarEndereco(valor) {
  const endereco = String(valor || "").trim();

  if (endereco.length < 3 || endereco.length > 240) {
    return {
      erro: "Informe uma localização válida.",
    };
  }

  // Aceita formato:
  // Bairro X, Cidade, UF
  // Rua X, 123, Cidade, UF
  // Cidade
  // Cidade, UF

  const partes = endereco
    .split(/\s*,\s*|\s+-\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  const localDetalhado =
    PREFIXO_LOGRADOURO.test(endereco);

  const segmentos = [...partes];

  let ufInformada = "";

  if (
    segmentos.length > 1 &&
    /^[a-zA-Z]{2}$/.test(
      segmentos[segmentos.length - 1]
    )
  ) {
    ufInformada =
      segmentos.pop().toUpperCase();
  }

  // Bairro ou rua precisam ter a cidade
  // como o último segmento não numérico.

  if (localDetalhado) {
    if (segmentos.length < 2) {
      return {
        erro:
          "Para pesquisar por bairro ou rua, informe obrigatoriamente a cidade. Exemplo: Bairro Santa Ana, Forquilhinha, SC.",
      };
    }

    const cidadeInformada =
      segmentos[segmentos.length - 1];

    if (
      cidadeInformada.length < 3 ||
      /^\d/.test(cidadeInformada) ||
      PREFIXO_LOGRADOURO.test(cidadeInformada)
    ) {
      return {
        erro:
          "Informe o nome da cidade após a rua ou o bairro. Exemplo: Rua das Flores, 123, Forquilhinha, SC.",
      };
    }

    return {
      endereco,
      cidadeInformada,
      ufInformada,
      localDetalhado: true,
    };
  }

  // Formato sem prefixo:
  // "Centro, Forquilhinha"
  // "Forquilhinha, SC"
  // "Forquilhinha"

  const cidadeInformada =
    segmentos.length > 1
      ? segmentos[segmentos.length - 1]
      : segmentos[0] || "";

  if (
    !cidadeInformada ||
    /^\d/.test(cidadeInformada)
  ) {
    return {
      erro: "Informe o nome da cidade.",
    };
  }

  return {
    endereco,
    cidadeInformada,
    ufInformada,
    localDetalhado: segmentos.length > 1,
    pesquisaSimples: segmentos.length === 1,
  };
}

// ==========================================
// COMPARAR CIDADE DO RESULTADO
// ==========================================

function cidadeConfere(local, cidadeInformada) {
  const esperada = normalizar(cidadeInformada);

  if (!esperada) {
    return false;
  }

  const localidades = [
    local.city,
    local.municipality,
  ]
    .map(normalizar)
    .filter(Boolean);

  return localidades.includes(esperada);
}

function ufConfere(local, ufInformada) {
  if (!ufInformada) {
    return true;
  }

  return (
    String(local.state_code || "")
      .toUpperCase() === ufInformada
  );
}

// ==========================================
// FUNÇÃO PRINCIPAL DA VERCEL
// ==========================================

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      erro: "Método não permitido.",
    });
  }

  if (
    !URL_SUPABASE ||
    !CHAVE_PUBLICA_SUPABASE ||
    !CHAVE_GEOAPIFY
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
  // VALIDAR TOKEN DE AUTENTICAÇÃO
  // ========================================

  const autorizacao =
    req.headers.authorization || "";

  const token = autorizacao.startsWith("Bearer ")
    ? autorizacao.slice(7)
    : "";

  if (!token || token.length > 4096) {
    return res.status(401).json({
      erro:
        "Entre na sua conta para consultar a localização.",
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

    const { data, error } =
      await supabase.auth.getUser(token);

    if (error || !data?.user?.id) {
      return res.status(401).json({
        erro:
          "Sessão inválida. Entre novamente.",
      });
    }

    // ======================================
    // LER O CORPO DA REQUISIÇÃO
    // ======================================

    let corpo = req.body;

    if (typeof corpo === "string") {
      try {
        corpo = JSON.parse(corpo);
      } catch {
        return res.status(400).json({
          erro: "Dados da consulta inválidos.",
        });
      }
    }

    if (
      !corpo ||
      typeof corpo !== "object" ||
      Array.isArray(corpo)
    ) {
      return res.status(400).json({
        erro: "Dados da consulta inválidos.",
      });
    }

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

    let consulta;
    let cidadeEsperada;
    let ufEsperada;
    let pesquisaDetalhada = false;
    let pesquisaSimples = false;

    // ======================================
    // CADASTRO DE TÉCNICO:
    // CIDADE + UF
    // ======================================

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

      consulta = `${cidade}, ${uf}, Brasil`;
      cidadeEsperada = cidade;
      ufEsperada = uf;
      pesquisaSimples = true;
    } else {
      // ====================================
      // PESQUISA DO USUÁRIO
      // ====================================

      const analise =
        analisarEndereco(endereco);

      if (analise.erro) {
        return res.status(400).json({
          erro: analise.erro,
        });
      }

      consulta = `${endereco}, Brasil`;

      cidadeEsperada =
        analise.cidadeInformada;

      ufEsperada =
        analise.ufInformada;

      pesquisaDetalhada =
        analise.localDetalhado;

      pesquisaSimples =
        analise.pesquisaSimples;
    }

    // ======================================
    // CONSULTAR GEOAPIFY
    // ======================================

    const parametros = new URLSearchParams({
      text: consulta,
      format: "json",
      filter: "countrycode:br",
      lang: "pt",
      limit: "5",
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

    const dadosGeoapify =
      await resposta.json();

    const candidatos = Array.isArray(
      dadosGeoapify.results
    )
      ? dadosGeoapify.results
      : [];

    // ======================================
    // CONFERIR CIDADE E UF
    // ======================================

    const correspondentes = candidatos.filter(
      (local) => {
        const lat = Number(local.lat);
        const lon = Number(local.lon);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lon)
        ) {
          return false;
        }

        return (
          cidadeConfere(
            local,
            cidadeEsperada
          ) &&
          ufConfere(
            local,
            ufEsperada
          )
        );
      }
    );

    // Pesquisa simples como "Centro":
    // se o provedor identificar como bairro,
    // exigir a cidade na pesquisa.

    if (
      pesquisaSimples &&
      correspondentes.length === 0 &&
      candidatos.some((local) =>
        TIPOS_BAIRRO.has(
          String(local.result_type || "")
            .toLowerCase()
        )
      )
    ) {
      return res.status(422).json({
        erro:
          "A localização parece ser um bairro. Informe também a cidade. Exemplo: Centro, Forquilhinha, SC.",
      });
    }

    if (correspondentes.length === 0) {
      return res.status(422).json({
        erro:
          "Não foi possível confirmar a cidade informada. Confira o nome do município e a UF.",
      });
    }

    // Se buscou uma rua ou bairro, evita
    // aceitar um resultado somente de cidade.

    const resultadosFiltrados =
      pesquisaDetalhada
        ? correspondentes.filter(
            (local) =>
              !["city", "county", "state"]
                .includes(
                  String(
                    local.result_type || ""
                  ).toLowerCase()
                )
          )
        : correspondentes;

    if (resultadosFiltrados.length === 0) {
      return res.status(422).json({
        erro:
          "Não foi possível confirmar a rua ou bairro nessa cidade. Confira o endereço informado.",
      });
    }

    // ======================================
    // RETORNAR DADOS SEGUROS
    // ======================================

    return res.status(200).json({
      results: resultadosFiltrados
        .slice(0, 5)
        .map((local) => ({
          lat: local.lat,
          lon: local.lon,
          formatted: local.formatted,
          city: local.city,
          municipality: local.municipality,
          state_code: local.state_code,
          result_type: local.result_type,
          rank: {
            match_type:
              local.rank?.match_type,
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
