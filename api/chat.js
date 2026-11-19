import { createHash } from "node:crypto"

import OpenAI, {
    toFile
} from "openai"

import {
    exigirAcesso,
    lerCargosPermitidos
} from "./_lib/exigirAcesso.js"


const openai =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY
    })


const MAX_TEXT_LENGTH =
    6000

const MAX_IMAGE_BYTES =
    3 * 1024 * 1024

const MAX_AUDIO_BYTES =
    6 * 1024 * 1024

const MAX_FILE_BYTES =
    3 * 1024 * 1024


const IMAGE_DATA_URL =
    /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/i


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
        "audio/x-m4a",
        "audio/flac",
        "audio/x-flac"
    ])


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
- Quando receber um arquivo, analise somente o conteúdo que estiver realmente disponível no arquivo.
- Se o formato do arquivo não puder ser interpretado, informe isso claramente em vez de inventar o conteúdo.
- Se um trecho essencial estiver ambíguo, peça confirmação ao usuário.
- Quando o usuário pedir para criar, gerar, desenhar, transformar ou editar uma imagem, use obrigatoriamente a ferramenta de geração de imagem. Não responda apenas com um prompt ou uma descrição da imagem.
`


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
        )

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
            )


    const padding =
        limpo.endsWith("==")
            ? 2
            : limpo.endsWith("=")
                ? 1
                : 0


    return Math.max(
        0,

        Math.floor(
            limpo.length *
            0.75
        ) -
        padding
    )

}


// ==========================================
// VALIDAR IMAGEM
// ==========================================

function validarImagem(
    image
) {

    if (!image) {

        return null

    }


    if (
        typeof image !==
        "string"
    ) {

        throw new Error(
            "Formato de imagem inválido."
        )

    }


    const encontrada =
        image.match(
            IMAGE_DATA_URL
        )


    if (!encontrada) {

        throw new Error(
            "A imagem precisa ser JPG, PNG ou WEBP."
        )

    }


    const base64 =
        encontrada[2]


    if (
        tamanhoBase64EmBytes(
            base64
        ) >
        MAX_IMAGE_BYTES
    ) {

        throw new Error(
            "A imagem ultrapassa o limite permitido."
        )

    }


    return image

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
        .trim()

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
            "m4a",

        "audio/flac":
            "flac",

        "audio/x-flac":
            "flac"

    }


    return (
        mapa[
            normalizarMimeAudio(
                mimeType
            )
        ] ||
        "webm"
    )

}


// ==========================================
// ARQUIVO GENÉRICO
// ==========================================

function limparNomeArquivo(
    nome
) {

    const seguro =
        String(
            nome ||
            "arquivo"
        )
            .replace(
                /[\u0000-\u001F\u007F]/g,
                ""
            )
            .replace(
                /[\\/:*?"<>|]/g,
                "_"
            )
            .trim()
            .slice(
                0,
                180
            )


    return seguro ||
        "arquivo"

}


function prepararArquivoGenerico(
    arquivo
) {

    if (!arquivo) {

        return null

    }


    if (
        typeof arquivo !==
        "object"
    ) {

        throw new Error(
            "Formato de arquivo inválido."
        )

    }


    const base64 =
        String(
            arquivo.data ||
            ""
        )
            .replace(
                /\s/g,
                ""
            )


    if (!base64) {

        throw new Error(
            "O arquivo enviado está vazio."
        )

    }


    if (
        tamanhoBase64EmBytes(
            base64
        ) >
        MAX_FILE_BYTES
    ) {

        throw new Error(
            "O arquivo ultrapassa o limite permitido de 3 MB."
        )

    }


    return {

        type:
            "input_file",

        filename:
            limparNomeArquivo(
                arquivo.name
            ),

        file_data:
            base64

    }

}


// ==========================================
// PREVIOUS RESPONSE ID
// ==========================================

function validarPreviousResponseId(
    valor
) {

    if (!valor) {

        return null

    }


    const id =
        String(
            valor
        )
            .trim()


    if (
        id.length > 200 ||
        !/^resp_[A-Za-z0-9_-]+$/.test(
            id
        )
    ) {

        return null

    }


    return id

}


// ==========================================
// AUTENTICAÇÃO SUPABASE
// ==========================================

function extrairBearerToken(
    req
) {

    const authorization =
        String(
            req.headers.authorization ||
            ""
        )
            .trim()


    if (
        !authorization.startsWith(
            "Bearer "
        )
    ) {

        return null

    }


    const token =
        authorization
            .slice(7)
            .trim()


    return token ||
        null

}


function decodificarPayloadJwt(
    token
) {

    try {

        const partes =
            String(
                token ||
                ""
            )
                .split(".")


        if (
            partes.length !==
            3
        ) {

            return null

        }


        let payloadBase64 =
            partes[1]
                .replace(
                    /-/g,
                    "+"
                )
                .replace(
                    /_/g,
                    "/"
                )


        const resto =
            payloadBase64.length %
            4


        if (
            resto
        ) {

            payloadBase64 +=
                "=".repeat(
                    4 -
                    resto
                )

        }


        const payloadJson =
            Buffer.from(
                payloadBase64,
                "base64"
            )
                .toString(
                    "utf8"
                )


        const payload =
            JSON.parse(
                payloadJson
            )


        return (
            payload &&
            typeof payload ===
                "object"
        )
            ? payload
            : null

    }
    catch {

        return null

    }

}


async function validarUsuario(
    req
) {

    const token =
        extrairBearerToken(
            req
        )


    if (!token) {

        return null

    }


    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL


    const supabaseAnonKey =
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY


    if (
        !supabaseUrl ||
        !supabaseAnonKey
    ) {

        console.error(
            "Variáveis do Supabase não configuradas no servidor."
        )


        return null

    }


    try {

        // ======================================
        // VALIDAR TOKEN NO SUPABASE
        // ======================================

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
            )


        if (
            !resposta.ok
        ) {

            return null

        }


        const usuario =
            await resposta.json()


        if (
            !usuario?.id
        ) {

            return null

        }


        // ======================================
        // LER CLAIMS DO TOKEN JÁ VALIDADO
        // ======================================

        const claims =
            decodificarPayloadJwt(
                token
            )


        if (
            !claims
        ) {

            return null

        }


        // ======================================
        // GARANTIR QUE O JWT PERTENCE AO USUÁRIO
        // ======================================

        if (
            String(
                claims.sub ||
                ""
            ) !==
            String(
                usuario.id
            )
        ) {

            return null

        }


        return {

            usuario,

            claims

        }

    }
    catch (
        error
    ) {

        console.error(
            "Erro ao validar sessão no Supabase:",
            error
        )


        return null

    }

}


// ==========================================
// DETECTAR PEDIDOS DE IMAGEM
// ==========================================

function normalizarIntentImagem(
    valor = ""
) {

    return String(
        valor
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()

}


function deveForcarGeracaoImagem(
    texto,
    temImagem
) {

    const valor =
        normalizarIntentImagem(
            texto
        )


    if (!valor) {

        return false

    }


    const pedidoCriacao =

        /\b(crie|criar|gere|gerar|desenhe|desenhar|faca|produza|ilustre|renderize|renderizar|transforme|transformar)\b/.test(
            valor
        ) &&

        /\b(imagem|foto|arte|desenho|ilustracao|wallpaper|render|pixel|mockup|banner|capa|logo)\b/.test(
            valor
        )


    const pedidoEdicao =

        Boolean(
            temImagem
        ) &&

        /\b(edite|editar|mude|troque|remova|retire|adicione|coloque|deixe|transforme|substitua|ajuste|altere)\b/.test(
            valor
        )


    return (
        pedidoCriacao ||
        pedidoEdicao
    )

}


// ==========================================
// IDENTIFICADOR DE SEGURANÇA
// ==========================================

function criarSafetyIdentifier(
    usuario
) {

    const id =
        String(
            usuario?.id ||
            ""
        )
            .trim()


    if (!id) {

        return undefined

    }


    return createHash(
        "sha256"
    )
        .update(
            id
        )
        .digest(
            "hex"
        )

}


// ==========================================
// TRANSCRIÇÃO DO ÁUDIO
// ==========================================

async function transcreverAudio(
    audio
) {

    if (!audio) {

        return ""

    }


    const base64 =
        String(
            audio.data ||
            ""
        )
            .replace(
                /\s/g,
                ""
            )


    const mimeType =
        normalizarMimeAudio(
            audio.mimeType
        )


    if (
        !base64 ||
        !mimeType ||
        !AUDIO_MIME_TYPES.has(
            mimeType
        )
    ) {

        throw new Error(
            "Formato de áudio inválido."
        )

    }


    if (
        tamanhoBase64EmBytes(
            base64
        ) >
        MAX_AUDIO_BYTES
    ) {

        throw new Error(
            "O áudio ultrapassa o limite permitido."
        )

    }


    const buffer =
        Buffer.from(
            base64,
            "base64"
        )


    if (
        buffer.length <
        500
    ) {

        throw new Error(
            "O áudio está vazio ou muito curto."
        )

    }


    const nomeSeguro =
        `audio-synter.${extensaoAudio(
            mimeType
        )}`


    const arquivo =
        await toFile(
            buffer,
            nomeSeguro,
            {

                type:
                    mimeType

            }
        )


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

            })


    return String(
        transcricao.text ||
        ""
    ).trim()

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
    )


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

            })

    }


    try {

        // ======================================
        // VALIDAR USUÁRIO
        // ======================================

        const autenticacao =
            await validarUsuario(
                req
            )


        if (
            !autenticacao
        ) {

            return res
                .status(401)
                .json({

                    error:
                        "Sessão inválida ou expirada.",

                    code:
                        "AUTH_REQUIRED"

                })

        }


        // ======================================
        // CARGO AUTORIZADO (verificado no servidor)
        // ======================================
        //
        // O uso do chat consome a conta paga da OpenAI. Só entram cargos
        // listados em CHAT_CARGOS_PERMITIDOS (ou, se vazio, em
        // SAT_CARGOS_PERMITIDOS).

        const acesso =
            await exigirAcesso(
                req,
                res,
                {
                    cargos:
                        lerCargosPermitidos([
                            "CHAT_CARGOS_PERMITIDOS",
                            "SAT_CARGOS_PERMITIDOS"
                        ]),

                    formatoErro:
                        "analytics"
                }
            )

        if (!acesso) {

            return

        }


        // ======================================
        // ROLE ESPERADA
        // ======================================

        if (
            autenticacao.claims?.role !==
            "authenticated"
        ) {

            return res
                .status(403)
                .json({

                    error:
                        "Acesso não autorizado.",

                    code:
                        "ACCESS_DENIED"

                })

        }


        const usuario =
            autenticacao.usuario


        // ======================================
        // RECEBER DADOS
        // ======================================

        const corpo =

            req.body &&
            typeof req.body ===
                "object"

                ? req.body
                : {}


        let texto =
            normalizarTexto(
                corpo.message
            )


        const image =
            validarImagem(
                corpo.image
            )


        const inputFile =
            prepararArquivoGenerico(
                corpo.file
            )


        const previousResponseId =
            validarPreviousResponseId(
                corpo.previousResponseId
            )


        // ======================================
        // TRANSCRIÇÃO DO ÁUDIO
        // ======================================

        const transcription =
            await transcreverAudio(
                corpo.audio
            )


        if (
            transcription
        ) {

            texto =

                texto

                    ? `${texto}

Mensagem de áudio transcrita:

${transcription}`

                    : transcription

        }


        // ======================================
        // COMPATIBILIDADE COM FRONTEND ANTIGO
        // ======================================

        let historicoAntigo =
            null


        if (

            !previousResponseId &&

            Array.isArray(
                corpo.messages
            ) &&

            corpo.messages.length >
            0 &&

            !image &&

            !inputFile &&

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
                    )

        }


        // ======================================
        // VALIDAR CONTEÚDO
        // ======================================

        if (

            !texto &&
            !image &&
            !inputFile &&
            !historicoAntigo

        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Envie uma mensagem, foto, áudio ou arquivo."

                })

        }


        // ======================================
        // MONTAR INPUT
        // ======================================

        let input


        if (
            historicoAntigo
        ) {

            input =
                historicoAntigo

        }
        else {

            const content =
                []


            content.push({

                type:
                    "input_text",

                text:

                    texto ||

                    (

                        image

                            ? "Analise esta imagem e explique de forma objetiva o que é possível observar."

                            : inputFile

                                ? "Analise o arquivo enviado e explique de forma objetiva o conteúdo relevante."

                                : "Responda à mensagem enviada."

                    )

            })


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

                })

            }


            if (
                inputFile
            ) {

                content.push(
                    inputFile
                )

            }


            input = [

                {

                    role:
                        "user",

                    content

                }

            ]

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

            tools: [

                {

                    type:
                        "image_generation",

                    model:

                        process.env.OPENAI_IMAGE_MODEL ||
                        "gpt-image-2.5-sunburst",

                    action:
                        "auto",

                    size:
                        "auto",

                    quality:
                        "medium",

                    output_format:
                        "webp",

                    output_compression:
                        85

                }

            ],

            safety_identifier:

                criarSafetyIdentifier(
                    usuario
                ),

            store:
                true

        }


        // ======================================
        // MANTER CONTEXTO
        // ======================================

        if (
            previousResponseId
        ) {

            parametros.previous_response_id =
                previousResponseId

        }


        // ======================================
        // FORÇAR GERAÇÃO DE IMAGEM
        // ======================================

        if (
            deveForcarGeracaoImagem(
                texto,
                Boolean(
                    image
                )
            )
        ) {

            parametros.tool_choice = {

                type:
                    "image_generation"

            }

        }


        // ======================================
        // ENVIAR PARA OPENAI
        // ======================================

        const response =
            await openai.responses
                .create(
                    parametros
                )


        // ======================================
        // EXTRAIR IMAGENS GERADAS
        // ======================================

        const imagensGeradas =

            (
                response.output ||
                []
            )

                .filter(
                    (
                        item
                    ) =>

                        item?.type ===
                            "image_generation_call" &&

                        item?.result
                )

                .map(
                    (
                        item
                    ) => {

                        const formato =

                            item.output_format ||
                            "webp"


                        return (
                            `data:image/${formato};base64,${item.result}`
                        )

                    }
                )


        // ======================================
        // TEXTO DA RESPOSTA
        // ======================================

        const respostaTexto =

            response.output_text
                ?.trim() ||
            ""


        const resposta =

            respostaTexto ||

            (

                imagensGeradas.length >
                0

                    ? "Imagem criada com sucesso."
                    : ""

            )


        if (

            !resposta &&

            imagensGeradas.length ===
            0

        ) {

            return res
                .status(500)
                .json({

                    error:
                        "Não foi possível gerar uma resposta."

                })

        }


        // ======================================
        // RETORNAR AO FRONTEND
        // ======================================

        return res
            .status(200)
            .json({

                message:
                    resposta,

                images:
                    imagensGeradas,

                responseId:
                    response.id,

                transcription:
                    transcription ||
                    null

            })

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
        )


        const mensagem =
            String(
                error?.message ||
                ""
            )


        const mensagemMinuscula =
            mensagem.toLowerCase()


        // ======================================
        // ERROS DE ARQUIVO / FORMATO
        // ======================================

        if (

            error?.status ===
            400 &&

            (

                mensagemMinuscula.includes(
                    "file"
                ) ||

                mensagemMinuscula.includes(
                    "arquivo"
                ) ||

                mensagemMinuscula.includes(
                    "unsupported"
                )

            )

        ) {

            return res
                .status(400)
                .json({

                    error:
                        "A IA não conseguiu ler esse formato de arquivo. Tente PDF, Word, Excel, CSV, TXT, imagem ou outro formato compatível."

                })

        }


        if (

            mensagemMinuscula.includes(
                "imagem"
            ) ||

            mensagemMinuscula.includes(
                "áudio"
            ) ||

            mensagemMinuscula.includes(
                "audio"
            ) ||

            mensagemMinuscula.includes(
                "arquivo"
            ) ||

            mensagemMinuscula.includes(
                "formato"
            ) ||

            mensagemMinuscula.includes(
                "limite"
            )

        ) {

            return res
                .status(400)
                .json({

                    error:
                        mensagem

                })

        }


        // ======================================
        // ERRO DE GERAÇÃO DE IMAGEM
        // ======================================

        if (

            mensagemMinuscula.includes(
                "image_generation"
            ) ||

            mensagemMinuscula.includes(
                "image generation"
            )

        ) {

            return res
                .status(500)
                .json({

                    error:
                        "Não foi possível gerar a imagem no momento. Tente novamente em alguns instantes."

                })

        }


        // ======================================
        // ERRO GENÉRICO
        // ======================================

        return res
            .status(500)
            .json({

                error:
                    "Não foi possível responder no momento."

            })

    }

}