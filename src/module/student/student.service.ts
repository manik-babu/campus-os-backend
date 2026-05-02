import status from "http-status";
import { LoggedInUser } from "../../@types/loggedInUser";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { EnrollmentStatus } from "../../../generated/prisma/enums";

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

    if (!offerings) {
        throw new AppError(status.NOT_FOUND, "Course offering not found");
    }
    if (offerings.course.departmentId !== student.departmentId) {
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
            courseTitle: offerings.course.title,
        };
    }
};
const studentBill = async (studentId: string, semesterId: string) => {
    const bill = await prisma.bill.findFirst({
        where: {
            studentId,
            semesterId,
        },
        select: {
            id: true,
            billItems: {
                select: {
                    id: true,
                    name: true,
                    totalAmount: true,
                }
            },
            payments: {
                where: {
                    status: "PAID",
                },
                select: {
                    id: true,
                    amount: true,
                    transactionId: true,
                    createdAt: true,
                    status: true,
                }
            },
            semester: {
                select: {
                    name: true,
                }
            }
        }
    });
    if (!bill) {
        return null;
    }
    const totalAmount = bill.billItems.reduce((acc, item) => acc + Number(item.totalAmount), 0) || 0;
    const totalPayments = bill.payments.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0;

    const midDue = Math.floor(totalAmount / 2);
    const finalDue = totalAmount - midDue;


    const midtermPayment = {
        amount: Math.max(0, midDue - totalPayments),
        isPaid: totalPayments >= midDue,
        name: "Midterm",
        isDisabled: false,
    };
    const finalPayment = {
        amount: Math.min(finalDue, Math.max(0, totalAmount - totalPayments)),
        isPaid: totalPayments >= totalAmount,
        name: "Final",
        isDisabled: totalPayments < midDue,
    };

    return { ...bill, semester: bill.semester.name, totalAmount, totalPayments, dueAmount: totalAmount - totalPayments, payments: [midtermPayment, finalPayment] };
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
const getEnrolledCourses = async (studentId: string, semesterId: string) => {
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
        offeringId: enrollment.courseOffering.id,
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

const resultStatics = async (studentId: string) => {
    const results = await prisma.enrollment.findMany({
        where: {
            studentId,
            status: EnrollmentStatus.COMPLETED,
        },
        select: {

            result: {
                select: {
                    points: true,
                }
            },
            courseOffering: {
                select: {
                    semester: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    course: {
                        select: {
                            credits: true,
                        }
                    }
                }
            }
        }
    });
    const data = results.reduce((acc, curr) => {
        const semesterId = curr.courseOffering.semester.id;
        const semesterName = curr.courseOffering.semester.name;
        if (!acc[semesterId]) {
            acc[semesterId] = {
                semesterId,
                semesterName,
                totalPoints: 0,
                totalCredits: 0,
            };
        }
        if (curr.result?.points) {
            acc[semesterId].totalPoints += Number(curr.result.points) * curr.courseOffering.course.credits;
            acc[semesterId].totalCredits += Number(curr.courseOffering.course.credits);
        }
        return acc;
    }, {} as Record<string, { semesterId: string; semesterName: string; totalPoints: number; totalCredits: number }>);

    const dataArray = Object.values(data).map(item => ({
        semesterName: item.semesterName,
        sgpa: item.totalCredits > 0 ? (item.totalPoints / item.totalCredits).toFixed(2) : 0,
    }));
    return dataArray;
}
const getAcademicRecords = async (studentId: string) => {

    const [completedSemesters, completedCourses, earnedCredits] = await prisma.$transaction([
        prisma.courseOffering.findMany({
            distinct: ["semesterId"],
            where: {
                enrollments: {
                    some: {
                        studentId,
                        status: EnrollmentStatus.COMPLETED,
                    }
                }
            }
        }),
        prisma.enrollment.count({
            where: {
                studentId,
                status: EnrollmentStatus.COMPLETED,
            }
        }),
        prisma.enrollment.findMany({
            where: {
                studentId,
                status: EnrollmentStatus.COMPLETED,
            },
            select: {
                courseOffering: {
                    select: {
                        course: {
                            select: {
                                credits: true,
                            }
                        }
                    }
                }
            }
        })
    ])
    return {
        completedSemesters: completedSemesters.length,
        completedCourses: completedCourses,
        earnedCredits: earnedCredits.reduce((acc, curr) => acc + curr.courseOffering.course.credits, 0) || 0,
    }
};
export const studentService = {
    enrollSingleCourse,
    studentBill,
    dropEnrollment,
    getEnrolledCourses,
    getResult,
    resultStatics,
    getAcademicRecords,
};