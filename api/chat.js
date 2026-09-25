import OpenAI from "openai";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


export default async function handler(req, res) {

    // ==========================================
    // SOMENTE POST
    // ==========================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Método não permitido."
        });

    }


    try {

        // ======================================
        // RECEBE AS MENSAGENS
        // ======================================

        const {
            messages = []
        } = req.body;


        if (
            !Array.isArray(messages) ||
            messages.length === 0
        ) {

            return res.status(400).json({
                error: "Nenhuma mensagem enviada."
            });

        }


        // ======================================
        // LIMITA O HISTÓRICO
        // ======================================

        const historico =
            messages
                .slice(-12)
                .map((mensagem) => ({

                    role:
                        mensagem.role === "assistant"
                            ? "assistant"
                            : "user",

                    content:
                        String(mensagem.content || "")

                }));


        // ======================================
        // OPENAI
        // ======================================

        const response =
            await openai.responses.create({

                model:
                    process.env.OPENAI_MODEL ||
                    "gpt-6-astra",

                reasoning: {
                    effort: "low"
                },

                instructions: `
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
                `,

                input: historico

            });


        // ======================================
        // RESPOSTA
        // ======================================

        const resposta =
            response.output_text?.trim();


        if (!resposta) {

            return res.status(500).json({
                error:
                    "Não foi possível gerar uma resposta."
            });

        }


        return res.status(200).json({

            message: resposta

        });


    } catch (error) {

        console.error(
            "Erro Assistente Synter:",
            error
        );


        return res.status(500).json({

            error:
                "Não foi possível responder no momento."

        });

    }

}