import { PrismaClient } from "@prisma/client";
import { Perfil, Permissao } from "../../../../core/src/index"; // Caminho relativo ao diretório atual
import DataMaster from "../../../../core/src/shared/Data"; // Caminho relativo ao diretório atual
import { v4 as uuidv4 } from 'uuid';
import Joi from "joi";
import { criarPermissoes } from "./repositorioPermissao";

const db = new PrismaClient();

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


export const criarPerfil = async (perfil: Perfil): Promise<Perfil> => {
    const { error } = perfilSchema.validate(perfil);
    if (error) {
      throw new Error(`Erro de validação do perfil: ${error.details.map(x => x.message).join(', ')}`);
    }
    const permissoes = await criarPermissoes(perfil.permissoes);
    const dataCriacao = typeof perfil.dataCriacao === 'string' 
      ? new Date(DataMaster.desformatar(perfil.dataCriacao)).toISOString()
      : perfil.dataCriacao instanceof Date
        ? perfil.dataCriacao.toISOString()
        : new Date().toISOString();
    const perfilCriado = await db.perfil.create({
      data: {
        id: uuidv4(),
        nome: perfil.nome,
        descricao: perfil.descricao,
        dataCriacao: dataCriacao,
        ativo: perfil.ativo,
        permissoes: {
          connect: permissoes.map((permissao: Permissao) => ({ id: permissao.id }))
        }
      },
      include: {
        permissoes: true
      }
    });
    return {
      ...perfilCriado,
      dataCriacao: perfilCriado.dataCriacao.toString(),
      permissoes: perfilCriado.permissoes.map((permissao: Permissao) => ({
        ...permissao,
        dataCriacao: permissao.dataCriacao.toString()
      }))
    } as Perfil;
  };

  export const criarPerfilComPermissoes = async (perfil: Perfil): Promise<Perfil> => {
    try {
      const permissoesCriadas = await criarPermissoes(perfil.permissoes);
      
      const dataCriacao = typeof perfil.dataCriacao === 'string' 
        ? new Date(DataMaster.desformatar(perfil.dataCriacao)).toISOString()
        : perfil.dataCriacao instanceof Date
          ? perfil.dataCriacao.toISOString()
          : new Date().toISOString();
      
      const perfilCriado = await db.perfil.create({
        data: {
          id: uuidv4(),
          nome: perfil.nome,
          descricao: perfil.descricao,
          dataCriacao: dataCriacao,
          ativo: perfil.ativo,
          permissoes: {
            connect: permissoesCriadas.map((permissao: Permissao) => ({ id: permissao.id }))
          }
        },
        include: {
          permissoes: true
        }
      });
      return {
        ...perfilCriado,
        dataCriacao: perfilCriado.dataCriacao instanceof Date 
          ? perfilCriado.dataCriacao.toISOString() 
          : perfilCriado.dataCriacao,
        permissoes: perfilCriado.permissoes.map((permissao: Permissao) => ({
          ...permissao,
          dataCriacao: permissao.dataCriacao instanceof Date 
            ? permissao.dataCriacao.toISOString() 
            : permissao.dataCriacao
        }))
      } as Perfil;
    } catch (error) {
      console.error('Erro ao criar perfil com permissões:', error);
      throw new Error("Erro ao criar perfil com permissões: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };