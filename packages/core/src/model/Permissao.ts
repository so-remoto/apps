import { Data } from "../shared"

export interface Permissao {
    id: string
    nome: string
    descricao: string
    dataCriacao: Data
    ativo: boolean
}