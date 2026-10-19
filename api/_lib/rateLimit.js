import {
  Redis
} from "@upstash/redis";

import {
  Ratelimit
} from "@upstash/ratelimit";


// ==========================================
// REDIS
// ==========================================

const redis =
  new Redis({

    url:
      process.env.KV_REST_API_URL,

    token:
      process.env.KV_REST_API_TOKEN

  });


// ==========================================
// LIMITADOR GLOBAL
// ==========================================

export const globalRateLimit =
  new Ratelimit({

    redis,

    limiter:
      Ratelimit.slidingWindow(
        100,
        "1 m"
      ),

    analytics:
      true,

    prefix:
      "synter:global"

  });


// ==========================================
// LIMITADOR POR USUÁRIO
// ==========================================

export const userRateLimit =
  new Ratelimit({

    redis,

    limiter:
      Ratelimit.slidingWindow(
        60,
        "1 m"
      ),

    analytics:
      true,

    prefix:
      "synter:user"

  });


// ==========================================
// CHAT / IA
// ==========================================

export const chatRateLimit =
  new Ratelimit({

    redis,

    limiter:
      Ratelimit.slidingWindow(
        10,
        "1 m"
      ),

    analytics:
      true,

    prefix:
      "synter:chat"

  });


// ==========================================
// ROTAS SENSÍVEIS
// ==========================================

export const sensitiveRateLimit =
  new Ratelimit({

    redis,

    limiter:
      Ratelimit.slidingWindow(
        10,
        "5 m"
      ),

    analytics:
      true,

    prefix:
      "synter:sensitive"

  });


// ==========================================
// PEGAR IP
// ==========================================

export function obterIp(
  req
) {

  const forwarded =
    req.headers[
      "x-forwarded-for"
    ];


  if (
    typeof forwarded ===
    "string"
  ) {

    return (
      forwarded
        .split(",")[0]
        ?.trim() ||
      "desconhecido"
    );

  }


  if (
    Array.isArray(forwarded)
  ) {

    return (
      forwarded[0]
        ?.split(",")[0]
        ?.trim() ||
      "desconhecido"
    );

  }


  return String(
    req.headers[
      "x-real-ip"
    ] ||
    "desconhecido"
  );

}


// ==========================================
// APLICAR RATE LIMIT
// ==========================================

export async function aplicarRateLimit({

  res,

  limiter,

  identifier,

  rota = "api"

}) {

  const resultado =
    await limiter.limit(
      `${rota}:${identifier}`
    );


  res.setHeader(
    "X-RateLimit-Limit",
    String(
      resultado.limit
    )
  );


  res.setHeader(
    "X-RateLimit-Remaining",
    String(
      resultado.remaining
    )
  );


  res.setHeader(
    "X-RateLimit-Reset",
    String(
      resultado.reset
    )
  );


  if (
    !resultado.success
  ) {

    const segundos =
      Math.max(
        1,
        Math.ceil(
          (
            resultado.reset -
            Date.now()
          ) /
          1000
        )
      );


    res.setHeader(
      "Retry-After",
      String(segundos)
    );


    res
      .status(429)
      .json({

        error:
          "Muitas solicitações. Aguarde alguns instantes antes de tentar novamente.",

        code:
          "RATE_LIMIT_EXCEEDED",

        retryAfter:
          segundos

      });


    return false;

  }


  return true;

}