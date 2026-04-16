import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { changePasswordZodSchema, loginZodSchema } from "./user.validation";
import { upload } from "../../config/cloudinary";

//? This file will contain all the routes related to authentication (login, register, logout, etc.)
//? /auth -> authRouter
const router = Router();

router.post("/register", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), upload.single("image"), authController.registration);
router.post("/login", validateRequest(loginZodSchema), authController.login);
router.patch("/change-password", auth(UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT, UserRole.SUPER_ADMIN), validateRequest(changePasswordZodSchema), authController.changePassword);
export const authRouter = router;