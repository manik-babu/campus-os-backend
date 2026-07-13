import * as z from "zod";


export const enrollSingleCourseZodSchema = z.object({
    courseOfferingId: z.string("Course offering is required"),
});
export const dropEnrollmentZodSchema = z.object({
    enrollmentId: z.string("Enrollment ID is required"),
});
export const updateContactSchema = z.object({
    email: z.email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters long").max(15, "Phone number must be at most 15 characters long"),
});