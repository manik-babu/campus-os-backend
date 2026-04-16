import { Request, Response } from "express";
import { LoggedInUser } from "../../@types/loggedInUser";
import catchAsync from "../../utils/catchAsync";
import { studentService } from "./student.service";
import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../helper/AppError";


const enrollSingleCourse = catchAsync(async (req: Request, res: Response,) => {
    const result = await studentService.enrollSingleCourse(req.body.courseOfferingId, req.user as LoggedInUser);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Course enrollment successful",
        data: result,
    });
});
const studentBill = catchAsync(async (req: Request, res: Response,) => {
    const semesterId = req.params.semesterId;
    if (!semesterId) {
        throw new AppError(status.BAD_REQUEST, "Semester ID is required");
    }
    const result = await studentService.studentBill(req.user?.id as string, semesterId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Student bill retrieved successfully",
        data: result,
    });
});
const dropEnrollment = catchAsync(async (req: Request, res: Response,) => {
    const result = await studentService.dropEnrollment(req.body.enrollmentId, req.user as LoggedInUser);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Dropped the course successfully",
        data: result,
    });
});
const getEnrolledCourses = catchAsync(async (req: Request, res: Response,) => {
    const semesterId: string | null = req.query.semesterId as string || null;
    const enrollments = await studentService.getEnrolledCourses(req.user?.id as string, semesterId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Enrolled courses retrieved successfully",
        data: enrollments,
    });
});
const getResult = catchAsync(async (req: Request, res: Response,) => {
    const semesterId = req.query.semesterId;
    if (!semesterId) {
        throw new AppError(status.BAD_REQUEST, "Semester ID is required");
    }
    const results = await studentService.getResult(req.user?.id as string, semesterId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Results retrieved successfully",
        data: results,
    });
});


export const studentController = {
    enrollSingleCourse,
    studentBill,
    dropEnrollment,
    getEnrolledCourses,
    getResult,
};