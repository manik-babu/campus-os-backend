/*
model CoursePost {
    id                 String         @id @default(uuid())
    courseOfferingId   String
    courseOffering     CourseOffering @relation(fields: [courseOfferingId], references: [id], onDelete: Cascade)
    message            String?
    attachment         String?
    type               MaterialType
    parentId           String? // For comments, this will reference the parent comment's ID
    parent             CoursePost?    @relation("Comments", fields: [parentId], references: [id], onDelete: Cascade) // Self-relation for comments
    comments           CoursePost[]   @relation("Comments") // Self-relation for comments
    assignmentDeadLine DateTime? // Only for assignments

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("course_posts")
}

enum MaterialType {
    LECTURE
    ASSIGNMENT
    NOTICE
    COMMENT
}

*/
import * as z from "zod";
import { MaterialType } from "../../../generated/prisma/enums";
export const coursePostZodSchema = z.object({
    courseOfferingId: z.string(),
    message: z.string().nullable(),
    type: z.enum(MaterialType),
    parentId: z.string().nullable(),
    assignmentDeadLine: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format"
    }).nullable(), // ISO date string
});
