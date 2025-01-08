-- CreateTable
CREATE TABLE "ScanHistory" (
    "id" TEXT NOT NULL,
    "cnp" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasAllowed" BOOLEAN NOT NULL,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "ScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanHistory_userId_idx" ON "ScanHistory"("userId");

-- CreateIndex
CREATE INDEX "ScanHistory_deviceId_idx" ON "ScanHistory"("deviceId");

-- CreateIndex
CREATE INDEX "ScanHistory_cnp_idx" ON "ScanHistory"("cnp");

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
