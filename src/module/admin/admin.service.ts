import { Batch, Course, CourseOffering, UserRole } from "../../../generated/prisma/client";
import { LoggedInUser } from "../../@types/loggedInUser";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";

const createBatch = async (admin: LoggedInUser, data: { departmentId: string; description?: string }) => {
    const adminInfo = await prisma.user.findUnique({
        where: {
            id: admin.id,
        },
        select: {
            adminProfile: true,
        },
    });
    if (adminInfo && adminInfo.adminProfile?.departmentId !== data.departmentId) {
        throw new AppError(403, "You are not authorized to create a batch for this department");
    }
    const lastBatch = await prisma.batch.findFirst({
        where: {
            departmentId: data.departmentId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const batchNo = lastBatch ? lastBatch.batchNo + 1 : 1;

    const batch = await prisma.batch.create({
        data: {
            ...data,
            batchNo: batchNo,
        },
    });
    return batch;
}
const getBatches = async (departmentId: string) => {
    const batches = await prisma.batch.findMany({
        where: {
            departmentId: departmentId
        }
    });
    return batches;
}
const createCourse = async (payload: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    const course = await prisma.course.create({
        data: payload,
    });
    return course;
}

const createCourseOffering = async (payload: Omit<CourseOffering, "id" | "createdAt" | "updatedAt">) => {
    const courseOffering = await prisma.courseOffering.create({
        data: payload,
    });
    return courseOffering;
}
const getAdmissionForms = async (admin: LoggedInUser) => {
    const adminInfo = await prisma.user.findUnique({
        where: {
            id: admin.id,
        },
        select: {
            adminProfile: true,
        },
    });
    if (!adminInfo || !adminInfo.adminProfile) {
        throw new AppError(403, "You are not authorized to view admission forms");
    }
    const forms = await prisma.admissionForm.findMany({
        where: {
            departmentId: adminInfo.adminProfile?.departmentId,
        },
    });
    return forms;
}
export const adminService = {
    createBatch,
    createCourse,
    getBatches,
    createCourseOffering,
    getAdmissionForms,
};