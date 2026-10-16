import OpenAI, {
    toFile
} from "openai";


const openai =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY
    });


// ==========================================
// LIMITES
// ==========================================

const MAX_TEXT_LENGTH =
    6000;

const MAX_IMAGE_BYTES =
    3 * 1024 * 1024;

const MAX_AUDIO_BYTES =
    3 * 1024 * 1024;

const MAX_FILE_BYTES =
    3 * 1024 * 1024;

const MAX_TOTAL_BYTES =
    3 * 1024 * 1024;


// ==========================================
// IMAGEM
// ==========================================

const IMAGE_DATA_URL =
    /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/i;


// ==========================================
// ÁUDIOS ACEITOS PARA TRANSCRIÇÃO
// ==========================================

const AUDIO_MIME_TYPES =
    new Set([
        "audio/flac",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
        "audio/mp3",
        "audio/mpga",
        "audio/wav",
        "audio/x-wav",
        "audio/ogg",
        "audio/m4a",
        "audio/x-m4a"
    ]);


// ==========================================
// INSTRUÇÕES DA SYNTIA
// ==========================================

const INSTRUCTIONS = `
Você é o Assistente Synter, integrado à plataforma Universidade Synter.

Sua função é auxiliar os usuários da plataforma de forma profissional, clara e objetiva.

Regras:

- Responda sempre em português do Brasil.
- Seja educado, profissional e objetivo.
- Prefira respostas diretas e fáceis de entender.
- Quando não tiver certeza sobre uma informação interna da Synter, informe que não possui essa informação.
- Nunca invente especificações de produtos, procedimentos técnicos, preços ou políticas da empresa.
- Não diga que tem acesso a documentos internos se eles não tiverem sido fornecidos na conversa.
- Ajude com dúvidas gerais sobre tecnologia, produtos, treinamentos, documentos e uso da Universidade Synter.
- Quando a pergunta envolver segurança ou procedimentos técnicos que possam causar danos, oriente o usuário a confirmar a informação no manual oficial.

Sobre imagens:
- Analise somente aquilo que realmente estiver visível.
- Diferencie uma observação visual de uma hipótese técnica.
- Não afirme que uma peça está defeituosa somente pela aparência quando a imagem não for suficiente para essa conclusão.

Sobre áudios:
- O conteúdo de áudio pode chegar transcrito.
- Considere que podem existir pequenos erros de transcrição.
- Se algum trecho essencial estiver ambíguo, peça confirmação.

Sobre arquivos:
- Analise somente informações realmente presentes no arquivo enviado.
- Não invente páginas, campos, números, dados ou informações que não aparecem no arquivo.
- Se o arquivo não puder ser interpretado corretamente, informe isso ao usuário.
- Quando o usuário enviar um arquivo sem explicar o que deseja, faça uma análise geral curta e pergunte como pode ajudá-lo com aquele conteúdo.
`;


// ==========================================
// TEXTO
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


// ==========================================
// BASE64
// ==========================================

function limparBase64(
    valor
) {

    return String(
        valor || ""
    )
        .replace(
            /\s/g,
            ""
        );

}


function base64Valido(
    valor
) {

    const base64 =
        limparBase64(
            valor
        );

    if (!base64) {
        return false;
    }

    return /^[A-Za-z0-9+/]*={0,2}$/.test(
        base64
    );

}


function tamanhoBase64EmBytes(
    base64
) {

    const limpo =
        limparBase64(
            base64
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
// NOME DO ARQUIVO
// ==========================================

function sanitizarNomeArquivo(
    nome
) {

    const limpo =
        String(
            nome || "arquivo"
        )
            .replace(
                /[\u0000-\u001F\u007F]/g,
                ""
            )
            .replace(
                /[\\/]/g,
                "_"
            )
            .trim()
            .slice(
                0,
                180
            );

    return (
        limpo ||
        "arquivo"
    );

}


// ==========================================
// IMAGEM
// ==========================================

function validarImagem(
    image
) {

    if (!image) {

        return {
            valor:
                null,

            tamanho:
                0
        };

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

    const tamanho =
        tamanhoBase64EmBytes(
            base64
        );

    if (
        tamanho >
        MAX_IMAGE_BYTES
    ) {

        throw new Error(
            "A imagem ultrapassa o limite permitido."
        );

    }

    return {
        valor:
            image,

        tamanho
    };

}


// ==========================================
// MIME DO ÁUDIO
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


// ==========================================
// EXTENSÃO DO ÁUDIO
// ==========================================

function extensaoAudio(
    mimeType,
    nome = ""
) {

    const mime =
        normalizarMimeAudio(
            mimeType
        );

    const mapaMime = {

        "audio/flac":
            "flac",

        "audio/webm":
            "webm",

        "audio/mp4":
            "mp4",

        "audio/mpeg":
            "mp3",

        "audio/mp3":
            "mp3",

        "audio/mpga":
            "mpga",

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

    if (
        mapaMime[mime]
    ) {

        return mapaMime[
            mime
        ];

    }

    const extensao =
        String(
            nome
        )
            .split(".")
            .pop()
            .toLowerCase();

    const permitidas = [
        "flac",
        "mp3",
        "mp4",
        "mpeg",
        "mpga",
        "m4a",
        "ogg",
        "wav",
        "webm"
    ];

    if (
        permitidas.includes(
            extensao
        )
    ) {

        return extensao;

    }

    return "webm";

}


// ==========================================
// PREVIOUS RESPONSE
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
        id.length >
            200 ||
        !/^resp_[A-Za-z0-9_-]+$/.test(
            id
        )
    ) {

        return null;

    }

    return id;

}


// ==========================================
// VALIDAR ARQUIVO GENÉRICO
// ==========================================

function validarArquivo(
    file
) {

    if (!file) {

        return {
            valor:
                null,

            tamanho:
                0
        };

    }

    if (
        typeof file !==
        "object"
    ) {

        throw new Error(
            "Formato de arquivo inválido."
        );

    }

    const nome =
        sanitizarNomeArquivo(
            file.name
        );

    const mimeType =
        String(
            file.mimeType ||
            "application/octet-stream"
        )
            .trim()
            .slice(
                0,
                150
            );

    const base64 =
        limparBase64(
            file.data
        );

    if (
        !base64 ||
        !base64Valido(
            base64
        )
    ) {

        throw new Error(
            "O conteúdo do arquivo é inválido."
        );

    }

    const tamanho =
        tamanhoBase64EmBytes(
            base64
        );

    if (
        tamanho >
        MAX_FILE_BYTES
    ) {

        throw new Error(
            "O arquivo ultrapassa o limite permitido."
        );

    }

    return {
        valor: {
            name:
                nome,

            mimeType,

            data:
                base64
        },

        tamanho
    };

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

        if (
            !resposta.ok
        ) {

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

        return {
            texto:
                "",

            tamanho:
                0
        };

    }

    if (
        typeof audio !==
        "object"
    ) {

        throw new Error(
            "Formato de áudio inválido."
        );

    }

    const base64 =
        limparBase64(
            audio.data
        );

    if (
        !base64 ||
        !base64Valido(
            base64
        )
    ) {

        throw new Error(
            "O conteúdo do áudio é inválido."
        );

    }

    const mimeType =
        normalizarMimeAudio(
            audio.mimeType
        );

    const nomeOriginal =
        sanitizarNomeArquivo(
            audio.name ||
            "audio"
        );

    const extensao =
        extensaoAudio(
            mimeType,
            nomeOriginal
        );

    const mimePorExtensao = {

        flac:
            "audio/flac",

        mp3:
            "audio/mpeg",

        mp4:
            "audio/mp4",

        mpeg:
            "audio/mpeg",

        mpga:
            "audio/mpeg",

        m4a:
            "audio/mp4",

        ogg:
            "audio/ogg",

        wav:
            "audio/wav",

        webm:
            "audio/webm"

    };

    const mimeFinal =
        AUDIO_MIME_TYPES.has(
            mimeType
        )
            ? mimeType
            : mimePorExtensao[
                extensao
            ];


    if (
        !mimeFinal
    ) {

        throw new Error(
            "Esse formato de áudio não é compatível com a transcrição."
        );

    }

    const tamanho =
        tamanhoBase64EmBytes(
            base64
        );

    if (
        tamanho >
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
        `audio-synter.${extensao}`;

    const arquivo =
        await toFile(
            buffer,
            nomeSeguro,
            {
                type:
                    mimeFinal
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


    return {

        texto:
            String(
                transcricao.text ||
                ""
            ).trim(),

        tamanho

    };

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


    let recebeuArquivo =
        false;


    try {

        // ======================================
        // USUÁRIO LOGADO
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
        // BODY
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


        // ======================================
        // IMAGEM
        // ======================================

        const imagemValidada =
            validarImagem(
                corpo.image
            );

        const image =
            imagemValidada.valor;


        // ======================================
        // ARQUIVO
        // ======================================

        const arquivoValidado =
            validarArquivo(
                corpo.file
            );

        const file =
            arquivoValidado.valor;

        recebeuArquivo =
            Boolean(
                file
            );


        // ======================================
        // CONTEXTO
        // ======================================

        const previousResponseId =
            validarPreviousResponseId(
                corpo.previousResponseId
            );


        // ======================================
        // ÁUDIO
        // ======================================

        const audioResult =
            await transcreverAudio(
                corpo.audio
            );

        const transcription =
            audioResult.texto;


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
        // LIMITE TOTAL
        // ======================================

        const tamanhoTotal =
            imagemValidada.tamanho +
            arquivoValidado.tamanho +
            audioResult.tamanho;


        if (
            tamanhoTotal >
            MAX_TOTAL_BYTES
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Os anexos juntos ultrapassam o limite permitido. Envie os arquivos separadamente."

                });

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
            !file &&
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
        // PRECISA TER CONTEÚDO
        // ======================================

        if (
            !texto &&
            !image &&
            !file &&
            !historicoAntigo
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Envie uma mensagem, imagem, áudio ou arquivo."

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


            // ==================================
            // TEXTO
            // ==================================

            let textoEntrada =
                texto;


            if (
                !textoEntrada
            ) {

                if (
                    file &&
                    image
                ) {

                    textoEntrada =
                        "Analise a imagem e o arquivo enviados e explique de forma objetiva o conteúdo.";

                }
                else if (
                    file
                ) {

                    textoEntrada =
                        "Analise o arquivo enviado e explique de forma objetiva o conteúdo.";

                }
                else if (
                    image
                ) {

                    textoEntrada =
                        "Analise esta imagem e explique de forma objetiva o que é possível observar.";

                }
                else {

                    textoEntrada =
                        "Analise o conteúdo enviado.";

                }

            }


            content.push({

                type:
                    "input_text",

                text:
                    textoEntrada

            });


            // ==================================
            // IMAGEM
            // ==================================

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


            // ==================================
            // ARQUIVO
            // ==================================

            if (
                file
            ) {

                content.push({

                    type:
                        "input_file",

                    filename:
                        file.name,

                    file_data:
                        file.data

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
        // OPENAI
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
        // CONTINUAÇÃO DA CONVERSA
        // ======================================

        if (
            previousResponseId
        ) {

            parametros.previous_response_id =
                previousResponseId;

        }


        // ======================================
        // RESPOSTA DA OPENAI
        // ======================================

        const response =
            await openai.responses
                .create(
                    parametros
                );


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
    catch (error) {

        console.error(
            "Erro Assistente Synter:",
            {

                name:
                    error?.name,

                status:
                    error?.status,

                code:
                    error?.code,

                type:
                    error?.type,

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
        // FORMATO DE ARQUIVO NÃO SUPORTADO
        // ======================================

        if (
            recebeuArquivo &&
            (
                error?.status === 400 ||
                mensagem
                    .toLowerCase()
                    .includes(
                        "unsupported"
                    )
            )
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Esse tipo de arquivo não pôde ser interpretado pela IA. Tente enviar em PDF, Word, Excel, CSV, TXT ou outro formato de documento compatível."

                });

        }


        // ======================================
        // ERROS DE ANEXOS
        // ======================================

        const mensagemMinuscula =
            mensagem
                .toLowerCase();


        if (
            mensagemMinuscula
                .includes(
                    "imagem"
                ) ||
            mensagemMinuscula
                .includes(
                    "áudio"
                ) ||
            mensagemMinuscula
                .includes(
                    "arquivo"
                ) ||
            mensagemMinuscula
                .includes(
                    "formato"
                ) ||
            mensagemMinuscula
                .includes(
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