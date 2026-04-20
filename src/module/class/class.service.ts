import { MaterialType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { CoursePostInput, IGetCoursePosts } from "./class.interface"

const addCoursePost = async (data: CoursePostInput, attachment: string | null) => {
    const createdPost = await prisma.coursePost.create({
        data: {
            ...data,
            assignmentDeadLine: data.assignmentDeadLine ? data.assignmentDeadLine : null,
            attachment
        },
        include: {
            _count: {
                select: {
                    comments: true,
                }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    idNo: true,
                    role: true
                }
            }
        },
    });
    return createdPost;
}

const getCoursePosts = async (classId: string, search: IGetCoursePosts) => {
    const posts = await prisma.coursePost.findMany({
        where: {
            courseOfferingId: classId,
            type: {
                not: MaterialType.COMMENT
            },
            ...(search.type !== "ALL" && { type: search.type }),
            OR: [
                {
                    message: {
                        contains: search.search,
                        mode: "insensitive"
                    }
                },
                {
                    attachment: {
                        contains: search.search,
                        mode: "insensitive"
                    }
                }
            ],
        },
        include: {
            _count: {
                select: {
                    comments: true,
                }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    idNo: true,
                    role: true
                }
            }
        },
        orderBy: {
            createdAt: search.orderBy
        },
        skip: (search.page - 1) * search.limit,
        take: search.limit
    });
    const total = await prisma.coursePost.count({
        where: {
            courseOfferingId: classId,
            type: {
                not: MaterialType.COMMENT
            },
            ...(search.type !== "ALL" && { type: search.type }),
            OR: [
                {
                    message: {
                        contains: search.search,
                        mode: "insensitive"
                    }
                },
                {
                    attachment: {
                        contains: search.search,
                        mode: "insensitive"
                    }
                }
            ],
        }
    });

    return {
        posts,
        meta: {
            total,
            page: search.page,
            limit: search.limit,
            totalPages: Math.ceil(total / search.limit)
        }
    };
}
const getComments = async (coursePostId: string, search: Omit<IGetCoursePosts, 'type' | "search">) => {
    const comments = await prisma.coursePost.findMany({
        where: {
            parentId: coursePostId,
            type: MaterialType.COMMENT
        },
        orderBy: {
            createdAt: search.orderBy
        },
        include: {
            _count: {
                select: {
                    comments: true,
                }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    idNo: true,
                    role: true
                }
            }
        },
        skip: (search.page - 1) * search.limit,
        take: search.limit
    });
    const total = await prisma.coursePost.count({
        where: {
            parentId: coursePostId,
            type: MaterialType.COMMENT
        }
    });
    return {
        comments,
        meta: {
            total,
            page: search.page,
            limit: search.limit,
            totalPages: Math.ceil(total / search.limit)
        }
    };
}

export const classService = {
    addCoursePost,
    getCoursePosts,
    getComments
}