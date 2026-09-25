import {
    useEffect,
    useRef,
    useState
} from "react";

import "../styles/SynterAssistant.css";


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
                role: "assistant",
                content:
                    "Olá! Sou o Assistente Synter. Como posso ajudar?"
            }
        ]);


    const mensagensRef =
        useRef(null);


    // ==========================================
    // ROLAR PARA ÚLTIMA MENSAGEM
    // ==========================================

    useEffect(() => {

        if (!mensagensRef.current) {
            return;
        }


        mensagensRef.current.scrollTop =
            mensagensRef.current.scrollHeight;

    }, [mensagens, carregando]);


    // ==========================================
    // ENVIAR MENSAGEM
    // ==========================================

    async function enviarMensagem(evento) {

        evento?.preventDefault();


        const texto =
            mensagem.trim();


        if (
            !texto ||
            carregando
        ) {
            return;
        }


        const mensagemUsuario = {

            role: "user",
            content: texto

        };


        const novoHistorico = [

            ...mensagens,
            mensagemUsuario

        ];


        setMensagens(
            novoHistorico
        );

        setMensagem("");

        setCarregando(true);


        try {

            const resposta =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                messages:
                                    novoHistorico

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


            setMensagens(
                (estadoAtual) => [

                    ...estadoAtual,

                    {
                        role: "assistant",

                        content:
                            dados.message
                    }

                ]
            );


        } catch (error) {

            console.error(
                error
            );


            setMensagens(
                (estadoAtual) => [

                    ...estadoAtual,

                    {
                        role: "assistant",

                        content:
                            "Não consegui responder agora. Tente novamente em alguns instantes."
                    }

                ]
            );


        } finally {

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

                        {mensagens.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    key={index}
                                    className={
                                        item.role ===
                                        "user"
                                            ? "synter-message synter-message-user"
                                            : "synter-message synter-message-assistant"
                                    }
                                >

                                    {item.content}

                                </div>

                            )
                        )}


                        {/* DIGITANDO */}

                        {carregando && (

                            <div
                                className="
                                    synter-message
                                    synter-message-assistant
                                    synter-typing
                                "
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

                        <textarea
                            placeholder="Digite sua pergunta..."
                            value={mensagem}
                            onChange={(evento) =>
                                setMensagem(
                                    evento.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            rows="1"
                        />


                        <button
                            type="submit"
                            disabled={
                                carregando ||
                                !mensagem.trim()
                            }
                            aria-label="Enviar mensagem"
                        >
                            ➜
                        </button>

                    </form>


                    {/* FOOTER */}

                    <div className="synter-chat-footer">

                        Assistente com Inteligência Artificial

                    </div>

                </div>

            )}


            {/* ================================= */}
            {/* BOTÃO FLUTUANTE                   */}
            {/* ================================= */}

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

                {aberto
                    ? "×"
                    : "AI"}

            </button>


        </div>

    );

}


export default SynterAssistant;