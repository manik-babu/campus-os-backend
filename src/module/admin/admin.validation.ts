import * as z from "zod";

export const createBatchZodSchema = z.object({
    departmentId: z.string().min(1, "Department ID is required"),
    description: z.string().optional(),
});

export const CourseZodSchema = z.object({
    code: z.string().min(1, "Course code is required"),
    title: z.string().min(1, "Course title is required"),
    description: z.string().optional(),
    credits: z.number().int().positive("Credits must be a positive integer"),
    departmentId: z.string().min(1, "Department ID is required"),
})
export const CourseOfferingZodSchema = z.object({
    courseId: z.string().min(1, "Course ID is required"),
    semesterId: z.string().min(1, "Semester ID is required"),
    batchId: z.string().min(1, "Batch ID is required"),
    facultyId: z.string().min(1, "Faculty ID is required"),
    creditFees: z.number().positive("Credit fees must be a positive number"),
    departmentId: z.string().min(1, "Department ID is required"),
})
/**
model CourseOffering {
    id           String       @id @default(uuid())
    courseId     String
    course       Course       @relation(fields: [courseId], references: [id])
    semesterId   String
    semester     Semester     @relation(fields: [semesterId], references: [id])
    batchId      String
    batch        Batch        @relation(fields: [batchId], references: [id])
    facultyId    String
    faculty      User         @relation(fields: [facultyId], references: [id])
    creditFees   Decimal      @db.Decimal(10, 2)
    departmentId String
    department   Department   @relation(fields: [departmentId], references: [id])
    enrollments  Enrollment[]
    createdAt    DateTime     @default(now())
    updatedAt    DateTime     @updatedAt

    @@map("course_offerings")
}


 */