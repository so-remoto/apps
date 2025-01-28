
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
      // Verificação se o e-mail já existe
      const usuarioExistente = await db.usuario.findUnique({
        where: { email: usuario.email }
      });

      if (usuarioExistente) {
        throw new Error(`E-mail ${usuario.email} já está em uso`);
      }

      // Definição de URL padrão para imagem
      const imagemUrl = usuario.imagem ?? 'https://exemplo.com/imagem-padrao.jpg';
      
      // Formatação da data de criação
      const dataCriacao = typeof usuario.dataCriacao === 'string' 
        ? new Date(DataMaster.desformatar(usuario.dataCriacao)).toISOString()
        : usuario.dataCriacao instanceof Date
          ? usuario.dataCriacao.toISOString()
          : new Date().toISOString();
      
      // Formatação da data de expiração do token
      const tokenExpiracao = usuario.tokenExpiracao
        ? (typeof usuario.tokenExpiracao === 'string' 
          ? new Date(DataMaster.desformatar(usuario.tokenExpiracao)).toISOString() 
          : usuario.tokenExpiracao instanceof Date
            ? usuario.tokenExpiracao.toISOString()
            : null)
        : null;
      
      // Criação do novo usuário
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

      // Vinculação dos perfis ao usuário
      if (usuario.perfis && usuario.perfis.length > 0) {
        for (const perfil of usuario.perfis) {
          // Geração de ID para o perfil, se necessário
          perfil.id = perfil.id || uuidv4();
          let perfilExistente = await db.perfil.findUnique({
            where: { id: perfil.id },
            include: { permissoes: true } 
          });

          if (!perfilExistente) {
            // Criação do perfil e permissões se não existir
            perfil.permissoes.forEach(permissao => {
              permissao.id = permissao.id || uuidv4();
            });

            perfilExistente = await db.perfil.create({
              data: {
                id: perfil.id,
                nome: perfil.nome,
                descricao: perfil.descricao,
                dataCriacao: perfil.dataCriacao ?? new Date().toISOString(),
                ativo: perfil.ativo,
                permissoes: {
                  create: perfil.permissoes.map(permissao => ({
                    id: permissao.id,
                    nome: permissao.nome,
                    descricao: permissao.descricao,
                    dataCriacao: permissao.dataCriacao ?? new Date().toISOString(),
                    ativo: permissao.ativo
                  }))
                }
              },
              include: { permissoes: true }
            });
          }

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

  export const atualizarUsuario = async (id: string, dadosAtualizados: Usuario): Promise<Usuario> => {
    try {
      // Atualização dos dados básicos do usuário
      const usuarioAtualizado = await db.usuario.update({
        where: { id: id },
        data: {
          nomeCompleto: dadosAtualizados.nomeCompleto,
          email: dadosAtualizados.email,
          senha: dadosAtualizados.senha,
          telefone: dadosAtualizados.telefone,
          imagem: dadosAtualizados.imagem,
          ativo: dadosAtualizados.ativo,
          tokenRecuperar: dadosAtualizados.tokenRecuperar ?? null,
          tokenExpiracao: dadosAtualizados.tokenExpiracao ? new Date(dadosAtualizados.tokenExpiracao).toISOString() : null
        }
      });
  
      // Deletar associações de perfis do usuário na tabela intermediária
      await db.usuarioPerfil.deleteMany({
        where: { usuarioId: id }
      });
  
      // Adicionar novas associações
      for (const perfil of dadosAtualizados.perfis) {
        // Geração de ID para o perfil, se necessário
        perfil.id = perfil.id || uuidv4();
        let perfilExistente = await db.perfil.findUnique({
          where: { id: perfil.id },
          include: { permissoes: true }
        });
  
        if (!perfilExistente) {
          // Criação do perfil e permissões se não existir
          perfil.permissoes.forEach(permissao => {
            permissao.id = permissao.id || uuidv4();
          });
  
          perfilExistente = await db.perfil.create({
            data: {
              id: perfil.id,
              nome: perfil.nome,
              descricao: perfil.descricao,
              dataCriacao: perfil.dataCriacao ?? new Date().toISOString(),
              ativo: perfil.ativo,
              permissoes: {
                create: perfil.permissoes.map(permissao => ({
                  id: permissao.id,
                  nome: permissao.nome,
                  descricao: permissao.descricao,
                  dataCriacao: permissao.dataCriacao ?? new Date().toISOString(),
                  ativo: permissao.ativo
                }))
              }
            },
            include: { permissoes: true }
          });
        }
  
        await db.usuarioPerfil.create({
          data: {
            id: uuidv4(),
            usuarioId: usuarioAtualizado.id,
            perfilId: perfilExistente.id
          }
        });
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
    try {
      // Deletar associações de perfis do usuário na tabela intermediária
      await db.usuarioPerfil.deleteMany({
        where: { usuarioId: id }
      });
  
      // Deletar o usuário
      await db.usuario.delete({
        where: { id: id }
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error("Erro ao deletar usuário: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
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
