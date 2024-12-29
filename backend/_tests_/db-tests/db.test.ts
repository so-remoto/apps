import { PrismaClient } from "@prisma/client";
import { obterUsuarios, criarUsuario, atualizarUsuario, obterUsuarioPorId, deletarUsuario } from '../../src/servicos/repositories/repositorioUsuario';
import { Usuario } from '../../../packages/core';

const prisma = new PrismaClient();

describe('Integração com o Banco de Dados', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.usuario.deleteMany(); // Limpar tabela de usuários antes de cada teste
  });

  it('deve criar, obter, atualizar e deletar um usuário no banco de dados', async () => {
    // Criar um usuário
    const usuarioCriado = await criarUsuario({
      id: '1',
      nomeCompleto: 'Usuário Teste',
      email: 'teste@exemplo.com',
      senha: 'senhaValida',
      telefone: '123456789',
      imagem: 'https://exemplo.com/imagem.jpg',
      ativo: true,
      perfis: []
    } as Usuario);

    expect(usuarioCriado).toHaveProperty('id');
    expect(usuarioCriado.email).toBe('teste@exemplo.com');

    // Obter o usuário criado
    const obterUsuarios = await obterUsuarioPorId(usuarioCriado.id);
    expect(obterUsuarios).toEqual(usuarioCriado);

    // Atualizar o usuário
    const usuarioAtualizado = await atualizarUsuario(usuarioCriado.id, {
      nomeCompleto: 'Usuário Atualizado'
    });
    expect(usuarioAtualizado?.nomeCompleto).toBe('Usuário Atualizado');

    // Deletar o usuário
    await deletarUsuario(usuarioCriado.id);

    // Verificar se o usuário foi deletado
    const usuarioDeletado = await obterUsuarioPorId(usuarioCriado.id);
    expect(usuarioDeletado).toBeNull();
  });
});
