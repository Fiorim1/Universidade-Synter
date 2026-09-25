export default function handler(req, res) {
  const notionTokenConfigurado = Boolean(
    process.env.NOTION_TOKEN
  );

  const notionDataSourceConfigurado = Boolean(
    process.env.NOTION_DATA_SOURCE_ID
  );

  return res.status(200).json({
    sucesso: true,

    mensagem:
      "API SAT funcionando na Vercel",

    variaveis: {
      NOTION_TOKEN:
        notionTokenConfigurado,

      NOTION_DATA_SOURCE_ID:
        notionDataSourceConfigurado,
    },
  });
}