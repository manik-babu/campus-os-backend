import { Router } from "express";
import { upload } from "../../config/cloudinary";
import { classController } from "./class.controller";


const router = Router();
//? /api/v1/classes -> classRouter
//? This file will contain all the routes related to class management (give lecture sheet, assignments, class notice by faculty, etc.)

router.post("/course-posts", upload.single("attachment"), classController.addCoursePost);
router.get("/course-posts/:classId", classController.getCoursePosts);
router.get("/course-posts/comments/:coursePostId", classController.getComments);
router.delete("/course-posts/:postId", classController.deleteCoursePost);
export const classRouter = router;