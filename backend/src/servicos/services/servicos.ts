import fetch from 'node-fetch';
import { Usuario } from '../../../../packages/core/dist';
// Defina a URL base da API
const API_URL = 'http://localhost:3001';


async function getUsers(): Promise<Usuario[]> {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Erro ao buscar usuários: ${errorMessage}`);
    }
    return response.json() as Promise<Usuario[]>;
  } catch (error) {
    console.error('Erro na requisição GET /users:', error);
    throw error; // Re-lança o erro para que o chamador possa lidar com ele
  }
}
// Função para criar um novo usuário
export async function createUser(usuario: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Erro ao criar usuário: ${errorMessage}`);
    }
    return response.json();
  } catch (error) {
    console.error('Erro na requisição POST /users:', error);
    throw error;
  }
}
// Função para atualizar um usuário
export async function updateUser(id: string, usuario: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Erro ao atualizar usuário: ${errorMessage}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Erro na requisição PUT /users/${id}:`, error);
    throw error;
  }
}
// Função para deletar um usuário
export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Erro ao deletar usuário: ${errorMessage}`);
    }
  } catch (error) {
    console.error(`Erro na requisição DELETE /users/${id}:`, error);
    throw error;
  }
}
