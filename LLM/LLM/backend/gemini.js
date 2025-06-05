const axios = require('axios');
require('dotenv').config();

async function getGeminiResponse(prompt, bookContent) {
  const fullPrompt = `Dado o seguinte trecho de um livro do Project Gutenberg: "${bookContent}", forneça um resumo ou análise em português com base no prompt: "${prompt}".`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      return response.data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Formato inesperado da resposta da API do Gemini');
    }
  } catch (error) {
    console.error('Erro ao consultar o Gemini:', error.message);
    console.log('Resposta completa:', error.response?.data || error);
    throw new Error('Erro ao consultar o Gemini');
  }
}

module.exports = { getGeminiResponse };