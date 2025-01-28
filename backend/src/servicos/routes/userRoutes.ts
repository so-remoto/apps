import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/useController'; 
import { getProfiles, getProfileById, createProfile, updateProfile, deleteProfile } from '../controllers/perfilController';
import { getPermissoes, getPermissaoById, createPermissao, updatePermissao, deletePermissao } from '../controllers/permissaoController';

const router = Router();

// Rota para usuários
router.get('/users', getUsers); 
router.get('/users/:id', getUserById); 
router.post('/users', createUser); 
router.put('/users/:id', updateUser); 
router.delete('/users/:id', deleteUser);

//Rota para criar perfil
router.get('/profiles', getProfiles);
router.get('/profiles/:id', getProfileById);
router.post('/profiles', createProfile);
router.put('/profiles/:id', updateProfile);
router.delete('/profiles/:id', deleteProfile);

// Rotas para permissões
router.get('/permissions', getPermissoes);
router.get('/permissions/:id', getPermissaoById);
router.post('/permissions', createPermissao);
router.put('/permissions/:id', updatePermissao);
router.delete('/permissions/:id', deletePermissao);

export default router;




