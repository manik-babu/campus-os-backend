import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";
import * as z from "zod";

interface IZodError {
    path: string,
    message: string
}

const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
        console.log("Global Error Handler:", err);
    }
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";
    let zodErrors: IZodError[] = [];

    if (err instanceof z.ZodError) {
        statusCode = status.BAD_REQUEST;
        message = "Validation Error";
        zodErrors = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
        }));

    } else if (err instanceof Error) {
        message = err.message;
    }
    res.status(statusCode).json({
        ok: false,
        status: statusCode,
        message: message,
        error: JSON.stringify(err),
        zodErrors: zodErrors
    });
};

export default globalErrorHandler;