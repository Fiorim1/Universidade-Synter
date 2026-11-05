
import { useEffect, useState } from "react";

import Header from "../components/Header";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import CardsDashboard from "../components/CardsDashboard";
import Footer from "../components/Footer";

import "../styles/Manuals.css";
import "../styles/FichaTecHero.css";

// ==========================================
// IMAGENS — PRODUTOS DIGITAIS
// ==========================================

import VENUSS2 from "../assets/venuss2pro.png";
import VENUS3 from "../assets/venuss3.png";
import VEGAFACEID from "../assets/vegafaceid.png";
import SYRIUSS3PRO from "../assets/syriuss3pro.png";
import SYRIUSS3MAX from "../assets/syriuss3max.png";
import SYRIUSS2PRONEO from "../assets/syriuss2proneo.png";
import LYRAPRO from "../assets/lyrapro.png";
import ERISS2FACEID from "../assets/eriss2faceid.png";
import S2QR from "../assets/s2qr.png";
import S2PRO from "../assets/s2pro.png";
import S2FACEID from "../assets/s2faceid.png";
import MARSIMG from "../assets/mars.png";
import NEXUSIMG from "../assets/nexuss1.png";
import SYRIUSS2PRO from "../assets/SYRIUSS2PRO.png";
import SYRIUSS1 from "../assets/syriuss1.png";
import SYRIUSS2MAX from "../assets/syriuss2max.png";
import DALASS2PRO from "../assets/dallas2pro.png";
import DALASS3PRO from "../assets/dallass3pro.png";
import DOMOUSS1 from "../assets/domuss1.png";

// ==========================================
// IMAGENS — PRODUTOS MECÂNICOS
// ==========================================

import STILLUS from "../assets/stillus.png";
import STARMAX from "../assets/starmax.png";
import STAR from "../assets/star.png";
import POLOMAX from "../assets/polomax.png";
import OLYMPIA from "../assets/olympia.png";
import NAVISII from "../assets/navisii.png";
import NAVIS from "../assets/navis.png";
import MARINEII from "../assets/marineii.png";
import MARINE from "../assets/marine.png";
import LUCK from "../assets/luck.png";
import GOL from "../assets/gol.png";
import GLORIAN from "../assets/glorian.png";
import CRISPUSMAX from "../assets/crispusmax.png";
import CHAMPION from "../assets/champion.png";
import CECI from "../assets/ceci.png";
import ACQUAMAX from "../assets/acquamax.png";
import BARRAAPOIO from "../assets/barraapoio.png";
import FECPCORRER from "../assets/fecpcorrer.png";
import FECIPCORRER from "../assets/fecipcorrer.png";
import FECPC from "../assets/fecpc.png";
import CHAVED from "../assets/chaved.png";
import FECROLETE from "../assets/fecrolete.png";

// ==========================================
// IMAGENS — FERRAGENS
// ==========================================

import F1 from "../assets/f1.png";
import F2 from "../assets/f2.png";
import F3 from "../assets/f3.png";
import F4 from "../assets/f4.png";
import F5 from "../assets/f5.png";
import F6 from "../assets/f6.png";
import F7 from "../assets/f7.png";
import F8 from "../assets/f8.png";
import F9 from "../assets/f9.png";
import F10 from "../assets/f10.png";
import F11 from "../assets/f11.png";
import F12 from "../assets/f12.png";
import F13 from "../assets/f13.png";
import F14 from "../assets/f14.png";
import F15 from "../assets/f15.png";
import F16 from "../assets/f16.png";
import F17 from "../assets/f17.png";
import F18 from "../assets/f18.png";
import F19 from "../assets/f19.png";
import F20 from "../assets/f20.png";
import F21 from "../assets/f21.png";
import F22 from "../assets/f22.png";
import F23 from "../assets/f23.png";
import F24 from "../assets/f24.png";
import F25 from "../assets/f25.png";
import F26 from "../assets/f26.png";
import F27 from "../assets/f27.png";
import F28 from "../assets/f28.png";

// ==========================================
// FICHAS TÉCNICAS — NAVIS
// ==========================================

import navisPdf0155 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_01_55mm.pdf";
import navisPdf0440 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_40mm.pdf";
import navisPdf0455 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_55mm.pdf";
import navisPdf0740 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_40mm.pdf";
import navisPdf0755 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_55mm.pdf";
import navisPdf0955 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_09_55mm.pdf";

// ==========================================
// FICHAS TÉCNICAS — GLORIAN
// ==========================================

import glorianPdf0155 from "../assets/fichas-tecnicas/glorian/FT_Glorian_Roseta_01_55mm.pdf";
import glorianPdf0440 from "../assets/fichas-tecnicas/glorian/FT_Glorian_Roseta_04_40mm.pdf";
import glorianPdf0455 from "../assets/fichas-tecnicas/glorian/FT_Glorian_Roseta_04_55mm.pdf";

// ==========================================
// FICHAS TÉCNICAS — GOL
// ==========================================

import golEspelho0540 from "../assets/fichas-tecnicas/gol/FT_Gol_Espelho_05_40mm.pdf";
import golRoseta0440 from "../assets/fichas-tecnicas/gol/FT_Gol_Roseta_04_40mm.pdf";
import golRoseta0640 from "../assets/fichas-tecnicas/gol/FT_Gol_Roseta_06_40mm.pdf";

// ==========================================
// MAPEAMENTO DOS PDFS
// ==========================================

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

const FICHAS_GLORIAN = {
  "01": {
    "55": glorianPdf0155,
  },
  "04": {
    "40": glorianPdf0440,
    "55": glorianPdf0455,
  },
};

const FICHAS_GOL = {
  "Espelho 05": {
    "40": golEspelho0540,
  },
  "Roseta 04": {
    "40": golRoseta0440,
  },
  "Roseta 06": {
    "40": golRoseta0640,
  },
};

// ==========================================
// LISTAS DE PRODUTOS
// ==========================================

const PRODUTOS_DIGITAIS = [
  { image: VENUS3, title: "Venus S3 PRO" },
  { image: VENUSS2, title: "Venus S2 PRO" },
  { image: SYRIUSS1, title: "Syrius S1" },
  { image: SYRIUSS1, title: "Syrius S1 Pro" },

  { image: SYRIUSS2PRO, title: "Syrius S2 Pro" },
  { image: SYRIUSS2PRONEO, title: "Syrius S2 Pro Neo" },
  { image: SYRIUSS2MAX, title: "Syrius S2 Max" },
  { image: SYRIUSS3PRO, title: "Syrius S3 Pro" },

  { image: SYRIUSS3MAX, title: "Syrius S3 Max" },
  { image: ERISS2FACEID, title: "Eris S2 Face Id" },
  { image: VEGAFACEID, title: "Vega Face Id" },
  { image: MARSIMG, title: "Mars S2 Pro" },

  { image: NEXUSIMG, title: "Nexus S1" },
  { image: NEXUSIMG, title: "Nexus S1 Pro" },
  { image: DALASS2PRO, title: "Dallas S2 Pro" },
  { image: DALASS3PRO, title: "Dallas S3 Pro" },

  { image: DOMOUSS1, title: "Domus S1" },
  { image: DOMOUSS1, title: "Domus S1 Pro" },
  { image: LYRAPRO, title: "Lyra Pro" },
  { image: S2PRO, title: "Controladora de Acesso S2 Pro" },

  { image: S2QR, title: "Controladora de Acesso S2 QR" },
  {
    image: S2FACEID,
    title: "Controladora de Acesso S2 Face Id",
  },
];

const PRODUTOS_MECANICOS = [
  { image: STILLUS, title: "Stillus" },
  { image: STARMAX, title: "Star Max" },
  { image: STAR, title: "Star" },
  { image: POLOMAX, title: "Polo Max" },

  { image: OLYMPIA, title: "Olympia" },
  { image: NAVISII, title: "Navis II" },
  {
    image: NAVIS,
    title: "Navis",
    ficha: "navis",
  },
  { image: MARINEII, title: "Marine II" },

  { image: MARINE, title: "Marine" },
  { image: LUCK, title: "Luck" },
  {
    image: GOL,
    title: "Gol",
    ficha: "gol",
  },
  {
    image: GLORIAN,
    title: "Glorian",
    ficha: "glorian",
  },

  { image: CRISPUSMAX, title: "Crispus Max" },
  { image: CHAMPION, title: "Champion" },
  { image: CECI, title: "Ceci" },
  { image: ACQUAMAX, title: "Acqua Max" },

  { image: BARRAAPOIO, title: "Barra de Apoio" },
  {
    image: FECPCORRER,
    title: "Fechadura de Banheiro para Porta de Correr",
  },
  {
    image: FECIPCORRER,
    title: "Fechadura Interna para Porta de Correr",
  },
  {
    image: FECPC,
    title: "Fechadura para Porta de Correr",
  },

  {
    image: CHAVED,
    title: "Fechadura Porta de Correr c/ Chave Dobrável e Concha",
  },
  { image: FECROLETE, title: "Fechadura Rolete" },
];

const FERRAGENS = [
  {
    image: F1,
    title: "Prendedor para Porta Magnético (fixação no piso)",
  },
  {
    image: F2,
    title: "Prendedor para Porta Magnético (fixação no piso ou parede)",
  },
  { image: F3, title: "Porta Cadeado" },
  { image: F4, title: "Números (fixação com parafuso)" },

  { image: F5, title: "Números (fixação com dupla face)" },
  { image: F6, title: "Levantador de Guilhotina" },
  { image: F7, title: "Gancho de Rede" },
  { image: F8, title: "Fecho Porta Cadeado" },

  { image: F9, title: "Fecho Pino Bola" },
  { image: F10, title: "Fecho para Janela de Correr" },
  { image: F11, title: "Fecho Fio Redondo" },
  { image: F12, title: "Fecho Fio Chato" },

  { image: F13, title: "Fecho Concha Trava" },
  { image: F14, title: "Cremona" },
  { image: F15, title: "Concha Stand com Furo" },
  { image: F16, title: "Concha Stand" },

  { image: F17, title: "Borboleta para Guilhotina" },
  {
    image: F18,
    title: "Amortecedor de Porta (fixação no piso)",
  },
  { image: F19, title: "Alça" },
  { image: F20, title: "Quartzo" },

  { image: F21, title: "Opala" },
  { image: F22, title: "Jaspe (com furo)" },
  { image: F23, title: "Jaspe" },
  { image: F24, title: "Jade Max" },

  { image: F25, title: "Jade" },
  { image: F26, title: "Vara de Cremona" },
  { image: F27, title: "Tarjeta" },
  { image: F28, title: "Prendedor para Veneziana" },
];

// ==========================================
// AGRUPAR 4 PRODUTOS POR LINHA
// ==========================================

function agruparEmLinhas(produtos, quantidade = 4) {
  const linhas = [];

  for (let indice = 0; indice < produtos.length; indice += quantidade) {
    linhas.push(produtos.slice(indice, indice + quantidade));
  }

  return linhas;
}

// ==========================================
// ÍCONE DE SETA
// ==========================================

function IconeSeta() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="m12 8 4 4-4 4" />
    </svg>
  );
}

// ==========================================
// CARD DE FICHA DISPONÍVEL
// ==========================================

function CartaoFichaDisponivel({ produto, onClick }) {
  return (
    <button
      type="button"
      className="cads-container"
      onClick={onClick}
      aria-label={`Selecionar ficha técnica ${produto.title}`}
      title={`Ver fichas técnicas de ${produto.title}`}
    >
      <div className="card-image">
        <img
          src={produto.image}
          alt=""
          loading="lazy"
        />
      </div>

      <div className="content-text-cards">
        <h3>{produto.title}</h3>
        <p>Selecione a ficha técnica desejada</p>
      </div>

      <span className="card-arrow" aria-hidden="true">
        <IconeSeta />
      </span>
    </button>
  );
}

// ==========================================
// SEÇÃO DOS PRODUTOS
// ==========================================

function SecaoProdutos({
  titulo,
  classe,
  produtos,
  abrirFicha,
}) {
  const linhas = agruparEmLinhas(produtos);

  return (
    <div className={classe}>
      <div className="title">
        <h4>{titulo}</h4>
      </div>

      <div className="line" />

      <div className="cards-manuals">
        {linhas.map((linha, indiceLinha) => (
          <div
            key={`${classe}-${indiceLinha}`}
            className={`cards-manuals-${indiceLinha + 1}`}
          >
            {linha.map((produto) =>
              produto.ficha ? (
                <CartaoFichaDisponivel
                  key={produto.title}
                  produto={produto}
                  onClick={() =>
                    abrirFicha(produto.ficha)
                  }
                />
              ) : (
                <CardsDashboard
                  key={produto.title}
                  image={produto.image}
                  title={produto.title}
                  desc="Ficha técnica em breve"
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MODAL DE SELEÇÃO DE FICHA TÉCNICA
// ==========================================

function ModalFichaTecnica({
  modelo,
  fichas,
  onClose,
}) {
  const [acabamento, setAcabamento] = useState("");
  const [maquina, setMaquina] = useState("");

  const pdfSelecionado =
    fichas[acabamento]?.[maquina] || null;

  const nomeArquivo =
    `FT_${modelo}_${acabamento}_${maquina}mm.pdf`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

  useEffect(() => {
    function fecharComEsc(evento) {
      if (evento.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", fecharComEsc);

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEsc
      );

      document.body.style.overflow =
        overflowAnterior;
    };
  }, [onClose]);

  const estiloCampo = {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    background: "#191919",
    color: "#ffffff",
    border: "1px solid #444444",
    borderRadius: 9,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const estiloBotao = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 44,
    padding: "12px 14px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  return (
    <div
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,.8)",
        backdropFilter: "blur(7px)",
        overflowY: "auto",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Selecionar ficha técnica ${modelo}`}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          maxHeight: "calc(100dvh - 40px)",
          overflowY: "auto",
          margin: "auto",
          padding: 28,
          background: "#101010",
          color: "#ffffff",
          border: "1px solid #333333",
          borderRadius: 16,
          boxShadow: "0 20px 70px rgba(0,0,0,.55)",
          boxSizing: "border-box",
        }}
      >
        {/* CABEÇALHO */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
          }}
        >
          <div>
            <span
              style={{
                color: "#999999",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              UNIVERSIDADE SYNTER
            </span>

            <h2
              style={{
                margin: "9px 0 0",
                fontSize: 23,
                fontWeight: 750,
                lineHeight: 1.25,
              }}
            >
              Ficha Técnica — {modelo}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar seleção"
            style={{
              flex: "0 0 34px",
              width: 34,
              height: 34,
              background: "#1e1e1e",
              color: "#ffffff",
              border: "1px solid #393939",
              borderRadius: 9,
              fontSize: 23,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <p
          style={{
            margin: "16px 0 24px",
            color: "#aaaaaa",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          Selecione a configuração desejada para
          visualizar ou baixar a ficha técnica em PDF.
        </p>

        {/* TIPO DE ROSETA / ESPELHO */}

        <label
          htmlFor="ficha-tipo"
          style={{
            display: "block",
            marginBottom: 9,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {modelo === "Gol"
            ? "Tipo de acabamento"
            : "Tipo de roseta"}
        </label>

        <select
          id="ficha-tipo"
          value={acabamento}
          onChange={(evento) => {
            setAcabamento(evento.target.value);
            setMaquina("");
          }}
          style={{
            ...estiloCampo,
            marginBottom: 20,
          }}
        >
          <option value="">
            Selecione uma opção
          </option>

          {Object.keys(fichas).map((tipo) => (
            <option key={tipo} value={tipo}>
              {modelo === "Gol"
                ? tipo
                : `Roseta ${tipo}`}
            </option>
          ))}
        </select>

        {/* TAMANHO DA MÁQUINA */}

        <label
          htmlFor="ficha-maquina"
          style={{
            display: "block",
            marginBottom: 9,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Tamanho da máquina
        </label>

        <select
          id="ficha-maquina"
          value={maquina}
          disabled={!acabamento}
          onChange={(evento) =>
            setMaquina(evento.target.value)
          }
          style={{
            ...estiloCampo,
            marginBottom: 24,
            opacity: acabamento ? 1 : 0.55,
            cursor: acabamento
              ? "pointer"
              : "not-allowed",
          }}
        >
          <option value="">
            Selecione o tamanho
          </option>

          {Object.keys(
            fichas[acabamento] || {}
          ).map((tamanho) => (
            <option
              key={tamanho}
              value={tamanho}
            >
              {tamanho} mm
            </option>
          ))}
        </select>

        {/* BOTÕES DE PDF */}

        {pdfSelecionado ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
            }}
          >
            <a
              href={pdfSelecionado}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...estiloBotao,
                color: "#111111",
                background: "#ffffff",
                border: "1px solid #ffffff",
              }}
            >
              Visualizar ficha técnica
            </a>

            <a
              href={pdfSelecionado}
              download={nomeArquivo}
              style={{
                ...estiloBotao,
                color: "#ffffff",
                background: "#202020",
                border: "1px solid #444444",
              }}
            >
              Baixar ficha técnica (PDF)
            </a>

            <p
              style={{
                margin: "4px 0 0",
                color: "#999999",
                fontSize: 11,
                textAlign: "center",
              }}
            >
              {modelo} —{" "}
              {modelo === "Gol"
                ? acabamento
                : `Roseta ${acabamento}`}
              {" • "}
              {maquina} mm
            </p>
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              color: "#aaaaaa",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Selecione as opções acima para liberar
            a visualização e o download do documento.
          </p>
        )}
      </section>
    </div>
  );
}

// ==========================================
// HERO — ÍCONE
// ==========================================

function IconeSynter() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

function FichaTec() {
  const [profileOpen, setProfileOpen] =
    useState(false);

  const [modalSelecionado, setModalSelecionado] =
    useState(null);

  function abrirFicha(modelo) {
    setModalSelecionado(modelo);
  }

  function fecharFicha() {
    setModalSelecionado(null);
  }

  const configuracoes = {
    navis: {
      modelo: "Navis",
      fichas: FICHAS_NAVIS,
    },
    glorian: {
      modelo: "Glorian",
      fichas: FICHAS_GLORIAN,
    },
    gol: {
      modelo: "Gol",
      fichas: FICHAS_GOL,
    },
  };

  const configuracaoAtiva =
    configuracoes[modalSelecionado] || null;

  return (
    <>
      <Header />

      {/* =====================================
          HERO — PADRÃO UNIVERSIDADE SYNTER
      ===================================== */}

      <section className="ficha-tec-hero">
        <div className="ficha-tec-hero-container">
          <div className="ficha-tec-profile">
            <UserProfileButton
              onClick={() =>
                setProfileOpen(true)
              }
            />
          </div>

          <div className="ficha-tec-hero-content">
            <div className="ficha-tec-eyebrow">
              <IconeSynter />

              <span>
                CENTRAL DE DOCUMENTAÇÃO
              </span>
            </div>

            <h1 className="ficha-tec-title">
              Fichas Técnicas
            </h1>

            <p className="ficha-tec-description">
              Consulte e baixe as fichas técnicas e
              especificações dos produtos Synter.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main>
        <div className="manuals-container">

          {/* PRODUTOS DIGITAIS */}

          <SecaoProdutos
            titulo="Produtos Digitais"
            classe="digials-products"
            produtos={PRODUTOS_DIGITAIS}
            abrirFicha={abrirFicha}
          />

          {/* PRODUTOS MECÂNICOS */}

          <SecaoProdutos
            titulo="Produtos Mecânicos"
            classe="mechanical-products"
            produtos={PRODUTOS_MECANICOS}
            abrirFicha={abrirFicha}
          />

          {/* FERRAGENS */}

          <SecaoProdutos
            titulo="Ferragens"
            classe="ironwork"
            produtos={FERRAGENS}
            abrirFicha={abrirFicha}
          />

        </div>
      </main>

      <Footer />

      {/* =====================================
          MODAL DAS FICHAS TÉCNICAS
      ===================================== */}

      {configuracaoAtiva && (
        <ModalFichaTecnica
          key={modalSelecionado}
          modelo={configuracaoAtiva.modelo}
          fichas={configuracaoAtiva.fichas}
          onClose={fecharFicha}
        />
      )}

      {/* PERFIL */}

      {profileOpen && (
        <Profile
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </>
  );
}

export default FichaTec;