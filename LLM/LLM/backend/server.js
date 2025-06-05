const express = require('express');
const cors = require('cors');
const { scrapeGutenberg } = require('./scraper');
const { getGeminiResponse } = require('./gemini');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt é obrigatório' });
    }

    const bookContent = await scrapeGutenberg(prompt);
    const geminiResponse = await getGeminiResponse(prompt, bookContent);
    res.json({ geminiResponse });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao consultar o Gemini', error: error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));