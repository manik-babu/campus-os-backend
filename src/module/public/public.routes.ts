

import { Router } from "express";
import { publicController } from "./public.controller";
import { upload } from "../../config/cloudinary";

//? This router will contain all the routes that are accessible without authentication (like login, registration, etc.)
//? /api/v1/public/ -> publicRouter
const router = Router();
router.post("/admission-form", upload.fields([{ name: "image", maxCount: 1 }, { name: "sscDoc", maxCount: 1 }, { name: "hscDoc", maxCount: 1 }]), publicController.createAdmissionForm);
router.get("/programs", publicController.getPrograms);
router.get("/departments", publicController.getDepartments);
router.get("/faculty", publicController.getFaculty);
router.get("/courses", publicController.getCourses);
export const publicRouter = router;