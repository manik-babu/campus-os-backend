import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import status from "http-status";
import AppError from "../../helper/AppError";
import sendResponse from "../../utils/sendResponse";
import zodParse from "../../utils/zodParse";
import { coursePostZodSchema } from "./class.validation";
import { uploadToCloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { classService } from "./class.service";
import { CoursePostInput } from "./class.interface";
import { MaterialType } from "../../../generated/prisma/enums";

const addCoursePost = catchAsync(async (req: Request, res: Response,) => {
    const data = JSON.parse(req.body.data);
    const user = req.user;
    if (user?.role !== "FACULTY" && data.type !== MaterialType.COMMENT) {
        throw new AppError(status.FORBIDDEN, "Only faculty members can create course posts");
    }
    const parsedData = zodParse(coursePostZodSchema, data);
    const file = req.file;
    let attachment: string | null = null;
    if (file) {
        attachment = await uploadToCloudinary({
            file: file as Express.Multer.File,
            folder: `${env.CLOUDINARY_FOLDER}/course-posts`,
            resource_type: "raw"
        }).then(result => result.secure_url);
    }
    const result = await classService.addCoursePost({ ...parsedData, authorId: user?.id } as CoursePostInput, attachment);

    sendResponse(res, {
        statusCode: status.CREATED,
        ok: true,
        message: "Course post created successfully",
        data: result
    })
});
const getCoursePosts = catchAsync(async (req: Request, res: Response) => {
    const classId = req.params.classId;
    const search = req.query.search as string || "";
    const type = (req.query.type as string || "ALL").toUpperCase() as MaterialType | "ALL";
    const orderBy = (req.query.orderBy as string || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await classService.getCoursePosts(classId as string, { search, type, orderBy, page, limit });
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Course posts fetched successfully",
        data: result
    })
});
const getComments = catchAsync(async (req: Request, res: Response) => {
    const coursePostId = req.params.coursePostId;
    const orderBy = (req.query.orderBy as string || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await classService.getComments(coursePostId as string, { orderBy, page, limit });
    sendResponse(res, {
        statusCode: status.OK,
        ok: true,
        message: "Comments fetched successfully",
        data: result
    })
});

export const classController = {
    addCoursePost,
    getCoursePosts,
    getComments
}