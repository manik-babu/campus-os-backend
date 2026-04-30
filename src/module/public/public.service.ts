import { UserRole } from "../../../generated/prisma/client";
import cloudinary from "../../config/cloudinary";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { IUploadedImage, TAdmissionForm } from "./public.interface";


const createAdmissionForm = async (data: TAdmissionForm, uploadedImage: IUploadedImage, uploadedSscDoc: IUploadedImage, uploadedHscDoc: IUploadedImage) => {
    try {
        const program = await prisma.program.count({
            where: {
                id: data.programId
            }
        });
        if (!program) {
            throw new AppError(404, "Program not found");
        }
        const department = await prisma.department.count({
            where: {
                id: data.departmentId
            }
        });
        if (!department) {
            throw new AppError(404, "Department not found");
        }
        const isExistingForm = await prisma.admissionForm.findFirst({
            where: {
                email: data.email
            }
        });
        if (isExistingForm) {
            throw new AppError(409, "Admission form for this email already exists");
        }
    } catch (error) {
        cloudinary.uploader.destroy(uploadedImage.public_id);
        cloudinary.uploader.destroy(uploadedSscDoc.public_id);
        cloudinary.uploader.destroy(uploadedHscDoc.public_id);
        throw error;
    }
    try {

        const form = await prisma.admissionForm.create({
            data: {
                ...data,
                birthDate: data.birthDate, // Convert birthDate to Date object before saving to database
                image: uploadedImage.secure_url,
                sscDoc: uploadedSscDoc.secure_url,
                hscDoc: uploadedHscDoc.secure_url,
            },
            select: {
                id: true,
                name: true,
                email: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                program: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                isPaidFee: true
            }
        });
        return {
            id: form.id,
            name: form.name,
            email: form.email,
            department: form.department.name,
            program: form.program.name,
            isPaidFee: form.isPaidFee,
            fee: 1000 // Set the admission fee amount here
        };
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
const getDepartments = async (programId: string | null) => {
    const departments = await prisma.department.findMany({
        where: {
            ...(programId && { programId: programId })
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
const getFaculty = async (departmentId: string | null) => {
    const faculty = await prisma.user.findMany({
        where: {
            role: UserRole.FACULTY,
            facultyProfile: {
                ...(departmentId && { departmentId: departmentId })
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