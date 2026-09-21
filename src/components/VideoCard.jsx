import { useRef, useState } from "react";
import { Play3 } from "reicon-react";

import "../styles/VideoCard.css";

function VideoCard({ titulo, descricao, video, capa }) {

  const videoRef = useRef(null);

  const [aberto, setAberto] = useState(false);
  const [tocando, setTocando] = useState(false);


  function abrirVideo() {
    setAberto(true);
  }


  function fecharVideo() {

    if (videoRef.current) {
      videoRef.current.pause();
    }

    setTocando(false);
    setAberto(false);
  }


  function playPause() {

    const player = videoRef.current;

    if (!player) return;

    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }

  }


  return (
    <>

      <div className="video-card">

        <video
          className="video-preview"
          src={video}
          poster={capa}
          muted
          preload="metadata"
        />

        <div className="video-card-info">

          <h2>{titulo}</h2>

          <p>{descricao}</p>

          <button
            className="botao-assistir"
            onClick={abrirVideo}
          >
            <Play3 />
            Assistir
          </button>

        </div>

      </div>


      {aberto && (

        <div
          className="modal-video-fundo"
          onClick={fecharVideo}
        >

          <div
            className="modal-video"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="botao-fechar"
              onClick={fecharVideo}
            >
              ×
            </button>


            <h2>{titulo}</h2>


            <video
              ref={videoRef}
              className="video-principal"
              src={video}
              poster={capa}
              onPlay={() => setTocando(true)}
              onPause={() => setTocando(false)}
              onEnded={() => setTocando(false)}
            />


            <button
              className="botao-play"
              onClick={playPause}
            >
              {tocando ? "❚❚ Pausar" : "▶ Reproduzir"}
            </button>

          </div>

        </div>

      )}

    </>
  );
}

export default VideoCard;