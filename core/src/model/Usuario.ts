import { Perfil } from "./Perfil"

export interface Usuario {
    id: string
    nomeCompleto: string
    email: string
    senha:string
    dataCriacao?: string | Date
    ativo: boolean
    tokenRecuperar?: string | null
    tokenExpiracao?: string | Date
    telefone: string
    imagem?: string
    perfis: Perfil[]

}