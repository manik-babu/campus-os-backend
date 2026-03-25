

import { Router } from "express";
import { publicController } from "./public.controller";
import validateRequest from "../../middleware/validateRequest";
import { upload } from "../../config/cloudinary";

//? This router will contain all the routes that are accessible without authentication (like login, registration, etc.)
//? /api/v1/public/ -> publicRouter
const router = Router();
router.post("/admission-form", upload.fields([{ name: "image", maxCount: 1 }, { name: "sscDoc", maxCount: 1 }, { name: "hscDoc", maxCount: 1 }]), publicController.createAdmissionForm);

export const publicRouter = router;