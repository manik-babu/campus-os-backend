import { AdminProfile, FacultyProfile, StudentProfile, UserRole } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { AdminProfileWithoutId, FacultyProfileWithGraduations, FacultyProfileWithoutId, ILogin, IRegistration, StudentProfileWithoutId } from "./user.interface"
const registration = async (payload: IRegistration) => {
    const { userData, profileData } = payload;
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
        idAndRegNo.registrationNo = `REG${parseInt(lastUser.idNo + 1).toString()}`;
    }
    const createdUser = await prisma.user.create({
        data: {
            ...userData,
            ...idAndRegNo
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
            profile = await prisma.facultyProfile.create({
                data: {
                    ...profileData as FacultyProfileWithoutId,
                    userId: createdUser.id,

                }
            });
            if (profile === null) {
                throw new Error("Faculty profile creation failed");
            }
            else {
                await Promise.all(
                    (profileData as FacultyProfileWithGraduations).graduations?.map((graduation) =>
                        prisma.graduation.create({
                            data: {
                                ...graduation,
                                facultyProfileId: profile?.id as string,
                            }
                        })
                    ) || []
                ).catch(async (error) => {                    // If graduation creation fails, delete the created faculty profile and user to maintain data integrity
                    await prisma.facultyProfile.delete({
                        where: { id: profile?.id as string },
                    });
                    throw error; // Re-throw the error after cleanup
                });

            }

        }

        return { user: createdUser, profile };
    } catch (error) {
        // If profile creation fails, delete the created user to maintain data integrity
        await prisma.user.delete({
            where: { id: createdUser.id },
        });
        throw error; // Re-throw the error after cleanup
    }
}
const login = async (payload: ILogin) => {

    const user = await prisma.user.findFirst({
        where: {
            idNo: payload.idNo,
        }
    });
    if (!user) {
        throw new Error("Id or password is incorrect");
    }
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new Error("Id or password is incorrect");
    }

    return user;
}
export const authService = {
    registration,
    login
}
