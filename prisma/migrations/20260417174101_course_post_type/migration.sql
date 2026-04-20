/*
  Warnings:

  - The values [LECTURE,NOTICE] on the enum `MaterialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MaterialType_new" AS ENUM ('MATERIAL', 'ANNOUNCEMENT', 'ASSIGNMENT', 'COMMENT');
ALTER TABLE "course_posts" ALTER COLUMN "type" TYPE "MaterialType_new" USING ("type"::text::"MaterialType_new");
ALTER TYPE "MaterialType" RENAME TO "MaterialType_old";
ALTER TYPE "MaterialType_new" RENAME TO "MaterialType";
DROP TYPE "public"."MaterialType_old";
COMMIT;
