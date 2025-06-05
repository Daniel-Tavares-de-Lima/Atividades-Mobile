const axios = require('axios');
require('dotenv').config();

async function getContextualizedInfo(info) {
  const prompt = `Dado o seguinte conteúdo: "${info}", forneça um resumo em português.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    } else {
      throw new Error("Formato inesperado da resposta da API");
    }
  } catch (error) {
    console.error("Erro ao buscar contexto com OpenAI:", error.message);
    console.log("Resposta completa:", error.response?.data || error);
    return "Erro ao buscar contexto adicional.";
  }
}

module.exports = { getContextualizedInfo };
