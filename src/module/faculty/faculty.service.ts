import { EnrollmentStatus } from "../../../generated/prisma/enums";
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
                include: {
                    department: {
                        select: {
                            shortName: true,
                        }
                    },
                }
            },
            semester: true,
            batch: {
                select: {
                    batchNo: true,
                }
            },
        },
    });
    const formattedClasses = classes.map((cls) => ({
        id: cls.id,
        courseCode: cls.course.code,
        courseName: cls.course.title,
        department: cls.course.department.shortName,
        batch: cls.batch.batchNo,
    }));
    return {
        semester: classes[0]?.semester.name || "Unknown Semester",
        classes: formattedClasses,
    };
}
const enrolledStudents = async (classId: string) => {
    const courseDetails = await prisma.courseOffering.findUnique({
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
    const attendances = await prisma.attendance.createMany({
        data: attendanceRecord.map(record => ({
            date: new Date(record.date),
            enrollmentId: record.enrollmentId,
            isPresent: record.isPresent,
        })),
    });
    return attendances;
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
                attendance: true,
            }
        });
        console.log({
            updatedMark
        })
        const resultComplete = Object.values(updatedMark).every(value => value !== null);
        if (resultComplete) {
            const { points, grade } = calculateGpa(Number(updatedMark.classTest1) + Number(updatedMark.classTest2) + Number(updatedMark.midterm) + Number(updatedMark.final) + Number(updatedMark.attendance));
            console.log({
                points,
                grade
            })
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
export const facultyService = {
    getClasses,
    enrolledStudents,
    takeAttendance,
    updateStudentMark,
}