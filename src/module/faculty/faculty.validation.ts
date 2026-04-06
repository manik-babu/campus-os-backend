import * as z from "zod";

export const AttendanceRecordZodSchema = z.array(z.object({
    date: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }),
    enrollmentId: z.string().uuid({ message: "Invalid enrollment ID format. Expected a UUID." }),
    isPresent: z.boolean(),
}));
export const studentMarkZodSchema = z.array(z.object({
    enrollmentId: z.string("Enrollment ID is required"),
    mark: z.object({
        classTest1: z.number().refine((val) => val >= 0 && val <= 10, "Class test 1 mark must be between 0 and 10").optional(),
        classTest2: z.number().refine((val) => val >= 0 && val <= 10, "Class test 2 mark must be between 0 and 10").optional(),
        midterm: z.number().refine((val) => val >= 0 && val <= 30, "Midterm mark must be between 0 and 30").optional(),
        final: z.number().refine((val) => val >= 0 && val <= 40, "Final mark must be between 0 and 40").optional(),
        attendance: z.number().refine((val) => val >= 0 && val <= 10, "Attendance mark must be between 0 and 10").optional(),
    })
}));