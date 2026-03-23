/*
  Warnings:

  - Added the required column `level` to the `programs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('UNDERGRADUATE', 'POSTGRADUATE', 'PHD');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "level" "ProgramLevel" NOT NULL;
