/*
  Warnings:

  - The primary key for the `admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `admin` table. All the data in the column will be lost.
  - Added the required column `name` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `admin` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Admin_username_key` ON `admin`;

-- AlterTable
ALTER TABLE `admin` DROP PRIMARY KEY,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `username`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
