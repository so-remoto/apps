import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Olá, Backend!');
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
