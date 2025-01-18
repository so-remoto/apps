import { Request, Response } from 'express';
import { atualizarPermissao, buscarPermissaoPorId, buscarTodasPermissoes, criarPermissoes, deletarPermissao } from '../repositories/repositorioPermissao';

export const getPermissoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissoes = await buscarTodasPermissoes();
    res.status(200).json(permissoes);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao buscar permissões', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao buscar permissões', details: 'Erro desconhecido' });
    }
  }
};

export const getPermissaoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const permissao = await buscarPermissaoPorId(id);
    if (!permissao) {
      res.status(404).json({ error: 'Permissão não encontrada' });
    } else {
      res.status(200).json(permissao);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao buscar permissão por ID', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao buscar permissão por ID', details: 'Erro desconhecido' });
    }
  }
};

export const createPermissao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { permissoes } = req.body;

    if (!Array.isArray(permissoes)) {
      res.status(400).json({
        error: 'Formato inválido',
        details: 'O corpo da requisição deve conter um array de permissões.'
      });
      return;
    }

    const permissoesCriadas = await criarPermissoes(permissoes);
    res.status(201).json(permissoesCriadas);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao criar permissões', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao criar permissões', details: 'Erro desconhecido' });
    }
  }
};
export const updatePermissao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const permissaoAtualizada = await atualizarPermissao(id, req.body);
    res.status(200).json(permissaoAtualizada);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao atualizar permissão', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar permissão', details: 'Erro desconhecido' });
    }
  }
};


export const deletePermissao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deletarPermissao(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao deletar permissão', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao deletar permissão', details: 'Erro desconhecido' });
    }
  }
};
