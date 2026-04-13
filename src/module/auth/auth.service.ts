import { AdminProfile, FacultyProfile, StudentProfile, UserRole } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { AdminProfileWithoutId, FacultyProfileWithGraduations, FacultyProfileWithoutId, ILogin, IRegistration, StudentProfileWithoutId } from "./user.interface"
import cloudinary from "../../config/cloudinary";
import AppError from "../../helper/AppError";
import status from "http-status";
const registration = async ({ userData, profileData, uploadedImage }: IRegistration) => {
    if (profileData.departmentId) {
        const department = await prisma.department.count({
            where: {
                id: profileData.departmentId
            }
        });
        if (!department) {
            await cloudinary.uploader.destroy(uploadedImage.public_id); // Delete the uploaded image from Cloudinary
            throw new AppError(404, "Department not found");
        }
    }
    if ((profileData as StudentProfileWithoutId).programId) {
        const program = await prisma.program.count({
            where: {
                id: (profileData as StudentProfileWithoutId).programId
            }
        });
        if (!program) {
            await cloudinary.uploader.destroy(uploadedImage.public_id); // Delete the uploaded image from Cloudinary
            throw new AppError(404, "Program not found");
        }
    }
    if ((profileData as StudentProfileWithoutId).batchId) {
        const batch = await prisma.batch.count({
            where: {
                id: (profileData as StudentProfileWithoutId).batchId
            }
        });
        if (!batch) {
            await cloudinary.uploader.destroy(uploadedImage.public_id); // Delete the uploaded image from Cloudinary
            throw new AppError(404, "Batch not found");
        }
    }
    const lastUser = await prisma.user.findFirst({
        orderBy: {
            createdAt: "desc"
        },
        select: {
            idNo: true,
            registrationNo: true
        }
    });
    let idAndRegNo: { idNo: string, registrationNo: string } = {
        idNo: "100000", // Starting ID card number
        registrationNo: "REG100000" // Starting registration number for students
    }
    if (lastUser) {
        idAndRegNo.idNo = (parseInt(lastUser.idNo) + 1).toString();
        idAndRegNo.registrationNo = `REG${parseInt(lastUser.idNo) + 1}`;
    }
    const createdUser = await prisma.user.create({
        data: {
            ...userData,
            ...idAndRegNo,
            image: uploadedImage.secure_url
        },
    })
    // After creating the user, we need to create the corresponding profile based on the role
    try {
        let profile: StudentProfile | AdminProfile | FacultyProfile | null = null;
        if (createdUser.role === UserRole.STUDENT) {
            profile = await prisma.studentProfile.create({
                data: {
                    userId: createdUser.id,
                    ...profileData as StudentProfileWithoutId,
                    birthDate: new Date((profileData as StudentProfileWithoutId).birthDate), // Convert birthDate to Date object
                }
            })
        } else if (createdUser.role === UserRole.ADMIN) {
            profile = await prisma.adminProfile.create({
                data: {
                    ...profileData as AdminProfileWithoutId,
                    userId: createdUser.id,
                }
            })
        }
        else if (createdUser.role === UserRole.FACULTY) {
            const facultyProfile = profileData as FacultyProfileWithGraduations;
            profile = await prisma.facultyProfile.create({
                data: {
                    userId: createdUser.id,
                    designation: facultyProfile.designation,
                    departmentId: facultyProfile.departmentId,
                    phoneNumber: facultyProfile.phoneNumber,
                    salary: facultyProfile.salary,
                    presentAddress: facultyProfile.presentAddress,
                    permanentAddress: facultyProfile.permanentAddress,
                    graduations: {
                        create: (facultyProfile).graduations?.map((graduation) => ({
                            degree: graduation.degree,
                            institute: graduation.institute,
                            major: graduation.major,
                            passingYear: graduation.passingYear,
                        })) || []
                    }
                }
            });
        }

        return { user: createdUser, profile };
    } catch (error) {
        // If profile creation fails, delete the created user to maintain data integrity
        await prisma.user.delete({
            where: { id: createdUser.id },
        });
        cloudinary.uploader.destroy(uploadedImage.public_id); // Delete the uploaded image from Cloudinary
        throw error; // Re-throw the error after cleanup
    }
}
const login = async (payload: ILogin) => {

    const user = await prisma.user.findFirst({
        where: {
            idNo: payload.idNo,
        },
        include: {
            studentProfile: {
                select: {
                    departmentId: true,
                }
            },
            facultyProfile: {
                select: {
                    departmentId: true,
                }
            },
            adminProfile: {
                select: {
                    departmentId: true,
                }
            },
        }
    });
    if (!user) {
        throw new AppError(status.BAD_REQUEST, "Id or password is incorrect");
    }
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(status.BAD_REQUEST, "Id or password is incorrect");
    }

    return user;
}
export const authService = {
    registration,
    login
}
