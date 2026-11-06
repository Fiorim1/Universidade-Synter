
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import { tecnicosClient } from "../lib/tecnicosClient";
import {
  consultarGeocodificacao,
} from "../lib/geocodificacao";

import "../styles/TecnicosHomologados.css";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const RAIOS = [10, 25, 50, 100];
const LIMITE_RESULTADOS = 20;

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function converterNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero)
    ? numero
    : null;
}

function coordenadasValidas(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// ==========================================
// DISTÂNCIA EM LINHA RETA
// ==========================================

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const raioTerra = 6371;

  const rad = (valor) =>
    (valor * Math.PI) / 180;

  const diferencaLatitude =
    rad(lat2 - lat1);

  const diferencaLongitude =
    rad(lon2 - lon1);

  const a =
    Math.sin(diferencaLatitude / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(diferencaLongitude / 2) ** 2;

  return (
    raioTerra *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(Math.max(0, 1 - a))
    )
  );
}

function formatarDistancia(valor) {
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

// ==========================================
// WHATSAPP
// ==========================================

function prepararWhatsapp(numero, nome) {
  const telefone = String(numero || "")
    .replace(/\D/g, "");

  if (
    telefone.length < 12 ||
    telefone.length > 13
  ) {
    return null;
  }

  if (!telefone.startsWith("55")) {
    return null;
  }

  const mensagem =
    `Olá! Encontrei seu contato na rede de ` +
    `Técnicos Homologados Synter. ` +
    `Gostaria de solicitar informações ` +
    `sobre um atendimento com ${nome}.`;

  return (
    `https://wa.me/${telefone}?text=` +
    encodeURIComponent(mensagem)
  );
}

// ==========================================
// GOOGLE MAPS
// ==========================================

function gerarLinkMapa(latitude, longitude) {
  return (
    "https://www.google.com/maps/search/?api=1" +
    `&query=${latitude}%2C${longitude}`
  );
}

// ==========================================
// IDENTIFICAR ENDEREÇO PELA API INTERNA
// ==========================================

async function localizarEndereco(endereco, signal) {
  const resultado =
    await consultarGeocodificacao({
      endereco,
      signal,
    });

  const local = resultado.results?.[0];

  const latitude =
    converterNumero(local?.lat);

  const longitude =
    converterNumero(local?.lon);

  if (
    !coordenadasValidas(latitude, longitude)
  ) {
    throw new Error(
      "Não encontramos esse endereço. Confira rua, número, cidade, estado e CEP."
    );
  }

  const tipoResultado =
    local?.result_type || "";

  const precisao =
    local?.rank?.match_type || "";

  const aproximado =
    !["building", "amenity"].includes(
      tipoResultado
    ) &&
    ![
      "full_match",
      "match_by_building",
    ].includes(precisao);

  return {
    latitude,
    longitude,
    enderecoFormatado:
      local.formatted || endereco,
    aproximado,
  };
}

// ==========================================
// CARREGAR TÉCNICOS HOMOLOGADOS
// ==========================================

async function carregarTecnicos() {
  const { data, error } =
    await tecnicosClient
      .from("tecnicos_homologados")
      .select(
        "id,nome,whatsapp,cidade,uf,especialidades," +
          "latitude,longitude,regiao_atendimento"
      )
      .eq("ativo", true)
      .eq("homologado", true)
      .eq("autorizou_divulgacao", true)
      .order("nome", {
        ascending: true,
      })
      .limit(1000);

  if (error) {
    console.error(
      "Erro na consulta de profissionais:",
      error
    );

    throw new Error(
      "Não foi possível consultar os profissionais disponíveis. Tente novamente."
    );
  }

  return (data || [])
    .map((tecnico) => ({
      ...tecnico,
      latitude: converterNumero(
        tecnico.latitude
      ),
      longitude: converterNumero(
        tecnico.longitude
      ),
    }))
    .filter((tecnico) =>
      coordenadasValidas(
        tecnico.latitude,
        tecnico.longitude
      )
    );
}

// ==========================================
// LOCALIZAR TÉCNICOS
// ==========================================

function localizarTecnicos(tecnicos, localizacao) {
  const ordenados = tecnicos
    .map((tecnico) => ({
      ...tecnico,

      distancia: calcularDistancia(
        localizacao.latitude,
        localizacao.longitude,
        tecnico.latitude,
        tecnico.longitude
      ),
    }))
    .sort(
      (a, b) =>
        a.distancia - b.distancia
    );

  // O raio é ampliado automaticamente
  // quando não existem técnicos mais próximos.

  const raioEncontrado =
    RAIOS.find((raio) =>
      ordenados.some(
        (tecnico) =>
          tecnico.distancia <= raio
      )
    ) || RAIOS[RAIOS.length - 1];

  const encontrados = ordenados
    .filter(
      (tecnico) =>
        tecnico.distancia <= raioEncontrado
    )
    .slice(0, LIMITE_RESULTADOS);

  return {
    encontrados,
    raioEncontrado,
  };
}

// ==========================================
// ÍCONES
// ==========================================

function Icone({ tipo, tamanho = 22 }) {
  const propriedades = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (tipo === "cubo") {
    return (
      <svg {...propriedades}>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="M3 7v10l9 5 9-5V7" />
        <path d="M12 12v10" />
      </svg>
    );
  }

  if (tipo === "pin") {
    return (
      <svg {...propriedades}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (tipo === "busca") {
    return (
      <svg {...propriedades}>
        <circle
          cx="10.5"
          cy="10.5"
          r="6.5"
        />
        <path d="m16 16 5 5" />
      </svg>
    );
  }

  if (tipo === "escudo") {
    return (
      <svg {...propriedades}>
        <path d="M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    );
  }

  if (tipo === "whatsapp") {
    return (
      <svg {...propriedades}>
        <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z" />
        <path d="M8 9c1 4 3 6 7 7l2-2" />
      </svg>
    );
  }

  if (tipo === "externo") {
    return (
      <svg {...propriedades}>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
      </svg>
    );
  }

  return null;
}

// ==========================================
// CARTÃO DE PROFISSIONAL
// ==========================================

function CardTecnico({
  tecnico,
  posicao,
}) {
  const whatsapp = prepararWhatsapp(
    tecnico.whatsapp,
    tecnico.nome
  );

  const especialidades =
    Array.isArray(tecnico.especialidades)
      ? tecnico.especialidades
      : [];

  return (
    <article className="th-card">
      <div className="th-card-top">

        <div className="th-card-avatar">
          <Icone
            tipo="escudo"
            tamanho={27}
          />
        </div>

        <div className="th-card-info">
          <div className="th-card-tag">
            PROFISSIONAL HOMOLOGADO
          </div>

          <h3>{tecnico.nome}</h3>

          <p>
            {tecnico.cidade} / {tecnico.uf}
          </p>
        </div>

        {posicao === 0 && (
          <span className="th-nearest">
            Mais próximo
          </span>
        )}
      </div>

      <div className="th-card-specialties">
        {especialidades.length > 0 ? (
          especialidades.map(
            (especialidade) => (
              <span key={especialidade}>
                {especialidade}
              </span>
            )
          )
        ) : (
          <span>
            Serviços conforme disponibilidade
          </span>
        )}
      </div>

      <div className="th-card-distance">
        <Icone
          tipo="pin"
          tamanho={17}
        />

        <span>
          Aproximadamente{" "}
          <strong>
            {formatarDistancia(
              tecnico.distancia
            )}
          </strong>{" "}
          em linha reta
        </span>
      </div>

      <div className="th-card-actions">

        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="th-button th-button-primary"
          >
            <Icone
              tipo="whatsapp"
              tamanho={18}
            />
            Conversar no WhatsApp
          </a>
        ) : (
          <span className="th-contact-unavailable">
            Contato indisponível
          </span>
        )}

        <a
          href={gerarLinkMapa(
            tecnico.latitude,
            tecnico.longitude
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="th-button th-button-secondary"
        >
          <Icone
            tipo="externo"
            tamanho={17}
          />
          Ver região no mapa
        </a>
      </div>
    </article>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function TecnicosHomologados() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [endereco, setEndereco] =
    useState("");

  const [pesquisando, setPesquisando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [localizacao, setLocalizacao] =
    useState(null);

  const [resultados, setResultados] =
    useState([]);

  const [raio, setRaio] =
    useState(10);

  const [
    pesquisaConcluida,
    setPesquisaConcluida,
  ] = useState(false);

  const [
    podeGerenciar,
    setPodeGerenciar,
  ] = useState(false);

  const controladorRef = useRef(null);

  // ========================================
  // LIMPEZA AO SAIR DA PÁGINA
  // ========================================

  useEffect(() => {
    return () => {
      controladorRef.current?.abort();
    };
  }, []);

  // ========================================
  // VERIFICAR ACESSO ADMINISTRATIVO
  // ========================================

  useEffect(() => {
    let montado = true;

    async function verificarPermissao() {
      try {
        const {
          data: usuario,
          error: erroUsuario,
        } = await tecnicosClient.auth.getUser();

        if (
          erroUsuario ||
          !usuario?.user
        ) {
          return;
        }

        const { data, error } =
          await tecnicosClient.rpc(
            "pode_gerenciar_tecnicos"
          );

        if (montado && !error) {
          setPodeGerenciar(
            data === true
          );
        }
      } catch {
        if (montado) {
          setPodeGerenciar(false);
        }
      }
    }

    verificarPermissao();

    return () => {
      montado = false;
    };
  }, []);

  // ========================================
  // BUSCAR PROFISSIONAIS
  // ========================================

  async function buscarTecnicos(evento) {
    evento.preventDefault();

    if (pesquisando) {
      return;
    }

    const enderecoInformado =
      endereco.trim();

    if (enderecoInformado.length < 3) {
      setErro(
        "Informe um endereço ou cidade para localizar os profissionais."
      );
      return;
    }

    controladorRef.current?.abort();

    const controlador =
      new AbortController();

    controladorRef.current = controlador;

    setPesquisando(true);
    setErro("");
    setResultados([]);
    setLocalizacao(null);
    setPesquisaConcluida(false);

    try {
      const [local, tecnicos] =
        await Promise.all([
          localizarEndereco(
            enderecoInformado,
            controlador.signal
          ),
          carregarTecnicos(),
        ]);

      if (
        controlador.signal.aborted
      ) {
        return;
      }

      const consulta =
        localizarTecnicos(
          tecnicos,
          local
        );

      setLocalizacao(local);
      setResultados(
        consulta.encontrados
      );
      setRaio(
        consulta.raioEncontrado
      );
      setPesquisaConcluida(true);
    } catch (falha) {
      if (
        controlador.signal.aborted
      ) {
        return;
      }

      setErro(
        falha.message ||
          "Não foi possível concluir a busca. Tente novamente."
      );
    } finally {
      if (
        !controlador.signal.aborted
      ) {
        setPesquisando(false);
      }
    }
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <div className="th-page">

      <Header />

      {/* HERO */}

      <section className="th-hero">
        <div className="th-container th-hero-inner">

          <div className="th-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="th-eyebrow">
            <Icone
              tipo="cubo"
              tamanho={24}
            />

            <span>
              REDE DE ASSISTÊNCIA HOMOLOGADA
            </span>
          </div>

          <h1>
            Técnicos Homologados
          </h1>

          <p>
            Localize profissionais homologados
            pela Synter próximos ao endereço
            da instalação e escolha com quem
            deseja entrar em contato.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}

      <main className="th-container th-main">

        <div className="th-section-heading">
          <span className="th-section-bar" />

          <div>
            <h2>
              ENCONTRE UM PROFISSIONAL
            </h2>

            <p>
              Basta informar o endereço.
              Nós buscamos os profissionais
              mais próximos para você.
            </p>
          </div>
        </div>

        {/* SOMENTE ADMINISTRADORES */}

        {podeGerenciar && (
          <div
            style={{
              marginBottom: 22,
            }}
          >
            <Link
              to="/tecnicos-homologados/gerenciar"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 45,
                padding: "12px 20px",
                color: "#111111",
                background: "#ffffff",
                border:
                  "1px solid #ffffff",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Gerenciar Técnicos
            </Link>
          </div>
        )}

        {/* FORMULÁRIO DE BUSCA */}

        <form
          className="th-search-card"
          onSubmit={buscarTecnicos}
        >
          <label
            htmlFor="endereco-tecnico"
          >
            Endereço da instalação
          </label>

          <div className="th-search-row">
            <div className="th-input-wrapper">

              <Icone
                tipo="pin"
                tamanho={21}
              />

              <input
                id="endereco-tecnico"
                type="text"
                value={endereco}
                onChange={(evento) =>
                  setEndereco(
                    evento.target.value
                  )
                }
                placeholder="Rua, número, bairro, cidade, UF e CEP"
                autoComplete="street-address"
                maxLength={240}
                required
              />
            </div>

            <button
              type="submit"
              className="th-search-button"
              disabled={pesquisando}
            >
              <Icone
                tipo="busca"
                tamanho={19}
              />

              {pesquisando
                ? "Localizando..."
                : "Encontrar técnicos"}
            </button>
          </div>

          <p className="th-search-help">
            Sua localização será utilizada
            para esta consulta. A pesquisa
            considera a proximidade geográfica
            e a disponibilidade de profissionais
            cadastrados.
          </p>
        </form>

        {/* MENSAGEM DE ERRO */}

        {erro && (
          <div
            className="th-message"
            role="alert"
          >
            <strong>
              Não foi possível concluir a busca
            </strong>

            <p>{erro}</p>
          </div>
        )}

        {/* RESULTADOS */}

        {pesquisaConcluida && (
          <section className="th-results">

            <div className="th-results-header">
              <div>
                <span className="th-eyebrow-small">
                  RESULTADO DA BUSCA
                </span>

                <h2>
                  {resultados.length === 0
                    ? "Nenhum técnico encontrado"
                    : `${resultados.length} ${
                        resultados.length === 1
                          ? "profissional encontrado"
                          : "profissionais encontrados"
                      }`}
                </h2>
              </div>

              <span className="th-radius">
                Raio de até {raio} km
              </span>
            </div>

            {localizacao && (
              <div className="th-location-summary">

                <Icone
                  tipo="pin"
                  tamanho={19}
                />

                <span>
                  Busca realizada para:{" "}

                  <strong>
                    {
                      localizacao.enderecoFormatado
                    }
                  </strong>
                </span>
              </div>
            )}

            {localizacao?.aproximado && (
              <p className="th-precision-note">
                A localização foi identificada
                aproximadamente. Confira o
                endereço antes de entrar em contato.
              </p>
            )}

            {resultados.length > 0 ? (
              <div className="th-grid">

                {resultados.map(
                  (tecnico, indice) => (
                    <CardTecnico
                      key={tecnico.id}
                      tecnico={tecnico}
                      posicao={indice}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="th-empty">

                <Icone
                  tipo="pin"
                  tamanho={35}
                />

                <h3>
                  Ainda não encontramos profissionais
                  homologados nessa região.
                </h3>

                <p>
                  Tente outro endereço próximo
                  ou entre em contato com a Synter
                  para receber orientação.
                </p>

                <a
                  href="https://wa.me/554991664297"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com a Synter
                </a>
              </div>
            )}

            <div className="th-disclaimer">
              <Icone
                tipo="escudo"
                tamanho={20}
              />

              <p>
                As distâncias são estimativas
                em linha reta, não tempos de viagem.
                A homologação não representa
                confirmação de disponibilidade,
                preço ou agendamento. Confirme
                diretamente com o profissional.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {profileOpen && (
        <Profile
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </div>
  );
}
