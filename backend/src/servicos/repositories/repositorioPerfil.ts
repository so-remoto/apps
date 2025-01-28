import { PrismaClient } from '@prisma/client'
import { Perfil, Permissao } from 'core/src/index'
import DataMaster from 'core/src/shared/Data'
import { v4 as uuidv4 } from 'uuid'
import Joi from 'joi'
import { criarPermissoes } from './repositorioPermissao'

const db = new PrismaClient()

const perfilSchema = Joi.object({
  id: Joi.string().optional(),
  nome: Joi.string().required(),
  descricao: Joi.string().required(),
  dataCriacao: Joi.string().optional(),
  ativo: Joi.boolean().required(),
  permissoes: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().optional(),
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        dataCriacao: Joi.string().optional(),
        ativo: Joi.boolean().required()
      })
    )
    .required()
})

export const criarPerfilComPermissoes = async (
  perfil: Perfil
): Promise<Perfil> => {
  try {
    // Adicione IDs usando uuid se não estiverem presentes
    perfil.id = perfil.id || uuidv4()
    perfil.permissoes.forEach((permissao) => {
      permissao.id = permissao.id || uuidv4()
    })

    const permissoesCriadas = await criarPermissoes(perfil.permissoes)
    const dataCriacao =
      typeof perfil.dataCriacao === 'string'
        ? new Date(DataMaster.desformatar(perfil.dataCriacao)).toISOString()
        : perfil.dataCriacao instanceof Date
        ? perfil.dataCriacao.toISOString()
        : new Date().toISOString()

    const perfilCriado = await db.perfil.create({
      data: {
        id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        dataCriacao: dataCriacao,
        ativo: perfil.ativo,
        permissoes: {
          connect: permissoesCriadas.map((permissao: Permissao) => ({
            id: permissao.id
          }))
        }
      },
      include: {
        permissoes: true
      }
    })
    return {
      ...perfilCriado,
      dataCriacao:
        perfilCriado.dataCriacao instanceof Date
          ? perfilCriado.dataCriacao.toISOString()
          : perfilCriado.dataCriacao,
      permissoes: perfilCriado.permissoes.map((permissao: Permissao) => ({
        ...permissao,
        dataCriacao:
          permissao.dataCriacao instanceof Date
            ? permissao.dataCriacao.toISOString()
            : permissao.dataCriacao
      }))
    } as Perfil
  } catch (error) {
    console.error('Erro ao criar perfil com permissões:', error)
    throw new Error(
      'Erro ao criar perfil com permissões: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    )
  }
}

export const atualizarPerfil = async (
  id: string,
  dadosAtualizados: Perfil
): Promise<Perfil> => {
  try {
    const perfilExistente = await db.perfil.findUnique({
      where: { id: id },
      include: { permissoes: true }
    })

    if (!perfilExistente) {
      throw new Error('Perfil não encontrado')
    }

    // Desconectar permissões antigas
    await db.perfil.update({
      where: { id: id },
      data: {
        permissoes: {
          disconnect: perfilExistente.permissoes.map(
            (permissao: Permissao) => ({ id: permissao.id })
          )
        }
      }
    })

    // Verificar e criar permissões se necessário
    const permissoesAtualizadas = []
    for (const permissao of dadosAtualizados.permissoes) {
      let permissaoExistente
      if (permissao.id) {
        permissaoExistente = await db.permissao.findUnique({
          where: { id: permissao.id }
        })
      }

      if (!permissaoExistente) {
        const novaPermissao = await db.permissao.create({
          data: {
            id: uuidv4(),
            nome: permissao.nome,
            descricao: permissao.descricao,
            dataCriacao:
              typeof permissao.dataCriacao === 'string'
                ? new Date(
                    DataMaster.desformatar(permissao.dataCriacao)
                  ).toISOString()
                : permissao.dataCriacao instanceof Date
                ? permissao.dataCriacao.toISOString()
                : new Date().toISOString(),
            ativo: permissao.ativo
          }
        })
        permissoesAtualizadas.push(novaPermissao.id)
      } else {
        permissoesAtualizadas.push(permissaoExistente.id)
      }
    }

    // Atualização do perfil com novas permissões
    const perfilAtualizado = await db.perfil.update({
      where: { id: id },
      data: {
        nome: dadosAtualizados.nome,
        descricao: dadosAtualizados.descricao,
        dataCriacao: dadosAtualizados.dataCriacao
          ? typeof dadosAtualizados.dataCriacao === 'string'
            ? dadosAtualizados.dataCriacao
            : dadosAtualizados.dataCriacao.toISOString()
          : new Date().toISOString(),
        ativo: dadosAtualizados.ativo,
        permissoes: {
          connect: permissoesAtualizadas.map((id) => ({ id }))
        }
      },
      include: { permissoes: true }
    })

    return {
      ...perfilAtualizado,
      dataCriacao: perfilAtualizado.dataCriacao.toString(),
      permissoes: perfilAtualizado.permissoes.map((permissao: Permissao) => ({
        ...permissao,
        dataCriacao: permissao.dataCriacao.toString()
      }))
    } as Perfil
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    throw new Error(
      'Erro ao atualizar perfil: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    )
  }
}

export const deletarPerfil = async (id: string): Promise<void> => {
  try {
    // Deletar associações de perfis do usuário na tabela intermediária
    await db.usuarioPerfil.deleteMany({
      where: { perfilId: id }
    })

    // Deletar o perfil
    await db.perfil.delete({
      where: { id: id }
    })
  } catch (error) {
    console.error('Erro ao deletar perfil:', error)
    throw new Error(
      'Erro ao deletar perfil: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    )
  }
}

export const buscarTodosPerfis = async (): Promise<Perfil[]> => {
  try {
    const perfis = await db.perfil.findMany({
      include: {
        permissoes: true
      }
    })

    return perfis.map((perfil: Perfil) => ({
      ...perfil,
      dataCriacao: perfil.dataCriacao.toString(),
      permissoes: perfil.permissoes.map((permissao) => ({
        ...permissao,
        dataCriacao: permissao.dataCriacao.toString()
      }))
    })) as Perfil[]
  } catch (error) {
    console.error('Erro ao buscar perfis:', error)
    throw new Error(
      'Erro ao buscar perfis: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    )
  }
}

export const buscarPerfilPorId = async (id: string): Promise<Perfil | null> => {
  try {
    const perfil = await db.perfil.findUnique({
      where: { id: id },
      include: {
        permissoes: true
      }
    })

    if (perfil) {
      return {
        ...perfil,
        dataCriacao: perfil.dataCriacao.toString(),
        permissoes: perfil.permissoes.map((permissao: Permissao) => ({
          ...permissao,
          dataCriacao: permissao.dataCriacao.toString()
        }))
      } as Perfil
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar perfil por ID:', error)
    throw new Error(
      'Erro ao buscar perfil por ID: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    )
  }
}
