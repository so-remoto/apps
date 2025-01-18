import express, { Application, Request, Response } from 'express';
import { config } from 'dotenv';
import path from 'path';
import userRoutes from './servicos/routes/userRoutes';

// Carrega as variáveis de ambiente do arquivo .env na pasta backend
config({ path: path.resolve(__dirname, 'backend/.env') });

const app: Application = express();
const port: number = 3001;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para tratar erros de cabeçalho HTTP
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao buscar permissão por ID', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao buscar permissão por ID', details: 'Erro desconhecido' });
    }
  }
});

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.send("Olá, Backend!");
});

// Usa o roteador para as rotas de usuário
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
