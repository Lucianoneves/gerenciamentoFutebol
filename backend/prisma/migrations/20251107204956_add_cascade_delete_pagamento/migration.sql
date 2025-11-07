-- DropForeignKey
ALTER TABLE `pagamento` DROP FOREIGN KEY `Pagamento_jogadorId_fkey`;

-- DropIndex
DROP INDEX `Pagamento_jogadorId_fkey` ON `pagamento`;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_jogadorId_fkey` FOREIGN KEY (`jogadorId`) REFERENCES `Jogador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
