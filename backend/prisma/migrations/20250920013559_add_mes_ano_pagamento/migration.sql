/*
  Warnings:

  - You are about to alter the column `mes` on the `pagamento` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `ano` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pagamento` ADD COLUMN `ano` INTEGER NOT NULL,
    MODIFY `mes` INTEGER NOT NULL;
