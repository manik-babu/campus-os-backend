import status from "http-status";
import sendResponse from "../../utils/sendResponse";
import { publicService } from "./public.service";
import { NextFunction, Request, Response } from "express";
import { AdmissionFormZodSchema } from "./public.validation";
import { uploadToCloudinary } from "../../config/cloudinary";


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
        const uploadedImage = await uploadToCloudinary(images.image?.buffer, "admission_forms/images");
        const uploadedSscDoc = await uploadToCloudinary(images.sscDoc?.buffer, "admission_forms/ssc_docs");
        const uploadedHscDoc = await uploadToCloudinary(images.hscDoc?.buffer, "admission_forms/hsc_docs");

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

export const publicController = {
    createAdmissionForm
}