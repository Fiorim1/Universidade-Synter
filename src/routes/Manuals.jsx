import { useMemo, useState } from "react";
import Header from "../components/Header";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import Hero from "../components/Hero";
import CardsDashboard from "../components/CardsDashboard";
import Footer from "../components/Footer";

import "../styles/Manuals.css";
import "../styles/ManualsMobile.css";

// Imagens e PDFs originais do projeto — sem alterar caminhos.
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
import VENUSS3PRO from "../assets/MANUAL_VENUS_S3_PRO.pdf";
import VENUSS2PRO from "../assets/MANUAL_VENUS_S2_PRO.pdf";
import MARS from "../assets/MANUAL_MARS.pdf";
import NEXUS from "../assets/MANUAL_NEXUS.pdf";
import VEGA from "../assets/MANUAL_VEGA.pdf";
import SYRIUSS2PROPDF from "../assets/MANUAL_SYRIUS_S2_PRO.pdf";
import SYRIUSS3MAXPDF from "../assets/MANUAL_SYRIUS_S3_MAX.pdf";
import SYRIUSS3PROPDF from "../assets/MANUAL_SYRIUS_S3_PRO.pdf";
import SYRIUSS1PRO from "../assets/MANUAL_SYRIUS_S1.pdf";
import SYRIUSS2MAXPDF from "../assets/MANUAL_SYRIUS_S2_MAX.pdf";
import SYRIUSS2PRONEOPDF from "../assets/MANUAL_SYRIUS_S2_PRO_NEO.pdf";
import DALLASS2PROPDF from "../assets/MANUAL_DALLAS_S2_PRO.pdf";
import DALLASS3PROPDF from "../assets/MANUAL_DALLAS_S3_PRO.pdf";
import DOMUSS1PDF from "../assets/MANUAL_DOMUS_S1_E_DOMUS_S1_PRO.pdf";
import ERISPDF from "../assets/MANUAL_ERIS_S2_FACE_ID.pdf";
import LYRAPDF from "../assets/MANUAL_LYRA_PRO.pdf";
import QRPDF from "../assets/MANUAL_CONTROLADORA_DE_ACESSO_S2_PRO_QR.pdf";
import FACEIDPDF from "../assets/MANUAL_DE_INSTALAÇÃO_CONTROLADORA_DE_ACESSO_FACE_ID.pdf";
import PROS2PDF from "../assets/PROS2.pdf";
import MECPDF from "../assets/MANUAL_FECHADURAS_MECÂNICAS_2026.pdf";

// Catálogo único: a lista do desktop e os filtros mobile usam os mesmos dados.
const PRODUTOS = [
  { categoria: "digitais", image: VENUS3, title: "Venus S3 PRO", pdf: VENUSS3PRO },
  { categoria: "digitais", image: VENUSS2, title: "Venus S2 PRO", pdf: VENUSS2PRO },
  { categoria: "digitais", image: SYRIUSS1, title: "Syrius S1", pdf: SYRIUSS1PRO },
  { categoria: "digitais", image: SYRIUSS1, title: "Syrius S1 Pro", pdf: SYRIUSS1PRO },
  { categoria: "digitais", image: SYRIUSS2PRO, title: "Syrius S2 Pro", pdf: SYRIUSS2PROPDF },
  { categoria: "digitais", image: SYRIUSS2PRONEO, title: "Syrius S2 Pro Neo", pdf: SYRIUSS2PRONEOPDF },
  { categoria: "digitais", image: SYRIUSS2MAX, title: "Syrius S2 Max", pdf: SYRIUSS2MAXPDF },
  { categoria: "digitais", image: SYRIUSS3PRO, title: "Syrius S3 Pro", pdf: SYRIUSS3PROPDF },
  { categoria: "digitais", image: SYRIUSS3MAX, title: "Syrius S3 Max", pdf: SYRIUSS3MAXPDF },
  { categoria: "digitais", image: ERISS2FACEID, title: "Eris S2 Face Id", pdf: ERISPDF },
  { categoria: "digitais", image: VEGAFACEID, title: "Vega Face Id", pdf: VEGA },
  { categoria: "digitais", image: MARSIMG, title: "Mars S2 Pro", pdf: MARS },
  { categoria: "digitais", image: NEXUSIMG, title: "Nexus S1", pdf: NEXUS },
  { categoria: "digitais", image: NEXUSIMG, title: "Nexus S1 Pro", pdf: NEXUS },
  { categoria: "digitais", image: DALASS2PRO, title: "Dallas S2 Pro", pdf: DALLASS2PROPDF },
  { categoria: "digitais", image: DALASS3PRO, title: "Dallas S3 Pro", pdf: DALLASS3PROPDF },
  { categoria: "digitais", image: DOMOUSS1, title: "Domus S1", pdf: DOMUSS1PDF },
  { categoria: "digitais", image: DOMOUSS1, title: "Domus S1 Pro", pdf: DOMUSS1PDF },
  { categoria: "digitais", image: LYRAPRO, title: "Lyra Pro", pdf: LYRAPDF },
  { categoria: "digitais", image: S2PRO, title: "Controladora de Acesso S2 Pro", pdf: PROS2PDF },
  { categoria: "digitais", image: S2QR, title: "Controladora de Acesso S2 QR", pdf: QRPDF },
  { categoria: "digitais", image: S2FACEID, title: "Controladora de Acesso S2 Face Id", pdf: FACEIDPDF },
  { categoria: "mecanicos", image: STILLUS, title: "Stillus", pdf: MECPDF },
  { categoria: "mecanicos", image: STARMAX, title: "Star Max", pdf: MECPDF },
  { categoria: "mecanicos", image: STAR, title: "Star", pdf: MECPDF },
  { categoria: "mecanicos", image: POLOMAX, title: "Polo Max", pdf: MECPDF },
  { categoria: "mecanicos", image: OLYMPIA, title: "Olympia", pdf: MECPDF },
  { categoria: "mecanicos", image: NAVISII, title: "Navis II", pdf: MECPDF },
  { categoria: "mecanicos", image: NAVIS, title: "Navis", pdf: MECPDF },
  { categoria: "mecanicos", image: MARINEII, title: "Marine II", pdf: MECPDF },
  { categoria: "mecanicos", image: MARINE, title: "Marine", pdf: MECPDF },
  { categoria: "mecanicos", image: LUCK, title: "Luck", pdf: MECPDF },
  { categoria: "mecanicos", image: GOL, title: "Gol", pdf: MECPDF },
  { categoria: "mecanicos", image: GLORIAN, title: "Glorian", pdf: MECPDF },
  { categoria: "mecanicos", image: CRISPUSMAX, title: "Crispus Max", pdf: MECPDF },
  { categoria: "mecanicos", image: CHAMPION, title: "Champion", pdf: MECPDF },
  { categoria: "mecanicos", image: CECI, title: "Ceci", pdf: MECPDF },
  { categoria: "mecanicos", image: ACQUAMAX, title: "Acqua Max", pdf: MECPDF },
  { categoria: "mecanicos", image: BARRAAPOIO, title: "Barra de Apoio", pdf: null },
  { categoria: "mecanicos", image: FECPCORRER, title: "Fechadura de Banheiro para Porta de Correr ", pdf: null },
  { categoria: "mecanicos", image: FECIPCORRER, title: "Fechadura Interna para Porta de Correr ", pdf: null },
  { categoria: "mecanicos", image: FECPC, title: "Fechadura para Porta de Correr", pdf: null },
  { categoria: "mecanicos", image: CHAVED, title: "Fechadura Porta de Correr c/ Chave Dobrável e Concha", pdf: null },
  { categoria: "mecanicos", image: FECROLETE, title: "Fechadura Rolete ", pdf: null },
  { categoria: "ferragens", image: F1, title: "Prendedor para Porta Magnético (fixação no piso)", pdf: null },
  { categoria: "ferragens", image: F2, title: "Prendedor para Porta Magnético (fixação no piso ou parede)", pdf: null },
  { categoria: "ferragens", image: F3, title: "Porta Cadeado", pdf: null },
  { categoria: "ferragens", image: F4, title: "Números (fixação com parafuso)", pdf: null },
  { categoria: "ferragens", image: F5, title: "Números (fixação com dupla face)", pdf: null },
  { categoria: "ferragens", image: F6, title: "Levantador de Guilhotina", pdf: null },
  { categoria: "ferragens", image: F7, title: "Gancho de Rede", pdf: null },
  { categoria: "ferragens", image: F8, title: "Fecho Porta Cadeado", pdf: null },
  { categoria: "ferragens", image: F9, title: "Fecho Pino Bola", pdf: null },
  { categoria: "ferragens", image: F10, title: "Fecho para Janela de Correr", pdf: null },
  { categoria: "ferragens", image: F11, title: "Fecho Fio Redondo", pdf: null },
  { categoria: "ferragens", image: F12, title: "Fecho Fio Chato", pdf: null },
  { categoria: "ferragens", image: F13, title: "Fecho Concha Trava", pdf: null },
  { categoria: "ferragens", image: F14, title: "Cremona", pdf: null },
  { categoria: "ferragens", image: F15, title: "Concha Stand com Furo", pdf: null },
  { categoria: "ferragens", image: F16, title: "Concha Stand", pdf: null },
  { categoria: "ferragens", image: F17, title: "Borboleta para Guilhotina", pdf: null },
  { categoria: "ferragens", image: F18, title: "Amortecedor de Porta (fixação no piso)", pdf: null },
  { categoria: "ferragens", image: F19, title: "Alça", pdf: null },
  { categoria: "ferragens", image: F20, title: "Quartzo", pdf: null },
  { categoria: "ferragens", image: F21, title: "Opala", pdf: null },
  { categoria: "ferragens", image: F22, title: "Jaspe (com furo)", pdf: null },
  { categoria: "ferragens", image: F23, title: "Jaspe", pdf: null },
  { categoria: "ferragens", image: F24, title: "Jade Max", pdf: null },
  { categoria: "ferragens", image: F25, title: "Jade", pdf: null },
  { categoria: "ferragens", image: F26, title: "Vara de Cremona", pdf: null },
  { categoria: "ferragens", image: F27, title: "Tarjeta", pdf: null },
  { categoria: "ferragens", image: F28, title: "Prendedor para Veneziana", pdf: null },
];

const CATEGORIAS = [
  { id: "todos", nome: "Todos" },
  { id: "digitais", nome: "Digitais" },
  { id: "mecanicos", nome: "Mecânicos" },
  { id: "ferragens", nome: "Ferragens" },
];

const NOMES_CATEGORIAS = {
  digitais: "Produtos Digitais",
  mecanicos: "Produtos Mecânicos",
  ferragens: "Ferragens",
};

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Permite filtrar por linha sem inventar categorias de produtos.
function identificarLinha(nome) {
  const titulo = normalizar(nome);
  if (titulo.startsWith("controladora")) return "Controladoras";
  if (titulo.startsWith("fechadura ")) return "Fechaduras para Correr / Rolete";
  const linhas = ["Venus", "Syrius", "Eris", "Vega", "Mars", "Nexus", "Dallas", "Domus", "Lyra", "Stillus", "Star", "Polo", "Olympia", "Navis", "Marine", "Luck", "Gol", "Glorian", "Crispus", "Champion", "Ceci", "Acqua"];
  return linhas.find((linha) => titulo.startsWith(normalizar(linha))) || "Outros";
}

function BotaoManualMobile({ produto }) {
  return (
    <article className="manual-mobile-item">
      <span className="manual-mobile-item-image">
        <img src={produto.image} alt="" loading="lazy" />
      </span>
      <span className="manual-mobile-item-info">
        <strong>{produto.title}</strong>
        <small>{produto.pdf ? "Manual disponível" : "Manual em breve"}</small>
      </span>
      {produto.pdf ? (
        <a
          className="manual-mobile-open"
          href={produto.pdf}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visualizar manual de ${produto.title}`}
        >
          Abrir PDF <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <span className="manual-mobile-soon" aria-label="Manual indisponível">Em breve</span>
      )}
    </article>
  );
}

function Manuals() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [linha, setLinha] = useState("todas");
  const [disponibilidade, setDisponibilidade] = useState("todos");
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const linhasDisponiveis = useMemo(() => {
    return [...new Set(PRODUTOS
      .filter((item) => categoria === "todos" || item.categoria === categoria)
      .map((item) => identificarLinha(item.title)))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [categoria]);

  const filtrados = useMemo(() => PRODUTOS.filter((item) => {
    if (categoria !== "todos" && item.categoria !== categoria) return false;
    if (linha !== "todas" && identificarLinha(item.title) !== linha) return false;
    if (disponibilidade === "disponivel" && !item.pdf) return false;
    if (disponibilidade === "breve" && item.pdf) return false;
    return normalizar(item.title).includes(normalizar(busca.trim()));
  }), [busca, categoria, linha, disponibilidade]);

  const visiveis = mostrarTodos ? filtrados : filtrados.slice(0, 3);

  function alterarCategoria(valor) {
    setCategoria(valor);
    setLinha("todas");
    setMostrarTodos(false);
  }

  function limparFiltros() {
    setBusca("");
    setCategoria("todos");
    setLinha("todas");
    setDisponibilidade("todos");
    setMostrarTodos(false);
  }

  return (
    <div className="manuals-page manuals-catalog-page">
      <Header />

      <section className="videos-hero-area">
        <div className="videos-profile">
          <UserProfileButton onClick={() => setProfileOpen(true)} />
        </div>
        <div className="videos-hero-content">
          <Hero
            variant="dashboard"
            one="Central de Documentação"
            two="Manuais Técnicos"
            three="Consulte e baixe manuais de instalação, configuração e utilização dos produtos Synter."
          />
        </div>
      </section>

      {/* Catálogo compacto apenas no celular */}
      <main className="manual-mobile-catalog">
        <div className="manual-mobile-head">
          <h2>ENCONTRE SEU MANUAL</h2>
          <p>Use os filtros e abra o PDF do produto desejado.</p>
        </div>

        <label className="manual-mobile-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="Pesquisar modelo"
            placeholder="Pesquisar produto ou modelo..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setMostrarTodos(false); }}
          />
        </label>

        <div className="manual-mobile-tabs" role="group" aria-label="Categoria do produto">
          {CATEGORIAS.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              className={categoria === opcao.id ? "is-selected" : ""}
              aria-pressed={categoria === opcao.id}
              onClick={() => alterarCategoria(opcao.id)}
            >{opcao.nome}</button>
          ))}
        </div>

        <div className="manual-mobile-filter-grid">
          <label>
            <span>Linha / Modelo</span>
            <select
              value={linha}
              onChange={(e) => { setLinha(e.target.value); setMostrarTodos(false); }}
            >
              <option value="todas">Todas as linhas</option>
              {linhasDisponiveis.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
            </select>
          </label>
          <label>
            <span>Disponibilidade</span>
            <select
              value={disponibilidade}
              onChange={(e) => { setDisponibilidade(e.target.value); setMostrarTodos(false); }}
            >
              <option value="todos">Todos</option>
              <option value="disponivel">Com manual</option>
              <option value="breve">Em breve</option>
            </select>
          </label>
        </div>

        <div className="manual-mobile-resultbar">
          <span>{filtrados.length} {filtrados.length === 1 ? "produto encontrado" : "produtos encontrados"}</span>
          <button type="button" onClick={limparFiltros}>Limpar filtros</button>
        </div>

        <div className="manual-mobile-list">
          {visiveis.map((produto) => (
            <BotaoManualMobile key={`${produto.categoria}-${produto.title}`} produto={produto} />
          ))}
          {filtrados.length === 0 && (
            <div className="manual-mobile-empty">Nenhum produto encontrado. Ajuste os filtros para pesquisar novamente.</div>
          )}
        </div>

        {filtrados.length > 3 && (
          <button
            type="button"
            className="manual-mobile-more"
            onClick={() => setMostrarTodos((atual) => !atual)}
          >
            {mostrarTodos ? "Mostrar apenas 3" : `Ver mais ${filtrados.length - 3} produtos`}
          </button>
        )}
      </main>

      {/* Catálogo original: preservado no desktop. */}
      <main className="manuals-container manuals-desktop-catalog">
        {CATEGORIAS.filter((item) => item.id !== "todos").map((grupo) => (
          <section
            key={grupo.id}
            className={grupo.id === "digitais" ? "digials-products" : grupo.id === "mecanicos" ? "mechanical-products" : "ironwork"}
          >
            <div className="title"><h4>{NOMES_CATEGORIAS[grupo.id]}</h4></div>
            <div className="line" />
            <div className="cards-manuals">
              {PRODUTOS.filter((item) => item.categoria === grupo.id).map((produto) => (
                <CardsDashboard
                  key={produto.title}
                  image={produto.image}
                  title={produto.title}
                  desc={produto.pdf ? "Clique aqui para baixar o manual!" : "Manual em breve"}
                  {...(produto.pdf ? { pdf: produto.pdf } : {})}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
      {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

export default Manuals;
