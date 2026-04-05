import { prisma } from "../../lib/prisma";
import { IGetCourseOfferings } from "./common.interface";


const getSemesters = async () => {
    const semesters = await prisma.semester.findMany();
    return semesters;
}
const getCourseOfferings = async (payload: IGetCourseOfferings) => {
    const courseOfferings = await prisma.courseOffering.findMany({
        where: {
            ...(payload.facultyId && { facultyId: payload.facultyId }),
            ...(payload.semesterId && { semesterId: payload.semesterId }),
            ...(payload.courseId && { courseId: payload.courseId }),
            ...(payload.batchId && { batchId: payload.batchId }),
        }
    });
    return courseOfferings;
}
export const commonService = {
    getSemesters,
    getCourseOfferings,
}