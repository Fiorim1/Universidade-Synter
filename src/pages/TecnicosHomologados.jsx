
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import { tecnicosClient } from "../lib/tecnicosClient";
import { consultarGeocodificacao } from "../lib/geocodificacao";

import "../styles/TecnicosHomologados.css";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const RAIOS = [10, 25, 50, 100];
const LIMITE_RESULTADOS = 20;

const PREFIXO_ENDERECO =
  /^(bairro|b\.|rua|r\.|avenida|av\.|travessa|tv\.|alameda|estrada|rodovia|servidao|loteamento|praca|viela)\s/i;

// ==========================================
// VALIDAÇÃO DO ENDEREÇO
// ==========================================

function validarEnderecoPesquisa(valor) {
  const endereco = String(valor || "").trim();

  if (endereco.length < 3) {
    return "Informe uma cidade ou endereço válido.";
  }

  const partes = endereco
    .split(/\s*,\s*|\s+-\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  const segmentos = [...partes];

  if (
    segmentos.length > 1 &&
    /^[A-Za-z]{2}$/.test(
      segmentos[segmentos.length - 1]
    )
  ) {
    segmentos.pop();
  }

  const eBairroOuRua =
    PREFIXO_ENDERECO.test(endereco);

  if (eBairroOuRua) {
    if (segmentos.length < 2) {
      return (
        "Para pesquisar por bairro ou rua, " +
        "é obrigatório informar também a cidade. " +
        "Exemplo: Bairro Santa Ana, Forquilhinha, SC."
      );
    }

    const ultimaParte =
      segmentos[segmentos.length - 1];

    if (
      ultimaParte.length < 3 ||
      /^\d/.test(ultimaParte) ||
      PREFIXO_ENDERECO.test(ultimaParte)
    ) {
      return (
        "Informe o nome da cidade após o bairro ou a rua. " +
        "Exemplo: Rua das Flores, 123, Forquilhinha, SC."
      );
    }
  }

  // A API também verifica a localidade
  // retornada pela Geoapify.
  return null;
}

// ==========================================
// FUNÇÕES DE LOCALIZAÇÃO
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

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const rad = (valor) =>
    (valor * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371 *
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
// CONTATO POR WHATSAPP
// ==========================================

function prepararWhatsapp(numero, nome) {
  const telefone = String(numero || "")
    .replace(/\D/g, "");

  if (!/^55\d{10,11}$/.test(telefone)) {
    return null;
  }

  const mensagem =
    "Olá! Encontrei seu contato na Rede de " +
    "Credenciados Synter. Gostaria de solicitar " +
    `informações sobre um atendimento com ${nome}.`;

  return (
    `https://wa.me/${telefone}?text=` +
    encodeURIComponent(mensagem)
  );
}

function gerarLinkMapa(latitude, longitude) {
  return (
    "https://www.google.com/maps/search/?api=1" +
    `&query=${latitude}%2C${longitude}`
  );
}

// ==========================================
// BUSCA DE ENDEREÇO
// ==========================================

async function localizarEndereco(endereco, signal) {
  const resultado = await consultarGeocodificacao({
    endereco,
    signal,
  });

  const local = resultado.results?.[0];

  const latitude = converterNumero(local?.lat);
  const longitude = converterNumero(local?.lon);

  if (!coordenadasValidas(latitude, longitude)) {
    throw new Error(
      "Não encontramos esse endereço. Confira a rua, bairro, cidade e estado."
    );
  }

  const tipoResultado = String(
    local?.result_type || ""
  ).toLowerCase();

  const precisao = local?.rank?.match_type || "";

  const aproximado =
    !["building", "amenity"].includes(tipoResultado) &&
    !["full_match", "match_by_building"].includes(
      precisao
    );

  return {
    latitude,
    longitude,
    enderecoFormatado: local.formatted || endereco,
    aproximado,
  };
}

// ==========================================
// CONSULTAR PROFISSIONAIS NO SUPABASE
// ==========================================

async function carregarCredenciados() {
  // Mantemos o nome da tabela existente.
  const { data, error } = await tecnicosClient
    .from("tecnicos_homologados")
    .select(
      "id,nome,whatsapp,cidade,uf," +
      "especialidades,latitude,longitude," +
      "regiao_atendimento"
    )
    .eq("ativo", true)
    .eq("homologado", true)
    .eq("autorizou_divulgacao", true)
    .order("nome", { ascending: true })
    .limit(1000);

  if (error) {
    console.error(
      "Erro ao consultar credenciados:",
      error
    );

    throw new Error(
      "Não foi possível consultar os profissionais credenciados. Tente novamente."
    );
  }

  return (data || [])
    .map((profissional) => ({
      ...profissional,
      latitude: converterNumero(
        profissional.latitude
      ),
      longitude: converterNumero(
        profissional.longitude
      ),
    }))
    .filter((profissional) =>
      coordenadasValidas(
        profissional.latitude,
        profissional.longitude
      )
    );
}

// ==========================================
// ORDENAR POR PROXIMIDADE
// ==========================================

function localizarCredenciados(
  profissionais,
  localizacao
) {
  const ordenados = profissionais
    .map((profissional) => ({
      ...profissional,
      distancia: calcularDistancia(
        localizacao.latitude,
        localizacao.longitude,
        profissional.latitude,
        profissional.longitude
      ),
    }))
    .sort((a, b) => a.distancia - b.distancia);

  const raioEncontrado =
    RAIOS.find((raio) =>
      ordenados.some(
        (profissional) =>
          profissional.distancia <= raio
      )
    ) || RAIOS[RAIOS.length - 1];

  const encontrados = ordenados
    .filter(
      (profissional) =>
        profissional.distancia <= raioEncontrado
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
  const props = {
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

  const icones = {
    cubo: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="M3 7v10l9 5 9-5V7" />
        <path d="M12 12v10" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    busca: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    escudo: (
      <>
        <path d="M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z" />
        <path d="M8 9c1 4 3 6 7 7l2-2" />
      </>
    ),
    externo: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
      </>
    ),
  };

  return <svg {...props}>{icones[tipo] || null}</svg>;
}

// ==========================================
// CARD DO PROFISSIONAL
// ==========================================

function CardCredenciado({
  profissional,
  posicao,
}) {
  const whatsapp = prepararWhatsapp(
    profissional.whatsapp,
    profissional.nome
  );

  const especialidades = Array.isArray(
    profissional.especialidades
  )
    ? profissional.especialidades
    : [];

  return (
    <article className="th-card">

      <div className="th-card-top">
        <div className="th-card-avatar">
          <Icone tipo="escudo" tamanho={27} />
        </div>

        <div className="th-card-info">
          <div className="th-card-tag">
            PROFISSIONAL CREDENCIADO
          </div>

          <h3>{profissional.nome}</h3>
          <p>
            {profissional.cidade} / {profissional.uf}
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
          especialidades.map((item, indice) => (
            <span key={`${item}-${indice}`}>
              {item}
            </span>
          ))
        ) : (
          <span>
            Serviços conforme disponibilidade
          </span>
        )}
      </div>

      <div className="th-card-distance">
        <Icone tipo="pin" tamanho={17} />

        <span>
          Aproximadamente{" "}
          <strong>
            {formatarDistancia(
              profissional.distancia
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
            <Icone tipo="whatsapp" tamanho={18} />
            Conversar no WhatsApp
          </a>
        ) : (
          <span className="th-contact-unavailable">
            Contato indisponível
          </span>
        )}

        <a
          href={gerarLinkMapa(
            profissional.latitude,
            profissional.longitude
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="th-button th-button-secondary"
        >
          <Icone tipo="externo" tamanho={17} />
          Ver região no mapa
        </a>
      </div>
    </article>
  );
}

// ==========================================
// PÁGINA REDE DE CREDENCIADOS
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

  const [pesquisaConcluida, setPesquisaConcluida] =
    useState(false);

  const [podeGerenciar, setPodeGerenciar] =
    useState(false);

  const controladorRef = useRef(null);

  // ========================================
  // LIMPEZA DAS REQUISIÇÕES
  // ========================================

  useEffect(() => {
    return () => {
      controladorRef.current?.abort();
    };
  }, []);

  // ========================================
  // VERIFICAR PERMISSÃO ADM
  // ========================================

  useEffect(() => {
    let montado = true;

    async function verificarPermissao() {
      try {
        const {
          data,
          error: erroUsuario,
        } = await tecnicosClient.auth.getUser();

        if (erroUsuario || !data?.user) {
          return;
        }

        const {
          data: permitido,
          error,
        } = await tecnicosClient.rpc(
          "pode_gerenciar_tecnicos"
        );

        if (montado && !error) {
          setPodeGerenciar(permitido === true);
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
  // BUSCA POR ENDEREÇO
  // ========================================

  async function buscarCredenciados(evento) {
    evento.preventDefault();

    if (pesquisando) {
      return;
    }

    const enderecoInformado = endereco.trim();

    const erroValidacao =
      validarEnderecoPesquisa(enderecoInformado);

    if (erroValidacao) {
      setErro(erroValidacao);
      setResultados([]);
      setLocalizacao(null);
      setPesquisaConcluida(false);
      return;
    }

    controladorRef.current?.abort();

    const controlador = new AbortController();
    controladorRef.current = controlador;

    setPesquisando(true);
    setErro("");
    setResultados([]);
    setLocalizacao(null);
    setPesquisaConcluida(false);

    try {
      const [local, profissionais] =
        await Promise.all([
          localizarEndereco(
            enderecoInformado,
            controlador.signal
          ),
          carregarCredenciados(),
        ]);

      if (controlador.signal.aborted) {
        return;
      }

      const consulta = localizarCredenciados(
        profissionais,
        local
      );

      setLocalizacao(local);
      setResultados(consulta.encontrados);
      setRaio(consulta.raioEncontrado);
      setPesquisaConcluida(true);
    } catch (falha) {
      if (controlador.signal.aborted) {
        return;
      }

      setErro(
        falha?.message ||
          "Não foi possível concluir a busca. Tente novamente."
      );
    } finally {
      if (!controlador.signal.aborted) {
        setPesquisando(false);
      }
    }
  }

  return (
    <div className="th-page">
      <Header />

      {/* HERO */}

      <section className="th-hero">
        <div className="th-container th-hero-inner">

          <div className="th-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="th-eyebrow">
            <Icone tipo="cubo" tamanho={24} />
            <span>REDE DE CREDENCIADOS SYNTER</span>
          </div>

          <h1>Rede de Credenciados</h1>

          <p>
            Localize profissionais credenciados pela
            Synter próximos ao endereço da instalação
            e escolha com quem deseja entrar em contato.
          </p>
        </div>
      </section>

      {/* PESQUISA */}

      <main className="th-container th-main">
        <div className="th-section-heading">
          <span className="th-section-bar" />

          <div>
            <h2>ENCONTRE UM CREDENCIADO</h2>

            <p>
              Informe a cidade ou um endereço completo
              para encontrar os profissionais mais próximos.
            </p>
          </div>
        </div>

        {/* GERENCIAMENTO EXCLUSIVO ADM */}

        {podeGerenciar && (
          <div style={{ marginBottom: 22 }}>
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
                border: "1px solid #ffffff",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Gerenciar Credenciados
            </Link>
          </div>
        )}

        {/* FORMULÁRIO */}

        <form
          className="th-search-card"
          onSubmit={buscarCredenciados}
        >
          <label htmlFor="endereco-tecnico">
            Endereço da instalação
          </label>

          <div className="th-search-row">
            <div className="th-input-wrapper">
              <Icone tipo="pin" tamanho={21} />

              <input
                id="endereco-tecnico"
                type="text"
                value={endereco}
                onChange={(evento) => {
                  setEndereco(evento.target.value);

                  if (erro) {
                    setErro("");
                  }
                }}
                placeholder="Cidade ou Bairro/Rua, Cidade, UF"
                autoComplete="street-address"
                maxLength={240}
                aria-invalid={Boolean(erro)}
                aria-describedby="th-instrucoes"
                required
              />
            </div>

            <button
              type="submit"
              className="th-search-button"
              disabled={pesquisando}
            >
              <Icone tipo="busca" tamanho={19} />

              {pesquisando
                ? "Localizando..."
                : "Encontrar credenciados"}
            </button>
          </div>

          <p
            id="th-instrucoes"
            className="th-search-help"
          >
            Você pode pesquisar somente pela cidade.
            Para pesquisar por bairro ou rua, informe
            obrigatoriamente o nome da cidade.
            Exemplo: Bairro Santa Ana, Forquilhinha, SC.
          </p>
        </form>

        {/* MENSAGENS */}

        {erro && (
          <div className="th-message" role="alert">
            <strong>
              Verifique a localização informada
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
                    ? "Nenhum credenciado encontrado"
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
                <Icone tipo="pin" tamanho={19} />

                <span>
                  Busca realizada para:{" "}
                  <strong>
                    {localizacao.enderecoFormatado}
                  </strong>
                </span>
              </div>
            )}

            {localizacao?.aproximado && (
              <p className="th-precision-note">
                A localização foi identificada
                aproximadamente. Confira o endereço
                antes de entrar em contato.
              </p>
            )}

            {resultados.length > 0 ? (
              <div className="th-grid">
                {resultados.map(
                  (profissional, indice) => (
                    <CardCredenciado
                      key={profissional.id}
                      profissional={profissional}
                      posicao={indice}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="th-empty">
                <Icone tipo="pin" tamanho={35} />

                <h3>
                  Ainda não encontramos profissionais
                  credenciados nessa região.
                </h3>

                <p>
                  Tente outro endereço próximo ou
                  entre em contato com a Synter
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
              <Icone tipo="escudo" tamanho={20} />

              <p>
                As distâncias são estimativas em linha
                reta, não tempos de viagem. O
                credenciamento não representa
                confirmação de disponibilidade, preço
                ou agendamento. Confirme diretamente
                com o profissional.
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
