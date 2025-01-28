import express, { Application, Request, Response } from 'express'
import { config } from 'dotenv'
import path from 'path'
import userRoutes from './servicos/routes/userRoutes'
import cors from 'cors'

// Carrega as variáveis de ambiente do arquivo .env na pasta backend
config({ path: path.resolve(__dirname, 'backend/.env') })

const app: Application = express()
const port: number = 3001

// Middleware para parsear JSON
app.use(cors())
app.use(express.json())

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.send('Olá, Backend!')
})

// Usa o roteador para as rotas de usuário
app.use('/api', userRoutes)
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`)
})
