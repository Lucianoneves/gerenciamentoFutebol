/*
  Warnings:

  - You are about to drop the column `email` on the `jogador` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Jogador_email_key` ON `jogador`;

-- AlterTable
ALTER TABLE `jogador` DROP COLUMN `email`;
