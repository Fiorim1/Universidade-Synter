
import { tecnicosClient } from "./tecnicosClient";

// ==========================================
// SERVIÇO DE GEOLOCALIZAÇÃO
// UNIVERSIDADE SYNTER
// ==========================================
//
// O frontend não utiliza a chave Geoapify.
//
// As consultas são enviadas para:
//
// /api/geocodificar
//
// Essa rota é executada no servidor da
// Vercel e utiliza GEOAPIFY_API_KEY.
//
// ==========================================

export async function consultarGeocodificacao({
  endereco,
  cidade,
  uf,
  signal,
}) {
  // ========================================
  // RECUPERAR SESSÃO DO SUPABASE
  // ========================================

  const { data, error } =
    await tecnicosClient.auth.getSession();

  const token =
    data?.session?.access_token;

  if (error || !token) {
    throw new Error(
      "Sua sessão expirou. Entre novamente para consultar a localização."
    );
  }

  // ========================================
  // CONSULTAR API DA VERCEL
  // ========================================

  let resposta;

  try {
    resposta = await fetch(
      "/api/geocodificar",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          endereco,
          cidade,
          uf,
        }),

        signal,
      }
    );
  } catch (erro) {
    if (erro.name === "AbortError") {
      throw erro;
    }

    throw new Error(
      "Falha de conexão com o serviço de localização. Tente novamente."
    );
  }

  // ========================================
  // VALIDAR RESPOSTA
  // ========================================

  const tipo =
    resposta.headers.get("content-type") || "";

  if (!tipo.includes("application/json")) {
    throw new Error(
      "A API de localização não está publicada. Verifique o deploy na Vercel."
    );
  }

  const resultado =
    await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.erro ||
        "Não foi possível localizar o endereço."
    );
  }

  return resultado;
}
