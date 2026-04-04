/*
  Warnings:

  - You are about to drop the column `programId` on the `course_offerings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_offerings" DROP CONSTRAINT "course_offerings_programId_fkey";

-- AlterTable
ALTER TABLE "course_offerings" DROP COLUMN "programId";
