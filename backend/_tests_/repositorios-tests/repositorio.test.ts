import { PrismaClient } from "@prisma/client";
import { 
  obterUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  obterUsuarioPorId, 
  deletarUsuario 
} from '../../src/servicos/repositories/repositorioUsuario';
import { Usuario } from '../../../packages/core'; 


// Mock do PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    usuario: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

describe('usuarioRepository', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve obter uma lista de usuários', async () => {
    const usuariosMock: any = [{
      id: '1',
      nomeCompleto: 'Usuário Teste',
      email: 'teste@exemplo.com',
      senha: 'senha',
      dataCriacao: new Date(),
      ativo: true,
      tokenRecuperar: null,
      tokenExpiracao: null,
      telefone: '123456789',
      imagem: null,
      perfis: [{ id: '1' }]
    }];

    (prisma.usuario.findMany as jest.MockedFunction<typeof prisma.usuario.findMany>).mockResolvedValue(usuariosMock);

    const usuarios = await obterUsuarios();
    expect(usuarios).toEqual(usuariosMock);
    expect(prisma.usuario.findMany).toHaveBeenCalledTimes(1);
  });

  it('deve criar um usuário', async () => {
    const usuarioMock: any = {
      id: '2',
      nomeCompleto: 'Novo Usuário',
      email: 'novo@exemplo.com',
      senha: 'senha',
      dataCriacao: new Date(),
      ativo: true,
      tokenRecuperar: null,
      tokenExpiracao: null,
      telefone: '987654321',
      imagem: null,
      perfis: [{ id: '2' }]
    };

    (prisma.usuario.create as jest.MockedFunction<typeof prisma.usuario.create>).mockResolvedValue(usuarioMock);

    const novoUsuario = await criarUsuario(usuarioMock as unknown as Usuario);
    expect(novoUsuario).toEqual(usuarioMock);
    expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar um usuário', async () => {
    const id = '1';
    const dadosAtualizados: any = {
      nomeCompleto: 'Usuário Atualizado',
      email: 'atualizado@exemplo.com',
      senha: 'novaSenha',
      telefone: '123123123',
      imagem: 'https://exemplo.com/imagem-atualizada.jpg',
      ativo: true,
      perfis: [{ id: '1' }]
    };

    const usuarioAtualizadoMock: any = {
      ...dadosAtualizados,
      id,
      dataCriacao: new Date(),
      tokenRecuperar: null,
      tokenExpiracao: null
    };

    (prisma.usuario.update as jest.MockedFunction<typeof prisma.usuario.update>).mockResolvedValue(usuarioAtualizadoMock);

    const usuarioAtualizado = await atualizarUsuario(id, dadosAtualizados as unknown as Partial<Usuario>);
    expect(usuarioAtualizado).toEqual(usuarioAtualizadoMock);
    expect(prisma.usuario.update).toHaveBeenCalledTimes(1);
  });

  it('deve obter um usuário por ID', async () => {
    const id = '1';
    const usuarioMock: any = {
      id,
      nomeCompleto: 'Usuário Teste',
      email: 'teste@exemplo.com',
      senha: 'senha',
      dataCriacao: new Date(),
      ativo: true,
      tokenRecuperar: null,
      tokenExpiracao: null,
      telefone: '123456789',
      imagem: null,
      perfis: [{ id: '1' }]
    };

    (prisma.usuario.findUnique as jest.MockedFunction<typeof prisma.usuario.findUnique>).mockResolvedValue(usuarioMock);

    const usuario = await obterUsuarioPorId(id);
    expect(usuario).toEqual(usuarioMock);
    expect(prisma.usuario.findUnique).toHaveBeenCalledTimes(1);
  });

  it('deve deletar um usuário', async () => { 
    const id = '1'; const deletarUsuarioMock = { id: '1',
      nomeCompleto: 'Usuário Deletado',
      email: 'deletado@exemplo.com',
      senha: 'senha',
      dataCriacao: new Date(),
      ativo: true, tokenRecuperar: null, 
      tokenExpiracao: null,
      telefone: '123456789',
      imagem: null,
      perfis: [{ id: '1' }] };

      (prisma.usuario.delete as jest.MockedFunction<typeof prisma.usuario.delete>).mockResolvedValue(deletarUsuarioMock); await deletarUsuario(id); expect(prisma.usuario.delete).toHaveBeenCalledTimes(1); expect(prisma.usuario.delete).toHaveBeenCalledWith({ where: { id } }); });

  
});
