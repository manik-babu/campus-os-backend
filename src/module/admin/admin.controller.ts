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
    const search = req.query.search as string || "";
    const sortBy = (req.query.sortBy as string || "desc") as "asc" | "desc";
    const limit = 10; // Default limit
    const page = parseInt(req.query.page as string) || 1;
    const filterQuery = {
        search,
        sortBy,
        limit,
        page
    };
    const result = await adminService.getAdmissionForms(admin, filterQuery);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Admission forms retrieved successfully",
        data: result,
    })
});
const getFormDetails = catchAsync(async (req: Request, res: Response) => {
    const formId = req.params.formId as string;
    const admin = req.user as LoggedInUser;
    if (!formId) {
        throw new AppError(status.BAD_REQUEST, "Form ID is required");
    }
    const result = await adminService.getFormDetails(formId, admin);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Admission form details retrieved successfully",
        data: result,
    })
});
const updateFormStatus = catchAsync(async (req: Request, res: Response) => {
    const formId = req.params.formId as string;
    const { status } = req.body;
    const admin = req.user as LoggedInUser;
    if (!formId) {
        throw new AppError(status.BAD_REQUEST, "Form ID is required");
    }
    if (!status) {
        throw new AppError(status.BAD_REQUEST, "Status is required");
    }
    const result = await adminService.updateFormStatus(formId, status);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Admission form status updated successfully",
        data: result,
    })
});

const getAdminDashboardData = catchAsync(async (req: Request, res: Response) => {
    const admin = req.user as LoggedInUser;
    const result = await adminService.getAdminDashboardData(admin);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Admin dashboard data retrieved successfully",
        data: result,
    })
});
export const adminController = {
    createBatch,
    createCourse,
    createCourseOffering,
    updateFormStatus,
    getAdmissionForms,
    enrollBatchStudents,
    getFormDetails,
    getAdminDashboardData,
};