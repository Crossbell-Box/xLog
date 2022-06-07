/*
  Warnings:

  - You are about to drop the column `subscribersNotifiedAt` on the `pages` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PageEmailStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "subscribersNotifiedAt",
ADD COLUMN     "emailStatus" "PageEmailStatus",
ADD COLUMN     "emailSubject" TEXT;
