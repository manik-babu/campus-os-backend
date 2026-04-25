import { Router } from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseOfferingZodSchema, CourseZodSchema, createBatchZodSchema } from "./admin.validation";


//? This file will contain all the routes related to admin (create student, create faculty, etc.)
//? /api/v1/admin -> adminRouter
const router = Router();
router.post("/create-batch", validateRequest(createBatchZodSchema), adminController.createBatch);
router.post("/create-course", validateRequest(CourseZodSchema), adminController.createCourse);
router.post("/create-course-offering", validateRequest(CourseOfferingZodSchema), adminController.createCourseOffering);
router.get("/admission-forms", adminController.getAdmissionForms);
router.post("/enroll-batch-students", adminController.enrollBatchStudents);
router.get("/admission-forms/:formId", adminController.getFormDetails);
router.patch("/admission-forms/:formId/status", adminController.updateFormStatus);
router.get("/dashboard", adminController.getAdminDashboardData);
export const adminRouter = router;