import { NextFunction, Request, Response } from "express";
import { superAdminService } from "./superAdmin.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";

const createProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await superAdminService.createProgram(req.body)
        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Program created successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}
const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await superAdminService.createDepartment(req.body)
        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Department created successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}
const createSemester = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        data.classStart = new Date(data.classStart);
        data.classEnd = new Date(data.classEnd);
        const result = await superAdminService.createSemester(data)
        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Semester created successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}

export const superAdminController = {
    createProgram,
    createDepartment,
    createSemester,

}