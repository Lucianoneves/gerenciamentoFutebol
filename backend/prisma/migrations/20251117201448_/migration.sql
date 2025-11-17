-- AlterTable
ALTER TABLE `pagamento` ADD COLUMN `dia` INTEGER NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL;
