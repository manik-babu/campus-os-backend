import { Router } from "express";
import { facultyController } from "./faculty.controller";
import validateRequest from "../../middleware/validateRequest";
import { AttendanceRecordZodSchema, studentMarkZodSchema } from "./faculty.validation";


const router = Router();
//? Define routes for faculty-related operations, such as creating courses, managing course offerings, and viewing enrolled students.
//? /api/v1/faculty -> facultyRouter

router.get("/classes/:semesterId", facultyController.getClasses);
router.get("/students/:classId", facultyController.enrolledStudents);
router.post("/students/attendance", validateRequest(AttendanceRecordZodSchema), facultyController.takeAttendance);
router.post("/students/marks", validateRequest(studentMarkZodSchema), facultyController.updateStudentMark);
router.get("/students/attendance/:classId", facultyController.getAttendanceRecords);

export const facultyRouter = router;