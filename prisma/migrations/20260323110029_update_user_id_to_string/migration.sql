/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[registrationNo]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idCardNo]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idCardNo` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNo` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "admin_profiles" DROP CONSTRAINT "admin_profiles_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "admin_profiles" DROP CONSTRAINT "admin_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "bills" DROP CONSTRAINT "bills_studentId_fkey";

-- DropForeignKey
ALTER TABLE "course_offerings" DROP CONSTRAINT "course_offerings_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "faculty_profiles" DROP CONSTRAINT "faculty_profiles_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "faculty_profiles" DROP CONSTRAINT "faculty_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "graduations" DROP CONSTRAINT "graduations_facultyProfileId_fkey";

-- DropForeignKey
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_programId_fkey";

-- DropForeignKey
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_userId_fkey";

-- AlterTable
ALTER TABLE "admin_profiles" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "bills" ALTER COLUMN "studentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "course_offerings" ALTER COLUMN "facultyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "enrollments" ALTER COLUMN "studentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "faculty_profiles" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "student_profiles" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "idCardNo" TEXT NOT NULL,
ADD COLUMN     "registrationNo" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "users_registrationNo_key" ON "users"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_idCardNo_key" ON "users"("idCardNo");

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduations" ADD CONSTRAINT "graduations_facultyProfileId_fkey" FOREIGN KEY ("facultyProfileId") REFERENCES "faculty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
