-- CreateIndex
CREATE INDEX "levels_packId_idx" ON "levels"("packId");

-- CreateIndex
CREATE INDEX "lexemes_packId_difficulty_idx" ON "lexemes"("packId", "difficulty");
