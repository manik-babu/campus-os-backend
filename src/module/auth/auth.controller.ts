import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { adminProfileZodSchema, studentProfileZodSchema, userZodSchema } from "./user.validation";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import bcrypt from "bcryptjs";
import * as z from "zod";
import jwt from "jsonwebtoken";
import { id } from "zod/v4/locales";
import { env } from "../../config/env";

const registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userData, profileData } = req.body;
        const { error: userError, data } = userZodSchema.safeParse(userData);
        if (userError) {
            throw userError;
        }
        const parsedUserData = {
            ...data,
            image: data.image || null, // Set default value for image if not provided
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
        const hashedPassword = await bcrypt.hash(parsedUserData.password, 10);
        parsedUserData.password = hashedPassword;
        const result = await authService.registration({ userData: parsedUserData, profileData: parsedProfileData });
        console.log({ result })
        sendResponse(res, {
            statusCode: status.CREATED,
            ok: true,
            message: "Registration successful",
            data: result,
        })
    } catch (error: any) {
        next(error);
    }
}
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.login(req.body);
        const token = jwt.sign(
            {
                id: result.id,
                name: result.name,
                role: result.role,
                email: result.email,
                idNo: result.idNo,
                registrationNo: result.registrationNo,
                status: result.status
            },
            env.JWT_SECRET as string,
            {
                expiresIn: "30d"
            }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set secure flag in production
            sameSite: "strict", // Adjust sameSite attribute as needed
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })

        sendResponse(res, {
            statusCode: status.OK,
            ok: true,
            message: "Login successful",
            data: result,
        })
    } catch (error: any) {
        next(error);
    }
}
export const authController = {
    registration,
    login
}