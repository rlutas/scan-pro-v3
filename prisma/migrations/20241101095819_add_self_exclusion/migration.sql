-- CreateTable
CREATE TABLE "SelfExclusion" (
    "id" TEXT NOT NULL,
    "cnp" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SelfExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelfExclusion_cnp_key" ON "SelfExclusion"("cnp");

-- CreateIndex
CREATE INDEX "SelfExclusion_cnp_idx" ON "SelfExclusion"("cnp");
