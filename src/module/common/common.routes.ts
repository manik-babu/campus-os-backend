import { Router } from "express";
import { commonController } from "./common.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

//? This file will contain all the routes that are common to both admin and public (if any)
//? /api/v1/common -> commonRouter
const router = Router();

router.get("/semesters", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), commonController.getSemesters);
router.get("/course-offerings", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT, UserRole.FACULTY), commonController.getCourseOfferings);
export const commonRouter = router;