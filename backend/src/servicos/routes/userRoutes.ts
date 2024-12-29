
import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/useController'; // Ajuste o caminho conforme necessário
const router = Router();
router.get('/users', getUsers); // Rota para obter todos os usuários
router.get('/users/:id', getUserById); // Rota para obter um usuário por ID
router.post('/users', createUser); // Rota para criar um novo usuário
router.put('/users/:id', updateUser); // Rota para atualizar um usuário por ID
router.delete('/users/:id', deleteUser); // Rota para deletar um usuário por ID
export default router;
