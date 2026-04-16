import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commonService } from "./common.service";
import { Request, Response } from "express";
import AppError from "../../helper/AppError";
import { IStudentAdmitCardData } from "./common.interface";
import { UserRole } from "../../../generated/prisma/enums";
import bcrypt from "bcryptjs";


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
const getUserDetails = catchAsync(async (req: Request, res: Response) => {
    let userId: string | null = req.query.userId as string || null;
    if (!userId) {
        userId = req.user?.id as string;
    }
    const result = await commonService.getUserDetails(userId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "User details retrieved successfully",
        data: result,
    });
});
const getAdmit = catchAsync(async (req: Request, res: Response,) => {
    const studentId = req.query.studentId;
    const semesterId = req.query.semesterId;
    const exam = req.query.exam as "Midterm" | "Final";
    if (!studentId || !semesterId || !exam) {
        throw new AppError(status.BAD_REQUEST, "Student ID, Semester ID and Exam type are required");
    }
    const details = await commonService.getAdmit(studentId as string, semesterId as string, exam);
    const admitCard = await commonService.generateAdmitCard(details as IStudentAdmitCardData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${details.idNo}_${exam}_Admit_Card.pdf`);
    res.send(admitCard);
    // sendResponse(res, {
    //     statusCode: status.OK,
    //     ok: true,
    //     message: "Admit card generated successfully",
    //     data: {
    //         details,
    //     },
    // });
});

const getBatches = catchAsync(async (req: Request, res: Response) => {
    let departmentId = req.query.departmentId as string;
    const user = req.user;
    if (user?.role !== UserRole.SUPER_ADMIN) {
        departmentId = user?.departmentId as string;
    }
    if (!departmentId) {
        throw new AppError(400, "You must provide a departmentId");
    }

    const result = await commonService.getBatches(departmentId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Batches retrieved successfully",
        data: result,
    });
});

export const commonController = {
    getSemesters,
    getCourseOfferings,
    getUserDetails,
    getAdmit,
    getBatches,
};