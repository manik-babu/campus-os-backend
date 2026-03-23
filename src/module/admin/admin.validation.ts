import * as z from "zod";

export const createBatchZodSchema = z.object({
    batchNo: z.number().nonnegative("Batch number must be a non-negative integer"),
    departmentId: z.string().min(1, "Department ID is required"),
    description: z.string().optional(),
});