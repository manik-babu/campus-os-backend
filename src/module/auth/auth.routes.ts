import { Router } from "express";
import { authController } from "./auth.controller";

//? This file will contain all the routes related to authentication (login, register, logout, etc.)
//? /auth -> authRouter
const router = Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
export const authRouter = router;