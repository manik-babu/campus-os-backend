import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../helper/AppError";
import { LoggedInUser } from "../../@types/loggedInUser";

const createBatch = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const admin = req.user as LoggedInUser;
    const result = await adminService.createBatch(admin, data);
    sendResponse(res, {
        statusCode: status.CREATED,
        ok: true,
        message: "Batch created successfully",
        data: result,
    })
})
const createCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.createCourse(req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        ok: true,
        message: "Course created successfully",
        data: result,
    })
});
const getBatches = catchAsync(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId;
    if (!departmentId) {
        throw new AppError(400, "You must provide a departmentId");
    }

    const result = await adminService.getBatches(departmentId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Batches retrieved successfully",
        data: result,
    });
});
const createCourseOffering = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.createCourseOffering(req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        ok: true,
        message: "Course offering created successfully",
        data: result,
    })
});
const enrollBatchStudents = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.enrollBatchStudents(req.body);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Students enrolled successfully",
        data: result,
    })
});

const getAdmissionForms = catchAsync(async (req: Request, res: Response) => {
    const admin = req.user as LoggedInUser;
    const result = await adminService.getAdmissionForms(admin);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Admission forms retrieved successfully",
        data: result,
    })
})
export const adminController = {
    createBatch,
    createCourse,
    getBatches,
    createCourseOffering,
    getAdmissionForms,
    enrollBatchStudents,
};