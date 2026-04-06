/*
  Warnings:

  - A unique constraint covering the columns `[enrollmentId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendances_enrollmentId_date_key" ON "attendances"("enrollmentId", "date");
