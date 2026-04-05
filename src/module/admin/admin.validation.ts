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
export const EnrollBatchStudentsZodSchema = z.object({
    id: z.string().min(1, "Course offering ID is required"),
    course: z.object({
        credits: z.number().int().positive("Course credits must be a positive integer"),
    }),
    creditFees: z.number().positive("Credit fees must be a positive number"),
    batchId: z.string().min(1, "Batch ID is required"),
    semesterId: z.string().min(1, "Semester ID is required"),
    departmentId: z.string().min(1, "Department ID is required")
});
/**


 */