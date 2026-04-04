import { UserRole } from "../../../generated/prisma/client";
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
const getPrograms = async () => {
    const programs = await prisma.program.findMany({
        select: {
            id: true,
            name: true,
            shortName: true,
            level: true,
            description: true
        }
    });
    return programs;
}
const getDepartments = async (programId: string) => {
    const departments = await prisma.department.findMany({
        where: {
            programId: programId
        },
        select: {
            id: true,
            name: true,
            shortName: true,
            description: true
        }
    });
    return departments;
}
const getFaculty = async (departmentId: string) => {
    const faculty = await prisma.user.findMany({
        where: {
            role: UserRole.FACULTY,
            facultyProfile: {
                departmentId: departmentId
            }
        },
        include: {
            facultyProfile: true
        }
    });
    return faculty;
}
const getCourses = async (departmentId: string) => {
    const courses = await prisma.course.findMany({
        where: {
            departmentId: departmentId
        }
    });
    return courses;

}
export const publicService = {
    createAdmissionForm,
    getPrograms,
    getDepartments,
    getFaculty,
    getCourses,
}   