-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('LECTURE', 'ASSIGNMENT', 'NOTICE', 'COMMENT');

-- CreateTable
CREATE TABLE "course_posts" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "message" TEXT,
    "attachment" TEXT,
    "type" "MaterialType" NOT NULL,
    "parentId" TEXT,
    "assignmentDeadLine" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "course_posts" ADD CONSTRAINT "course_posts_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_posts" ADD CONSTRAINT "course_posts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "course_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
