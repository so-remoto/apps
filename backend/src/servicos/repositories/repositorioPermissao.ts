import { Permissao } from "../../../../core/src/index"; // Caminho relativo ao diretório atual
import DataMaster from "../../../../core/src/shared/Data"; // Caminho relativo ao diretório atual
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";


const db = new PrismaClient();

export const criarPermissoes = async (permissoes: Permissao[]): Promise<Permissao[]> => {
    const permissoesCriadas: Permissao[] = [];
    for (const permissao of permissoes) {
      const permissaoExistente = await db.permissao.findUnique({ where: { id: permissao.id } });
      if (!permissaoExistente) {
        const dataCriacao = typeof permissao.dataCriacao === 'string' 
          ? new Date(DataMaster.desformatar(permissao.dataCriacao)).toISOString()
          : permissao.dataCriacao instanceof Date
            ? permissao.dataCriacao.toISOString()
            : new Date().toISOString();
        
        const novaPermissao = await db.permissao.create({
          data: {
            id: uuidv4(),
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
  