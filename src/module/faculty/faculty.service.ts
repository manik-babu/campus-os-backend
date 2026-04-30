import status from "http-status";
import { EnrollmentStatus } from "../../../generated/prisma/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { calculateGpa, IMarks } from "../../utils/calculateGpa";
import { IAttendanceRecord, IStudentMark } from "./faculty.interface";


const getClasses = async (facultyId: string, semesterId: string) => {
    const classes = await prisma.courseOffering.findMany({
        where: {
            facultyId,
            semesterId,
        },
        select: {
            id: true,
            course: {
                select: {
                    code: true,
                    title: true,
                }
            },
            batch: {
                select: {
                    batchNo: true,
                }
            },
            department: {
                select: {
                    shortName: true,
                    program: {
                        select: {
                            shortName: true,
                        }
                    }
                }
            },
        },
    });
    const formattedClasses = classes.map((cls) => ({
        id: cls.id,
        courseCode: cls.course.code,
        courseName: cls.course.title,
        department: cls.department.program.shortName + " • " + cls.department.shortName,
        batch: cls.batch.batchNo,
    }));
    return formattedClasses;
}
const enrolledStudents = async (classId: string) => {
    const courseDetails = await prisma.courseOffering.findUnique({
        where: {
            id: classId,
        },
        select: {
            id: true,
            course: {
                select: {
                    title: true,
                    code: true,
                }
            },
            semester: {
                select: {
                    name: true,
                }
            },
            batch: {
                select: {
                    batchNo: true,
                }
            },
            department: {
                select: {
                    shortName: true,
                }
            }
        },
    });
    const enrollments = await prisma.enrollment.findMany({
        where: {
            courseOfferingId: classId,
        },
        select: {
            id: true,
            student: {
                select: {
                    id: true,
                    idNo: true,
                    name: true,
                }
            }
        }
    });
    return {
        classDetails: {
            classId: courseDetails?.id,
            courseName: courseDetails?.course.title,
            courseCode: courseDetails?.course.code,
            semester: courseDetails?.semester.name,
            batch: courseDetails?.batch.batchNo,
            department: courseDetails?.department.shortName,
        },
        students: enrollments.map(enrollment => ({
            enrollmentId: enrollment.id,
            studentId: enrollment.student.id,
            studentIdNo: enrollment.student.idNo,
            studentName: enrollment.student.name,
        })),
    };
}
const takeAttendance = async (attendanceRecord: IAttendanceRecord[]) => {
    if (attendanceRecord.length === 0) {
        return null;
    }
    const isExists = await prisma.attendance.findFirst({
        where: {
            date: attendanceRecord[0]?.date as string,
            courseOfferingId: attendanceRecord[0]?.courseOfferingId as string,
        }
    });
    if (isExists) {
        throw new AppError(status.BAD_REQUEST, "Attendance for this date already recorded");
    }
    await prisma.attendance.createMany({
        data: attendanceRecord.map(record => ({
            date: record.date as string,
            enrollmentId: record.enrollmentId as string,
            isPresent: record.isPresent,
            courseOfferingId: record.courseOfferingId as string,
        })),
    });
    return null;
};
const updateStudentMark = async (studentMarks: IStudentMark) => {
    const updatedMarks = await Promise.all(studentMarks.map(async (studentMark) => {
        const { enrollmentId, mark } = studentMark;
        const updatedMark = await prisma.result.update({
            where: {
                enrollmentId
            },
            data: {
                ...(mark.classTest1 !== undefined && { classTest1: mark.classTest1 }),
                ...(mark.classTest2 !== undefined && { classTest2: mark.classTest2 }),
                ...(mark.midterm !== undefined && { midterm: mark.midterm }),
                ...(mark.final !== undefined && { final: mark.final }),
                ...(mark.attendance !== undefined && { attendance: mark.attendance }),
            },
            select: {
                classTest1: true,
                classTest2: true,
                midterm: true,
                final: true,
            }
        });
        const resultComplete = Object.values(updatedMark).every(value => value !== null);
        if (resultComplete) {
            const present = await prisma.attendance.count({
                where: {
                    enrollmentId,
                    isPresent: true,
                }
            });
            const totalClasses = await prisma.attendance.count({
                where: {
                    enrollmentId,
                }
            });
            const attendanceMark = totalClasses > 0 ? Math.floor((present / totalClasses) * 10) : 10;
            const { points, grade } = calculateGpa(Number(updatedMark.classTest1) + Number(updatedMark.classTest2) + Number(updatedMark.midterm) + Number(updatedMark.final) + Number(attendanceMark));
            await Promise.all([
                prisma.enrollment.update({
                    where: {
                        id: enrollmentId,
                    },
                    data: {
                        status: EnrollmentStatus.COMPLETED,
                    },
                }),
                prisma.result.update({
                    where: {
                        enrollmentId
                    },
                    data: {
                        points,
                        grade,
                        attendance: attendanceMark,
                    }
                })
            ]);
        }
        return {
            enrollmentId,
        };
    }));
    return updatedMarks;
};
const getAttendanceRecords = async (classId: string, year: number, month: number) => {
    const records = await prisma.attendance.findMany({
        where: {
            courseOfferingId: classId,
            date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1)
            }
        },
        select: {
            date: true,
            enrollment: {
                select: {
                    student: {
                        select: {
                            name: true,
                            idNo: true,
                        }
                    }
                }
            },
            isPresent: true,
        },
        orderBy: {
            date: "asc",
        }
    });
    const dates = await prisma.attendance.findMany({
        distinct: ["date"],
        where: {
            courseOfferingId: classId,
            date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1)
            }
        },
        select: {
            date: true,
        },
        orderBy: {
            date: "asc",
        }
    });

    const studentRecords = records.reduce((acc, record) => {
        const studentIdNo = record.enrollment.student.idNo;
        const studentName = record.enrollment.student.name;
        const isPresent = record.isPresent;
        if (!acc[studentIdNo]) {
            acc[studentIdNo] = {
                studentName,
                studentIdNo,
                attendance: [],
            };
        }
        acc[studentIdNo].attendance.push(isPresent);
        return acc;
    }, {} as Record<string, {
        studentName: string;
        studentIdNo: string;
        attendance: boolean[];
    }>);
    const finalStudentRecords = Object.values(studentRecords);
    return {
        dates: dates.map(record => record.date),
        records: finalStudentRecords
    };
};

const getStudentMark = async (classId: string) => {
    const results = await prisma.enrollment.findMany({
        where: {
            courseOfferingId: classId,
        },
        select: {
            id: true,
            student: {
                select: {
                    id: true,
                    idNo: true,
                    name: true,
                }
            },
            result: {
                select: {
                    classTest1: true,
                    classTest2: true,
                    midterm: true,
                    final: true,
                    attendance: true,
                }
            }
        }
    })
    const classDetails = await prisma.courseOffering.findUnique({
        where: {
            id: classId,
        },
        select: {
            course: {
                select: {
                    title: true,
                    code: true,
                }
            },
            semester: {
                select: {
                    name: true,
                }
            },
            batch: {
                select: {
                    batchNo: true,
                }
            },
            department: {
                select: {
                    shortName: true,
                }
            }
        },
    });
    const formattedResults = results.map(enrollment => ({
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        studentIdNo: enrollment.student.idNo,
        studentName: enrollment.student.name,
        marks: enrollment.result,
    }));
    return {
        classDetails: {
            classId,
            courseName: classDetails?.course.title,
            courseCode: classDetails?.course.code,
            semester: classDetails?.semester.name,
            batch: classDetails?.batch.batchNo,
            department: classDetails?.department.shortName,
        },
        studentMarks: formattedResults,
    };
};

export const facultyService = {
    getClasses,
    enrolledStudents,
    takeAttendance,
    updateStudentMark,
    getAttendanceRecords,
    getStudentMark,
}