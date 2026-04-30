/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `admission_forms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "admission_forms_email_key" ON "admission_forms"("email");
