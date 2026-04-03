import { Router } from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseZodSchema, createBatchZodSchema } from "./admin.validation";
//? This file will contain all the routes related to admin (create student, create faculty, etc.)
//? /admin -> adminRouter
const router = Router();
router.post("/create-batch", validateRequest(createBatchZodSchema), adminController.createBatch);
router.post("/create-course", validateRequest(CourseZodSchema), adminController.createCourse);
export const adminRouter = router;