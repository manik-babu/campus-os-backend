-- DropForeignKey
ALTER TABLE "results" DROP CONSTRAINT "results_enrollmentId_fkey";

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
