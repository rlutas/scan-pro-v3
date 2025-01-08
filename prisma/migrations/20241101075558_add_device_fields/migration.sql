/*
  Warnings:

  - Added the required column `fingerprint` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `Device` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "fingerprint" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE INDEX "Device_fingerprint_idx" ON "Device"("fingerprint");
