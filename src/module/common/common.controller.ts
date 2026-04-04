import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commonService } from "./common.service";
import { Request, Response } from "express";


const getSemesters = catchAsync(async (req: Request, res: Response) => {
    const result = await commonService.getSemesters();
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Semesters retrieved successfully",
        data: result,
    });
});

export const commonController = {
    getSemesters,
};