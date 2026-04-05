import * as z from "zod";


export const enrollSingleCourseZodSchema = z.object({
    courseOfferingId: z.string("Course offering is required"),
});
export const dropEnrollmentZodSchema = z.object({
    enrollmentId: z.string("Enrollment ID is required"),
});