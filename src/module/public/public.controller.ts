import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import { publicService } from "./public.service";
import { NextFunction, Request, Response } from "express";
import { AdmissionFormZodSchema } from "./public.validation";
import { uploadToCloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../helper/AppError";


const createAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, data } = AdmissionFormZodSchema.safeParse(JSON.parse(req.body.data));
        if (error) {
            throw error;
        }
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const images = {
            image: files?.image?.[0],
            sscDoc: files?.sscDoc?.[0],
            hscDoc: files?.hscDoc?.[0],
        }
        const uploadedImage = await uploadToCloudinary(images.image?.buffer, `${env.CLOUDINARY_FOLDER}/admission_forms/images`);
        const uploadedSscDoc = await uploadToCloudinary(images.sscDoc?.buffer, `${env.CLOUDINARY_FOLDER}/admission_forms/ssc_docs`);
        const uploadedHscDoc = await uploadToCloudinary(images.hscDoc?.buffer, `${env.CLOUDINARY_FOLDER}/admission_forms/hsc_docs`);

        const result = await publicService.createAdmissionForm(data, uploadedImage, uploadedSscDoc, uploadedHscDoc);

        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Admission form created successfully",
            data: result
        })
    } catch (error: any) {
        next(error);
    }
}
const getPrograms = catchAsync(async (req: Request, res: Response) => {
    const result = await publicService.getPrograms();
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Programs retrieved successfully",
        data: result
    })
})
const getDepartments = catchAsync(async (req: Request, res: Response) => {
    const programId = req.query.programId;
    if (!programId) {
        throw new AppError(400, "You must provide a programId");
    }
    const result = await publicService.getDepartments(programId as string);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Departments retrieved successfully",
        data: result
    })
})
const getFaculty = catchAsync(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | "";
    const result = await publicService.getFaculty(departmentId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Faculty retrieved successfully",
        data: result,
    })
})
const getCourses = catchAsync(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string;
    if (!departmentId) {
        throw new AppError(400, "You must provide a departmentId");
    }
    const result = await publicService.getCourses(departmentId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Courses retrieved successfully",
        data: result,
    });
});
export const publicController = {
    createAdmissionForm,
    getPrograms,
    getDepartments,
    getFaculty,
    getCourses,
}