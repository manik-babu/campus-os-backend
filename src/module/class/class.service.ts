import { MaterialType } from "../../../generated/prisma/enums";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../lib/prisma"
import { getPublicIdFromUrl } from "../../utils/getPublicId";
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
                    role: true,
                    image: true
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

const deleteCoursePost = async (postId: string, userId: string) => {
    const post = await prisma.coursePost.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true,
            attachment: true,
            authorId: true
        }
    });
    if (!post) {
        throw new Error("Post might have already been deleted");
    }
    if (post.authorId !== userId) {
        throw new Error("You are not authorized to delete this post");
    }
    await prisma.coursePost.delete({
        where: {
            id: postId
        }
    });
    const attachmentPublicId = post.attachment ? getPublicIdFromUrl(post.attachment) : null;
    if (attachmentPublicId) {
        await cloudinary.uploader.destroy(attachmentPublicId).catch(err => {
            console.error("Error deleting file from cloudinary:", err);
        });
    }

    return true;
}

export const classService = {
    addCoursePost,
    getCoursePosts,
    getComments,
    deleteCoursePost
}