import { UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGetCourseOfferings, IStudentAdmitCardData } from "./common.interface";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import ejs from "ejs";
const getSemesters = async () => {
    const semesters = await prisma.semester.findMany();
    return semesters;
}
const getCourseOfferings = async (payload: IGetCourseOfferings) => {
    const courseOfferings = await prisma.courseOffering.findMany({
        where: {
            ...(payload.facultyId && { facultyId: payload.facultyId }),
            ...(payload.semesterId && { semesterId: payload.semesterId }),
            ...(payload.courseId && { courseId: payload.courseId }),
            ...(payload.batchId && { batchId: payload.batchId }),
        }
    });
    return courseOfferings;
}
const getUserDetails = async (userId: string, role: UserRole) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            ...(role === UserRole.STUDENT && {
                studentProfile: {
                    include: {
                        batch: {
                            select: {
                                batchNo: true
                            }
                        },
                        department: {
                            select: {
                                shortName: true,
                                name: true
                            }
                        },
                        program: {
                            select: {
                                name: true,
                                shortName: true
                            }
                        }
                    }
                }
            }),
            ...(role === UserRole.FACULTY && {
                facultyProfile: {
                    include: {
                        department: {
                            select: {
                                shortName: true,
                                name: true
                            }
                        },
                        graduations: true
                    }
                }
            })
        }
    });
    return user;
};
const getAdmit = async (studentId: string, semesterId: string, exam: "Midterm" | "Final") => {
    const details = await prisma.user.findUnique({
        where: {
            idNo: studentId,
        },
        select: {
            idNo: true,
            registrationNo: true,
            name: true,
            studentProfile: {
                select: {
                    department: {
                        select: {
                            name: true,
                            shortName: true,
                        }
                    },
                    batch: {
                        select: {
                            batchNo: true,
                        }
                    },
                    program: {
                        select: {
                            name: true,
                            shortName: true,
                        }
                    }
                }
            },
            enrollments: {
                where: {
                    courseOffering: {
                        semesterId: semesterId
                    }
                },
                select: {
                    courseOffering: {
                        select: {
                            course: {
                                select: {
                                    code: true,
                                    title: true,
                                    credits: true,
                                }
                            },
                            semester: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    const formattedDetails = {
        idNo: details?.idNo,
        registrationNo: details?.registrationNo,
        name: details?.name,
        department: details?.studentProfile?.department.name,
        program: details?.studentProfile?.program.name,
        batch: details?.studentProfile?.batch.batchNo,
        exam: exam,
        semester: details?.enrollments[0]?.courseOffering.semester.name,
        date: new Date().toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        courses: details?.enrollments.map(enrollment => ({
            code: enrollment.courseOffering.course.code,
            title: enrollment.courseOffering.course.title,
            credits: enrollment.courseOffering.course.credits,
        })),
    }
    return formattedDetails;

};
const generateAdmitCard = async (student: IStudentAdmitCardData) => {
    try {
        // Render the EJS template with student data
        const templatePath = path.join(process.cwd(), "/src/templates/admit_card.ejs");
        const html = await ejs.renderFile(templatePath, { student });

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle2" });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm",
            },
            printBackground: true,
        });

        await browser.close();

        return pdfBuffer;
    } catch (error) {
        throw error;
    }
}


export const commonService = {
    getSemesters,
    getCourseOfferings,
    getUserDetails,
    getAdmit,
    generateAdmitCard,
};