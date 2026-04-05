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
const getCourseOfferings = catchAsync(async (req: Request, res: Response) => {
    const result = await commonService.getCourseOfferings(req.query);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Course offerings retrieved successfully",
        data: result,
    });
});

export const commonController = {
    getSemesters,
    getCourseOfferings,
};