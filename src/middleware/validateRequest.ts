import { NextFunction, Request, Response } from "express";
import * as z from "zod";

const validateRequest = (zodSchema: z.ZodObject | z.ZodArray<z.ZodObject>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = zodSchema.safeParse(req.body);
        if (!result.success) {
            next(result.error); // Pass the error to the error middleware
            return;
        }
        req.body = result.data; // Use the parsed and validated data
        next();
    }
}

export default validateRequest;