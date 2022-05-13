-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "autoExcerpt" TEXT,
ALTER COLUMN "excerpt" DROP NOT NULL;
