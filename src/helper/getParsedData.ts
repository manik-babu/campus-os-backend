import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { adminProfileZodSchema, studentProfileZodSchema, userZodSchema } from "../module/auth/user.validation";
import * as z from "zod";
export const getParsedData = (requestData: any) => {
    const userData = JSON.parse(requestData.userData);
    const profileData = JSON.parse(requestData.profileData);
    const { error: userError, data } = userZodSchema.safeParse(userData);
    if (userError) {
        throw userError;
    }
    const parsedUserData = {
        ...data,
        status: data.status || UserStatus.ACTIVE // Default status for students is ACTIVE, for others it's optional
    };
    let parsedProfileData: any = {};
    if (userData.role === UserRole.ADMIN) {
        const { error, data } = adminProfileZodSchema.safeParse(profileData);
        if (error) {
            throw error;
        }
        parsedProfileData = data;
    } else if (userData.role === UserRole.STUDENT) {
        const { error, data } = studentProfileZodSchema.safeParse(profileData);
        if (error) {
            throw error;
        }
        parsedProfileData = data;
    } else if (userData.role === UserRole.FACULTY) {
        // For faculty, we need to validate both the faculty profile and the graduations
        const { success, error } = adminProfileZodSchema.safeParse(profileData);
        if (!success) {
            throw error;
        }
        parsedProfileData = data;

        // Validate graduations if provided
        if (profileData.graduations) {
            const graduationsValidation = z.array(adminProfileZodSchema).safeParse(profileData.graduations);
            if (!graduationsValidation.success) {
                throw graduationsValidation.error;
            }
            parsedProfileData.graduations = graduationsValidation.data;
        }
    }
    return { parsedUserData, parsedProfileData };

}