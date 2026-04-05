/*
  Warnings:

  - A unique constraint covering the columns `[courseId,semesterId,batchId]` on the table `course_offerings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "course_offerings_courseId_semesterId_batchId_key" ON "course_offerings"("courseId", "semesterId", "batchId");
