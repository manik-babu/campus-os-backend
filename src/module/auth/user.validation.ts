import status from "http-status";
import * as z from "zod";

/**
 * model User {
    id              Int              @id @default(autoincrement())
    name            String
    image           String?
    email           String           @unique
    password        String
    role            UserRole
    status          UserStatus       @default(ACTIVE)
    gender          UserGender
    studentProfile  StudentProfile?
    facultyProfile  FacultyProfile?
    courseOfferings CourseOffering[]
    adminProfiles   AdminProfile?
    enrollments     Enrollment[]
    bills           Bill[]
    createdAt       DateTime         @default(now())
    updatedAt       DateTime         @updatedAt

    @@map("users")
}

enum UserGender {
    MALE
    FEMALE
    OTHER
}

enum UserRole {
    SUPER_ADMIN
    ADMIN
    STUDENT
    FACULTY
}

enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    TRANSFERRED
    GRADUATED
}

 */

export const admissionFormZodSchema = z.object({
    programId: z.string(),
    departmentId: z.string(),
    name: z.string(),
    image: z.string(),
    email: z.email(),
    fatherName: z.string(),
    motherName: z.string(),
    birthDate: z.string(), // You can further validate this as a date string if needed
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
export const userZodSchema = z.object({
    name: z.string(),
    image: z.string().optional(),
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
    birthDate: z.string(), // You can further validate this as a date string if needed
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
    bloodGroup: z.string().optional(),
    presentAddress: z.string(),
    permanentAddress: z.string(),
    graduations: z.array(z.object({
        degree: z.string(),
        major: z.string(),
        institute: z.string(),
        graduationDate: z.string(), // You can further validate this as a date string if needed
    })).optional(),
});
export const loginZodSchema = z.object({
    idNo: z.string(),
    password: z.string(),
});