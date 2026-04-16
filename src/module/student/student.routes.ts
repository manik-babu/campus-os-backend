import { Router } from "express";
import { studentController } from "./student.controller";
import validateRequest from "../../middleware/validateRequest";
import { dropEnrollmentZodSchema, enrollSingleCourseZodSchema } from "./student.validation";

const router = Router();
//? Define routes for student-related operations, such as enrolling in courses, viewing bills, and dropping courses.
//? /api/v1/students -> studentRouter

router.post("/enroll", validateRequest(enrollSingleCourseZodSchema), studentController.enrollSingleCourse);
router.get("/bill/:semesterId", studentController.studentBill);
router.delete("/enrollments/drop", validateRequest(dropEnrollmentZodSchema), studentController.dropEnrollment);
router.get("/enrollments", studentController.getEnrolledCourses);
router.get("/results", studentController.getResult);
router.get("/results/statics", studentController.resultStatics);


export const studentRouter = router;