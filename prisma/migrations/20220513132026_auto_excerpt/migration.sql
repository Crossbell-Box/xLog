/*
  Warnings:

  - Added the required column `autoExcerpt` to the `pages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "autoExcerpt" TEXT NOT NULL,
ALTER COLUMN "excerpt" DROP NOT NULL;
