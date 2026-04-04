import { prisma } from "../../lib/prisma";


const getSemesters = async () => {
    const semesters = await prisma.semester.findMany();
    return semesters;
}
export const commonService = {
    getSemesters,
}