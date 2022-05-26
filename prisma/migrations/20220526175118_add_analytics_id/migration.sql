/*
  Warnings:

  - A unique constraint covering the columns `[analyticsId]` on the table `sites` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "analyticsId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sites_analyticsId_key" ON "sites"("analyticsId");
