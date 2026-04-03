import { Batch, Course } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createBatch = async (payload: Omit<Batch, "id" | "createdAt" | "updatedAt">) => {
    const batch = await prisma.batch.create({
        data: payload,
    });
    return batch;
}
const createCourse = async (payload: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    const course = await prisma.course.create({
        data: payload,
    });
    return course;
}
export const adminService = {
    createBatch,
    createCourse,
};