-- CreateTable
CREATE TABLE "Metadata" (
    "uri" TEXT NOT NULL,
    "aiSummary" TEXT,
    "aiScore" INTEGER,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("uri")
);

-- CreateIndex
CREATE INDEX "Metadata_uri_idx" ON "Metadata"("uri");
