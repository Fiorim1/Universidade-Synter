import OpenAI, {
    toFile
} from "openai";


const openai =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY
    });


const MAX_TEXT_LENGTH =
    6000;

const MAX_IMAGE_BYTES =
    3 * 1024 * 1024;

const MAX_AUDIO_BYTES =
    6 * 1024 * 1024;


const IMAGE_DATA_URL =
    /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/i;


const AUDIO_MIME_TYPES =
    new Set([
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/ogg",
        "audio/m4a",
        "audio/x-m4a"
    ]);


const INSTRUCTIONS = `
Você é o Assistente Synter, integrado à plataforma Universidade Synter.

Sua função é auxiliar usuários da plataforma de forma profissional, clara e objetiva.

Regras:

- Responda sempre em português do Brasil.
- Seja educado e profissional.
- Prefira respostas diretas e fáceis de entender.
- Quando não tiver certeza sobre uma informação interna da Synter, informe que não possui essa informação.
- Nunca invente especificações de produtos, procedimentos técnicos, preços ou políticas da empresa.
- Não diga que tem acesso a documentos internos se eles ainda não tiverem sido disponibilizados para você.
- Ajude com dúvidas gerais sobre tecnologia, produtos, treinamentos, documentos e uso da Universidade Synter.
- Quando a pergunta envolver segurança ou procedimentos técnicos que possam causar danos, oriente o usuário a confirmar a informação no manual oficial.
- Quando receber uma foto, analise somente o que for realmente visível.
- Diferencie observação visual de hipótese técnica.
- Não afirme que uma peça está defeituosa apenas pela aparência quando a imagem não for suficiente para concluir isso.
- Quando a mensagem vier de um áudio transcrito, considere que podem existir pequenos erros de transcrição.
- Se um trecho essencial estiver ambíguo, peça confirmação ao usuário.
`;


// ==========================================
// UTILITÁRIOS
// ==========================================

function normalizarTexto(
    valor
) {

    return String(
        valor || ""
    )
        .trim()
        .slice(
            0,
            MAX_TEXT_LENGTH
        );

}


function tamanhoBase64EmBytes(
    base64
) {

    const limpo =
        String(
            base64 || ""
        )
            .replace(
                /\s/g,
                ""
            );


    const padding =
        limpo.endsWith("==")
            ? 2
            : limpo.endsWith("=")
                ? 1
                : 0;


    return Math.max(
        0,
        Math.floor(
            limpo.length *
            0.75
        ) -
        padding
    );

}


// ==========================================
// VALIDAR IMAGEM
// ==========================================

function validarImagem(
    image
) {

    if (!image) {
        return null;
    }


    if (
        typeof image !==
        "string"
    ) {

        throw new Error(
            "Formato de imagem inválido."
        );

    }


    const encontrada =
        image.match(
            IMAGE_DATA_URL
        );


    if (!encontrada) {

        throw new Error(
            "A imagem precisa ser JPG, PNG ou WEBP."
        );

    }


    const base64 =
        encontrada[2];


    if (
        tamanhoBase64EmBytes(
            base64
        ) >
        MAX_IMAGE_BYTES
    ) {

        throw new Error(
            "A imagem ultrapassa o limite permitido."
        );

    }


    return image;

}


// ==========================================
// ÁUDIO
// ==========================================

function normalizarMimeAudio(
    mimeType
) {

    return String(
        mimeType || ""
    )
        .split(";")[0]
        .toLowerCase()
        .trim();

}


function extensaoAudio(
    mimeType
) {

    const mapa = {

        "audio/webm":
            "webm",

        "audio/mp4":
            "mp4",

        "audio/mpeg":
            "mp3",

        "audio/mp3":
            "mp3",

        "audio/wav":
            "wav",

        "audio/x-wav":
            "wav",

        "audio/ogg":
            "ogg",

        "audio/m4a":
            "m4a",

        "audio/x-m4a":
            "m4a"

    };


    return (
        mapa[
            normalizarMimeAudio(
                mimeType
            )
        ] ||
        "webm"
    );

}


// ==========================================
// PREVIOUS RESPONSE ID
// ==========================================

function validarPreviousResponseId(
    valor
) {

    if (!valor) {
        return null;
    }


    const id =
        String(
            valor
        )
            .trim();


    if (
        id.length > 200 ||
        !/^resp_[A-Za-z0-9_-]+$/.test(
            id
        )
    ) {

        return null;

    }


    return id;

}


// ==========================================
// AUTENTICAÇÃO SUPABASE
// ==========================================

async function validarUsuario(
    req
) {

    const authorization =
        String(
            req.headers.authorization ||
            ""
        );


    if (
        !authorization.startsWith(
            "Bearer "
        )
    ) {

        return null;

    }


    const token =
        authorization
            .slice(7)
            .trim();


    if (!token) {
        return null;
    }


    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL;


    const supabaseAnonKey =
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY;


    if (
        !supabaseUrl ||
        !supabaseAnonKey
    ) {

        console.error(
            "Variáveis do Supabase não configuradas no servidor."
        );

        return null;

    }


    try {

        const resposta =
            await fetch(
                `${supabaseUrl}/auth/v1/user`,
                {

                    method:
                        "GET",

                    headers: {

                        apikey:
                            supabaseAnonKey,

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (!resposta.ok) {
            return null;
        }


        const usuario =
            await resposta.json();


        return usuario?.id
            ? usuario
            : null;

    }
    catch (error) {

        console.error(
            "Erro ao validar sessão no Supabase:",
            error
        );


        return null;

    }

}


// ==========================================
// TRANSCRIÇÃO DO ÁUDIO
// ==========================================

async function transcreverAudio(
    audio
) {

    if (!audio) {
        return "";
    }


    const base64 =
        String(
            audio.data || ""
        )
            .replace(
                /\s/g,
                ""
            );


    const mimeType =
        normalizarMimeAudio(
            audio.mimeType
        );


    if (
        !base64 ||
        !mimeType ||
        !AUDIO_MIME_TYPES.has(
            mimeType
        )
    ) {

        throw new Error(
            "Formato de áudio inválido."
        );

    }


    if (
        tamanhoBase64EmBytes(
            base64
        ) >
        MAX_AUDIO_BYTES
    ) {

        throw new Error(
            "O áudio ultrapassa o limite permitido."
        );

    }


    const buffer =
        Buffer.from(
            base64,
            "base64"
        );


    if (
        buffer.length <
        500
    ) {

        throw new Error(
            "O áudio está vazio ou muito curto."
        );

    }


    const nomeSeguro =
        `audio-synter.${extensaoAudio(
            mimeType
        )}`;


    const arquivo =
        await toFile(
            buffer,
            nomeSeguro,
            {
                type:
                    mimeType
            }
        );


    const transcricao =
        await openai.audio
            .transcriptions
            .create({

                file:
                    arquivo,

                model:
                    process.env
                        .OPENAI_TRANSCRIBE_MODEL ||
                    "gpt-4o-mini-transcribe",

                language:
                    "pt"

            });


    return String(
        transcricao.text || ""
    ).trim();

}


// ==========================================
// HANDLER
// ==========================================

export default async function handler(
    req,
    res
) {

    res.setHeader(
        "Cache-Control",
        "no-store"
    );


    // ======================================
    // SOMENTE POST
    // ======================================

    if (
        req.method !==
        "POST"
    ) {

        return res
            .status(405)
            .json({

                error:
                    "Método não permitido."

            });

    }


    try {

        // ======================================
        // VALIDA USUÁRIO
        // ======================================

        const usuario =
            await validarUsuario(
                req
            );


        if (!usuario) {

            return res
                .status(401)
                .json({

                    error:
                        "Sessão inválida ou expirada."

                });

        }


        // ======================================
        // RECEBE DADOS
        // ======================================

        const corpo =
            req.body &&
            typeof req.body ===
            "object"
                ? req.body
                : {};


        let texto =
            normalizarTexto(
                corpo.message
            );


        const image =
            validarImagem(
                corpo.image
            );


        const previousResponseId =
            validarPreviousResponseId(
                corpo.previousResponseId
            );


        // ======================================
        // TRANSCRIÇÃO DO ÁUDIO
        // ======================================

        const transcription =
            await transcreverAudio(
                corpo.audio
            );


        if (
            transcription
        ) {

            texto =
                texto
                    ? `${texto}

Mensagem de áudio transcrita:
${transcription}`
                    : transcription;

        }


        // ======================================
        // COMPATIBILIDADE COM FRONTEND ANTIGO
        // ======================================

        let historicoAntigo =
            null;


        if (
            !previousResponseId &&
            Array.isArray(
                corpo.messages
            ) &&
            corpo.messages.length >
            0 &&
            !image &&
            !corpo.audio &&
            !corpo.message
        ) {

            historicoAntigo =
                corpo.messages
                    .slice(
                        -12
                    )
                    .map(
                        (
                            mensagem
                        ) => ({

                            role:
                                mensagem.role ===
                                "assistant"
                                    ? "assistant"
                                    : "user",

                            content:
                                normalizarTexto(
                                    mensagem.content
                                )

                        })
                    )
                    .filter(
                        (
                            mensagem
                        ) =>
                            mensagem.content
                    );

        }


        // ======================================
        // VALIDA CONTEÚDO
        // ======================================

        if (
            !texto &&
            !image &&
            !historicoAntigo
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Envie uma mensagem, foto ou áudio."

                });

        }


        // ======================================
        // MONTA INPUT
        // ======================================

        let input;


        if (
            historicoAntigo
        ) {

            input =
                historicoAntigo;

        }
        else {

            const content =
                [];


            content.push({

                type:
                    "input_text",

                text:
                    texto ||
                    "Analise esta imagem e explique de forma objetiva o que é possível observar."

            });


            if (
                image
            ) {

                content.push({

                    type:
                        "input_image",

                    image_url:
                        image,

                    detail:
                        "auto"

                });

            }


            input = [

                {

                    role:
                        "user",

                    content

                }

            ];

        }


        // ======================================
        // OPENAI RESPONSES API
        // ======================================

        const parametros = {

            model:
                process.env.OPENAI_MODEL ||
                "gpt-6-astra",

            reasoning: {

                effort:
                    "low"

            },

            instructions:
                INSTRUCTIONS,

            input,

            store:
                true

        };


        // ======================================
        // MANTER CONTEXTO
        // ======================================

        if (
            previousResponseId
        ) {

            parametros.previous_response_id =
                previousResponseId;

        }


        // ======================================
        // ENVIA PARA OPENAI
        // ======================================

        const response =
            await openai.responses
                .create(
                    parametros
                );


        // ======================================
        // RESPOSTA
        // ======================================

        const resposta =
            response.output_text
                ?.trim();


        if (
            !resposta
        ) {

            return res
                .status(500)
                .json({

                    error:
                        "Não foi possível gerar uma resposta."

                });

        }


        return res
            .status(200)
            .json({

                message:
                    resposta,

                responseId:
                    response.id,

                transcription:
                    transcription ||
                    null

            });

    }
    catch (
        error
    ) {

        console.error(
            "Erro Assistente Synter:",
            {

                name:
                    error?.name,

                status:
                    error?.status,

                code:
                    error?.code,

                message:
                    error?.message

            }
        );


        const mensagem =
            String(
                error?.message ||
                ""
            );


        // ======================================
        // ERROS DE ARQUIVO
        // ======================================

        if (
            mensagem.includes(
                "imagem"
            ) ||
            mensagem.includes(
                "áudio"
            ) ||
            mensagem.includes(
                "Formato"
            ) ||
            mensagem.includes(
                "limite"
            )
        ) {

            return res
                .status(400)
                .json({

                    error:
                        mensagem

                });

        }


        // ======================================
        // ERRO GENÉRICO
        // ======================================

        return res
            .status(500)
            .json({

                error:
                    "Não foi possível responder no momento."

            });

    }

}