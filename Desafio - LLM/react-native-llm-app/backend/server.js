const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyAvSGkHxRKFNkhHGyJisrQ8cs7U-sbDKR0';

// 🔧 Função de scraping atualizada e robusta
async function scrapeGutenberg(prompt) {
  try {
    const searchUrl = `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(prompt)}`;
    const searchResponse = await axios.get(searchUrl);
    const $search = cheerio.load(searchResponse.data);

    const bookLink = $search('.booklink a').first().attr('href');
    if (!bookLink) {
      throw new Error('Nenhum livro encontrado para o prompt fornecido. Tente um termo de busca mais específico.');
    }

    const bookUrl = `https://www.gutenberg.org${bookLink}`;
    const bookResponse = await axios.get(bookUrl);
    const $book = cheerio.load(bookResponse.data);

    let textLink;
    $book('a[href]').each((i, el) => {
      const href = $book(el).attr('href');
      if (href && (href.endsWith('.txt') || href.includes('.txt.utf-8') || href.includes('.txt.utf8'))) {
        textLink = href.startsWith('http') ? href : `https://www.gutenberg.org${href}`;
        return false; // Para no primeiro link válido
      }
    });

    if (!textLink) {
      throw new Error('Conteúdo de texto do livro não encontrado. Tente outro livro ou prompt.');
    }

    const textResponse = await axios.get(textLink);
    const content = textResponse.data.trim().substring(0, 1500);

    if (!content) {
      throw new Error('Conteúdo do livro vazio após scraping.');
    }

    return content;
  } catch (error) {
    console.error('Erro ao realizar scraping:', error.message);
    if (error.response) {
      console.error('Detalhes HTTP:', error.response.status, error.response.data);
    }
    throw error;
  }
}

// 🔮 Rota para gerar resposta com Gemini
app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'O campo "question" é obrigatório.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Chave da API do Gemini não configurada.' });
  }

  try {
    const bookContent = await scrapeGutenberg(question);

    const fullPrompt = `Você é um assistente de leitura. Analise o seguinte trecho de um livro do Project Gutenberg:
\`\`\`text
${bookContent}
\`\`\`
Agora, responda à seguinte pergunta ou pedido do usuário:
"${question}"
Responda de forma clara, concisa e em português.`;

    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          max_output_tokens: 500,
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        timeout: 15000,
      }
    );

    const parts = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parts) {
      throw new Error('Formato inesperado da resposta da API do Gemini.');
    }

    res.json({ answer: parts.trim() });
  } catch (error) {
    console.error('Erro no /ask:', error.message);
    res.status(500).json({ error: 'Erro ao processar sua solicitação.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
