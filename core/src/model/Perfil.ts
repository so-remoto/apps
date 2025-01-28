import { Permissao } from "./Permissao"

export interface Perfil {
    id: string
    nome: string
    descricao: string
    dataCriacao: string | Date
    ativo: boolean
    permissoes: Permissao[]
    
}