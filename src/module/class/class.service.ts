import { MaterialType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { CoursePostInput, IGetCoursePosts } from "./class.interface"

const addCoursePost = async (data: CoursePostInput, attachment: string | null) => {
    const createdPost = await prisma.coursePost.create({
        data: {
            ...data,
            assignmentDeadLine: data.assignmentDeadLine ? new Date(data.assignmentDeadLine) : null,
            attachment
        }
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
    return posts;
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
        skip: (search.page - 1) * search.limit,
        take: search.limit
    });
    return comments;
}

export const classService = {
    addCoursePost,
    getCoursePosts,
    getComments
}