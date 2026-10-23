import { useEffect, useState } from "react";
import Header from "../components/Header";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import "../styles/FichaTec.css";

import navisPdf0155 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_01_55mm.pdf";
import navisPdf0440 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_40mm.pdf";
import navisPdf0455 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_04_55mm.pdf";
import navisPdf0740 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_40mm.pdf";
import navisPdf0755 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_07_55mm.pdf";
import navisPdf0955 from "../assets/fichas-tecnicas/navis/FT_Navis_Roseta_09_55mm.pdf";

const FICHAS_NAVIS = {
  "01": { "55": navisPdf0155 },
  "04": { "40": navisPdf0440, "55": navisPdf0455 },
  "07": { "40": navisPdf0740, "55": navisPdf0755 },
  "09": { "55": navisPdf0955 },
};

// Reutiliza exatamente as imagens locais que já existem no projeto.
const imagensAssets = import.meta.glob("../assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
function imagemProduto(arquivo) {
  return imagensAssets[`../assets/${arquivo}`] || "";
}

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

function SetaIcone() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 12h9m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardFicha({ nome, arquivo, onAbrir }) {
  const disponivel = Boolean(onAbrir);
  const imagem = imagemProduto(arquivo);
  const interior = (
    <>
      <div className="fichas-card-foto">
        {imagem ? <img src={imagem} alt={nome} loading="lazy" /> : <span>Sem imagem</span>}
      </div>
      <div className="fichas-card-info">
        <h3>{nome}</h3>
        <p>{disponivel ? "Clique para escolher sua ficha técnica" : "Ficha técnica em breve"}</p>
      </div>
      <span className={`fichas-card-seta ${disponivel ? "ativa" : ""}`}><SetaIcone /></span>
    </>
  );
  return disponivel ? (
    <button type="button" className="fichas-card disponivel" onClick={onAbrir} aria-label={`Selecionar ficha técnica de ${nome}`}>
      {interior}
    </button>
  ) : (
    <div className="fichas-card indisponivel" aria-label={`${nome}: ficha técnica em breve`}>
      {interior}
    </div>
  );
}

function SecaoFichas({ titulo, produtos, onAbrirNavis }) {
  return (
    <section className="fichas-grupo">
      <h2 className="fichas-titulo-grupo">{titulo}</h2>
      <div className="fichas-grid">
        {produtos.map(([nome, arquivo]) => (
          <CardFicha key={nome} nome={nome} arquivo={arquivo} onAbrir={nome === "Navis" ? onAbrirNavis : undefined} />
        ))}
      </div>
    </section>
  );
}

function FichaTec() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [navisModalOpen, setNavisModalOpen] = useState(false);
  const [navisRoseta, setNavisRoseta] = useState("");
  const [navisMaquina, setNavisMaquina] = useState("");
  const navisPdfSelecionado = FICHAS_NAVIS[navisRoseta]?.[navisMaquina] || null;

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
    const aoTeclar = (event) => {
      if (event.key === "Escape") fecharFichasNavis();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [navisModalOpen]);

  return (
    <div className="fichas-page">
      <Header />
      <section className="fichas-hero videos-hero-area">
        <div className="videos-profile fichas-perfil">
          <UserProfileButton onClick={() => setProfileOpen(true)} />
        </div>
        <div className="videos-hero-content fichas-hero-conteudo">
          <Hero variant="dashboard" one="Central de Documentação" two="Fichas Técnicas" three="Consulte e baixe as fichas técnicas, especificações e referências dos produtos Synter." />
        </div>
      </section>

      <main className="fichas-container">
        <SecaoFichas titulo="Produtos Digitais" produtos={PRODUTOS_DIGITAIS} />
        <SecaoFichas titulo="Produtos Mecânicos" produtos={PRODUTOS_MECANICOS} onAbrirNavis={abrirFichasNavis} />
        <SecaoFichas titulo="Ferragens" produtos={PRODUTOS_FERRAGENS} />
      </main>
      <Footer />

      {navisModalOpen && (
        <div className="fichas-modal-fundo" onMouseDown={(event) => {
          if (event.target === event.currentTarget) fecharFichasNavis();
        }}>
          <section className="fichas-modal" role="dialog" aria-modal="true" aria-labelledby="fichas-modal-titulo">
            <div className="fichas-modal-topo">
              <h2 id="fichas-modal-titulo">Ficha técnica — Navis</h2>
              <button type="button" className="fichas-fechar" aria-label="Fechar" onClick={fecharFichasNavis}>×</button>
            </div>
            <p className="fichas-modal-descricao">Escolha a roseta e o tamanho da máquina para acessar a ficha técnica correspondente.</p>
            <label htmlFor="navis-roseta">1. Tipo de roseta</label>
            <select id="navis-roseta" value={navisRoseta} onChange={(event) => {
              setNavisRoseta(event.target.value);
              setNavisMaquina("");
            }}>
              <option value="">Selecione a roseta</option>
              {Object.keys(FICHAS_NAVIS).map((roseta) => <option key={roseta} value={roseta}>Roseta {roseta}</option>)}
            </select>
            <label htmlFor="navis-maquina">2. Tamanho da máquina</label>
            <select id="navis-maquina" value={navisMaquina} disabled={!navisRoseta} onChange={(event) => setNavisMaquina(event.target.value)}>
              <option value="">Selecione o tamanho</option>
              {Object.keys(FICHAS_NAVIS[navisRoseta] || {}).map((mm) => <option key={mm} value={mm}>{mm} mm</option>)}
            </select>
            {navisPdfSelecionado ? (
              <a className="fichas-botao-pdf" href={navisPdfSelecionado} target="_blank" rel="noopener noreferrer">
                Visualizar ficha — Roseta {navisRoseta}, {navisMaquina} mm
              </a>
            ) : (
              <p className="fichas-modal-ajuda">Selecione as duas opções para liberar a ficha técnica.</p>
            )}
          </section>
        </div>
      )}
      {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
export default FichaTec;
