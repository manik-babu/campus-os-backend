import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { getParsedData } from "../../helper/getParsedData";
import { uploadToCloudinary } from "../../config/cloudinary";
import { IUploadedImage } from "./user.interface";
import { UserRole } from "../../../generated/prisma/enums";

const registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new Error("Profile image is required");
        }
        const { parsedUserData, parsedProfileData } = getParsedData(req.body);
        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(parsedUserData.password, 10);
        parsedUserData.password = hashedPassword;

        // Upload the image to Cloudinary and get the URL
        const uploadedImage: IUploadedImage = await uploadToCloudinary({
            file: req.file as Express.Multer.File,
            folder: `${env.CLOUDINARY_FOLDER}/profile-images`,
            resource_type: "image"
        });

        const result = await authService.registration({ userData: parsedUserData, profileData: parsedProfileData, uploadedImage });
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
        const role = result.role;
        const departmentId = () => {
            if (role === UserRole.ADMIN) return result.adminProfile?.departmentId;
            if (role === UserRole.FACULTY) return result.facultyProfile?.departmentId;
            if (role === UserRole.STUDENT) return result.studentProfile?.departmentId;
            return null;
        }
        const data = {
            id: result.id,
            name: result.name,
            role: result.role,
            email: result.email,
            idNo: result.idNo,
            registrationNo: result.registrationNo,
            status: result.status,
            departmentId: departmentId()
        }
        const token = jwt.sign(
            data,
            env.JWT_SECRET as string,
            {
                expiresIn: "30d"
            }
        );
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production", // Set secure flag in production
        //     sameSite: "lax", // Adjust sameSite attribute as needed
        //     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        // })

        sendResponse(res, {
            statusCode: status.OK,
            ok: true,
            message: "Login successful",
            data: {
                token,
                user: data
            },
        })
    } catch (error: any) {
        next(error);
    }
}
export const authController = {
    registration,
    login
}