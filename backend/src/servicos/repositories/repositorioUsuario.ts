
import { PrismaClient } from "@prisma/client";
import { Usuario, Perfil, Permissao } from "core/src/index"; // Caminho relativo ao diretório atual
import DataMaster from "core/src/shared/Data"; // Caminho relativo ao diretório atual
import Joi from 'joi';

import { v4 as uuidv4 } from 'uuid';
const db = new PrismaClient();
// Definindo um esquema de validação para Usuario
const usuarioSchema = Joi.object({
  id: Joi.string().optional(),
  nomeCompleto: Joi.string().required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  telefone: Joi.string().required(),
  imagem: Joi.string().uri().allow(null, ''),
  dataCriacao: Joi.string().optional(),
  ativo: Joi.boolean().required(),
  tokenRecuperar: Joi.string().optional().allow(null),
  tokenExpiracao: Joi.string().optional().allow(null),
  perfis: Joi.array().items(Joi.object({
    id: Joi.string().optional(),
    nome: Joi.string().required(),
    descricao: Joi.string().required(),
    dataCriacao: Joi.string().optional(),
    ativo: Joi.boolean().required(),
    permissoes: Joi.array().items(Joi.object({
      id: Joi.string().optional(),
      nome: Joi.string().required(),
      descricao: Joi.string().required(),
      dataCriacao: Joi.string().optional(),
      ativo: Joi.boolean().required()
    })).required()
  })).optional()
});
const perfilSchema = Joi.object({
  id: Joi.string().optional(),
  nome: Joi.string().required(),
  descricao: Joi.string().required(),
  dataCriacao: Joi.string().optional(),
  ativo: Joi.boolean().required(),
  permissoes: Joi.array().items(Joi.object({
    id: Joi.string().optional(),
    nome: Joi.string().required(),
    descricao: Joi.string().required(),
    dataCriacao: Joi.string().optional(),
    ativo: Joi.boolean().required()
  })).required()
});
const idSchema = Joi.string().required();


export const criarUsuario = async (usuario: Usuario): Promise<Usuario> => {
  try {
    const { error } = usuarioSchema.validate(usuario);
    if (error) {
      throw new Error(`Erro de validação: ${error.details.map(x => x.message).join(', ')}`);
    }
    
    const imagemUrl = usuario.imagem ?? 'https://exemplo.com/imagem-padrao.jpg';
    
    const dataCriacao = typeof usuario.dataCriacao === 'string' 
      ? new Date(DataMaster.desformatar(usuario.dataCriacao)).toISOString()
      : usuario.dataCriacao instanceof Date
        ? usuario.dataCriacao.toISOString()
        : new Date().toISOString();
    
    const tokenExpiracao = usuario.tokenExpiracao
      ? (typeof usuario.tokenExpiracao === 'string' 
        ? new Date(DataMaster.desformatar(usuario.tokenExpiracao)).toISOString() 
        : usuario.tokenExpiracao instanceof Date
          ? usuario.tokenExpiracao.toISOString()
          : null)
      : null;
    
    const novoUsuario = await db.usuario.create({
      data: {
        id: uuidv4(),
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        senha: usuario.senha,
        telefone: usuario.telefone,
        imagem: imagemUrl,
        dataCriacao: dataCriacao,
        ativo: usuario.ativo,
        tokenRecuperar: usuario.tokenRecuperar ?? null,
        tokenExpiracao: tokenExpiracao
      }
    });
    if (usuario.perfis && usuario.perfis.length > 0) {
      for (const perfil of usuario.perfis) {
        let perfilExistente = await db.perfil.findUnique({
          where: { id: perfil.id },
          include: { permissoes: true } 
        });
        if (perfilExistente) {
          const perfilComDataConvertida: Perfil = {
            ...perfilExistente,
            dataCriacao: perfilExistente.dataCriacao instanceof Date
              ? perfilExistente.dataCriacao.toISOString()
              : perfilExistente.dataCriacao,
            permissoes: perfilExistente.permissoes.map((permissao: Permissao) => ({
              ...permissao,
              dataCriacao: permissao.dataCriacao instanceof Date
                ? permissao.dataCriacao.toISOString()
                : permissao.dataCriacao
            }))
          };
          await db.usuarioPerfil.create({
            data: {
              id: uuidv4(),
              usuarioId: novoUsuario.id,
              perfilId: perfilComDataConvertida.id
            }
          });
        }
      }
    }
    return {
      ...novoUsuario,
      dataCriacao: novoUsuario.dataCriacao instanceof Date
        ? novoUsuario.dataCriacao.toISOString()
        : novoUsuario.dataCriacao,
      tokenExpiracao: novoUsuario.tokenExpiracao instanceof Date
        ? novoUsuario.tokenExpiracao.toISOString()
        : novoUsuario.tokenExpiracao
    } as Usuario;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error("Erro ao criar usuário: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};
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
    // Atualizar usuário
    const dataCriacao = dadosAtualizados.dataCriacao
      ? (typeof dadosAtualizados.dataCriacao === 'string'
        ? new Date(DataMaster.desformatar(dadosAtualizados.dataCriacao)).toISOString()
        : dadosAtualizados.dataCriacao instanceof Date
          ? dadosAtualizados.dataCriacao.toISOString()
          : undefined)
      : undefined;
    const tokenExpiracao = dadosAtualizados.tokenExpiracao
      ? (typeof dadosAtualizados.tokenExpiracao === 'string'
        ? new Date(DataMaster.desformatar(dadosAtualizados.tokenExpiracao)).toISOString()
        : dadosAtualizados.tokenExpiracao instanceof Date
          ? dadosAtualizados.tokenExpiracao.toISOString()
          : undefined)
      : undefined;
    const usuarioAtualizado = await db.usuario.update({
      where: { id },
      data: {
        nomeCompleto: dadosAtualizados.nomeCompleto,
        email: dadosAtualizados.email,
        senha: dadosAtualizados.senha,
        telefone: dadosAtualizados.telefone,
        imagem: dadosAtualizados.imagem ? new URL(dadosAtualizados.imagem)!.toString() : undefined,
        dataCriacao: dataCriacao,
        ativo: dadosAtualizados.ativo,
        tokenRecuperar: dadosAtualizados.tokenRecuperar !== undefined ? dadosAtualizados.tokenRecuperar : null,
        tokenExpiracao: tokenExpiracao,
      }
    });
    // Atualizar perfis associados
    if (dadosAtualizados.perfis && dadosAtualizados.perfis.length > 0) {
      // Remover associações antigas
      await db.usuarioPerfil.deleteMany({ where: { usuarioId: id } });
      // Adicionar novas associações
      for (const perfil of dadosAtualizados.perfis) {
        let perfilExistente = await db.perfil.findUnique({
          where: { id: perfil.id },
          include: { permissoes: true } 
        });
        if (perfilExistente) {
          const perfilComDataConvertida: Perfil = {
            ...perfilExistente,
            dataCriacao: perfilExistente.dataCriacao instanceof Date
              ? perfilExistente.dataCriacao.toISOString()
              : perfilExistente.dataCriacao,
            permissoes: perfilExistente.permissoes.map((permissao: Permissao) => ({
              ...permissao,
              dataCriacao: permissao.dataCriacao instanceof Date
                ? permissao.dataCriacao.toISOString()
                : permissao.dataCriacao
            }))
          };
          await db.usuarioPerfil.create({
            data: {
              id: uuidv4(),
              usuarioId: id,
              perfilId: perfilComDataConvertida.id
            }
          });
        }
      }
    }
    return {
      ...usuarioAtualizado,
      dataCriacao: usuarioAtualizado.dataCriacao instanceof Date
        ? usuarioAtualizado.dataCriacao.toISOString()
        : usuarioAtualizado.dataCriacao,
      tokenExpiracao: usuarioAtualizado.tokenExpiracao instanceof Date
        ? usuarioAtualizado.tokenExpiracao.toISOString()
        : usuarioAtualizado.tokenExpiracao
    } as Usuario;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error("Erro ao atualizar usuário: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const deletarUsuario = async (id: string): Promise<void> => {
  await db.usuario.delete({ where: { id } });
  await db.usuarioPerfil.deleteMany({ where: { usuarioId: id } });
};



export const obterUsuarios = async (): Promise<Usuario[]> => {
  try {
    const usuarios = await db.usuario.findMany({
      include: {
        perfis: {
          include: {
            perfil: {
              include: {
                permissoes: true // Inclui permissões relacionadas
              }
            }
          }
        }
      }
    });
    return usuarios.map((usuario: any) => ({
      ...usuario,
      dataCriacao: usuario.dataCriacao 
        ? (typeof usuario.dataCriacao === 'string'
          ? new Date(usuario.dataCriacao).toISOString()
          : usuario.dataCriacao.toISOString())
        : undefined,
      tokenExpiracao: usuario.tokenExpiracao
        ? (typeof usuario.tokenExpiracao === 'string'
          ? new Date(usuario.tokenExpiracao).toISOString()
          : usuario.tokenExpiracao.toISOString())
        : null,
      perfis: usuario.perfis.map((usuarioPerfil: any) => ({
        ...usuarioPerfil.perfil,
        dataCriacao: usuarioPerfil.perfil.dataCriacao 
          ? (typeof usuarioPerfil.perfil.dataCriacao === 'string'
            ? new Date(usuarioPerfil.perfil.dataCriacao).toISOString()
            : usuarioPerfil.perfil.dataCriacao.toISOString())
          : undefined,
        permissoes: usuarioPerfil.perfil.permissoes.map((permissao: any) => ({
          ...permissao,
          dataCriacao: permissao.dataCriacao 
            ? (typeof permissao.dataCriacao === 'string'
              ? new Date(permissao.dataCriacao).toISOString()
              : permissao.dataCriacao.toISOString())
            : undefined
        }))
      }))
    })) as Usuario[];
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw new Error('Erro ao obter usuários: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const obterUsuarioPorId = async (id: string): Promise<Usuario | null> => {
  try {
    // Validação do ID
    const { error } = idSchema.validate(id);
    if (error) {
      throw new Error(`Erro de validação do ID: ${error.details.map(x => x.message).join(', ')}`);
    }
    const usuario = await db.usuario.findUnique({
      where: { id },
      include: {
        perfis: {
          include: {
            perfil: {
              include: {
                permissoes: true
              }
            }
          }
        }
      }
    });
    if (!usuario) return null;
    return {
      ...usuario,
      dataCriacao: usuario.dataCriacao 
        ? (typeof usuario.dataCriacao === 'string'
          ? new Date(usuario.dataCriacao).toISOString()
          : usuario.dataCriacao.toISOString())
        : undefined,
      tokenExpiracao: usuario.tokenExpiracao
        ? (typeof usuario.tokenExpiracao === 'string'
          ? new Date(usuario.tokenExpiracao).toISOString()
          : usuario.tokenExpiracao.toISOString())
        : null,
      perfis: usuario.perfis.map((usuarioPerfil: { perfil: Perfil }) => ({
        ...usuarioPerfil.perfil,
        dataCriacao: usuarioPerfil.perfil.dataCriacao 
          ? (typeof usuarioPerfil.perfil.dataCriacao === 'string'
            ? new Date(usuarioPerfil.perfil.dataCriacao).toISOString()
            : usuarioPerfil.perfil.dataCriacao.toISOString())
          : undefined,
        permissoes: usuarioPerfil.perfil.permissoes.map((permissao: Permissao) => ({
          ...permissao,
          dataCriacao: permissao.dataCriacao 
            ? (typeof permissao.dataCriacao === 'string'
              ? new Date(permissao.dataCriacao).toISOString()
              : permissao.dataCriacao.toISOString())
            : undefined
        }))
      }))
    } as Usuario;
  } catch (error) {
    console.error(`Erro ao obter usuário com ID ${id}:`, error);
    throw new Error('Erro ao obter usuário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};
