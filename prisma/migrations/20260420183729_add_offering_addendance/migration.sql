/*
  Warnings:

  - A unique constraint covering the columns `[courseOfferingId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseOfferingId` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "attendances_enrollmentId_date_key";

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "courseOfferingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attendances_courseOfferingId_date_key" ON "attendances"("courseOfferingId", "date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
