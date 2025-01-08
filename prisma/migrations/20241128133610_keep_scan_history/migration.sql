-- DropForeignKey
ALTER TABLE "ScanHistory" DROP CONSTRAINT "ScanHistory_deviceId_fkey";

-- AlterTable
ALTER TABLE "ScanHistory" ADD COLUMN     "deviceLocation" TEXT,
ADD COLUMN     "deviceName" TEXT;

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
