import { Router } from "express";
import { commonController } from "./common.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

//? This file will contain all the routes that are common to both admin and public (if any)
//? /api/v1/common -> commonRouter
const router = Router();

router.get("/semesters", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT), commonController.getSemesters);
router.get("/course-offerings", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT, UserRole.FACULTY), commonController.getCourseOfferings);
router.get("/course-offering-info/:courseOfferingId", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT, UserRole.FACULTY), commonController.getCourseOfferingInfo);
router.get("/user-details", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT, UserRole.FACULTY), commonController.getUserDetails);
router.get("/admit", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT, UserRole.FACULTY), commonController.getAdmit);

router.get("/batches", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT), commonController.getBatches);
export const commonRouter = router;