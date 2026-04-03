import * as z from "zod";

export const createBatchZodSchema = z.object({
    batchNo: z.number().nonnegative("Batch number must be a non-negative integer"),
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

/**
 model Course {
    id           String     @id @default(uuid())
    code         String     @unique
    title        String
    description  String?
    credits      Int
    departmentId String
    department   Department @relation(fields: [departmentId], references: [id])

    courseOfferings CourseOffering[]
    createdAt       DateTime         @default(now())
    updatedAt       DateTime         @updatedAt

    @@map("courses")
}

 */