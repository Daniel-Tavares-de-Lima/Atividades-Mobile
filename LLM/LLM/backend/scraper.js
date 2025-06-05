const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeGutenberg(prompt) {
  try {
    // Simples busca no Gutenberg usando o prompt (ex.: título do livro)
    const searchUrl = `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(prompt)}`;
    const searchResponse = await axios.get(searchUrl);
    const $search = cheerio.load(searchResponse.data);

    // Obtém o link do primeiro resultado
    const bookLink = $search('.booklink').first().find('a').attr('href');
    if (!bookLink) {
      throw new Error('Nenhum livro encontrado para o prompt fornecido');
    }

    // Acessa a página do livro
    const bookUrl = `https://www.gutenberg.org${bookLink}`;
    const bookResponse = await axios.get(bookUrl);
    const $book = cheerio.load(bookResponse.data);

    // Encontra o link para o texto completo (formato HTML ou texto)
    const textLink = $book('a[title*="Plain Text UTF-8"]').attr('href') || $book('a[title*="HTML"]').attr('href');
    if (!textLink) {
      throw new Error('Texto do livro não encontrado');
    }

    // Acessa o texto do livro
    const textUrl = `https://www.gutenberg.org${textLink}`;
    const textResponse = await axios.get(textUrl);
    const $text = cheerio.load(textResponse.data);

    // Extrai os primeiros 500 caracteres do conteúdo principal
    let content = $text('body').text().trim().substring(0, 500);
    if (!content) {
      throw new Error('Conteúdo do livro não encontrado');
    }

    return content;
  } catch (error) {
    console.error('Erro ao realizar scraping no Project Gutenberg:', error.message);
    throw error;
  }
}

module.exports = { scrapeGutenberg };