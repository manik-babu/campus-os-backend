-- CreateEnum
CREATE TYPE "AdmissionUserGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "admission_forms" ADD COLUMN     "gender" "AdmissionUserGender";
