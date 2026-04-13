import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import status from "http-status";
import sendResponse from "../utils/sendResponse";

export const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return sendResponse(res, {
                    statusCode: status.UNAUTHORIZED,
                    ok: false,
                    message: "Unauthorized: No token provided",
                    data: null
                })
            }
            const decodedToken = jwt.verify(token, env.JWT_SECRET as string);
            if (decodedToken && typeof decodedToken === "object" && "role" in decodedToken) {
                const userRole = decodedToken.role as UserRole;
                if (!roles.includes(userRole)) {
                    return sendResponse(res, {
                        statusCode: status.FORBIDDEN,
                        ok: false,
                        message: "Forbidden: Insufficient permissions",
                        data: null
                    })
                }
            } else {
                return sendResponse(res, {
                    statusCode: status.UNAUTHORIZED,
                    ok: false,
                    message: "Unauthorized: Invalid token",
                    data: null
                });
            }
            req.user = decodedToken as any;
            // Verify token and check roles here
            next();
        } catch (error) {
            console.error("Authorization error:", error);
            next(error);
        }
    };
}