import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { facultyService } from "./faculty.service";
import AppError from "../../helper/AppError";
import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import { IAttendanceRecord, IStudentMark } from "./faculty.interface";


const getClasses = catchAsync(async (req: Request, res: Response,) => {
    const semesterId = req.params.semesterId;
    if (!semesterId) {
        throw new AppError(status.NOT_FOUND, "Semester ID is required");
    }
    const result = await facultyService.getClasses(req.user?.id as string, semesterId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Classes retrieved successfully",
        data: result,
    });
});
const enrolledStudents = catchAsync(async (req: Request, res: Response,) => {
    const classId = req.params.classId;
    if (!classId) {
        throw new AppError(status.NOT_FOUND, "Class ID is required");
    }
    const result = await facultyService.enrolledStudents(classId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Enrolled students retrieved successfully",
        data: result,
    });
});
const takeAttendance = catchAsync(async (req: Request, res: Response,) => {
    const attendanceRecord = req.body as IAttendanceRecord[];
    if (!attendanceRecord || attendanceRecord.length === 0) {
        throw new AppError(status.BAD_REQUEST, "Attendance records are required");
    }
    console.log({
        attendanceRecord
    })
    const result = await facultyService.takeAttendance(attendanceRecord);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Attendance recorded successfully",
        data: result,
    });
});
const updateStudentMark = catchAsync(async (req: Request, res: Response,) => {
    const result = await facultyService.updateStudentMark(req.body as IStudentMark);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Student mark updated successfully",
        data: result,
    });
});

export const facultyController = {
    getClasses,
    enrolledStudents,
    takeAttendance,
    updateStudentMark,

}