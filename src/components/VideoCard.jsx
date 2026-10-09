
import { useRef, useState } from "react";
import { Play3 } from "reicon-react";

import "../styles/VideoCard.css";

function VideoCard({ titulo, descricao, video, capa }) {
  const videoRef = useRef(null);

  const [aberto, setAberto] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [erroDownload, setErroDownload] = useState("");

  const ehYoutube =
    typeof video === "string" &&
    (video.includes("youtube.com") ||
      video.includes("youtu.be"));

  // ==========================================
  // CONVERTER LINK DO YOUTUBE
  // ==========================================

  function obterEmbedYoutube(url) {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) {
      return url.split("?")[0];
    }

    if (url.includes("youtube.com/shorts/")) {
      const id = url
        .split("youtube.com/shorts/")[1]
        ?.split(/[?&/]/)[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("youtu.be/")) {
      const id = url
        .split("youtu.be/")[1]
        ?.split(/[?&/]/)[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("v=")) {
      const id = url
        .split("v=")[1]
        ?.split("&")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  }

  const youtubeEmbed = ehYoutube
    ? obterEmbedYoutube(video)
    : "";

  // ==========================================
  // ABRIR VÍDEO
  // ==========================================

  function abrirVideo() {
    setAberto(true);
    setTocando(false);
    setErroDownload("");
  }

  // ==========================================
  // FECHAR VÍDEO
  // ==========================================

  function fecharVideo() {
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setTocando(false);
    setAberto(false);
  }

  // ==========================================
  // REPRODUZIR VÍDEO
  // ==========================================

  async function reproduzirVideo() {
    if (ehYoutube) {
      setTocando(true);
      return;
    }

    const player = videoRef.current;

    if (!player) return;

    try {
      await player.play();
    } catch (erro) {
      console.error("Erro ao reproduzir:", erro);
    }
  }

  // ==========================================
  // BAIXAR VÍDEO MP4
  // ==========================================

  async function baixarVideo() {
    if (!video || ehYoutube || baixando) return;

    setBaixando(true);
    setErroDownload("");

    try {
      const resposta = await fetch(video);

      if (!resposta.ok) {
        throw new Error(
          `Falha ao acessar vídeo: ${resposta.status}`
        );
      }

      const blob = await resposta.blob();

      if (!blob.size) {
        throw new Error("Arquivo de vídeo vazio.");
      }

      const urlTemporaria = URL.createObjectURL(blob);

      const nomeArquivo = (titulo || "video")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const caminho = video.split("?")[0];
      const extensaoOriginal = caminho
        .split("/")
        .pop()
        ?.match(/\.(mp4|webm|mov|m4v)$/i)?.[1];

      const extensaoMime = {
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov",
        "video/x-m4v": "m4v",
      };

      const tipoMime = blob.type
        .split(";")[0]
        .toLowerCase();

      const extensao =
        extensaoMime[tipoMime] ||
        extensaoOriginal ||
        "mp4";

      const link = document.createElement("a");

      link.href = urlTemporaria;
      link.download = `${nomeArquivo || "video"}.${extensao}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(urlTemporaria);
      }, 1000);

    } catch (erro) {
      console.error("Erro no download:", erro);

      setErroDownload(
        "Não foi possível baixar o vídeo. Verifique o arquivo ou as permissões do servidor."
      );
    } finally {
      setBaixando(false);
    }
  }

  // ==========================================
  // BOTÃO DE DOWNLOAD
  // ==========================================

  function BotaoDownload() {
    return (
      <button
        type="button"
        className="botao-download"
        onClick={baixarVideo}
        disabled={baixando}
      >
        <span aria-hidden="true">↓</span>
        {baixando ? "Baixando..." : "Baixar vídeo"}
      </button>
    );
  }

  return (
    <>
      {/* =====================================
          CARD DO VÍDEO
      ====================================== */}

      <div className="video-card">

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
            playsInline
          />
        )}

        <div className="video-card-info">

          <h2>{titulo}</h2>

          <p>{descricao}</p>

          <div className="video-card-botoes">

            <button
              type="button"
              className="botao-assistir"
              onClick={abrirVideo}
            >
              <Play3 />
              Assistir
            </button>

            {!ehYoutube && (
              <button
                type="button"
                className="botao-download"
                onClick={baixarVideo}
                disabled={baixando}
              >
                <span aria-hidden="true">↓</span>
                {baixando ? "Baixando..." : "Baixar vídeo"}
              </button>
            )}

          </div>

          {erroDownload && !aberto && (
            <p className="video-download-erro" role="alert">
              {erroDownload}
            </p>
          )}

        </div>
      </div>

      {/* =====================================
          MODAL DO VÍDEO
      ====================================== */}

      {aberto && (
        <div
          className="modal-video-fundo"
          onClick={fecharVideo}
        >
          <div
            className="modal-video"
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="botao-fechar"
              onClick={fecharVideo}
              aria-label="Fechar vídeo"
            >
              ×
            </button>

            <h2>{titulo}</h2>

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
              <video
                ref={videoRef}
                className="video-principal"
                src={video}
                poster={capa}
                controls={tocando}
                playsInline
                onPlay={() => setTocando(true)}
                onPause={() => setTocando(false)}
                onEnded={() => setTocando(false)}
              />
            )}

            {/* AÇÕES DO MODAL */}

            <div className="modal-video-acoes">

              {!tocando && (
                <button
                  type="button"
                  className="botao-play"
                  onClick={reproduzirVideo}
                >
                  ▶ Reproduzir
                </button>
              )}

              {!ehYoutube && (
                <button
                  type="button"
                  className="botao-download"
                  onClick={baixarVideo}
                  disabled={baixando}
                >
                  <span aria-hidden="true">↓</span>
                  {baixando
                    ? "Baixando..."
                    : "Baixar vídeo"}
                </button>
              )}

            </div>

            {erroDownload && (
              <p
                className="video-download-erro"
                role="alert"
              >
                {erroDownload}
              </p>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default VideoCard;