import { PrismaClient} from "@prisma/client";
import { Usuario } from "../../../../packages/core"; // Ajuste o caminho conforme necessário
import  {Data}  from "../../../../packages/core"; // Usando a exportação correta

const repo = new PrismaClient();

export const obterUsuarios = async (): Promise<Usuario[]> => {
  const usuarios = await repo.usuario.findMany({
    include: {
      perfis: true // Inclui perfis relacionados
    }
  });
  return usuarios as unknown as Usuario[];
}

export const criarUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const novoUsuario = await repo.usuario.create({
    data: {
      nomeCompleto: usuario.nomeCompleto,
      email: usuario.email,
      senha: usuario.senha,
      telefone: usuario.telefone,
      imagem: new URL(usuario.imagem).toString(), // Converter string para URL e depois para string
      dataCriacao: Data.desformatar(usuario.dataCriacao.toString()),
      ativo: usuario.ativo,
      tokenRecuperar: usuario.tokenRecuperar !== undefined ? usuario.tokenRecuperar: null,
      tokenExpiracao: usuario.tokenExpiracao !== undefined? usuario.tokenExpiracao: null,
      perfis: {
        connect: usuario.perfis.map(perfil => ({ id: perfil.id }))
      }
    }
  });
  return novoUsuario as unknown as Usuario;
}

export const atualizarUsuario = async (id: string, dadosAtualizados: Partial<Usuario>): Promise<Usuario | null> => {
  const usuarioAtualizado = await repo.usuario.update({
    where: { id },
    data: {
      nomeCompleto: dadosAtualizados.nomeCompleto,
      email: dadosAtualizados.email,
      senha: dadosAtualizados.senha,
      telefone: dadosAtualizados.telefone,
      imagem: dadosAtualizados.imagem ? new URL(dadosAtualizados.imagem).toString() : undefined, // Converter string para URL se disponível
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
}


export const obterUsuarioPorId = async (id: string): Promise<Usuario | null> => {
  const usuario = await repo.usuario.findUnique({
    where: { id },
    include: { perfis: true }
  });
  return usuario as unknown as Usuario | null;
}

export const deletarUsuario = async (id: string): Promise<void> => {
  await repo.usuario.delete({
    where: { id }
  });
}

