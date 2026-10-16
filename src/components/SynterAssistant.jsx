import {
    useEffect,
    useRef,
    useState
} from "react";

import { supabase } from "../services/supabaseClient";

import "../styles/SynterAssistant.css";


const LIMITE_IMAGEM = 10 * 1024 * 1024;
const LIMITE_GRAVACAO = 60;


function SynterAssistant() {

    const [aberto, setAberto] =
        useState(false);

    const [mensagem, setMensagem] =
        useState("");

    const [carregando, setCarregando] =
        useState(false);

    const [mensagens, setMensagens] =
        useState([
            {
                id: "boas-vindas",
                role: "assistant",
                content:
                    "Olá! Sou o Assistente Synter. Como posso ajudar?"
            }
        ]);

    const [previousResponseId, setPreviousResponseId] =
        useState(null);

    const [imagem, setImagem] =
        useState(null);

    const [processandoImagem, setProcessandoImagem] =
        useState(false);

    const [audio, setAudio] =
        useState(null);

    const [gravando, setGravando] =
        useState(false);

    const [tempoGravacao, setTempoGravacao] =
        useState(0);

    const [erroMidia, setErroMidia] =
        useState("");


    const mensagensRef =
        useRef(null);

    const imagemInputRef =
        useRef(null);

    const mediaRecorderRef =
        useRef(null);

    const mediaStreamRef =
        useRef(null);

    const audioChunksRef =
        useRef([]);

    const timerRef =
        useRef(null);

    const tempoGravacaoRef =
        useRef(0);

    const descartarGravacaoRef =
        useRef(false);


    // ==========================================
    // ROLAR PARA A ÚLTIMA MENSAGEM
    // ==========================================

    useEffect(() => {

        if (!mensagensRef.current) {
            return;
        }

        mensagensRef.current.scrollTop =
            mensagensRef.current.scrollHeight;

    }, [
        mensagens,
        carregando,
        imagem,
        audio,
        gravando
    ]);


    // ==========================================
    // LIMPEZA
    // ==========================================

    useEffect(() => {

        return () => {

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (mediaStreamRef.current) {

                mediaStreamRef.current
                    .getTracks()
                    .forEach((track) =>
                        track.stop()
                    );

            }

        };

    }, []);


    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    function criarId() {

        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

    }


    function formatarTempo(segundos) {

        const minutos =
            Math.floor(segundos / 60);

        const restante =
            segundos % 60;

        return `${String(minutos).padStart(2, "0")}:${String(
            restante
        ).padStart(2, "0")}`;

    }


    function arquivoParaDataUrl(arquivo) {

        return new Promise((resolve, reject) => {

            const leitor =
                new FileReader();

            leitor.onload = () =>
                resolve(String(leitor.result || ""));

            leitor.onerror = () =>
                reject(
                    new Error(
                        "Não foi possível ler o arquivo."
                    )
                );

            leitor.readAsDataURL(arquivo);

        });

    }


    function carregarImagem(src) {

        return new Promise((resolve, reject) => {

            const img =
                new Image();

            img.onload = () =>
                resolve(img);

            img.onerror = () =>
                reject(
                    new Error(
                        "Não foi possível processar a imagem."
                    )
                );

            img.src = src;

        });

    }


    function tamanhoDataUrl(dataUrl) {

        const base64 =
            String(dataUrl)
                .split(",")[1] || "";

        return Math.ceil(
            base64.length * 0.75
        );

    }


    async function otimizarImagem(arquivo) {

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !tiposPermitidos.includes(
                arquivo.type
            )
        ) {

            throw new Error(
                "Envie uma foto JPG, PNG ou WEBP."
            );

        }

        if (
            arquivo.size >
            LIMITE_IMAGEM
        ) {

            throw new Error(
                "A imagem é muito grande. Use uma foto de até 10 MB."
            );

        }

        const original =
            await arquivoParaDataUrl(
                arquivo
            );

        // Preserva imagens pequenas, inclusive screenshots.
        if (
            arquivo.size <=
            1.5 * 1024 * 1024
        ) {

            return {
                dataUrl: original,
                nome: arquivo.name || "imagem",
                tipo: arquivo.type
            };

        }

        const img =
            await carregarImagem(
                original
            );

        function gerarDataUrl(
            limite,
            qualidade
        ) {

            const maiorLado =
                Math.max(
                    img.naturalWidth,
                    img.naturalHeight
                );

            const escala =
                maiorLado > limite
                    ? limite / maiorLado
                    : 1;

            const largura =
                Math.max(
                    1,
                    Math.round(
                        img.naturalWidth * escala
                    )
                );

            const altura =
                Math.max(
                    1,
                    Math.round(
                        img.naturalHeight * escala
                    )
                );

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width = largura;
            canvas.height = altura;

            const contexto =
                canvas.getContext("2d");

            if (!contexto) {
                throw new Error(
                    "Não foi possível preparar a imagem."
                );
            }

            contexto.fillStyle =
                "#ffffff";

            contexto.fillRect(
                0,
                0,
                largura,
                altura
            );

            contexto.drawImage(
                img,
                0,
                0,
                largura,
                altura
            );

            return canvas.toDataURL(
                "image/jpeg",
                qualidade
            );

        }

        let dataUrl =
            gerarDataUrl(
                1600,
                0.80
            );

        if (
            tamanhoDataUrl(dataUrl) >
            2.5 * 1024 * 1024
        ) {

            dataUrl =
                gerarDataUrl(
                    1200,
                    0.68
                );

        }

        if (
            tamanhoDataUrl(dataUrl) >
            3 * 1024 * 1024
        ) {

            throw new Error(
                "A imagem continuou muito grande. Tente outra foto."
            );

        }

        return {
            dataUrl,
            nome:
                arquivo.name ||
                "imagem.jpg",
            tipo: "image/jpeg"
        };

    }


    function mimeAudioPreferido() {

        if (
            typeof MediaRecorder ===
            "undefined"
        ) {
            return "";
        }

        const opcoes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4",
            "audio/ogg;codecs=opus"
        ];

        return (
            opcoes.find((tipo) =>
                MediaRecorder.isTypeSupported?.(
                    tipo
                )
            ) || ""
        );

    }


    function extensaoAudio(mime = "") {

        const tipo =
            mime
                .split(";")[0]
                .toLowerCase();

        const mapa = {
            "audio/webm": "webm",
            "audio/mp4": "mp4",
            "audio/mpeg": "mp3",
            "audio/mp3": "mp3",
            "audio/wav": "wav",
            "audio/x-wav": "wav",
            "audio/ogg": "ogg"
        };

        return mapa[tipo] ||
            "webm";

    }


    function limparTimer() {

        if (timerRef.current) {

            clearInterval(
                timerRef.current
            );

            timerRef.current =
                null;

        }

    }


    function encerrarStream() {

        if (!mediaStreamRef.current) {
            return;
        }

        mediaStreamRef.current
            .getTracks()
            .forEach((track) =>
                track.stop()
            );

        mediaStreamRef.current =
            null;

    }


    // ==========================================
    // FOTO
    // ==========================================

    async function selecionarImagem(evento) {

        const arquivo =
            evento.target.files?.[0];

        evento.target.value = "";

        if (!arquivo) {
            return;
        }

        try {

            setErroMidia("");
            setProcessandoImagem(true);

            const preparada =
                await otimizarImagem(
                    arquivo
                );

            setImagem(preparada);

        }
        catch (error) {

            console.error(
                "Erro ao selecionar imagem:",
                error
            );

            setErroMidia(
                error?.message ||
                "Não foi possível adicionar a imagem."
            );

        }
        finally {

            setProcessandoImagem(false);

        }

    }


    // ==========================================
    // ÁUDIO
    // ==========================================

    async function iniciarGravacao() {

        if (
            carregando ||
            gravando ||
            processandoImagem
        ) {
            return;
        }

        if (
            !navigator.mediaDevices?.getUserMedia ||
            typeof MediaRecorder === "undefined"
        ) {

            setErroMidia(
                "Seu navegador não oferece suporte à gravação de áudio."
            );

            return;
        }

        try {

            setErroMidia("");
            setAudio(null);
            setTempoGravacao(0);

            tempoGravacaoRef.current = 0;
            descartarGravacaoRef.current = false;

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true
                    });

            mediaStreamRef.current =
                stream;

            const mime =
                mimeAudioPreferido();

            const opcoes =
                mime
                    ? {
                        mimeType: mime,
                        audioBitsPerSecond: 64000
                    }
                    : undefined;

            const recorder =
                new MediaRecorder(
                    stream,
                    opcoes
                );

            mediaRecorderRef.current =
                recorder;

            audioChunksRef.current =
                [];

            recorder.ondataavailable =
                (evento) => {

                    if (
                        evento.data &&
                        evento.data.size > 0
                    ) {

                        audioChunksRef.current.push(
                            evento.data
                        );

                    }

                };

            recorder.onstop =
                async () => {

                    limparTimer();
                    encerrarStream();
                    setGravando(false);

                    if (
                        descartarGravacaoRef.current
                    ) {

                        descartarGravacaoRef.current = false;
                        audioChunksRef.current = [];
                        return;

                    }

                    try {

                        const mimeFinal =
                            recorder.mimeType ||
                            mime ||
                            "audio/webm";

                        const blob =
                            new Blob(
                                audioChunksRef.current,
                                {
                                    type: mimeFinal
                                }
                            );

                        audioChunksRef.current =
                            [];

                        if (blob.size < 800) {
                            throw new Error(
                                "O áudio ficou muito curto. Grave novamente."
                            );
                        }

                        const dataUrl =
                            await arquivoParaDataUrl(
                                blob
                            );

                        setAudio({
                            dataUrl,
                            base64:
                                dataUrl.split(",")[1] || "",
                            mimeType: mimeFinal,
                            nome:
                                `audio-synter.${extensaoAudio(
                                    mimeFinal
                                )}`,
                            duracao:
                                Math.max(
                                    1,
                                    tempoGravacaoRef.current
                                )
                        });

                    }
                    catch (error) {

                        console.error(
                            "Erro ao preparar áudio:",
                            error
                        );

                        setErroMidia(
                            error?.message ||
                            "Não foi possível preparar o áudio."
                        );

                    }

                };

            recorder.start(250);
            setGravando(true);

            timerRef.current =
                setInterval(() => {

                    tempoGravacaoRef.current += 1;

                    setTempoGravacao(
                        tempoGravacaoRef.current
                    );

                    if (
                        tempoGravacaoRef.current >=
                        LIMITE_GRAVACAO
                    ) {

                        pararGravacao();

                    }

                }, 1000);

        }
        catch (error) {

            console.error(
                "Erro ao acessar microfone:",
                error
            );

            limparTimer();
            encerrarStream();
            setGravando(false);

            if (
                error?.name ===
                "NotAllowedError"
            ) {

                setErroMidia(
                    "Permita o acesso ao microfone no navegador para enviar áudios."
                );

                return;
            }

            setErroMidia(
                "Não foi possível acessar o microfone."
            );

        }

    }


    function pararGravacao() {

        const recorder =
            mediaRecorderRef.current;

        if (
            !recorder ||
            recorder.state === "inactive"
        ) {
            return;
        }

        recorder.stop();

    }


    function cancelarGravacao() {

        descartarGravacaoRef.current =
            true;

        const recorder =
            mediaRecorderRef.current;

        if (
            recorder &&
            recorder.state !== "inactive"
        ) {
            recorder.stop();
        }
        else {
            limparTimer();
            encerrarStream();
            setGravando(false);
        }

        setAudio(null);
        setTempoGravacao(0);
        tempoGravacaoRef.current = 0;
        setErroMidia("");

    }


    // ==========================================
    // ENVIAR
    // ==========================================

    async function enviarMensagem(evento) {

        evento?.preventDefault();

        const texto =
            mensagem.trim();

        if (
            carregando ||
            gravando ||
            processandoImagem ||
            (
                !texto &&
                !imagem &&
                !audio
            )
        ) {
            return;
        }

        const idMensagem =
            criarId();

        const textoAtual =
            texto;

        const imagemAtual =
            imagem;

        const audioAtual =
            audio;

        const mensagemUsuario = {
            id: idMensagem,
            role: "user",
            content: textoAtual,
            image:
                imagemAtual?.dataUrl ||
                null,
            audio:
                audioAtual?.dataUrl ||
                null,
            audioDuration:
                audioAtual?.duracao ||
                null,
            transcription: ""
        };

        setMensagens(
            (estadoAtual) => [
                ...estadoAtual,
                mensagemUsuario
            ]
        );

        setMensagem("");
        setImagem(null);
        setAudio(null);
        setErroMidia("");
        setCarregando(true);

        try {

            const {
                data: {
                    session
                }
            } =
                await supabase.auth
                    .getSession();

            if (!session?.access_token) {
                throw new Error(
                    "Sua sessão expirou. Entre novamente na plataforma."
                );
            }

            const resposta =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${session.access_token}`
                        },

                        body:
                            JSON.stringify({
                                message:
                                    textoAtual,

                                image:
                                    imagemAtual?.dataUrl ||
                                    null,

                                audio:
                                    audioAtual
                                        ? {
                                            data:
                                                audioAtual.base64,
                                            mimeType:
                                                audioAtual.mimeType,
                                            name:
                                                audioAtual.nome
                                        }
                                        : null,

                                previousResponseId:
                                    previousResponseId ||
                                    null
                            })
                    }
                );

            const dados =
                await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.error ||
                    "Erro ao consultar assistente."
                );
            }

            if (dados.transcription) {

                setMensagens(
                    (estadoAtual) =>
                        estadoAtual.map(
                            (item) =>
                                item.id === idMensagem
                                    ? {
                                        ...item,
                                        transcription:
                                            dados.transcription
                                    }
                                    : item
                        )
                );

            }

            if (dados.responseId) {
                setPreviousResponseId(
                    dados.responseId
                );
            }

            setMensagens(
                (estadoAtual) => [
                    ...estadoAtual,
                    {
                        id: criarId(),
                        role: "assistant",
                        content:
                            dados.message
                    }
                ]
            );

        }
        catch (error) {

            console.error(error);

            // Remove a mensagem otimista e restaura
            // o conteúdo para permitir uma nova tentativa.
            setMensagens(
                (estadoAtual) =>
                    estadoAtual.filter(
                        (item) =>
                            item.id !==
                            idMensagem
                    )
            );

            setMensagem(textoAtual);
            setImagem(imagemAtual);
            setAudio(audioAtual);

            setMensagens(
                (estadoAtual) => [
                    ...estadoAtual,
                    {
                        id: criarId(),
                        role: "assistant",
                        content:
                            error?.message ||
                            "Não consegui responder agora. Tente novamente em alguns instantes."
                    }
                ]
            );

        }
        finally {
            setCarregando(false);
        }

    }


    // ==========================================
    // ENTER PARA ENVIAR
    // ==========================================

    function handleKeyDown(evento) {

        if (
            evento.key === "Enter" &&
            !evento.shiftKey
        ) {

            evento.preventDefault();
            enviarMensagem();

        }

    }


    return (

        <div className="synter-assistant">


            {/* ================================= */}
            {/* JANELA                            */}
            {/* ================================= */}

            {aberto && (

                <div className="synter-chat">


                    {/* HEADER */}

                    <div className="synter-chat-header">

                        <div className="synter-chat-user">

                            <div className="synter-chat-avatar">
                                S
                            </div>

                            <div>

                                <strong>
                                    Assistente Synter
                                </strong>

                                <span>
                                    Inteligência Artificial
                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="synter-chat-close"
                            onClick={() =>
                                setAberto(false)
                            }
                            aria-label="Fechar assistente"
                        >
                            ×
                        </button>

                    </div>


                    {/* MENSAGENS */}

                    <div
                        className="synter-chat-messages"
                        ref={mensagensRef}
                    >

                        {mensagens.map((item) => (

                            <div
                                key={item.id}
                                className={
                                    item.role === "user"
                                        ? "synter-message synter-message-user"
                                        : "synter-message synter-message-assistant"
                                }
                            >

                                {item.image && (

                                    <img
                                        src={item.image}
                                        alt="Imagem enviada ao Assistente Synter"
                                        className="synter-message-image"
                                    />

                                )}


                                {item.audio && (

                                    <div className="synter-message-audio">

                                        <audio
                                            controls
                                            preload="metadata"
                                            src={item.audio}
                                        />

                                        {item.audioDuration && (
                                            <small>
                                                Áudio •{" "}
                                                {formatarTempo(
                                                    item.audioDuration
                                                )}
                                            </small>
                                        )}

                                    </div>

                                )}


                                {item.content && (
                                    <div className="synter-message-text">
                                        {item.content}
                                    </div>
                                )}


                                {item.transcription && (

                                    <div className="synter-message-transcription">

                                        <span>
                                            Transcrição
                                        </span>

                                        <p>
                                            {item.transcription}
                                        </p>

                                    </div>

                                )}

                            </div>

                        ))}


                        {carregando && (

                            <div
                                className="synter-message synter-message-assistant synter-typing"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                        )}

                    </div>


                    {/* INPUT */}

                    <form
                        className="synter-chat-form"
                        onSubmit={enviarMensagem}
                    >

                        <input
                            ref={imagemInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="synter-file-input"
                            onChange={selecionarImagem}
                            disabled={
                                carregando ||
                                processandoImagem
                            }
                        />


                        {(
                            imagem ||
                            audio ||
                            gravando ||
                            processandoImagem
                        ) && (

                            <div className="synter-attachment-area">

                                {processandoImagem && (
                                    <div className="synter-attachment-processing">
                                        Preparando imagem...
                                    </div>
                                )}


                                {imagem && (

                                    <div className="synter-image-preview">

                                        <img
                                            src={imagem.dataUrl}
                                            alt="Prévia da imagem"
                                        />

                                        <div>
                                            <strong>
                                                Imagem anexada
                                            </strong>
                                            <span>
                                                {imagem.nome}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="synter-attachment-remove"
                                            onClick={() =>
                                                setImagem(null)
                                            }
                                            disabled={carregando}
                                            aria-label="Remover imagem"
                                        >
                                            ×
                                        </button>

                                    </div>

                                )}


                                {gravando && (

                                    <div className="synter-recording-preview">

                                        <div className="synter-recording-status">
                                            <span className="synter-recording-dot"></span>
                                            <strong>
                                                Gravando
                                            </strong>
                                            <time>
                                                {formatarTempo(
                                                    tempoGravacao
                                                )}
                                            </time>
                                        </div>

                                        <div className="synter-recording-actions">
                                            <button
                                                type="button"
                                                onClick={cancelarGravacao}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="synter-recording-stop"
                                                onClick={pararGravacao}
                                            >
                                                Parar
                                            </button>
                                        </div>

                                    </div>

                                )}


                                {!gravando && audio && (

                                    <div className="synter-audio-preview">

                                        <audio
                                            controls
                                            preload="metadata"
                                            src={audio.dataUrl}
                                        />

                                        <span>
                                            {formatarTempo(
                                                audio.duracao
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            className="synter-attachment-remove"
                                            onClick={() =>
                                                setAudio(null)
                                            }
                                            disabled={carregando}
                                            aria-label="Remover áudio"
                                        >
                                            ×
                                        </button>

                                    </div>

                                )}

                            </div>

                        )}


                        {erroMidia && (
                            <div
                                className="synter-media-error"
                                role="alert"
                            >
                                {erroMidia}
                            </div>
                        )}


                        <div className="synter-chat-compose-row">

                            <button
                                type="button"
                                className="synter-chat-tool-button"
                                onClick={() =>
                                    imagemInputRef.current?.click()
                                }
                                disabled={
                                    carregando ||
                                    gravando ||
                                    processandoImagem
                                }
                                aria-label="Adicionar foto"
                                title="Adicionar foto"
                            >
                                +
                            </button>


                            <textarea
                                placeholder="Digite sua pergunta..."
                                value={mensagem}
                                onChange={(evento) =>
                                    setMensagem(
                                        evento.target.value
                                    )
                                }
                                onKeyDown={handleKeyDown}
                                rows="1"
                                disabled={carregando}
                            />


                            <button
                                type="button"
                                className={
                                    gravando
                                        ? "synter-chat-tool-button synter-chat-mic-button gravando"
                                        : "synter-chat-tool-button synter-chat-mic-button"
                                }
                                onClick={
                                    gravando
                                        ? pararGravacao
                                        : iniciarGravacao
                                }
                                disabled={
                                    carregando ||
                                    processandoImagem
                                }
                                aria-label={
                                    gravando
                                        ? "Parar gravação"
                                        : "Gravar áudio"
                                }
                                title={
                                    gravando
                                        ? "Parar gravação"
                                        : "Gravar áudio"
                                }
                            >

                                {gravando ? (
                                    <span className="synter-stop-icon"></span>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H8v2h8v-2h-3v-3.08A7 7 0 0 0 19 11h-2Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                )}

                            </button>


                            <button
                                type="submit"
                                className="synter-chat-send-button"
                                disabled={
                                    carregando ||
                                    gravando ||
                                    processandoImagem ||
                                    (
                                        !mensagem.trim() &&
                                        !imagem &&
                                        !audio
                                    )
                                }
                                aria-label="Enviar mensagem"
                            >
                                ➜
                            </button>

                        </div>

                    </form>


                    <div className="synter-chat-footer">
                        Assistente com Inteligência Artificial
                    </div>

                </div>

            )}


            <button
                type="button"
                className="synter-assistant-button"
                onClick={() =>
                    setAberto(
                        (estadoAtual) =>
                            !estadoAtual
                    )
                }
                aria-label="Abrir Assistente Synter"
            >
                {aberto ? "×" : "AI"}
            </button>


        </div>

    );

}


export default SynterAssistant;
