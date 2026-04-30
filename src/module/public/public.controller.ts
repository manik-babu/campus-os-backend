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
        const uploadedImage = await uploadToCloudinary({
            file: images.image as Express.Multer.File,
            folder: `${env.CLOUDINARY_FOLDER}/admission_forms/profile_images`,
            resource_type: "image"
        });
        const uploadedSscDoc = await uploadToCloudinary({
            file: images.sscDoc as Express.Multer.File,
            folder: `${env.CLOUDINARY_FOLDER}/admission_forms/ssc_docs`,
            resource_type: "image"
        });
        const uploadedHscDoc = await uploadToCloudinary({
            file: images.hscDoc as Express.Multer.File,
            folder: `${env.CLOUDINARY_FOLDER}/admission_forms/hsc_docs`,
            resource_type: "image"
        });

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
    const programId = (req.query.programId || null) as string | null;
    const result = await publicService.getDepartments(programId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Departments retrieved successfully",
        data: result
    })
})
const getFaculty = catchAsync(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | null;
    const short = req.query.short === "true";
    console.log({
        departmentId,
        short
    })
    const result = await publicService.getFaculty(departmentId);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Faculty retrieved successfully",
        data: short ? result.map(faculty => ({ id: faculty.id, name: faculty.name, idNo: faculty.idNo })) : result
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