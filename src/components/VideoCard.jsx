import { useRef, useState } from "react";
import { Play3 } from "reicon-react";

import "../styles/VideoCard.css";

function VideoCard({
  titulo,
  descricao,
  video,
  capa
}) {

  const videoRef = useRef(null);

  const [aberto, setAberto] = useState(false);
  const [tocando, setTocando] = useState(false);

  // ==========================================
  // VERIFICA SE É YOUTUBE
  // ==========================================

  const ehYoutube =
    video.includes("youtube.com") ||
    video.includes("youtu.be");

  // ==========================================
  // CONVERTE LINK DO YOUTUBE PARA EMBED
  // ==========================================

  function obterEmbedYoutube(url) {

    if (!url) {
      return "";
    }

    // JÁ É EMBED

    if (url.includes("youtube.com/embed/")) {
      return url.split("?")[0];
    }

    // SHORTS

    if (url.includes("youtube.com/shorts/")) {

      const id =
        url
          .split("youtube.com/shorts/")[1]
          ?.split("?")[0]
          ?.split("&")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    // YOUTU.BE

    if (url.includes("youtu.be/")) {

      const id =
        url
          .split("youtu.be/")[1]
          ?.split("?")[0]
          ?.split("&")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    // YOUTUBE NORMAL
    // youtube.com/watch?v=...

    if (url.includes("v=")) {

      const id =
        url
          .split("v=")[1]
          ?.split("&")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  }

  // ==========================================
  // ABRIR MODAL
  // ==========================================

  function abrirVideo() {

    setAberto(true);
    setTocando(false);
  }

  // ==========================================
  // FECHAR MODAL
  // ==========================================

  function fecharVideo() {

    if (videoRef.current) {
      videoRef.current.pause();
    }

    setTocando(false);
    setAberto(false);
  }

  // ==========================================
  // REPRODUZIR
  // ==========================================

  function reproduzirVideo() {

    // ======================================
    // YOUTUBE
    // ======================================

    if (ehYoutube) {
      setTocando(true);
      return;
    }

    // ======================================
    // MP4
    // ======================================

    const player = videoRef.current;

    if (!player) {
      return;
    }

    player.play();
  }

  // ==========================================
  // LINK EMBED
  // ==========================================

  const youtubeEmbed =
    ehYoutube
      ? obterEmbedYoutube(video)
      : "";

  return (
    <>

      {/* =====================================
          CARD
      ====================================== */}

      <div className="video-card">

        {/* =====================================
            PREVIEW
        ====================================== */}

        {ehYoutube ? (

          <img
            className="video-preview"
            src={capa}
            alt={titulo}
          />

        ) : (

          <video
            className="video-preview"
            src={video}
            poster={capa}
            muted
            preload="metadata"
          />

        )}

        {/* =====================================
            INFORMAÇÕES
        ====================================== */}

        <div className="video-card-info">

          <h2>
            {titulo}
          </h2>

          <p>
            {descricao}
          </p>

          <button
            className="botao-assistir"
            onClick={abrirVideo}
          >
            <Play3 />

            Assistir
          </button>

        </div>

      </div>

      {/* =====================================
          MODAL
      ====================================== */}

      {aberto && (

        <div
          className="modal-video-fundo"
          onClick={fecharVideo}
        >

          <div
            className="modal-video"
            onClick={(e) => e.stopPropagation()}
          >

            {/* FECHAR */}

            <button
              className="botao-fechar"
              onClick={fecharVideo}
            >
              ×
            </button>

            {/* TÍTULO */}

            <h2>
              {titulo}
            </h2>

            {/* =================================
                YOUTUBE
            ================================== */}

            {ehYoutube ? (

              <>

                {tocando ? (

                  <iframe
                    className="video-principal video-youtube"
                    src={`${youtubeEmbed}?autoplay=1&rel=0`}
                    title={titulo}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />

                ) : (

                  <div className="youtube-capa-container">

                    <img
                      className="video-principal youtube-capa"
                      src={capa}
                      alt={titulo}
                    />

                  </div>

                )}

              </>

            ) : (

              // =================================
              // MP4
              // =================================

              <video
                ref={videoRef}
                className="video-principal"
                src={video}
                poster={capa}
                onPlay={() => setTocando(true)}
                onPause={() => setTocando(false)}
                onEnded={() => setTocando(false)}
              />

            )}

            {/* =================================
                BOTÃO REPRODUZIR
            ================================== */}

            {!tocando && (

              <button
                className="botao-play"
                onClick={reproduzirVideo}
              >
                ▶ Reproduzir
              </button>

            )}

          </div>

        </div>

      )}

    </>
  );
}

export default VideoCard;