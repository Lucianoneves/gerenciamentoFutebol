-- CreateEnum
CREATE TYPE "public"."TipoJogador" AS ENUM ('MENSALISTA', 'AVULSO');

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jogador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tipo" "public"."TipoJogador" NOT NULL,
    "valorBase" DOUBLE PRECISION,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pagamento" (
    "id" SERIAL NOT NULL,
    "jogadorId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "dia" INTEGER,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Despesa" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER,
    "ano" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- AddForeignKey
ALTER TABLE "public"."Pagamento" ADD CONSTRAINT "Pagamento_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "public"."Jogador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
