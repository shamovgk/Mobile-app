/*
  Warnings:

  - You are about to drop the column `packId` on the `user_level_progress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_level_progress" DROP CONSTRAINT "user_level_progress_packId_fkey";

-- DropIndex
DROP INDEX "user_level_progress_packId_idx";

-- AlterTable
ALTER TABLE "user_level_progress" DROP COLUMN "packId";

-- CreateIndex
CREATE INDEX "level_attempts_userId_levelId_completedAt_idx" ON "level_attempts"("userId", "levelId", "completedAt");

-- CreateIndex
CREATE INDEX "user_level_progress_levelId_idx" ON "user_level_progress"("levelId");

-- CreateIndex
CREATE INDEX "user_level_progress_userId_completedAt_idx" ON "user_level_progress"("userId", "completedAt");
