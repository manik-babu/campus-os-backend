-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "admission_forms" ADD COLUMN     "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING';
