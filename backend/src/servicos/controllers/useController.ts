import { Request, Response } from 'express';
import { obterUsuarios, obterUsuarioPorId, criarUsuario, atualizarUsuario, deletarUsuario, criarPerfilComPermissoes } from "../repositories/repositorioUsuario";
const convertDateToString = (date: Date | string | undefined): string | undefined => {
  return date instanceof Date ? date.toISOString() : date;
};
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await obterUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários, Controller:', error);
    res.status(500).json({
      error: 'Erro ao listar usuários, Controller',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await obterUsuarioPorId(id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado, Controller' });
    }
  } catch (error) {
    console.error(`Erro ao obter usuário com ID, Controller ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Erro ao obter usuário, Controller',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Convertendo datas para strings
    req.body.dataCriacao = convertDateToString(req.body.dataCriacao);
    req.body.tokenExpiracao = convertDateToString(req.body.tokenExpiracao);
    const novoUsuario = await criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário, Controller:', error);
    const statusCode = error instanceof Error && error.message.includes('validação') ? 400 : 500;
    res.status(statusCode).json({
      error: 'Erro ao criar usuário',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Convertendo datas para strings
    req.body.dataCriacao = convertDateToString(req.body.dataCriacao);
    req.body.tokenExpiracao = convertDateToString(req.body.tokenExpiracao);
    const usuarioAtualizado = await atualizarUsuario(id, req.body);
    if (usuarioAtualizado) {
      res.status(200).json(usuarioAtualizado);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    console.error(`Erro ao atualizar usuário com ID, Controller ${req.params.id}:`, error);
    const statusCode = error instanceof Error && error.message.includes('validação') ? 400 : 500;
    res.status(statusCode).json({
      error: 'Erro ao atualizar usuário',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deletarUsuario(id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar usuário com ID, Controller ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Erro ao deletar usuário',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const novoPerfil = await criarPerfilComPermissoes(req.body);
    res.status(201).json(novoPerfil);
  } catch (error) {
    console.error('Erro ao criar perfil, Controller:', error);
    const statusCode = error instanceof Error && error.message.includes('validação') ? 400 : 500;
    res.status(statusCode).json({
      error: 'Erro ao criar perfil',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
