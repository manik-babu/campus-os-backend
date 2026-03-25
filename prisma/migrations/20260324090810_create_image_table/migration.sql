/*
  Warnings:

  - You are about to drop the column `image` on the `admission_forms` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admission_forms" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT,
    "admissionFormId" TEXT,
    "sscCertificateId" TEXT,
    "hscCertificateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_userId_key" ON "images"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "images_admissionFormId_key" ON "images"("admissionFormId");

-- CreateIndex
CREATE UNIQUE INDEX "images_sscCertificateId_key" ON "images"("sscCertificateId");

-- CreateIndex
CREATE UNIQUE INDEX "images_hscCertificateId_key" ON "images"("hscCertificateId");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_admissionFormId_fkey" FOREIGN KEY ("admissionFormId") REFERENCES "admission_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_sscCertificateId_fkey" FOREIGN KEY ("sscCertificateId") REFERENCES "admission_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_hscCertificateId_fkey" FOREIGN KEY ("hscCertificateId") REFERENCES "admission_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
