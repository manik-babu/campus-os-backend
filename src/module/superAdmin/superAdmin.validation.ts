import * as z from "zod";
export const programZodSchema = z.object({
    name: z.string("Program name is required"),
    shortName: z.string("Short name is required"),
    level: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "PHD"], "Program level is required"),
    description: z.string().optional(),
});

export const departmentZodSchema = z.object({
    programId: z.string("Program ID is required"),
    name: z.string("Name is required").min(2).max(100),
    shortName: z.string("Short name is required").min(2).max(20),
    description: z.string("Description is required").optional(),
});

export const semesterZodSchema = z.object({
    name: z.string("Semester name is required"),
    classStart: z.string("Class start date is required"),
    classEnd: z.string("Class end date is required"),
    description: z.string().optional(),
});

