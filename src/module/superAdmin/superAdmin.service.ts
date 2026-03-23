import { Department, Program, Semester } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createProgram = async (payload: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => {
    const createdProgram = await prisma.program.create({
        data: payload,
    })
    return createdProgram;
}
const createDepartment = async (payload: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    const createdDepartment = await prisma.department.create({
        data: payload,
    })
    return createdDepartment;
}
const createSemester = async (payload: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>) => {
    const createdSemester = await prisma.semester.create({
        data: payload
    })
    return createdSemester;
}

export const superAdminService = {
    createProgram,
    createDepartment,
    createSemester,
}