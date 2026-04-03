import cloudinary from "../../config/cloudinary";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { IUploadedImage, TAdmissionForm } from "./public.interface";


const createAdmissionForm = async (data: TAdmissionForm, uploadedImage: IUploadedImage, uploadedSscDoc: IUploadedImage, uploadedHscDoc: IUploadedImage) => {
    const program = await prisma.program.count({
        where: {
            id: data.programId
        }
    });
    if (!program) {
        cloudinary.uploader.destroy(uploadedImage.public_id);
        cloudinary.uploader.destroy(uploadedSscDoc.public_id);
        cloudinary.uploader.destroy(uploadedHscDoc.public_id);
        throw new AppError(404, "Program not found");
    }
    const department = await prisma.department.count({
        where: {
            id: data.departmentId
        }
    });
    if (!department) {
        cloudinary.uploader.destroy(uploadedImage.public_id);
        cloudinary.uploader.destroy(uploadedSscDoc.public_id);
        cloudinary.uploader.destroy(uploadedHscDoc.public_id);
        throw new AppError(404, "Department not found");
    }

    try {
        const form = await prisma.admissionForm.create({
            data: {
                ...data,
                birthDate: new Date(data.birthDate), // Convert birthDate to Date object before saving to database
                image: uploadedImage.secure_url,
                sscDoc: uploadedSscDoc.secure_url,
                hscDoc: uploadedHscDoc.secure_url,
            }
        });
        return form;
    } catch (error) {
        cloudinary.uploader.destroy(uploadedImage.public_id);
        cloudinary.uploader.destroy(uploadedSscDoc.public_id);
        cloudinary.uploader.destroy(uploadedHscDoc.public_id);
        throw error;
    }
}

export const publicService = {
    createAdmissionForm
}   