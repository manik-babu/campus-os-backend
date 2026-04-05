import { Router } from "express";
import { studentController } from "./student.controller";
import validateRequest from "../../middleware/validateRequest";
import { dropEnrollmentZodSchema, enrollSingleCourseZodSchema } from "./student.validation";
//? Importing the Router class from the Express library to create a new router instance for handling student-related routes.
//? /api/v1/students -> studentRouter

const router = Router();
router.post("/enroll", validateRequest(enrollSingleCourseZodSchema), studentController.enrollSingleCourse);
router.get("/bill", studentController.studentBill);
router.delete("/enrollments/drop", validateRequest(dropEnrollmentZodSchema), studentController.dropEnrollment);
router.get("/enrollments", studentController.getEnrolledCourses);
export const studentRouter = router;