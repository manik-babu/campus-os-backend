/*
  Warnings:

  - You are about to drop the `graduations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "graduations" DROP CONSTRAINT "graduations_facultyProfileId_fkey";

-- DropTable
DROP TABLE "graduations";
