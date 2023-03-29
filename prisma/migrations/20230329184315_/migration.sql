/*
  Warnings:

  - You are about to drop the column `aiScore` on the `Metadata` table. All the data in the column will be lost.
  - You are about to drop the column `aiSummary` on the `Metadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Metadata" DROP COLUMN "aiScore",
DROP COLUMN "aiSummary",
ADD COLUMN     "ai_score" INTEGER,
ADD COLUMN     "ai_summary_en" TEXT,
ADD COLUMN     "ai_summary_ja" TEXT,
ADD COLUMN     "ai_summary_zh" TEXT,
ADD COLUMN     "ai_summary_zhtw" TEXT;
