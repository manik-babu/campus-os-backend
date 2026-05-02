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
import catchAsync from "../../utils/catchAsync";
import AppError from "../../helper/AppError";
import { sendRegistrationEmail } from "../../helper/registrationEmail";
import { sendResetPasswordEmail } from "../../helper/resetPassword";

const registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { parsedUserData, parsedProfileData } = getParsedData(req.body);

        if (!req.file && parsedUserData.role !== UserRole.STUDENT) {
            throw new Error("Profile image is required");
        }
        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(parsedUserData.password, 10);
        parsedUserData.password = hashedPassword;

        // Upload the image to Cloudinary and get the URL
        let uploadedImage: IUploadedImage | null = null;
        if (parsedUserData.role !== UserRole.STUDENT) {
            uploadedImage = await uploadToCloudinary({
                file: req.file as Express.Multer.File,
                folder: `${env.CLOUDINARY_FOLDER}/profile-images`,
                resource_type: "image"
            });
        }

        const result = await authService.registration({ userData: parsedUserData, profileData: parsedProfileData, uploadedImage });
        await sendRegistrationEmail({
            name: result.name,
            email: result.email,
            role: result.role,
            idNo: result.idNo,
            registrationNo: result.registrationNo,
        });
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
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set secure flag in production
            sameSite: "lax", // Adjust sameSite attribute as needed
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })

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
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "You must be logged in to change your password");
    }
    const userPass = await authService.getUserPass(user.id);
    const isMatch = await bcrypt.compare(oldPassword, userPass as string);
    if (!isMatch) {
        throw new AppError(status.BAD_REQUEST, "Old password is incorrect");
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await authService.changePassword(user.id, hashedNewPassword);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Password changed successfully",
        data: true,
    });
});
const sendResentPasswordEmail = catchAsync(async (req: Request, res: Response,) => {
    const { email } = req.body;

    const isUserExist = await authService.isUserExist(email);
    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User with this email does not exist");
    }
    // Generate a random password
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    await sendResetPasswordEmail({
        otp,
        name: isUserExist.name,
        email: isUserExist.email,
    });
    const hashedOtp = await bcrypt.hash(otp, 10);
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Password reset email sent successfully",
        data: {
            hashedOtp,
            email
        },
    })
});
const resetPassword = catchAsync(async (req: Request, res: Response,) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        throw new AppError(status.BAD_REQUEST, "Email and new password are required");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await authService.resetPassword(email, hashedPassword);

    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Password reset successfully",
        data: result
    })
})



export const authController = {
    registration,
    login,
    changePassword,
    resetPassword,
    sendResentPasswordEmail
}