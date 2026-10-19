import {

    useEffect,

    useRef,

    useState

} from "react";



import { supabase } from "../services/supabaseClient";



import "../styles/SynterAssistant.css";





const LIMITE_IMAGEM = 10 * 1024 * 1024;

const LIMITE_ARQUIVO = 3 * 1024 * 1024;

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



    const [arquivo, setArquivo] =

        useState(null);



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



    const arquivoInputRef =

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

        arquivo,

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





    function formatarTamanhoArquivo(bytes) {

        const valor =
            Number(bytes || 0);


        if (valor < 1024) {
            return `${valor} B`;
        }


        if (valor < 1024 * 1024) {
            return `${(valor / 1024).toFixed(1)} KB`;
        }


        return `${(valor / (1024 * 1024)).toFixed(1)} MB`;

    }



    function extensaoArquivo(nome = "") {

        const partes =
            String(nome).toLowerCase().split(".");


        return partes.length > 1
            ? partes.pop()
            : "";

    }



    function mimeAudioPorArquivo(arquivo) {

        const mime =
            String(arquivo?.type || "")
                .split(";")[0]
                .toLowerCase();


        if (mime.startsWith("audio/")) {
            return mime;
        }


        const extensao =
            extensaoArquivo(arquivo?.name);


        const mapa = {
            flac: "audio/flac",
            mp3: "audio/mpeg",
            mp4: "audio/mp4",
            mpeg: "audio/mpeg",
            mpga: "audio/mpeg",
            m4a: "audio/m4a",
            ogg: "audio/ogg",
            wav: "audio/wav",
            webm: "audio/webm"
        };


        return mapa[extensao] || "";

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

    // ARQUIVO / FOTO / ÁUDIO DO DISPOSITIVO

    // ==========================================



    async function selecionarArquivo(evento) {

        const arquivoSelecionado =
            evento.target.files?.[0];


        evento.target.value = "";


        if (!arquivoSelecionado) {
            return;
        }


        try {

            setErroMidia("");
            setProcessandoImagem(true);


            // Mantemos apenas um anexo por mensagem para
            // evitar payloads grandes no /api/chat.
            setImagem(null);
            setArquivo(null);
            setAudio(null);


            const tipoImagem =
                String(arquivoSelecionado.type || "")
                    .toLowerCase();


            if (
                [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ].includes(tipoImagem)
            ) {

                const preparada =
                    await otimizarImagem(
                        arquivoSelecionado
                    );


                setImagem(preparada);
                return;

            }


            const mimeAudio =
                mimeAudioPorArquivo(
                    arquivoSelecionado
                );


            if (mimeAudio) {

                if (
                    arquivoSelecionado.size >
                    LIMITE_ARQUIVO
                ) {

                    throw new Error(
                        "O áudio selecionado deve ter no máximo 3 MB."
                    );

                }


                const dataUrl =
                    await arquivoParaDataUrl(
                        arquivoSelecionado
                    );


                setAudio({
                    dataUrl,
                    base64:
                        dataUrl.split(",")[1] || "",
                    mimeType:
                        mimeAudio,
                    nome:
                        arquivoSelecionado.name ||
                        `audio.${extensaoAudio(mimeAudio)}`,
                    duracao: null
                });


                return;

            }


            if (
                arquivoSelecionado.size >
                LIMITE_ARQUIVO
            ) {

                throw new Error(
                    "O arquivo deve ter no máximo 3 MB."
                );

            }


            const dataUrl =
                await arquivoParaDataUrl(
                    arquivoSelecionado
                );


            setArquivo({
                nome:
                    arquivoSelecionado.name ||
                    "arquivo",
                mimeType:
                    arquivoSelecionado.type ||
                    "application/octet-stream",
                tamanho:
                    arquivoSelecionado.size,
                dataUrl,
                base64:
                    dataUrl.split(",")[1] || ""
            });

        }
        catch (error) {

            console.error(
                "Erro ao selecionar arquivo:",
                error
            );


            setErroMidia(
                error?.message ||
                "Não foi possível adicionar o arquivo."
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

            setImagem(null);
            setArquivo(null);
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

                !arquivo &&

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



        const arquivoAtual =

            arquivo;



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

            file:

                arquivoAtual

                    ? {

                        name: arquivoAtual.nome,

                        mimeType: arquivoAtual.mimeType,

                        size: arquivoAtual.tamanho,

                        dataUrl: arquivoAtual.dataUrl

                    }

                    : null,

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

        setArquivo(null);

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



                                file:

                                    arquivoAtual

                                        ? {

                                            data:

                                                arquivoAtual.base64,

                                            mimeType:

                                                arquivoAtual.mimeType,

                                            name:

                                                arquivoAtual.nome,

                                            size:

                                                arquivoAtual.tamanho

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
                            dados.message ||
                            "",

                        generatedImages:
                            Array.isArray(
                                dados.images
                            )
                                ? dados.images
                                : []

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

            setArquivo(arquivoAtual);

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

                                    `${
                                        item.role === "user"
                                            ? "synter-message synter-message-user"
                                            : "synter-message synter-message-assistant"
                                    }${
                                        item.generatedImages?.length
                                            ? " synter-message-generated"
                                            : ""
                                    }`

                                }

                            >



                                {item.image && (



                                    <img

                                        src={item.image}

                                        alt="Imagem enviada ao Assistente Synter"

                                        className="synter-message-image"

                                    />



                                )}





                                {Array.isArray(item.generatedImages) &&
                                item.generatedImages.length > 0 && (
                                    <div className="synter-generated-images">
                                        {item.generatedImages.map((imagemGerada, index) => (
                                            <img
                                                key={`${item.id}-generated-${index}`}
                                                src={imagemGerada}
                                                alt={`Imagem criada pelo Assistente Synter ${index + 1}`}
                                                className="synter-generated-image"
                                            />
                                        ))}
                                    </div>
                                )}



                                {item.file && (

                                    <a
                                        className="synter-message-file"
                                        href={item.file.dataUrl || undefined}
                                        download={item.file.name}
                                        onClick={(evento) => {
                                            if (!item.file.dataUrl) {
                                                evento.preventDefault();
                                            }
                                        }}
                                    >

                                        <span className="synter-file-icon">
                                            {(extensaoArquivo(item.file.name) || "ARQ")
                                                .slice(0, 4)
                                                .toUpperCase()}
                                        </span>

                                        <span className="synter-file-info">
                                            <strong>
                                                {item.file.name}
                                            </strong>

                                            <small>
                                                {item.file.mimeType || "Arquivo"}
                                                {item.file.size
                                                    ? ` • ${formatarTamanhoArquivo(item.file.size)}`
                                                    : ""}
                                            </small>
                                        </span>

                                    </a>

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

                            ref={arquivoInputRef}

                            type="file"

                            className="synter-file-input"

                            onChange={selecionarArquivo}

                            disabled={

                                carregando ||

                                processandoImagem

                            }

                        />





                        {(

                            imagem ||

                            arquivo ||

                            audio ||

                            gravando ||

                            processandoImagem

                        ) && (



                            <div className="synter-attachment-area">



                                {processandoImagem && (

                                    <div className="synter-attachment-processing">

                                        Preparando anexo...

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





                                {arquivo && (

                                    <div className="synter-file-preview">

                                        <span className="synter-file-icon">
                                            {(extensaoArquivo(arquivo.nome) || "ARQ")
                                                .slice(0, 4)
                                                .toUpperCase()}
                                        </span>

                                        <div className="synter-file-preview-info">

                                            <strong>
                                                {arquivo.nome}
                                            </strong>

                                            <span>
                                                {arquivo.mimeType || "Arquivo"}
                                                {" • "}
                                                {formatarTamanhoArquivo(
                                                    arquivo.tamanho
                                                )}
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            className="synter-attachment-remove"
                                            onClick={() =>
                                                setArquivo(null)
                                            }
                                            disabled={carregando}
                                            aria-label="Remover arquivo"
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



                                        {audio.duracao ? (

                                            <span>

                                                {formatarTempo(

                                                    audio.duracao

                                                )}

                                            </span>

                                        ) : (

                                            <span>
                                                Áudio anexado
                                            </span>

                                        )}



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

                                    arquivoInputRef.current?.click()

                                }

                                disabled={

                                    carregando ||

                                    gravando ||

                                    processandoImagem

                                }

                                aria-label="Adicionar arquivo"

                                title="Adicionar arquivo"

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

                                        !arquivo &&

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