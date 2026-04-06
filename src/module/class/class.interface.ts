import { MaterialType } from "../../../generated/prisma/enums";
import { coursePostZodSchema } from "./class.validation";
import * as z from "zod";
export type CoursePostInput = z.infer<typeof coursePostZodSchema> & {
    authorId: string;
};
export interface IGetCoursePosts {
    type: MaterialType | "ALL";
    search: string;
    limit: number;
    page: number;
    orderBy: "asc" | "desc";
}