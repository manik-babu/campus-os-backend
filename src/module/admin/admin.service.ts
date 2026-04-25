import { AdmissionStatus, Course, CourseOffering } from "../../../generated/prisma/client";
import { LoggedInUser } from "../../@types/loggedInUser";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { EnrolledStudent, getAdmissionFormsFilterQuery, IEnrollBatchStudentsPayload, IStudent } from "./admin.interface";

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
    return {
        id: batch.id,
        batchNo: batch.batchNo,
        description: batch.description,
    };
}

const createCourse = async (payload: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    const course = await prisma.course.create({
        data: payload,
    });
    return null;
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
const getAdmissionForms = async (admin: LoggedInUser, filterQuery: getAdmissionFormsFilterQuery) => {
    const forms = await prisma.admissionForm.findMany({
        where: {
            departmentId: admin.departmentId as string,
            status: AdmissionStatus.PENDING,
            OR: [
                {
                    name: {
                        contains: filterQuery.search,
                        mode: "insensitive",
                    },
                },
                {
                    phoneNumber: {
                        contains: filterQuery.search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: filterQuery.search,
                        mode: "insensitive",
                    },
                },
            ],
        },
        take: filterQuery.limit,
        skip: (filterQuery.page - 1) * filterQuery.limit,
        orderBy: {
            createdAt: filterQuery.sortBy,
        },
        select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
        }
    });
    const metaData = await prisma.admissionForm.count({
        where: {
            departmentId: admin.departmentId as string,
            status: AdmissionStatus.PENDING,
            name: {
                contains: filterQuery.search,
                mode: "insensitive",
            },
            phoneNumber: {
                contains: filterQuery.search,
                mode: "insensitive",
            },
            email: {
                contains: filterQuery.search,
                mode: "insensitive",
            },
        },
    });
    return {
        forms,
        meta: {
            total: metaData,
            page: filterQuery.page,
            limit: filterQuery.limit,
            totalPages: Math.ceil(metaData / filterQuery.limit),
        }
    };
}
const getFormDetails = async (formId: string, admin: LoggedInUser) => {
    const batch = await prisma.batch.findFirst({
        where: {
            departmentId: admin.departmentId as string,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            batchNo: true,
        }
    });
    const form = await prisma.admissionForm.findUnique({
        where: {
            id: formId,
        },
        include: {
            program: {
                select: {
                    name: true,
                }
            },
            department: {
                select: {
                    name: true,
                }
            }
        },
        omit: {
            status: true
        }
    });
    return {
        ...form,
        batchId: batch?.id,
        batchNo: batch?.batchNo,
        program: form?.program.name,
        department: form?.department.name,
    };
}

const updateFormStatus = async (formId: string, status: AdmissionStatus) => {
    const form = await prisma.admissionForm.update({
        where: {
            id: formId,
        },
        data: {
            status,
        },
    });
    return null;
}

const getAdminDashboardData = async (admin: LoggedInUser) => {
    const totalStudents = await prisma.batch.findMany({
        where: {
            departmentId: admin.departmentId as string,
        },
        select: {
            batchNo: true,
            _count: {
                select: {
                    studentProfiles: true,
                }
            }
        },
        orderBy: {
            createdAt: "asc",
        }
    })
    const formattedTotalStudents = totalStudents.map(batch => ({
        batchNo: batch.batchNo,
        studentCount: batch._count.studentProfiles
    }));
    const admissionForms = await prisma.admissionForm.count({
        where: {
            departmentId: admin.departmentId as string,
            status: AdmissionStatus.PENDING,
        }
    });
    const totalFaculties = await prisma.user.count({
        where: {
            role: "FACULTY",
            facultyProfile: {
                departmentId: admin.departmentId as string,
            }
        }
    });
    const totalCourses = await prisma.course.count({
        where: {
            departmentId: admin.departmentId as string,
        }
    });
    const totalBatches = await prisma.batch.count({
        where: {
            departmentId: admin.departmentId as string,
        }
    });
    return {
        students: formattedTotalStudents,
        total: {
            admissionForms: admissionForms,
            faculties: totalFaculties,
            courses: totalCourses,
            batches: totalBatches,
        }
    };
}

export const adminService = {
    createBatch,
    createCourse,
    createCourseOffering,
    getAdmissionForms,
    getFormDetails,
    enrollBatchStudents,
    updateFormStatus,
    getAdminDashboardData
};