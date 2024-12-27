import { Request, Response } from 'express';
import { obterUsuarios, obterUsuarioPorId, criarUsuario, atualizarUsuario, deletarUsuario } from "../repositories/repositorioUsuario";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await obterUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await obterUsuarioPorId(id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const novoUsuario = await criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioAtualizado = await atualizarUsuario(id, req.body);
    if (usuarioAtualizado) {
      res.status(200).json(usuarioAtualizado);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deletarUsuario(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
}
