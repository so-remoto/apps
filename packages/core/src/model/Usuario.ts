import { Data } from "../shared"
import { Perfil } from "./Perfil"

export interface Usuario {
    id: string
    nomeCompleto: string
    email: string
    senha:string
    dataCriacao: Data
    ativo: boolean
    tokenRecuperar?: {}
    tokenExpiracao?: {}
    telefone: string
    imagem: URL
    perfis: Perfil

}