/*
  Warnings:

  - Added the required column `departmentId` to the `course_offerings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `course_offerings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_offerings" ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
