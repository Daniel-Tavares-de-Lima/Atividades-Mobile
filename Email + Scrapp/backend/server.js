const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuração do transporte de e-mail (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function scrapeTechCrunch() {
  try {
    console.log('Iniciando scraping no TechCrunch...');
    const url = 'https://techcrunch.com';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // Seleciona a primeira notícia em destaque
    const article = $('article').first();
    const title = article.find('h2 a').text().trim();
    const summary = article.find('.post-block__content').text().trim().substring(0, 200) + '...';
    const link = article.find('h2 a').attr('href');

    console.log('Notícia encontrada:', { title, summary, link });

    if (!title || !summary) {
      throw new Error('Não foi possível extrair título ou resumo da notícia');
    }

    return { title, summary, link };
  } catch (error) {
    console.error('Erro ao realizar scraping no TechCrunch:', error.message);
    throw error;
  }
}

app.post('/scrape-and-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }

  try {
    // Realiza o scraping
    const { title, summary, link } = await scrapeTechCrunch();

    // Configura o e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Notícia TechCrunch: ${title}`,
      text: `Título: ${title}\n\nResumo: ${summary}\n\nLeia mais: ${link}`,
      html: `<h2>Notícia TechCrunch</h2>
             <p><strong>Título:</strong> ${title}</p>
             <p><strong>Resumo:</strong><br>${summary.replace(/\n/g, '<br>')}</p>
             <p><strong>Leia mais:</strong> <a href="${link}">${link}</a></p>`,
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso para:', email);

    res.json({ message: 'Scraping realizado e e-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error.message);
    res.status(500).json({ error: 'Erro ao realizar scraping ou enviar e-mail', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});