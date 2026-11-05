import { useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";
import VideoCard from "../components/VideoCard";

import capaMarketing1 from "../assets/capaMarketing1.png";
import capaMarketing2 from "../assets/capaMarketing2.png";
import capaMarketing3 from "../assets/capaMarketing3.png";
import capaMarketing4 from "../assets/capaMarketing4.png";
import capaMarketing5 from "../assets/capaMarketing5.png";
import capaMarketing6 from "../assets/capaMarketing6.png";
import capaMarketing7 from "../assets/capaMarketing7.png";
import capaMarketing8 from "../assets/capaMarketing8.png";
import capaMarketing9 from "../assets/capaMarketing9.png";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";

const videos = [
  { id: 1, titulo: "Fechadura Digital - Syrius S2 Pro", descricao: "Conheça os recursos e diferenciais das fechaduras digitais Synter.", video: "https://youtube.com/shorts/i2_8xFaqHgc", capa: capaMarketing1 },
  { id: 2, titulo: "Fechadura Digital - Dallas S3", descricao: "Material audiovisual para divulgação das fechaduras digitais Synter.", video: "https://youtube.com/shorts/vuzLzcqCT5A", capa: capaMarketing2 },
  { id: 3, titulo: "Fechadura Digital - Syrius S3 Max", descricao: "Apresente os principais benefícios das fechaduras digitais Synter.", video: "https://youtube.com/shorts/RMC2hm9reTQ", capa: capaMarketing3 },
  { id: 4, titulo: "Fechadura Digital - Venus S3 Pro", descricao: "Conteúdo desenvolvido para divulgação comercial dos produtos Synter.", video: "https://youtube.com/shorts/3nLdCqSkRuE", capa: capaMarketing4 },
  { id: 5, titulo: "Fechadura Digital - Vega Face Id", descricao: "Vídeo promocional para apresentação das fechaduras digitais Synter.", video: "https://youtube.com/shorts/-h3p7BRSvR4", capa: capaMarketing5 },
  { id: 6, titulo: "Fechadura Digital - Syrius S3 Pro", descricao: "Material visual para campanhas e divulgação das fechaduras Synter.", video: "https://youtube.com/shorts/Wl7mP3oGji0", capa: capaMarketing6 },
  { id: 7, titulo: "Fechadura Digital - Syrius S2 Pro Neo", descricao: "Conheça detalhes e funcionalidades das fechaduras digitais Synter.", video: "https://youtube.com/shorts/nOxgn_bKzNo?feature=share", capa: capaMarketing7 },
  { id: 8, titulo: "Fechadura Digital - Lyra Pro", descricao: "Conteúdo para apoiar ações comerciais e de marketing.", video: "https://youtube.com/shorts/GQwlcEne9ks", capa: capaMarketing8 },
  { id: 9, titulo: "Fechadura Digital - Eris Face Id", descricao: "Vídeo desenvolvido para apresentação dos produtos Synter.", video: "https://youtube.com/shorts/2_5_QFtbLIE", capa: capaMarketing9 },
];

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function IconeSynter() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

export default function DigMarketing() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  const videosFiltrados = useMemo(() => {
    const termo = normalizar(pesquisa);
    if (!termo) return videos;
    return videos.filter((item) =>
      normalizar(`${item.titulo} ${item.descricao}`).includes(termo)
    );
  }, [pesquisa]);

  return (
    <div className="videos-page dig-marketing-page">
      <Header />

      <section className="dig-marketing-hero">
        <div className="dig-marketing-hero-container">
          <div className="dig-marketing-profile">
            <UserProfileButton onClick={() => setProfileOpen(true)} />
          </div>

          <div className="dig-marketing-eyebrow">
            <IconeSynter />
            <span>CONTEÚDOS PARA DIVULGAÇÃO</span>
          </div>

          <h1 className="dig-marketing-title">Vídeos de Fechaduras Digitais</h1>
          <p className="dig-marketing-description">
            Acesse vídeos das fechaduras digitais Synter para divulgação,
            campanhas e ações de marketing.
          </p>
        </div>
      </section>

      <main className="videos-content">
        <div className="videos-section-title">
          <div className="videos-section-bar" />
          <h4>VÍDEOS DE FECHADURAS DIGITAIS</h4>
        </div>

        <div className="pesquisa-videos">
          <input
            type="search"
            placeholder="Pesquisar vídeo..."
            value={pesquisa}
            onChange={(evento) => setPesquisa(evento.target.value)}
            aria-label="Pesquisar vídeos de fechaduras digitais"
          />
        </div>

        <div className="videos-grid">
          {videosFiltrados.map((item) => (
            <VideoCard
              key={item.id}
              titulo={item.titulo}
              descricao={item.descricao}
              video={item.video}
              capa={item.capa}
            />
          ))}
        </div>

        {videosFiltrados.length === 0 && (
          <p className="nenhum-video" role="status">
            Nenhum vídeo encontrado para sua pesquisa.
          </p>
        )}
      </main>

      <Footer />

      {profileOpen && (
        <Profile onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
