import { Permissao } from "core/src/index"; // Caminho relativo ao diretório atual
import DataMaster from "core/src/shared/Data"; // Caminho relativo ao diretório atual
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const criarPermissoes = async (permissoes: Permissao[]): Promise<Permissao[]> => {
  console.log("Permissões recebidas:", permissoes);

  if (!Array.isArray(permissoes)) {
    throw new TypeError("permissoes is not iterable");
  }

  const permissoesCriadas: Permissao[] = [];

  for (const permissao of permissoes) {
    const permissaoId = permissao.id || uuidv4(); // Gera um id único se não for fornecido

    const permissaoExistente = await db.permissao.findUnique({
      where: { id: permissaoId }
    });

    if (!permissaoExistente) {
      const dataCriacao = typeof permissao.dataCriacao === 'string'
        ? new Date(DataMaster.desformatar(permissao.dataCriacao)).toISOString()
        : permissao.dataCriacao instanceof Date
          ? permissao.dataCriacao.toISOString()
          : new Date().toISOString();

      const novaPermissao = await db.permissao.create({
        data: {
          id: permissaoId,
          nome: permissao.nome,
          descricao: permissao.descricao,
          dataCriacao: dataCriacao,
          ativo: permissao.ativo
        }
      });

      permissoesCriadas.push({
        ...novaPermissao,
        dataCriacao: novaPermissao.dataCriacao.toString()
      } as Permissao);
    } else {
      permissoesCriadas.push({
        ...permissaoExistente,
        dataCriacao: permissaoExistente.dataCriacao.toString()
      } as Permissao);
    }
  }

  return permissoesCriadas;
};

export const atualizarPermissao = async (id: string, dadosAtualizados: Permissao): Promise<Permissao> => {
  try {
    const permissaoAtualizada = await db.permissao.update({
      where: { id: id },
      data: {
        nome: dadosAtualizados.nome,
        descricao: dadosAtualizados.descricao,
        dataCriacao: dadosAtualizados.dataCriacao
          ? new Date(dadosAtualizados.dataCriacao).toISOString()
          : new Date().toISOString(),
        ativo: dadosAtualizados.ativo
      }
    });

    return {
      ...permissaoAtualizada,
      dataCriacao: permissaoAtualizada.dataCriacao.toString()
    } as Permissao;
  } catch (error) {
    console.error('Erro ao atualizar permissão:', error);
    throw new Error("Erro ao atualizar permissão: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};


export const buscarTodasPermissoes = async (): Promise<Permissao[]> => {
  try {
    const permissoes = await db.permissao.findMany();
    return permissoes.map(permissao => ({
      ...permissao,
      dataCriacao: permissao.dataCriacao instanceof Date
        ? permissao.dataCriacao.toISOString()
        : permissao.dataCriacao
    })) as Permissao[];
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    throw new Error("Erro ao buscar permissões: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const buscarPermissaoPorId = async (id: string): Promise<Permissao | null> => {
  try {
    const permissao = await db.permissao.findUnique({
      where: { id: id }
    });

    if (permissao) {
      return {
        ...permissao,
        dataCriacao: permissao.dataCriacao instanceof Date
          ? permissao.dataCriacao.toISOString()
          : permissao.dataCriacao
      } as Permissao;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar permissão por ID:', error);
    throw new Error("Erro ao buscar permissão por ID: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

export const deletarPermissao = async (id: string): Promise<void> => {
  try {
    await db.permissao.delete({
      where: { id: id }
    });
  } catch (error) {
    console.error('Erro ao deletar permissão:', error);
    throw new Error("Erro ao deletar permissão: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};
