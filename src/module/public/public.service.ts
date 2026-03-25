import cloudinary from "../../config/cloudinary";
import { prisma } from "../../lib/prisma";
import { IUploadedImage, TAdmissionForm } from "./public.interface";


const createAdmissionForm = async (data: TAdmissionForm, uploadedImage: IUploadedImage, uploadedSscDoc: IUploadedImage, uploadedHscDoc: IUploadedImage) => {
    try {
        const form = await prisma.admissionForm.create({
            data: {
                ...data,
                birthDate: new Date(data.birthDate), // Convert birthDate to Date object before saving to database
                image: {
                    create: {
                        url: uploadedImage.secure_url,
                        publicId: uploadedImage.public_id,
                    }
                },
                sscDoc: {
                    create: {
                        url: uploadedSscDoc.secure_url,
                        publicId: uploadedSscDoc.public_id,
                    }
                },
                hscDoc: {
                    create: {
                        url: uploadedHscDoc.secure_url,
                        publicId: uploadedHscDoc.public_id,
                    }
                }
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