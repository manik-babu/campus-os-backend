import * as z from "zod";
import { studentMarkZodSchema } from "./faculty.validation";

export type IStudentMark = z.infer<typeof studentMarkZodSchema>;
export interface IAttendanceRecord {
    date: string;
    enrollmentId: string;
    isPresent: boolean;
}