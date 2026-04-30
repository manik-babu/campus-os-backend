/*
  Warnings:

  - Made the column `gender` on table `admission_forms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "admission_forms" ALTER COLUMN "gender" SET NOT NULL;
