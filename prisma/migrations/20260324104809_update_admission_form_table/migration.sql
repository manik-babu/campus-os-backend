/*
  Warnings:

  - You are about to drop the column `hscCertificateId` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `sscCertificateId` on the `images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sscDocId]` on the table `images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hscDocId]` on the table `images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_admissionFormId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_hscCertificateId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_sscCertificateId_fkey";

-- DropIndex
DROP INDEX "images_hscCertificateId_key";

-- DropIndex
DROP INDEX "images_sscCertificateId_key";

-- AlterTable
ALTER TABLE "images" DROP COLUMN "hscCertificateId",
DROP COLUMN "sscCertificateId",
ADD COLUMN     "hscDocId" TEXT,
ADD COLUMN     "sscDocId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "images_sscDocId_key" ON "images"("sscDocId");

-- CreateIndex
CREATE UNIQUE INDEX "images_hscDocId_key" ON "images"("hscDocId");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_admissionFormId_fkey" FOREIGN KEY ("admissionFormId") REFERENCES "admission_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_sscDocId_fkey" FOREIGN KEY ("sscDocId") REFERENCES "admission_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_hscDocId_fkey" FOREIGN KEY ("hscDocId") REFERENCES "admission_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
