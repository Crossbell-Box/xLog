-- AlterTable
ALTER TABLE "login_tokens" ADD COLUMN     "subscribeForm" JSONB;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "subscribersNotifiedAt" TIMESTAMP(3);
