// api/_lib/limitarUso.js
//
// Limite de uso por usuário (rate limit), guardado no Redis da Upstash.
// Protege a conta da OpenAI (chat) e a busca de dados de clientes (SAT).
//
// Variáveis de ambiente (criadas automaticamente pela integração
// Upstash Redis da Vercel). Aceita os dois nomes mais comuns:
//   KV_REST_API_URL            ou  UPSTASH_REDIS_REST_URL
//   KV_REST_API_TOKEN          ou  UPSTASH_REDIS_REST_TOKEN
//
// Comportamento se o Redis não estiver configurado ou estiver fora do ar:
// o limite é ignorado (a API continua funcionando) e o motivo aparece nos
// logs da Vercel. Assim, um problema no Redis nunca derruba o sistema.
//
// Uso:
//   const dentroDoLimite = await limitarUso(res, {
//     tipo: "chat",
//     identificador: acesso.usuario.id,
//   });
//   if (!dentroDoLimite) return; // a resposta 429 já foi enviada

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Ajuste os números aqui, se precisar.
const POLITICAS = {
  chat: {
    quantidade: 10,
    janela: "1 m",
    mensagem:
      "Muitas mensagens em pouco tempo. Aguarde alguns instantes e tente novamente.",
  },
  busca: {
    quantidade: 30,
    janela: "5 m",
    mensagem:
      "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  },
  pdf: {
    quantidade: 20,
    janela: "5 m",
    mensagem:
      "Muitos PDFs gerados em pouco tempo. Aguarde alguns minutos e tente novamente.",
  },
};

let redis = null;
const limitadores = {};
let avisouSemRedis = false;

function obterLimitador(tipo) {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;

  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!avisouSemRedis) {
      console.warn(
        "limitarUso: variáveis do Redis (KV_REST_API_URL e KV_REST_API_TOKEN) ausentes. Limite de uso DESATIVADO."
      );
      avisouSemRedis = true;
    }

    return null;
  }

  if (!redis) {
    redis = new Redis({ url, token });
  }

  if (!limitadores[tipo]) {
    const politica = POLITICAS[tipo];

    limitadores[tipo] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(politica.quantidade, politica.janela),
      prefix: `synter:${tipo}`,
      analytics: false,
    });
  }

  return limitadores[tipo];
}

export async function limitarUso(
  res,
  { tipo, identificador, formatoErro = "sat" }
) {
  const politica = POLITICAS[tipo];

  if (!politica) {
    console.error(`limitarUso: tipo desconhecido "${tipo}". Limite ignorado.`);
    return true;
  }

  try {
    const limitador = obterLimitador(tipo);

    if (!limitador) return true;

    const resultado = await limitador.limit(String(identificador));

    res.setHeader("X-RateLimit-Limit", String(resultado.limit));
    res.setHeader(
      "X-RateLimit-Remaining",
      String(Math.max(0, resultado.remaining))
    );

    if (resultado.success) return true;

    const esperaSegundos = Math.max(
      1,
      Math.ceil((resultado.reset - Date.now()) / 1000)
    );

    res.setHeader("Retry-After", String(esperaSegundos));

    if (formatoErro === "analytics") {
      res.status(429).json({
        error: politica.mensagem,
        code: "RATE_LIMITED",
      });
    } else {
      res.status(429).json({
        sucesso: false,
        mensagem: politica.mensagem,
      });
    }

    return false;
  } catch (erro) {
    console.error(
      "limitarUso: falha ao consultar o Redis. Limite ignorado nesta chamada:",
      erro?.message
    );

    return true;
  }
}