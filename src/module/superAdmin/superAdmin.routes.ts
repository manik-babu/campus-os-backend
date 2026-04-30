import { Router } from "express";
import { superAdminController } from "./superAdmin.controller";
import validateRequest from "../../middleware/validateRequest";
import { departmentZodSchema, programZodSchema, semesterZodSchema } from "./superAdmin.validation";

//? This file will contain all the routes related to super admin (create admin, delete admin, etc.)
//? /api/v1/super-admin -> superAdminRouter
const router = Router();
router.post("/create-program", validateRequest(programZodSchema), superAdminController.createProgram);
router.post("/create-department", validateRequest(departmentZodSchema), superAdminController.createDepartment);
router.post("/create-semester", validateRequest(semesterZodSchema), superAdminController.createSemester);
router.get("/dashboard-data", superAdminController.getDashboardData);

export const superAdminRouter = router;