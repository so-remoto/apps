import { Perfil } from "./Perfil"

export interface Usuario {
    id: string
    nomeCompleto: string
    email: string
    senha:string
    dataCriacao?: Date
    ativo: boolean
    tokenRecuperar?: string
    tokenExpiracao?: string
    telefone: string
    imagem: string
    perfis: Perfil[]

}