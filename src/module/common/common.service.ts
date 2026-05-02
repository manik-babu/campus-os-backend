import { UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGetCourseOfferings, IStudentAdmitCardData } from "./common.interface";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import AppError from "../../helper/AppError";
import status from "http-status";
const getSemesters = async () => {
    const semesters = await prisma.semester.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    return semesters;
}
const getBatches = async (departmentId: string) => {
    const batches = await prisma.batch.findMany({
        where: {
            departmentId: departmentId
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            batchNo: true,
            description: true,
        }
    });
    return batches;
}
const getCourseOfferings = async (payload: IGetCourseOfferings) => {
    const courseOfferings = await prisma.courseOffering.findMany({
        where: {
            ...(payload.batchId !== "all" && { batchId: payload.batchId }),
            OR: [
                {
                    course: {
                        title: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                },
                {
                    course: {
                        code: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                },
                {
                    faculty: {
                        name: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                }
            ]
        },
        take: 10,
        skip: payload.page ? (parseInt(payload.page) - 1) * 10 : 0,
        select: {
            id: true,
            creditFees: true,
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
            },
            faculty: {
                select: {
                    name: true,
                    image: true,
                }
            },
            batch: {
                select: {
                    batchNo: true,
                }
            }
        }
    });
    const totalCount = await prisma.courseOffering.count({
        where: {
            ...(payload.batchId !== "all" && { batchId: payload.batchId }),
            OR: [
                {
                    course: {
                        title: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                },
                {
                    course: {
                        code: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                },
                {
                    faculty: {
                        name: {
                            contains: payload.search || "",
                            mode: "insensitive"
                        }
                    }
                }
            ]
        }
    });
    return {
        courses: courseOfferings,
        meta: {
            total: totalCount,
            page: payload.page ? parseInt(payload.page) : 1,
            perPage: 10,
            totalPages: Math.ceil(totalCount / 10)
        }
    };
}
const getUserDetails = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            adminProfile: {
                include: {
                    department: {
                        select: {
                            name: true,
                            shortName: true,
                        }
                    }
                }
            },
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
            },
            facultyProfile: {
                include: {
                    department: {
                        select: {
                            shortName: true,
                            name: true
                        }
                    },
                }
            }
        }
    });
    return user;
};
const getAdmit = async (studentId: string, semesterId: string, exam: "Midterm" | "Final") => {
    console.table({ studentId, semesterId, exam })
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
    console.log(formattedDetails)
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
const getCourseOfferingInfo = async (courseOfferingId: string) => {
    const courseOfferings = await prisma.courseOffering.findUnique({
        where: {
            id: courseOfferingId
        },
        select: {
            course: {
                select: {
                    code: true,
                    title: true,
                }
            },
            faculty: {
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
        }
    });
    const data = {
        offeringId: courseOfferingId,
        courseName: courseOfferings?.course.title,
        courseCode: courseOfferings?.course.code,
        facultyName: courseOfferings?.faculty.name,
        batch: courseOfferings?.batch.batchNo,
        department: courseOfferings?.department.shortName,
    }
    return data;
}

export const commonService = {
    getSemesters,
    getCourseOfferings,
    getUserDetails,
    getAdmit,
    generateAdmitCard,
    getBatches,
    getCourseOfferingInfo,
};