
import { useEffect, useState } from "react";

import Header from "../components/Header";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

import "../styles/Manuals.css";

// ======================================================
// FICHAS TÉCNICAS — NAVIS
// ======================================================

import navisPdf0155 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_01_55mm.pdf";
import navisPdf0440 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_40mm.pdf";
import navisPdf0455 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_55mm.pdf";
import navisPdf0740 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_40mm.pdf";
import navisPdf0755 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_55mm.pdf";
import navisPdf0955 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_09_55mm.pdf";

const FICHAS_NAVIS = {
  "01": {
    "55": navisPdf0155,
  },
  "04": {
    "40": navisPdf0440,
    "55": navisPdf0455,
  },
  "07": {
    "40": navisPdf0740,
    "55": navisPdf0755,
  },
  "09": {
    "55": navisPdf0955,
  },
};

// ======================================================
// IMAGENS EXISTENTES DO PROJETO
// Não importa nenhum manual.
// ======================================================

const imagensAssets = import.meta.glob("../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

function imagemProduto(arquivo) {
  return imagensAssets[`../assets/${arquivo}`] || "";
}

// ======================================================
// CATÁLOGO DE PRODUTOS
// As fichas ainda não cadastradas não abrem manuais.
// ======================================================

const PRODUTOS_DIGITAIS = [
  ["Venus S3 PRO", "venuss3.png"],
  ["Venus S2 PRO", "venuss2pro.png"],
  ["Syrius S1", "syriuss1.png"],
  ["Syrius S1 Pro", "syriuss1.png"],
  ["Syrius S2 Pro", "SYRIUSS2PRO.png"],
  ["Syrius S2 Pro Neo", "syriuss2proneo.png"],
  ["Syrius S2 Max", "syriuss2max.png"],
  ["Syrius S3 Pro", "syriuss3pro.png"],
  ["Syrius S3 Max", "syriuss3max.png"],
  ["Eris S2 Face Id", "eriss2faceid.png"],
  ["Vega Face Id", "vegafaceid.png"],
  ["Mars S2 Pro", "mars.png"],
  ["Nexus S1", "nexuss1.png"],
  ["Nexus S1 Pro", "nexuss1.png"],
  ["Dallas S2 Pro", "dallas2pro.png"],
  ["Dallas S3 Pro", "dallass3pro.png"],
  ["Domus S1", "domuss1.png"],
  ["Domus S1 Pro", "domuss1.png"],
  ["Lyra Pro", "lyrapro.png"],
  ["Controladora de Acesso S2 Pro", "s2pro.png"],
  ["Controladora de Acesso S2 QR", "s2qr.png"],
  ["Controladora de Acesso S2 Face Id", "s2faceid.png"],
];

const PRODUTOS_MECANICOS = [
  ["Stillus", "stillus.png"],
  ["Star Max", "starmax.png"],
  ["Star", "star.png"],
  ["Polo Max", "polomax.png"],
  ["Olympia", "olympia.png"],
  ["Navis II", "navisii.png"],
  ["Navis", "navis.png"],
  ["Marine II", "marineii.png"],
  ["Marine", "marine.png"],
  ["Luck", "luck.png"],
  ["Gol", "gol.png"],
  ["Glorian", "glorian.png"],
  ["Crispus Max", "crispusmax.png"],
  ["Champion", "champion.png"],
  ["Ceci", "ceci.png"],
  ["Acqua Max", "acquamax.png"],
  ["Barra de Apoio", "barraapoio.png"],
  [
    "Fechadura de Banheiro para Porta de Correr",
    "fecpcorrer.png",
  ],
  [
    "Fechadura Interna para Porta de Correr",
    "fecipcorrer.png",
  ],
  ["Fechadura para Porta de Correr", "fecpc.png"],
  [
    "Fechadura Porta de Correr c/ Chave Dobrável e Concha",
    "chaved.png",
  ],
  ["Fechadura Rolete", "fecrolete.png"],
];

const PRODUTOS_FERRAGENS = [
  ["Prendedor para Porta Magnético (fixação no piso)", "f1.png"],
  [
    "Prendedor para Porta Magnético (fixação no piso ou parede)",
    "f2.png",
  ],
  ["Porta Cadeado", "f3.png"],
  ["Números (fixação com parafuso)", "f4.png"],
  ["Números (fixação com dupla face)", "f5.png"],
  ["Levantador de Guilhotina", "f6.png"],
  ["Gancho de Rede", "f7.png"],
  ["Fecho Porta Cadeado", "f8.png"],
  ["Fecho Pino Bola", "f9.png"],
  ["Fecho para Janela de Correr", "f10.png"],
  ["Fecho Fio Redondo", "f11.png"],
  ["Fecho Fio Chato", "f12.png"],
  ["Fecho Concha Trava", "f13.png"],
  ["Cremona", "f14.png"],
  ["Concha Stand com Furo", "f15.png"],
  ["Concha Stand", "f16.png"],
  ["Borboleta para Guilhotina", "f17.png"],
  ["Amortecedor de Porta (fixação no piso)", "f18.png"],
  ["Alça", "f19.png"],
  ["Quartzo", "f20.png"],
  ["Opala", "f21.png"],
  ["Jaspe (com furo)", "f22.png"],
  ["Jaspe", "f23.png"],
  ["Jade Max", "f24.png"],
  ["Jade", "f25.png"],
  ["Vara de Cremona", "f26.png"],
  ["Tarjeta", "f27.png"],
  ["Prendedor para Veneziana", "f28.png"],
];

// ======================================================
// ESTILOS DOS CARDS
// ======================================================

const estiloGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 18,
  paddingTop: 16,
  paddingBottom: 22,
};

const estiloCard = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  minHeight: 260,
  padding: 20,
  border: "1px solid #e3e5e8",
  borderRadius: 14,
  background: "#fff",
  color: "#202020",
  textAlign: "center",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
};

const estiloImagem = {
  width: "100%",
  height: 130,
  objectFit: "contain",
};

const estiloSelect = {
  display: "block",
  width: "100%",
  padding: "13px 12px",
  border: "1px solid #ccd0d5",
  borderRadius: 8,
  background: "#fff",
  color: "#222",
  fontSize: 14,
};

const estiloLabel = {
  display: "block",
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
};

// ======================================================
// CARD DE FICHA TÉCNICA
// ======================================================

function CardFicha({ nome, arquivo, disponivel, onAbrir }) {
  const imagem = imagemProduto(arquivo);

  const conteudo = (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        {imagem ? (
          <img
            src={imagem}
            alt={nome}
            style={estiloImagem}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              height: 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Imagem indisponível
          </div>
        )}
      </div>

      <strong
        style={{
          fontSize: 15,
          lineHeight: 1.4,
        }}
      >
        {nome}
      </strong>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: disponivel ? "#167144" : "#858585",
        }}
      >
        {disponivel
          ? "Selecionar ficha técnica"
          : "Ficha técnica em breve"}
      </span>
    </>
  );

  if (disponivel) {
    return (
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Acessar fichas técnicas de ${nome}`}
        style={{
          ...estiloCard,
          cursor: "pointer",
          borderColor: "#c6dfd1",
        }}
      >
        {conteudo}
      </button>
    );
  }

  return (
    <div
      style={estiloCard}
      aria-label={`${nome}: ficha técnica ainda não disponível`}
    >
      {conteudo}
    </div>
  );
}

// ======================================================
// SEÇÃO DE PRODUTOS
// ======================================================

function SecaoFichas({ titulo, produtos, onAbrirNavis }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div className="title">
        <h4>{titulo}</h4>
      </div>

      <div className="line"></div>

      <div style={estiloGrid}>
        {produtos.map(([nome, arquivo]) => {
          const disponivel = nome === "Navis";

          return (
            <CardFicha
              key={nome}
              nome={nome}
              arquivo={arquivo}
              disponivel={disponivel}
              onAbrir={
                disponivel ? onAbrirNavis : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}

// ======================================================
// PÁGINA PRINCIPAL
// ======================================================

function FichaTec() {
  const [profileOpen, setProfileOpen] = useState(false);

  const [navisModalOpen, setNavisModalOpen] = useState(false);
  const [navisRoseta, setNavisRoseta] = useState("");
  const [navisMaquina, setNavisMaquina] = useState("");

  const navisPdfSelecionado =
    FICHAS_NAVIS[navisRoseta]?.[navisMaquina] || null;

  function abrirFichasNavis() {
    setNavisRoseta("");
    setNavisMaquina("");
    setNavisModalOpen(true);
  }

  function fecharFichasNavis() {
    setNavisModalOpen(false);
    setNavisRoseta("");
    setNavisMaquina("");
  }

  useEffect(() => {
    if (!navisModalOpen) return undefined;

    function aoPressionarTecla(event) {
      if (event.key === "Escape") {
        fecharFichasNavis();
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);

    return () => {
      window.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [navisModalOpen]);

  return (
    <>
      <Header />

      {/* ===========================================
          CABEÇALHO
      =========================================== */}

      <section className="videos-hero-area">
        <div className="videos-profile">
          <UserProfileButton
            onClick={() => setProfileOpen(true)}
          />
        </div>

        <div className="videos-hero-content">
          <Hero
            variant="dashboard"
            one="Central de Documentação"
            two="Fichas Técnicas"
            three="Consulte as especificações técnicas, referências, características e aplicações dos produtos Synter."
          />
        </div>
      </section>

      {/* ===========================================
          CATÁLOGO DE FICHAS TÉCNICAS
      =========================================== */}

      <main className="manuals-container">
        <SecaoFichas
          titulo="Produtos Digitais"
          produtos={PRODUTOS_DIGITAIS}
        />

        <SecaoFichas
          titulo="Produtos Mecânicos"
          produtos={PRODUTOS_MECANICOS}
          onAbrirNavis={abrirFichasNavis}
        />

        <SecaoFichas
          titulo="Ferragens"
          produtos={PRODUTOS_FERRAGENS}
        />
      </main>

      <Footer />

      {/* ===========================================
          SELETOR DAS FICHAS TÉCNICAS — NAVIS
      =========================================== */}

      {navisModalOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharFichasNavis();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(5px)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-ficha-navis"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: 26,
              borderRadius: 16,
              background: "#fff",
              color: "#202020",
              boxShadow: "0 15px 60px rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h2
                id="titulo-ficha-navis"
                style={{
                  margin: 0,
                  fontSize: 21,
                }}
              >
                Ficha Técnica — Navis
              </h2>

              <button
                type="button"
                onClick={fecharFichasNavis}
                aria-label="Fechar"
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: 26,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                margin: "10px 0 22px",
                color: "#666",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Selecione o modelo de roseta e o tamanho
              da máquina para visualizar a ficha técnica
              correspondente.
            </p>

            {/* ROSETA */}

            <label
              htmlFor="navis-roseta"
              style={estiloLabel}
            >
              1. Tipo de roseta
            </label>

            <select
              id="navis-roseta"
              value={navisRoseta}
              onChange={(event) => {
                setNavisRoseta(event.target.value);
                setNavisMaquina("");
              }}
              style={{
                ...estiloSelect,
                marginBottom: 20,
              }}
            >
              <option value="">
                Selecione a roseta
              </option>

              {Object.keys(FICHAS_NAVIS).map(
                (roseta) => (
                  <option
                    key={roseta}
                    value={roseta}
                  >
                    Roseta {roseta}
                  </option>
                )
              )}
            </select>

            {/* MÁQUINA */}

            <label
              htmlFor="navis-maquina"
              style={estiloLabel}
            >
              2. Tamanho da máquina
            </label>

            <select
              id="navis-maquina"
              value={navisMaquina}
              disabled={!navisRoseta}
              onChange={(event) =>
                setNavisMaquina(event.target.value)
              }
              style={{
                ...estiloSelect,
                marginBottom: 20,
                opacity: navisRoseta ? 1 : 0.6,
              }}
            >
              <option value="">
                Selecione o tamanho
              </option>

              {Object.keys(
                FICHAS_NAVIS[navisRoseta] || {}
              ).map((mm) => (
                <option key={mm} value={mm}>
                  {mm} mm
                </option>
              ))}
            </select>

            {/* DOCUMENTO */}

            {navisPdfSelecionado ? (
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#167144",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  Ficha técnica disponível:
                  Roseta {navisRoseta} — {navisMaquina} mm
                </p>

                <a
                  href={navisPdfSelecionado}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    padding: 14,
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 8,
                    background: "#161616",
                    color: "#fff",
                  }}
                >
                  Visualizar ficha técnica
                </a>
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#777",
                }}
              >
                Selecione as duas opções para liberar
                o documento correspondente.
              </p>
            )}
          </section>
        </div>
      )}

      {/* ===========================================
          MODAL DE PERFIL
      =========================================== */}

      {profileOpen && (
        <Profile
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

export default FichaTec;
