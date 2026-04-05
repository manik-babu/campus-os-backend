import { Course, CourseOffering } from "../../../generated/prisma/client";
import { LoggedInUser } from "../../@types/loggedInUser";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { EnrolledStudent, IEnrollBatchStudentsPayload, IStudent } from "./admin.interface";

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
        select: {
            id: true,
            course: {
                select: {
                    credits: true,
                    title: true,
                }
            },
            creditFees: true,
            batchId: true,
            semesterId: true,
            departmentId: true,
        }
    });
    return courseOffering;
}
const enrollBatchStudents = async (payload: IEnrollBatchStudentsPayload) => {
    const students = await prisma.user.findMany({
        where: {
            role: "STUDENT",
            studentProfile: {
                batchId: payload.batchId,
                departmentId: payload.departmentId
            }
        },
        select: {
            id: true,
            idNo: true,
            name: true,
        }
    });
    let enrollStudentData: EnrolledStudent[] = await Promise.all(
        students.map(async (student: IStudent) => {
            try {
                const existingEnrollment = await prisma.enrollment.findUnique({
                    where: {
                        studentId_courseOfferingId: {
                            studentId: student.id,
                            courseOfferingId: payload.id,
                        }
                    }
                });
                if (existingEnrollment) {
                    return {
                        idNo: student.idNo,
                        name: student.name,
                        enrolled: true,
                    };
                }
                const enrollment = await prisma.$transaction(async (tx) => {
                    let bill;
                    const existingBill = await tx.bill.findFirst({
                        where: {
                            studentId: student.id,
                            semesterId: payload.semesterId,
                        }
                    });
                    if (existingBill) {
                        bill = existingBill;
                    }
                    else {
                        bill = await tx.bill.create({
                            data: {
                                studentId: student.id,
                                semesterId: payload.semesterId,
                            },
                        });
                    }
                    const enroll = await tx.enrollment.create({
                        data: {
                            studentId: student.id,
                            courseOfferingId: payload.id,
                            result: {
                                create: {},
                            },
                        },
                    });
                    await tx.billItem.create({
                        data: {
                            name: `Tuition fee for ${payload.course.title}`,
                            enrollmentId: enroll.id,
                            totalAmount: parseFloat(payload.creditFees) * payload.course.credits,
                            billId: bill.id,
                        }
                    });
                    return enroll;
                });
                if (enrollment) {
                    return {
                        idNo: student.idNo,
                        name: student.name,
                        enrolled: true,
                    }
                } else {
                    return {
                        idNo: student.idNo,
                        name: student.name,
                        enrolled: false,
                    };
                }
            } catch (error) {
                return {
                    idNo: student.idNo,
                    name: student.name,
                    enrolled: false,
                };
            }
        })
    ).catch((error) => {
        return students.map((student: IStudent) => ({
            idNo: student.idNo,
            name: student.name,
            enrolled: false,
        }));
    });
    return enrollStudentData;
};
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
    enrollBatchStudents,
};