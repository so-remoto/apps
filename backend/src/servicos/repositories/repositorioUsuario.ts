import { PrismaClient } from "@prisma/client";
import { Usuario } from "../../../../packages/core";
import { Data as DataAlias } from "../../../../packages/core";
import Joi from 'joi';

const repo = new PrismaClient();

// Definindo um esquema de validação para Usuario
const usuarioSchema = Joi.object({
  nomeCompleto: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  senha: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{5,30}$'))
    .required(),
  telefone: Joi.string()
    .pattern(new RegExp('^[1-9][0-9]\\s?9[1-9][0-9]{7}$'))
    .required(),
  imagem: Joi.string().uri().allow(null, ''),
  dataCriacao: Joi.date().optional(),
  ativo: Joi.boolean().optional(),
  tokenRecuperar: Joi.string().optional().allow(null),
  tokenExpiracao: Joi.date().optional().allow(null),
  perfis: Joi.array().items(Joi.object({
        id: Joi.string().required()
      })).optional()
});

const idSchema = Joi.string().guid({ version: 'uuidv4' }).required();

export const obterUsuarios = async (): Promise<Usuario[]> => {
  try {
    const usuarios = await repo.usuario.findMany({
      include: {
        perfis: true // Inclui perfis relacionados
      }
    });
    return usuarios as unknown as Usuario[];
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw new Error('Erro ao obter usuários: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

export const criarUsuario = async (usuario: Usuario): Promise<Usuario> => {
  try {
    // Validação dos dados de entrada
    const { error } = usuarioSchema.validate(usuario);
    if (error) {
      throw new Error(`Erro de validação: ${error.details.map(x => x.message).join(', ')}`);
    }

    const imagemUrl = usuario.imagem ? new URL(usuario.imagem).toString() : 'https://exemplo.com/imagem-padrao.jpg';
    const novoUsuario = await repo.usuario.create({
      data: {
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        senha: usuario.senha,
        telefone: usuario.telefone,
        imagem: imagemUrl,
        dataCriacao: usuario.dataCriacao ? DataAlias.desformatar(usuario.dataCriacao.toDateString()) : undefined,
        ativo: usuario.ativo,
        tokenRecuperar: usuario.tokenRecuperar !== undefined ? usuario.tokenRecuperar : null,
        tokenExpiracao: usuario.tokenExpiracao !== undefined ? usuario.tokenExpiracao : null,
        perfis: {
          connect: usuario.perfis ? usuario.perfis.map(perfil => ({ id: perfil.id })) : []
        }
      }
    });
    return novoUsuario as unknown as Usuario;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error("Erro ao criar usuário:" + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

export const atualizarUsuario = async (id: string, dadosAtualizados: Partial<Usuario>): Promise<Usuario | null> => {
  try {
    // Validação do ID
    const { error: idError } = idSchema.validate(id);
    if (idError) {
      throw new Error(`Erro de validação do ID: ${idError.details.map(x => x.message).join(', ')}`);
    }

    // Validação dos dados de entrada
    const { error } = usuarioSchema.validate(dadosAtualizados, { allowUnknown: true });
    if (error) {
      throw new Error(`Erro de validação: ${error.details.map(x => x.message).join(', ')}`);
    }

    const usuarioAtualizado = await repo.usuario.update({
      where: { id },
      data: {
        nomeCompleto: dadosAtualizados.nomeCompleto,
        email: dadosAtualizados.email,
        senha: dadosAtualizados.senha,
        telefone: dadosAtualizados.telefone,
        imagem: dadosAtualizados.imagem ? new URL(dadosAtualizados.imagem).toString() : undefined,
        ativo: dadosAtualizados.ativo,
        tokenRecuperar: dadosAtualizados.tokenRecuperar !== undefined ? dadosAtualizados.tokenRecuperar : null,
        tokenExpiracao: dadosAtualizados.tokenExpiracao !== undefined ? dadosAtualizados.tokenExpiracao : null,
        perfis: {
          connect: dadosAtualizados.perfis ? dadosAtualizados.perfis.map(perfil => ({ id: perfil.id })) : []
        }
      },
      include: { perfis: true }
    });
    return usuarioAtualizado as unknown as Usuario | null;
  } catch (error) {
    console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
    throw new Error('Erro ao atualizar usuário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

export const obterUsuarioPorId = async (id: string): Promise<Usuario | null> => {
  try {
    // Validação do ID
    const { error } = idSchema.validate(id);
    if (error) {
      throw new Error(`Erro de validação do ID: ${error.details.map(x => x.message).join(', ')}`);
    }

    const usuario = await repo.usuario.findUnique({
      where: { id },
      include: { perfis: true }
    });
    return usuario as unknown as Usuario | null;
  } catch (error) {
    console.error(`Erro ao obter usuário com ID ${id}:`, error);
    throw new Error('Erro ao obter usuário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

export const deletarUsuario = async (id: string): Promise<void> => {
  try {
    // Validação do ID
    const { error } = idSchema.validate(id);
    if (error) {
      throw new Error(`Erro de validação do ID: ${error.details.map(x => x.message).join(', ')}`);
    }

    await repo.usuario.delete({
      where: { id }
    });
  } catch (error) {
    console.error(`Erro ao deletar usuário com ID ${id}:`, error);
    throw new Error('Erro ao deletar usuário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}
