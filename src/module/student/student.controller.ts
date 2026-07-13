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
    const semesterId: string = req.params.semesterId as string;
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
const resultStatics = catchAsync(async (req: Request, res: Response,) => {
    const result = await studentService.resultStatics(req.user?.id as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Result statics retrieved successfully",
        data: result,
    });
});
const getAcademicRecords = catchAsync(async (req: Request, res: Response,) => {
    const result = await studentService.getAcademicRecords(req.user?.id as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Academic records retrieved successfully",
        data: result,
    });
});

const updateContact = catchAsync(async (req: Request, res: Response,) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError(status.UNAUTHORIZED, "User ID is required");
    }
    const { email, phone } = req.body;
    if (!email && !phone) {
        throw new AppError(status.BAD_REQUEST, "At least one of email or phone is required");
    }
    const result = await studentService.updateContact(req.user?.id as string, email, phone);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Contact updated successfully",
        data: result,
    });
});
const updateAddress = catchAsync(async (req: Request, res: Response,) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError(status.UNAUTHORIZED, "User ID is required");
    }
    const { presentAddress, permanentAddress } = req.body;
    if (!presentAddress && !permanentAddress) {
        throw new AppError(status.BAD_REQUEST, "At least one of present address or permanent address is required");
    }
    const result = await studentService.updateAddress(req.user?.id as string, presentAddress, permanentAddress);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Address updated successfully",
        data: result,
    });
});

export const studentController = {
    enrollSingleCourse,
    studentBill,
    dropEnrollment,
    getEnrolledCourses,
    getResult,
    resultStatics,
    getAcademicRecords,
    updateContact,
    updateAddress,
};