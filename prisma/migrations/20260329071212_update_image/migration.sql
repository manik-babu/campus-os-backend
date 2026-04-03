/*
  Warnings:

  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_admissionFormId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_hscDocId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_sscDocId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_userId_fkey";

-- AlterTable
ALTER TABLE "admission_forms" ADD COLUMN     "hscDoc" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "sscDoc" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "images";
