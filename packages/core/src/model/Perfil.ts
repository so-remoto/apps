import { GrupoDev } from "../groups/GrupoDev"
import { Data } from "../shared"
import { Permissao } from "./Permissao"

export interface Perfil {
    id: string
    nome: string
    descricao: string
    dataCriacao: Data
    ativo: boolean
    permissoes: Permissao[]
    grupo: GrupoDev
}