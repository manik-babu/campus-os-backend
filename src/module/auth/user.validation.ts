import status from "http-status";
import * as z from "zod";

/**
 * Zod schema for validating password change requests
 */
export const changePasswordZodSchema = z.object({
    oldPassword: z.string().min(1, "Please enter your old password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const userZodSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "STUDENT", "FACULTY"]),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TRANSFERRED", "GRADUATED"]).optional(),
});

export const adminProfileZodSchema = z.object({
    departmentId: z.string(),
    phoneNumber: z.string(),
});
export const studentProfileZodSchema = z.object({
    programId: z.string(),
    batchId: z.string(),
    departmentId: z.string(),
    fatherName: z.string(),
    motherName: z.string(),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }), // You can further validate this as a date string if needed
    permanentAddress: z.string(),
    presentAddress: z.string(),
    phoneNumber: z.string(),
    schoolName: z.string(),
    collegeName: z.string(),
    sscGpa: z.number().refine(value => value >= 0 && value <= 5, {
        message: "SSC GPA must be between 0 and 5",
    }),
    hscGpa: z.number().refine(value => value >= 0 && value <= 5, {
        message: "HSC GPA must be between 0 and 5",
    }),
    sscPassingYear: z.number().int().refine(value => value > 1900 && value <= new Date().getFullYear(), {
        message: "SSC Passing Year must be a valid year",
    }),
    hscPassingYear: z.number().int().refine(value => value > 1900 && value <= new Date().getFullYear(), {
        message: "HSC Passing Year must be a valid year",
    }),
    bloodGroup: z.string().optional(),
});
export const facultyProfileZodSchema = z.object({
    departmentId: z.string(),
    designation: z.string(),
    phoneNumber: z.string(),
    salary: z.number().refine(value => value >= 0, {
        message: "Salary must be a positive number",
    }),
    bloodGroup: z.string().nullable(),
    presentAddress: z.string(),
    permanentAddress: z.string(),
    graduations: z.array(z.object({
        degree: z.string(),
        major: z.string(),
        institute: z.string(),
        passingYear: z.number().int().refine(value => value > 1900 && value <= new Date().getFullYear(), {
            message: "Passing Year must be a valid year",
        }),
    })).optional(),
});
export const loginZodSchema = z.object({
    idNo: z.string(),
    password: z.string(),
});