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

const getDashboardData = async () => {
    const totalPrograms = await prisma.program.count();
    const totalDepartments = await prisma.department.count();
    const totalStudents = await prisma.user.count({
        where: {
            role: 'STUDENT'
        }
    });
    const totalFaculties = await prisma.user.count({
        where: {
            role: 'FACULTY'
        }
    });
    const totalAdmins = await prisma.user.count({
        where: {
            role: 'ADMIN'
        }
    });
    const studentByDepartment = await prisma.department.findMany({
        select: {
            _count: {
                select: {
                    studentProfiles: true,
                }
            },
            name: true,
            program: {
                select: {
                    shortName: true,
                }
            }
        }
    });
    const formattedDepartments = studentByDepartment.map(dept => ({
        name: dept.name + " (" + dept.program.shortName + ")",
        studentCount: dept._count.studentProfiles,
    }));

    return {
        total: {
            totalPrograms,
            totalDepartments,
            totalStudents,
            totalFaculties,
            totalAdmins,
        },
        departments: formattedDepartments
    }
}

export const superAdminService = {
    createProgram,
    createDepartment,
    createSemester,
    getDashboardData,
}