const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/mylibrary', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelo do Livro
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  comment: String,
  cover: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});
const Book = mongoose.model('Book', BookSchema);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Rotas
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros' });
  }
});

app.post('/books', upload.single('cover'), async (req, res) => {
  try {
    const { title, author, comment, latitude, longitude } = req.body;
    if (!title || !author || !latitude || !longitude) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const book = new Book({
      title,
      author,
      comment,
      cover: req.file ? req.file.path : null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Erro ao salvar livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(3000, () => console.log('Backend rodando na porta 3000'));