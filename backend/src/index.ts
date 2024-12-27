import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env na pasta backend
config({ path: path.resolve(__dirname, 'backend/.env') });

const app: Application = express();
const port: number = 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Olá, Backend!');
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
