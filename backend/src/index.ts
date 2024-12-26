import express from 'express';
import { config } from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env na pasta backend
config({ path: path.resolve(__dirname, 'backend/.env') });

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Olá, Backend!');
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
