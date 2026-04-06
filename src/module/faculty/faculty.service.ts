import { prisma } from "../../lib/prisma";
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
                classTest1: mark.classTest1 || null,
                classTest2: mark.classTest2 || null,
                midterm: mark.midterm || null,
                final: mark.final || null,
                attendance: mark.attendance || null,
            },
        })
        return {
            enrollmentId: updatedMark.enrollmentId,
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