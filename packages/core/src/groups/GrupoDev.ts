import Data from "../shared/Data";
import { Permissao } from "../model/Permissao";
import { DevPerfil } from "./DevPerfil";

// models/Grupo.ts
export interface GrupoDev {
    id: string;
    nome: DevPerfil
    descricao: string;    
    dataCriacao: Data;
    permissoes: Permissao[]
    ativo: boolean;
}
