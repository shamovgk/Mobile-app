/*
  Warnings:

  - You are about to drop the column `audio` on the `lexemes` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `lexemes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guest_users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "lexemes" DROP COLUMN "audio",
DROP COLUMN "image";

-- CreateIndex
CREATE INDEX "guest_users_createdAt_idx" ON "guest_users"("createdAt");
