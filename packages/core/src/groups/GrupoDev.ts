import { Permissao } from "../model/Permissao";
import { DevPerfil } from "./DevPerfil";

// models/Grupo.ts
export interface GrupoDev {
    id: string;
    nome: DevPerfil
    descricao: string;    
    dataCriacao: Date;
    permissoes: Permissao[]
    ativo: boolean;
}
