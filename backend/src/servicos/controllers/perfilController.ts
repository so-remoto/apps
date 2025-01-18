import { Request, Response } from 'express';
import { atualizarPerfil, buscarPerfilPorId, buscarTodosPerfis, criarPerfilComPermissoes, deletarPerfil } from '../repositories/repositorioPerfil';

export const getProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const perfis = await buscarTodosPerfis();
    res.status(200).json(perfis);
  } catch (error) {
     if (error instanceof Error) {
         res.status(500).json({ error: 'Erro ao buscar perfis', details: error.message });
    } else {
         res.status(500).json({ error: 'Erro ao buscar perfis', details: 'Erro desconhecido' });
    }
    
  }
};

export const getProfileById = async (req: Request, res: Response): Promise<void> => { 
    try { 
            const { id } = req.params; const perfil = await buscarPerfilPorId(id);
        if (!perfil) { res.status(404).json({ error: 'Perfil não encontrado' });
        } else {
        res.status(200).json(perfil); 
        } } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ error: 'Erro ao buscar perfis', details: error.message });
        } else {
            res.status(500).json({ error: 'Erro ao buscar perfis', details: 'Erro desconhecido' });
        }
    }
};

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const perfil = await criarPerfilComPermissoes(req.body);
    res.status(201).json(perfil);
  } catch (error) {
   
    if (error instanceof Error) {
        res.status(500).json({ error: 'Erro ao buscar perfis', details: error.message });
    } else {
        res.status(500).json({ error: 'Erro ao buscar perfis', details: 'Erro desconhecido' });
    }
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const perfilAtualizado = await atualizarPerfil(id, req.body);
    res.status(200).json(perfilAtualizado);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar perfil', details: 'Erro desconhecido' });
    }
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deletarPerfil(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ error: 'Erro ao buscar perfis', details: error.message });
    } else {
        res.status(500).json({ error: 'Erro ao buscar perfis', details: 'Erro desconhecido' });
    }
  }
};


