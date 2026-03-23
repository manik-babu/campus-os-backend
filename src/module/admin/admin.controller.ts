import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import status from "http-status";
import sendResponse from "../../utils/sendResponse";

const createBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminService.createBatch(req.body);
        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Batch created successfully",
            data: result,
        })
    } catch (error: any) {
        next(error);
    }
}

export const adminController = {
    createBatch,
};