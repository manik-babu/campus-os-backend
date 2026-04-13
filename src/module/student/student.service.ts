import status from "http-status";
import { LoggedInUser } from "../../@types/loggedInUser";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";

const enrollSingleCourse = async (courseOfferingsId: string, student: LoggedInUser) => {
    const offerings = await prisma.courseOffering.findUnique({
        where: {
            id: courseOfferingsId,
        },
        include: {
            course: {
                select: {
                    departmentId: true,
                    title: true,
                    credits: true,

                }
            }

        }
    });
    const studentInfo = await prisma.user.findUnique({
        where: {
            id: student.id,
        },
        select: {
            studentProfile: {
                select: {
                    departmentId: true,
                }
            }
        }
    })

    if (!offerings) {
        throw new AppError(status.NOT_FOUND, "Course offering not found");
    }
    if (offerings.course.departmentId !== studentInfo?.studentProfile?.departmentId) {
        throw new AppError(status.FORBIDDEN, "You are not allowed to enroll in this course");
    }
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseOfferingId: {
                studentId: student.id,
                courseOfferingId: courseOfferingsId,
            }
        }
    });
    if (existingEnrollment) {
        throw new AppError(status.BAD_REQUEST, "You are already enrolled in this course");
    }
    const enrollment = await prisma.$transaction(async (tx) => {
        let bill;
        const existingBill = await tx.bill.findFirst({
            where: {
                studentId: student.id,
                semesterId: offerings.semesterId,
            },
            select: {
                id: true,
            }
        });
        if (existingBill) {
            bill = existingBill;
        }
        else {
            bill = await tx.bill.create({
                data: {
                    studentId: student.id,
                    semesterId: offerings.semesterId,
                },
                select: {
                    id: true,
                }
            });
        }
        const enroll = await tx.enrollment.create({
            data: {
                studentId: student.id,
                courseOfferingId: offerings.id,
                result: {
                    create: {},
                },
            },
        });
        await tx.billItem.create({
            data: {
                name: `Tuition fee for ${offerings.course.title}`,
                enrollmentId: enroll.id,
                totalAmount: Number(offerings.creditFees) * offerings.course.credits,
                billId: bill.id,
            }
        });
        return enroll;
    });
    if (!enrollment) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to enroll in the course");
    }
    else {
        return {
            ...enrollment,
            course: {
                title: offerings.course.title,
                credits: offerings.course.credits,
            }
        };
    }
};
const studentBill = async (studentId: string, semesterId: string) => {
    const bill = await prisma.bill.findFirst({
        where: {
            studentId,
            semesterId,
        },
        include: {
            billItems: true,
            payments: true,
        }
    });
    const totalAmount = bill?.billItems.reduce((acc, item) => acc + Number(item.totalAmount), 0) || 0;
    const totalPayments = bill?.payments.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0;
    if (!bill) {
        throw new AppError(status.NOT_FOUND, "Bill not found for the given semester");
    }
    return { ...bill, totalAmount, totalPayments, dueAmount: totalAmount - totalPayments };
};
const dropEnrollment = async (enrollmentId: string, student: LoggedInUser) => {
    const enrollment = await prisma.enrollment.count({
        where: {
            id: enrollmentId,
            studentId: student.id,
        },
    });
    if (!enrollment) {
        throw new AppError(status.NOT_FOUND, "Enrollment not found");
    }
    const droppedEnrollment = await prisma.enrollment.delete({
        where: {
            id: enrollmentId,
        },
    });
    if (!droppedEnrollment) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to drop the course");
    }
    else {
        return droppedEnrollment;
    }
};
const getEnrolledCourses = async (studentId: string, semesterId: string | null) => {
    if (!semesterId) {
        const lastSemester = await prisma.semester.findFirst({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
            }
        });
        if (!lastSemester) {
            throw new AppError(status.NOT_FOUND, "No semester found");
        }
        semesterId = lastSemester.id;
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            studentId,
            courseOffering: {
                semesterId,
            }
        },
        select: {
            id: true,
            courseOffering: {
                include: {
                    course: {
                        select: {
                            code: true,
                            title: true,
                            credits: true,
                        }
                    },
                    faculty: {
                        select: {
                            name: true,
                        }
                    }
                }
            },

        },
    });
    return enrollments.map(enrollment => ({
        id: enrollment.id,
        courseCode: enrollment.courseOffering.course.code,
        courseTitle: enrollment.courseOffering.course.title,
        credits: enrollment.courseOffering.course.credits,
        facultyName: enrollment.courseOffering.faculty.name,
    }));
}
const getResult = async (studentId: string, semesterId: string) => {
    const results = await prisma.enrollment.findMany({
        where: {
            studentId,
            courseOffering: {
                semesterId,
            }
        },
        include: {
            courseOffering: {
                include: {
                    course: {
                        select: {
                            code: true,
                            title: true,
                            credits: true,
                        }
                    },
                    faculty: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            result: true,
        }
    });
    return results.map(result => ({
        courseCode: result.courseOffering.course.code,
        courseTitle: result.courseOffering.course.title,
        credits: result.courseOffering.course.credits,
        facultyName: result.courseOffering.faculty.name,
        result: {
            classTest1: result.result?.classTest1,
            classTest2: result.result?.classTest2,
            midterm: result.result?.midterm,
            final: result.result?.final,
            attendance: result.result?.attendance,
            grade: result.result?.grade,
            points: result.result?.points,
        }
    }));
}
export const studentService = {
    enrollSingleCourse,
    studentBill,
    dropEnrollment,
    getEnrolledCourses,
    getResult,
};