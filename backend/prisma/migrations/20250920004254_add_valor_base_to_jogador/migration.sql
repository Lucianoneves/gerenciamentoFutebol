/*
  Warnings:

  - You are about to drop the column `data` on the `pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `pagamento` table. All the data in the column will be lost.
  - Added the required column `mes` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jogador` ADD COLUMN `valorBase` DOUBLE NULL;

-- AlterTable
ALTER TABLE `pagamento` DROP COLUMN `data`,
    DROP COLUMN `status`,
    DROP COLUMN `tipo`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `mes` VARCHAR(191) NOT NULL,
    ADD COLUMN `pago` BOOLEAN NOT NULL DEFAULT false;
