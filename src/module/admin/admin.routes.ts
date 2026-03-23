import { Router } from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { createBatchZodSchema } from "./admin.validation";
//? This file will contain all the routes related to admin (create student, create faculty, etc.)
//? /admin -> adminRouter
const router = Router();
router.post("/create-batch", validateRequest(createBatchZodSchema), adminController.createBatch);
export const adminRouter = router;