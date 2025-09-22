/*
  Warnings:

  - Added the required column `tipo` to the `Jogador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorBase` to the `Jogador` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefone` on table `jogador` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `jogador` ADD COLUMN `tipo` ENUM('MENSALISTA', 'AVULSO') NOT NULL,
    ADD COLUMN `valorBase` DOUBLE NOT NULL,
    MODIFY `telefone` VARCHAR(191) NOT NULL;
