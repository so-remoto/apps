-- CreateEnum
CREATE TYPE "DevPerfil" AS ENUM ('Junior', 'Pleno', 'Senior');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL,
    "tokenRecuperar" TEXT,
    "tokenExpiracao" TIMESTAMP(3),
    "telefone" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL,
    "grupoId" TEXT NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoDev" (
    "id" TEXT NOT NULL,
    "nome" "DevPerfil" NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "GrupoDev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PerfilPermissoes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerfilPermissoes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UsuarioPerfis" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UsuarioPerfis_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GrupoDevToPermissao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GrupoDevToPermissao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "_PerfilPermissoes_B_index" ON "_PerfilPermissoes"("B");

-- CreateIndex
CREATE INDEX "_UsuarioPerfis_B_index" ON "_UsuarioPerfis"("B");

-- CreateIndex
CREATE INDEX "_GrupoDevToPermissao_B_index" ON "_GrupoDevToPermissao"("B");

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoDev"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilPermissoes" ADD CONSTRAINT "_PerfilPermissoes_A_fkey" FOREIGN KEY ("A") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfilPermissoes" ADD CONSTRAINT "_PerfilPermissoes_B_fkey" FOREIGN KEY ("B") REFERENCES "Permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioPerfis" ADD CONSTRAINT "_UsuarioPerfis_A_fkey" FOREIGN KEY ("A") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioPerfis" ADD CONSTRAINT "_UsuarioPerfis_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GrupoDevToPermissao" ADD CONSTRAINT "_GrupoDevToPermissao_A_fkey" FOREIGN KEY ("A") REFERENCES "GrupoDev"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GrupoDevToPermissao" ADD CONSTRAINT "_GrupoDevToPermissao_B_fkey" FOREIGN KEY ("B") REFERENCES "Permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
